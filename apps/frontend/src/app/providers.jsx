import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth';
import { queryClient } from './queryClient';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default Providers;
