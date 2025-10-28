// Layout.jsx
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <Topbar />
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
         <div
        className="main-content"
        style={{
          marginLeft: collapsed ? "70px" : "220px", // adjust based on sidebar
          marginTop: "60px", // topbar height
          transition: "margin-left 0.3s",
          padding: "5px",
        }}
      >  
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
