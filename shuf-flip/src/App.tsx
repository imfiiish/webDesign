import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import I18nProvider from './components/I18nProvider'
import Home from './pages/home'
import Login from './pages/login'
import Shelf from './pages/shelf'
import Flip from './pages/flip'
import Rating from './pages/rating'
import Results from './pages/results'
import Progress from './pages/progress'
import Scene from './pages/scene'

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shelf" element={<Shelf />} />
          <Route path="/flip" element={<Flip />} />
          <Route path="/rating" element={<Rating />} />
          <Route path="/results" element={<Results />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/scene/:id" element={<Scene />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}
