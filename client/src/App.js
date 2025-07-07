import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Chat from './pages/Chat';
import SetAvatar from './pages/SetAvatar';
import UserProfile from './pages/UserProfile';
import Index from './pages/Index';
import About from './pages/About';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Contact from './pages/Contact'
import adminDashboard from './pages/admin-dashboard';

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
        <Route path='/Chat' element={<Chat />} />
        <Route path='/setAvatar' element={<SetAvatar />} />
        <Route path='/userProfile' element={<UserProfile />} />
        <Route path='/' element={<Index />} />
        <Route path='/about' element={<About />} />
        <Route path='/services' element={<Services />}/>
        <Route path='/projects' element={<Projects />}/>
        <Route path='/contact' element={<Contact />}/>
        <Route path='/admin/dashboard' element={<adminDashboard />}/>
      </Routes>
    </BrowserRouter>
  );
}
