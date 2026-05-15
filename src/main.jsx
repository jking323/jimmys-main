import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Site from './Site.jsx';
import AdminApp from './admin/AdminApp.jsx';
import './theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<Site />} />
    </Routes>
  </BrowserRouter>
);
