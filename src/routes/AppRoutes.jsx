import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Home from '../pages/Home';
import SheetPicker from '../pages/SheetPicker';
import Scan from '../pages/Scan';
import History from '../pages/History';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sheets" element={<SheetPicker />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
