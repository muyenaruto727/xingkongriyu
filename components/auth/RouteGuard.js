import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { isProtectedRoute } from '../../lib/protectedRoutes';

const RouteLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-white">
    <div className="text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      <p className="mt-4 text-sm text-gray-500">正在检查登录状态...</p>
    </div>
  </div>
);

const RouteGuard = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const protectedRoute = isProtectedRoute(router.asPath || router.pathname);

  useEffect(() => {
    if (!router.isReady || loading || !protectedRoute || isAuthenticated) {
      return;
    }

    router.replace({
      pathname: '/login',
      query: { redirect: router.asPath },
    });
  }, [isAuthenticated, loading, protectedRoute, router]);

  if (protectedRoute && (loading || !isAuthenticated)) {
    return <RouteLoading />;
  }

  return children;
};

export default RouteGuard;
