import React from "react";
import { BrowserRouter as Router , Routes, Route} from "react-router-dom";
import Country from "../pages/Country.jsx";
import Layout from "../components/Layout.jsx";
import State  from "../pages/State.jsx";
import City from "../pages/City.jsx";
import { DataProvider }  from '../context/DataContext'; 
import Uom from "../pages/Uom.jsx";
import StateForm from "../pages/StateForm.jsx";
import CityForm from "../pages/CityForm.jsx";
import StateModalForm from "../pages/StateModalForm.jsx";

function App() {
  return (
    <Router>
      <DataProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="country" element={<Country />} />
          <Route path= "state" element={<State />} /> 
          <Route path= "city" element={<City />} />
          <Route path= "uom" element={<Uom />} />
          {/* <Route path= "city/new" element={<CityForm />} /> */}
          {/* Add more routes here */}
        </Route>
      </Routes>
      </DataProvider>
    </Router>
  );
}

export default App;
