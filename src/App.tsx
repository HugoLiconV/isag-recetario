import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import ModulePage from './pages/ModulePage'
import RecipePage from './pages/RecipePage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/module/:slug" element={<ModulePage />} />
          <Route path="/module/:slug/recipe/:recipeId" element={<RecipePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
