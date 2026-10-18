import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/ui/Button';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');
  const [isDelivered, setIsDelivered] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpError, setSmtpError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setEmailError('Email address is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');
    setDevResetUrl('');
    setIsDelivered(false);
    setSmtpConfigured(false);
    setSmtpError('');
    setCopied(false);

    try {
      const response = await authService.forgotPassword(email.trim());
      const msg =
        (typeof response?.message === 'string' && response.message) ||
        response?.data?.message ||
        'If an account exists for this email, a password reset link has been sent.';
      
      setSuccessMessage(msg);
      setIsDelivered(Boolean(response?.data?.delivered));
      setSmtpConfigured(Boolean(response?.data?.smtpConfigured));
      setSmtpError(response?.data?.smtpError || '');
      
      if (response?.data?.devResetUrl) {
        setDevResetUrl(response.data.devResetUrl);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to process your request. Please try again later.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!devResetUrl) return;
    navigator.clipboard.writeText(devResetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetForm = () => {
    setSuccessMessage('');
    setDevResetUrl('');
    setIsDelivered(false);
    setSmtpConfigured(false);
    setSmtpError('');
    setCopied(false);
  };

  const isAuthError = smtpError?.includes('535') || smtpError?.toLowerCase().includes('badcredentials');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset your password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email and we&apos;ll help you reset your password.
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
        >
          {serverError}
        </div>
      )}

      {successMessage ? (
        <div className="space-y-4">
          <div
            role="status"
            className={`p-3 text-xs rounded-lg border ${
              isDelivered
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isDelivered ? (
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span><strong>Email Dispatched:</strong> A password reset link has been sent to your email inbox. Please check your inbox and spam folder.</span>
              </div>
            ) : (
              successMessage
            )}
          </div>

          {/* Case 1: SMTP Configured, but Authentication or Connection Failed */}
          {!isDelivered && smtpConfigured && (
            <div className="p-4 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80 text-xs space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                <div>
                  <p className="font-semibold text-rose-900 dark:text-rose-200">
                    SMTP Delivery Failed (Authentication Error)
                  </p>
                  <p className="text-rose-800 dark:text-rose-300/90 mt-0.5 leading-relaxed">
                    The server attempted to send an email using your configured SMTP settings, but the mail provider rejected the request.
                  </p>
                  {isAuthError && (
                    <div className="mt-2 p-2.5 rounded-lg bg-rose-100/70 dark:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-900 dark:text-rose-100 space-y-1">
                      <p className="font-semibold">Google 535 BadCredentials Diagnostic:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-rose-800 dark:text-rose-200">
                        <li>Make sure 2-Step Verification is turned ON for this Google account.</li>
                        <li>Do not use your regular Google password. Generate a 16-character <strong>App Password</strong> at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="underline font-medium">myaccount.google.com/apppasswords</a>.</li>
                        <li>Ensure the Gmail username in <code className="font-mono text-xs">SMTP_USER</code> matches the account where the App Password was generated.</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Case 2: SMTP Not Configured (Clean Dev Simulation Notice) */}
          {!isDelivered && !smtpConfigured && devResetUrl && (
            <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-base leading-none">ℹ️</span>
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    SMTP Not Configured (Development Simulation)
                  </p>
                  <p className="text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                    SMTP is not configured in <code className="px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100 font-mono text-[11px]">apps/backend/.env</code>. A direct reset link has been generated below for development testing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Development Reset Link Helper (shown whenever devResetUrl is provided in dev mode) */}
          {devResetUrl && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
              <div>
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <span>🔗</span>
                  <span>Development Reset Link:</span>
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={devResetUrl}
                    className="w-full text-xs font-mono p-2 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="shrink-0 px-3 py-2 text-xs font-medium rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    {copied ? 'Copied! ✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <Link
                  to={devResetUrl.replace(/^https?:\/\/[^/]+/, '')}
                  className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
                >
                  Proceed to Reset Password Now →
                </Link>
              </div>

              <details className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer">
                <summary className="font-medium hover:underline">
                  How do I configure real SMTP email delivery?
                </summary>
                <div className="mt-2 pl-2 border-l-2 border-slate-300 dark:border-slate-700 space-y-1 text-slate-600 dark:text-slate-400">
                  <p>In <code className="font-mono text-indigo-600 dark:text-indigo-400">apps/backend/.env</code>, configure:</p>
                  <pre className="font-mono text-[10px] bg-slate-900 text-emerald-400 p-2 rounded overflow-x-auto">
SMTP_SERVICE=gmail&#10;SMTP_USER=your_email@gmail.com&#10;SMTP_PASS=your_16_char_google_app_password
                  </pre>
                  <p>Nodemon will automatically reload when <code className="font-mono">.env</code> is saved.</p>
                </div>
              </details>
            </div>
          )}

          {isDelivered && (
            <p className="text-xs text-slate-500 text-center">
              Didn&apos;t receive an email? Check your spam folder or try again in a few minutes.
            </p>
          )}

          <div className="pt-2 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={resetForm}>
              Try Another Email
            </Button>
            <Link to="/login" className="flex-1">
              <Button variant="secondary" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="forgot-email"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                emailError
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
              }`}
              required
            />
            {emailError && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{emailError}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Request...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>

          <div className="text-center text-xs text-slate-500">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
