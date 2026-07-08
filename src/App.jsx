import './App.css'
import AuthForm from './components/AuthForm'
import Dashboard from './components/Dashboard'
import ThemeToggle from './components/ThemeToggle'
import { useAuthContext } from './context/AuthContext'

function App() {
  const { user, loading } = useAuthContext()

  return (
    <>
      <ThemeToggle />

      {loading ? (
        <div className="app-state">
          <p>Cargando sesión...</p>
        </div>
      ) : user ? (
        <Dashboard user={user} />
      ) : (
        <AuthForm />
      )}
    </>
  )
}

export default App