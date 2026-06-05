import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './routes/Landing'
import HostView from './routes/HostView'
import PlayerView from './routes/PlayerView'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/host/:code" element={<HostView />} />
      <Route path="/play/:code" element={<PlayerView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
