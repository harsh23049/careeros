import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export function ForgotPassword() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset your password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <Button type="submit" variant="primary" className="w-full">
          Send Reset Link
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
