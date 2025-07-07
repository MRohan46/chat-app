import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Chat from './pages/Chat';
import SetAvatar from './pages/SetAvatar';
import AdminDashboard from './pages/adminDashboard';

export default function App() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // ✅ Network Status Listener (Offline Notification)
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      {!isOnline && <div className="offline-banner">⚠️ You are offline!</div>}
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/' element={<Chat />} />
        <Route path='/setAvatar' element={<SetAvatar />} />
        <Route path='/admindashboard' element={<adminDashboard />}/>
      </Routes>
    </BrowserRouter>
  );
}
