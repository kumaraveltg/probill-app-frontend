import React from "react";
import "../src/App.css";
import { useState } from "react";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [open,setOpen] = useState(false)

  return (
    <div
      className="sidebar-custom d-flex flex-column p-2"
      style={{
        width: collapsed ? "70px" : "220px",
        transition: "width 0.3s",
        minHeight: "100vh"
      }}
    >
      {/* Toggle Button */}
      <button         className="btn btn-custom1 mb-5"   onClick={() => setCollapsed(!collapsed)}
        style={{ color: collapsed ? "white" : "white" }} 
        >
        {/* {collapsed ? ">" : "<"} */}
        <i class="bi bi-list"></i>
     </button>
     
      <ul className="nav flex-column">
        <li className="nav-item d-flex align-items-center mb-2 sidebar-item"
            data-bs-toggle= {collapsed ? "tooltip": ""}
            data-bs-placement="right"
            title="Dashboard"
        >
          <i className="bi bi-house-door me-2"></i>
          {!collapsed && <a className="nav-link text-light" href="#">Dashboard</a>}
        </li>
        <li className="nav-item d-flex align-items-center mb-2 sidebar-item"
            data-bs-toggle= {collapsed ? "tooltip": ""}
            data-bs-placement="right"
            title="Settings"
        >
          <i className="bi bi-gear me-2"></i>
          {!collapsed && <a className="nav-link text-light" href="#">Settings</a>}
        </li>
      </ul>
        {/*main menu*/}
        <ul className="nav flex-column">
      <li className="nav-item ">
        {/* Header part: keep the header as a block/row */}
        <div
          className="d-flex align-items-center"
          onClick={() => setOpen(prev => !prev)}
          style={{ cursor: "pointer", userSelect: "none" }}
          aria-expanded={open}
          role="button"
        >
          <i className="bi bi-folder me-2"></i>
          {!collapsed && <span className="nav-link text-light p-0">General Master</span>}
          {!collapsed && <i className={`bi ${open ? "bi-chevron-down" : "bi-chevron-right"} ms-auto`}></i>}
        </div>

        {/* Sub-menu: vertical list, shown only when open */}
        {!collapsed && open && (
          <ul className="nav flex-column ms-4 mt-1">
            <li className="nav-item sidebar-subitem">
              <a className="nav-link text-light small p-1" href="#">Country</a>
            </li>
            <li className="nav-item sidebar-subitem">
              <a className="nav-link text-light small p-1" href="#">State</a>
            </li>
            <li className="nav-item sidebar-subitem">
              <a className="nav-link text-light small p-1" href="#">City</a>
            </li>
          </ul>
        )}
      </li>
    </ul>
    </div>
  );
}

export default Sidebar;



// function Sidebar() {
//   return (
//     <div
//       className="sidebar-custom p-3"
//       style={{ width: "220px", minHeight: "100vh" }}
//     >
// {/* <h4>Sidebar</h4> */}
//       <ul className="nav flex-column">
//         <li className="nav-item">
//           <a className="nav-link text-dark" href="#">
//             Dashboard
//           </a>
//         </li>
//         <li className="nav-item">
//           <a className="nav-link text-dark" href="#">
//             Settings
//           </a>
//         </li>
//       </ul>
//     </div>      
//   );
// }

// export default Sidebar;
