import { Route, Routes } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import Home from './Home.jsx';
import Login from './Login.jsx';
import Signup from './Signup';
import Dashboard from './dashboard.jsx';
import Theme from './dark.mode.jsx';


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


