import './App.css'
import { AdminPage } from './pages/AdminPage'
import { PublicAlbumPage } from './pages/PublicAlbumPage'

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin')

  return isAdmin ? <AdminPage /> : <PublicAlbumPage />
}

export default App
