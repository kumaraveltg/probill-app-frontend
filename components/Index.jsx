import { Routes, Route, Navigate } from "react-router-dom";
import AdminCompany from "../pages/Admin/AdminCompany";
import AdminLayout from "../components/AdminLayout";
import { useState, useEffect, useContext } from "react";
 
function AdminRoutes() {
  return (
    <Routes>
      {/* Admin layout wrapper */}
      <Route element={<AdminLayout />}>
        {/* Nested admin pages */}
        <Route path="admincompany" element={<AdminCompany />} />
         <Route path="*" element={<Navigate to="admincompany" replace />} />
      </Route> 
        {/* Optional: redirect /admin → /admin/admincompany 
     */}
    </Routes>
  );
}

export default AdminRoutes;
