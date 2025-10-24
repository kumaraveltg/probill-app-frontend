import React from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { BrowserRouter as Router , Routes, Route} from "react-router-dom";
import { DataProvider }  from '../context/DataContext';  
import {  AuthProvider } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { useSessionTimeout } from "../hooks/useSessonTimeout.jsx"; 
import Layout from "../components/Layout.jsx";
import Country from "../pages/Country.jsx";
import State  from "../pages/State.jsx";
import City from "../pages/City.jsx";
import Uom from "../pages/Uom.jsx"; 
import Company from "../pages/Company.jsx" 
import Currency from "../pages/Currency.jsx"
import Login from "../pages/Login.jsx"
import Users from "../pages/Users.jsx";
import UserRole from "../pages/UserRole.jsx";
import Finyr from "../pages/Finyr.jsx";
import TaxMaster from "../pages/TaxMaster.jsx";
import Items from "../pages/Items.jsx";
import Test from  "../pages/Test.jsx"
import Hsn from "../pages/Hsn.jsx";
import Customer from "../pages/Customer.jsx";
import Invoice from "../pages/Invoice.jsx"
import Receipts from "../pages/Receipts.jsx";


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
              <Route path="users" element={<Users />} />
              <Route path="userrole" element={<UserRole />} />
              <Route path="finyr" element={<Finyr />} />
              <Route path="taxmaster" element={<TaxMaster />} />
              <Route path="items" element={<Items />} />
              <Route path="test" element={<Test />} />
              <Route path="hsn" element={<Hsn />} />
              <Route path="customer" element={<Customer />} />
              <Route path="invoice" element={<Invoice />} />
              <Route path="receipts" element={<Receipts />} />
            </Route>
             {/* Default root goes to /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />            
            {/* Catch-all route to redirect unknown paths */}
              <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes> 
      </DataProvider>
    </AuthProvider>
    </Router>
  );
}


export default App;
