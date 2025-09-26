import React from "react";
import { BrowserRouter as Router , Routes, Route} from "react-router-dom";
import Country from "../pages/Country.jsx";
import Layout from "../components/Layout.jsx";
import State  from "../pages/State.jsx";
import City from "../pages/City.jsx";
import { DataProvider }  from '../context/DataContext'; 
import Uom from "../pages/Uom.jsx"; 
import Company from "../pages/Company.jsx" 
import Currency from "../pages/Currency.jsx"
import { DataCurrencyProvider } from "../context/DataCurrency";



function App() {
  return (
    <Router>
      <DataProvider>
        <DataCurrencyProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="country" element={<Country />} />
              <Route path="state" element={<State />} /> 
              <Route path="city" element={<City />} />
              <Route path="uom" element={<Uom />} /> 
              <Route path="company" element={<Company />} />
              <Route path="currency" element={<Currency />} />
            </Route>
          </Routes>
        </DataCurrencyProvider>
      </DataProvider>
    </Router>
  );
}


export default App;
