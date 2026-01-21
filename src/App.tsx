import { Routes, Route } from 'react-router-dom'
import {
  HomePage,
  VideoFeedPage,
  ListPage,
  AdminPage,
  LoginPage,
  ChatListPage,
  ChatRoomPage
} from '@/pages'

function App() {
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/feed" element={<VideoFeedPage />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:roomId" element={<ChatRoomPage />} />
      </Routes>
    </div>
  )
}

export default App
