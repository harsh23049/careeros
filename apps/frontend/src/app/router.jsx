import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';
import Dashboard from '../pages/Dashboard';
import Jobs from '../pages/Jobs';
import JobDetails from '../pages/JobDetails';
import Applications from '../pages/Applications';
import Resumes from '../pages/Resumes';
import AITools from '../pages/AITools';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'jobs', element: <Jobs /> },
      { path: 'jobs/:id', element: <JobDetails /> },
      { path: 'applications', element: <Applications /> },
      { path: 'resumes', element: <Resumes /> },
      { path: 'ai-tools', element: <AITools /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
