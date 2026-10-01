
import '../styles/globals.css';
import 'antd/dist/reset.css';
import '@wangeditor/editor/dist/css/style.css';
import ErrorBoundary from '../components/common/ErrorBoundary';
import RouteGuard from '../components/auth/RouteGuard';
import { AuthProvider } from '../contexts/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouteGuard>
          <Component {...pageProps} />
        </RouteGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
