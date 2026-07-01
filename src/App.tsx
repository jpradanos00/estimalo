import { SessionProvider, useSession } from './context/SessionContext';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { Landing } from './pages/Landing';
import { SessionRoom } from './pages/SessionRoom';
import { Footer } from './components/Footer';

function AppContent() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        {session ? <SessionRoom /> : <Landing />}
      </div>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <SessionProvider>
            <AppContent />
          </SessionProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
