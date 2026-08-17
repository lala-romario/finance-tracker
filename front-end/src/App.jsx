import { Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/dashboard.jsx';
import Theme from './components/dark.mode.jsx';


function App() {
  return (
    <>
      <Theme />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='login' element={<Login />} />
        <Route path='signup' element={<Signup />} />
        <Route path='dashboard' element={<Dashboard />}/>
      </Routes></>
  )
}

export default App


