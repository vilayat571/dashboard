import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import NewsPage from './pages/NewsPage'
import GalleryPage from './pages/GalleryPage'

// Protect routes — redirect to login if not logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" />
}

const AppRoutes = () => {
  const { isLoggedIn } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/news" /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/news" />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="gallery" element={<GalleryPage />} />
      </Route>
    </Routes>
  )
}

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
)

export default App
