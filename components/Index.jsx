import { Routes, Route, Navigate } from "react-router-dom";
import AdminCompany from "../pages/Admin/AdminCompany";
import AdminLayout from "../components/AdminLayout"; 
import License from "../pages/Admin/Licenses";
 
function AdminRoutes() {
  return (
    <Routes>
      {/* Admin layout wrapper */}
      <Route element={<AdminLayout />}> 
        <Route path="admincompany" element={<AdminCompany />} />
        <Route path="adminlicense" element={<License />} />
        <Route path="*" element={<Navigate to="/admin/admincompany" replace />} />
      </Route>  
    </Routes>
  );
}

export default AdminRoutes;
