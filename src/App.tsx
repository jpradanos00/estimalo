import { SessionProvider, useSession } from './context/SessionContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import { Landing } from './pages/Landing';
import { SessionRoom } from './pages/SessionRoom';

function AppContent() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Landing />;
  }

  return <SessionRoom />;
}

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SessionProvider>
          <AppContent />
        </SessionProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
