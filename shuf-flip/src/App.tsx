import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import I18nProvider from './components/I18nProvider'
import Home from './pages/home'
import Login from './pages/login'

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}
