import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CameraCapture from './components/CameraCapture';
import AdSlideshow from './components/AdSlideshow';
import './styles/camera.css';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<CameraCapture />} />
        <Route path="/ads" element={<AdSlideshow />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
