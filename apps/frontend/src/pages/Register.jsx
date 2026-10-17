import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth';
import Button from '../components/ui/Button';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'Full name must be at least 3 characters.';
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required.';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      errors.username = 'Username can only contain letters, numbers, and underscores.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
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
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');
    setSuccessMessage('');

    try {
      await register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      setSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please check the details and try again.';
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create your account</h2>
        <p className="mt-1 text-xs text-slate-500">Get started with CareerOS in seconds</p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="p-3 text-xs rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
        >
          {serverError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="p-3 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="register-fullname"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Full Name
          </label>
          <input
            id="register-fullname"
            name="fullName"
            type="text"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Jane Doe"
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
              formErrors.fullName
                ? 'border-rose-500 focus:ring-rose-400'
                : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
            }`}
            required
          />
          {formErrors.fullName && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.fullName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-username"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Username
          </label>
          <input
            id="register-username"
            name="username"
            type="text"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="janedoe"
            disabled={isSubmitting}
            className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
              formErrors.username
                ? 'border-rose-500 focus:ring-rose-400'
                : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
            }`}
            required
          />
          {formErrors.username && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{formErrors.username}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Email address
          </label>
          <input
            id="register-email"
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
          <label
            htmlFor="register-password"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
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

        <div>
          <label
            htmlFor="register-confirm-password"
            className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="register-confirm-password"
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
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default Register;
