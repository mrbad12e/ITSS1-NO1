import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ForumPage from "./pages/ForumPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="/forum/:id" element={<ForumPage />} />
      </Routes>
    </Router>
  );
};

export default App;
