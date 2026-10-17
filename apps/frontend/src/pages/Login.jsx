import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth';
import Button from '../components/ui/Button';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
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
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      await login(formData.email.trim(), formData.password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to log in. Please check your credentials and try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign in to your account</h2>
        <p className="mt-1 text-xs text-slate-500">Access your job pipeline and AI assistant</p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="login-email"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Email address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
              formErrors.email
                ? 'border-rose-500 focus:ring-rose-400'
                : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
            }`}
            required
          />
          {formErrors.email && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.email}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="login-password"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
              formErrors.password
                ? 'border-rose-500 focus:ring-rose-400'
                : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
            }`}
            required
          />
          {formErrors.password && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.password}</p>
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
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          Create one now
        </Link>
      </div>
    </div>
  );
}

export default Login;
