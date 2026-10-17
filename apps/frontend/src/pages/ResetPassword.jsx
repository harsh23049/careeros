import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';
import Button from '../components/ui/Button';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setServerError('Missing reset token. Please request a new password reset link.');
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const response = await authService.resetPassword({
        token,
        newPassword: formData.newPassword,
      });

      setSuccessMessage(
        response.message || 'Password has been reset successfully! Redirecting to login...'
      );

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Password reset failed. The link may have expired or is invalid.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-xl font-bold">
          !
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invalid Reset Link</h2>
          <p className="mt-2 text-xs text-slate-500">
            No valid password reset token was found in the link. Tokens expire after 15 minutes.
          </p>
        </div>
        <Link to="/forgot-password">
          <Button variant="primary" className="w-full">
            Request New Reset Link
          </Button>
        </Link>
        <div className="text-center text-xs text-slate-500">
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Set new password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Please enter and confirm your new secure password.
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
            className="p-3 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
          >
            {successMessage}
          </div>
          <Link to="/login">
            <Button variant="primary" className="w-full">
              Sign In Now
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="reset-password"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              New Password
            </label>
            <input
              id="reset-password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                formErrors.newPassword
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
              }`}
              required
            />
            {formErrors.newPassword && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.newPassword}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reset-confirm-password"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                formErrors.confirmPassword
                  ? 'border-rose-500 focus:ring-rose-400'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
              }`}
              required
            />
            {formErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {formErrors.confirmPassword}
              </p>
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
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </Button>

          <div className="text-center text-xs text-slate-500">
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default ResetPassword;
