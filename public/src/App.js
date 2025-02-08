import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register'
import Login from './pages/Login'
import Chat from './pages/Chat'
import SetAvatar from './pages/SetAvatar'
import UserProfile from './pages/UserProfile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/' element={<Chat />} />
        <Route path='/setAvatar' element={<SetAvatar />} />
        <Route path='/userProfile' element={<UserProfile />}/>
      </Routes>
    </BrowserRouter>
  );
}
