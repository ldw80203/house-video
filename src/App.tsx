import { Routes, Route } from 'react-router-dom'
import { HomePage, VideoFeedPage, ListPage, AdminPage } from '@/pages'

function App() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<VideoFeedPage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  )
}

export default App
