import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadPaper from './pages/UploadPaper';
import ExtractPaper from './pages/ExtractPaper';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<UploadPaper />} />
          <Route path="extract" element={<ExtractPaper />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
