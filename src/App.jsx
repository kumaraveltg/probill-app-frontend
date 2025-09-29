import React from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
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
import {  AuthProvider } from "../context/AuthContext.jsx";
import Login from "../pages/Login.jsx"
import { Navigate } from "react-router-dom";
import { useSessionTimeout } from "../hooks/useSessonTimeout.jsx"; 

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { accessToken } = useContext(AuthContext);

  if (!accessToken) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }
 return children;
};

function App() { 
  useSessionTimeout();
  return (
    <Router>
    <AuthProvider>
      <DataProvider>
        <DataCurrencyProvider>
          <Routes>
          {/* Public route */}           
          <Route path="/login" element={<Login />} />
           {/* Protected routes */} 
            <Route   path="/" element={  <Layout />  }   >
              <Route path="country" element={<Country />} />
              <Route path="state" element={<State />} /> 
              <Route path="city" element={<City />} />
              <Route path="uom" element={<Uom />} /> 
              <Route path="company" element={<Company />} />
              <Route path="currency" element={<Currency />} />
            </Route>
             {/* Default root goes to /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />            
            {/* Catch-all route to redirect unknown paths */}
              <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </DataCurrencyProvider>
      </DataProvider>
    </AuthProvider>
    </Router>
  );
}


export default App;
