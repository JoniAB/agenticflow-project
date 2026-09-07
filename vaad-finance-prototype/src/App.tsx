import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppDataProvider } from "./context/AppDataContext";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";

function AppShell() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Login />;
  return (
    <AppDataProvider>
      <Dashboard />
    </AppDataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
