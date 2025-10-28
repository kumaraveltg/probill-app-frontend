import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "../context/AuthContext.jsx";
import { DataProvider } from "../context/DataContext";
import { useSessionTimeout } from "../hooks/useSessonTimeout.jsx";

import Layout from "../components/Layout.jsx";
import Country from "../pages/Country.jsx";
import State from "../pages/State.jsx";
import City from "../pages/City.jsx";
import Uom from "../pages/Uom.jsx";
import Company from "../pages/Company.jsx";
import Currency from "../pages/Currency.jsx";
import Login from "../pages/Login.jsx";
import Users from "../pages/Users.jsx";
import UserRole from "../pages/UserRole.jsx";
import Finyr from "../pages/Finyr.jsx";
import TaxMaster from "../pages/TaxMaster.jsx";
import Items from "../pages/Items.jsx";
import Test from "../pages/Test.jsx";
import Hsn from "../pages/Hsn.jsx";
import Customer from "../pages/Customer.jsx";
import Invoice from "../pages/Invoice.jsx";
import Receipts from "../pages/Receipts.jsx";

// ✅ Protected Route
const ProtectedRoute = ({ children }) => {
  const { accessToken } = useContext(AuthContext);

  if (!accessToken) {
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
            {/* 🔓 Public Route */}
            <Route path="/login" element={<Login />} />

            {/* 🔒 Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/country" replace />} />
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

            {/* 🧭 Catch-all redirect */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
