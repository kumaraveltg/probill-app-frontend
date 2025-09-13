// Layout.jsx
import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom"; // placeholder for page content

function Layout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <Topbar />
        <div className="p-3">
          <Outlet /> {/* Page content will render here */}
        </div>
      </div>
    </div>
  );
}

export default Layout;
