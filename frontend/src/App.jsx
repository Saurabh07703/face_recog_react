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
    // Warm up the backend (Render cold start + model pre-loading)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Backend warm-up sequence started...');

    // Using a longer timeout for the pre-warm since it now loads models
    axios.get(`${apiUrl}/health`, { timeout: 60000 })
      .then((res) => {
        console.log('Backend ready:', res.data);
      })
      .catch((err) => {
        console.log('Backend warm-up notice:', err.message);
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
