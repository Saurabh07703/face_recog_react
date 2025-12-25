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
    // Aggressive backend warm-up (Render cold start + model pre-loading)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const warmup = (retries = 3) => {
      console.log(`Backend warm-up attempt (${4 - retries}/3)...`);
      axios.get(`${apiUrl}/health`, { timeout: 30000 })
        .then((res) => {
          console.log('Backend signaled ready:', res.data);
        })
        .catch((err) => {
          console.warn('Warm-up attempt failed:', err.message);
          if (retries > 0) {
            console.log('Retrying in 5 seconds...');
            setTimeout(() => warmup(retries - 1), 5000);
          }
        });
    };

    warmup();
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
