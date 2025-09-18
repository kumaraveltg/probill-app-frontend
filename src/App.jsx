import React from "react";
import { BrowserRouter as Router , Routes, Route} from "react-router-dom";
import Country from "../pages/Country.jsx";
import Layout from "../components/Layout.jsx";
import State  from "../pages/State.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="country" element={<Country />} />
          <Route path= "state" element={<State />} />
          {/* Add more routes here */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
