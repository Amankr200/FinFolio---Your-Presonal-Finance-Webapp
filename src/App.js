import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupSigninComponent from "./components/SignupSignin";
import Dashboard from "./components/Dashboard"; // Import your Dashboard component
// ...existing imports...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupSigninComponent />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
