// front/sitemap-routes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// A dummy component for the element prop
const DummyComponent = () => <div />;

const SitemapRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DummyComponent />} />
      <Route path="/signup" element={<DummyComponent />} />
      <Route path="/signin" element={<DummyComponent />} />
      <Route path="/forgot-password" element={<DummyComponent />} />
      {/* Add other public static routes here if any */}
    </Routes>
  );
};

export default SitemapRoutes;
