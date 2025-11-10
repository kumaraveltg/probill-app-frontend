import React, { useState } from "react";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <AdminTopbar />
      <AdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className="main-content"
        style={{
          marginLeft: collapsed ? "70px" : "220px",
          marginTop: "60px",
          transition: "margin-left 0.3s",
          padding: "5px",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
