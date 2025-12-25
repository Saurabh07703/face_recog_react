import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Match from './pages/Match';
import Manage from './pages/Manage';

function App() {
  useEffect(() => {
    // Warm up the backend (Render cold start)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    axios.get(`${apiUrl}/health`).catch(() => {
      console.log('Backend unique warming up...');
    });
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/match" element={<Match />} />
            <Route path="/manage" element={<Manage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
