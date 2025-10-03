import React, { useState } from "react";
import "../src/App.css";
import { Link } from "react-router-dom";
import Layout from "./Layout";

function Sidebar({ collapsed, setCollapsed }) {
  //const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div
      className="sidebar-custom d-flex flex-column p-2"
      style={{
        width: collapsed ? "70px" : "220px",
        top: "60px",
        transition: "width 0.3s",
        minHeight: "calc(100vh - 60px)",
        position: "fixed",
        overflowY: "auto",
      }}
    >
      {/* Toggle Button */}
      <button
        className="btn btn-custom1 mb-5"
        onClick={() => setCollapsed(!collapsed)}
        style={{ color: "white" }}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Main Nav */}
      <ul className="nav flex-column">
        <li
          className="nav-item d-flex align-items-center mb-2 sidebar-item"
          data-bs-toggle={collapsed ? "tooltip" : ""}
          data-bs-placement="right"
          title="Dashboard"
        >
          <i className="bi bi-house-door me-2"></i>
          {!collapsed && (
            <Link className="nav-link text-light" to="/dashboard">
              Dashboard
            </Link>
          )}
        </li>
        <li
          className="nav-item d-flex align-items-center mb-2 sidebar-item"
          data-bs-toggle={collapsed ? "tooltip" : ""}
          data-bs-placement="right"
          title="Settings"
        >
          <i className="bi bi-gear me-2"></i>
          {!collapsed && (
            <Link className="nav-link text-light" to="/settings">
              Settings
            </Link>
          )}
        </li>
      </ul>

      {/* General Master Menu */}
      <ul className="nav flex-column">
        <li className="nav-item">
          <div
            className="d-flex align-items-center"
            onClick={() => setOpen((prev) => !prev)}
            style={{ cursor: "pointer", userSelect: "none" }}
            aria-expanded={open}
            role="button"
          >
            <i className="bi bi-folder me-2"></i>
            {!collapsed && (
              <>
                <span className="nav-link text-light p-0">General Master</span>
                <i
                  className={`bi ${
                    open ? "bi-chevron-down" : "bi-chevron-right"
                  } ms-auto`}
                ></i>
              </>
            )}
          </div>

          {!collapsed && open && (
            <ul className="nav flex-column ms-4 mt-1">
              <li className="nav-item sidebar-subitem">
                <Link className="nav-link text-light small p-1" to="/country">
                  Country
                </Link>
              </li>
              <li className="nav-item sidebar-subitem">
                <Link className="nav-link text-light small p-1" to="/state">
                  State  
                </Link>
              </li>
              
              <li className="nav-item sidebar-subitem">
                <Link className="nav-link text-light small p-1" to="/city">
                  City
                </Link>
              </li>
              <li className="nav-item sidebar-subitem">
                <Link className="nav-link text-light small p-1" to="currency">
                  Currency
                </Link>
              </li>
              <li className="nav-item sidebar-subitem">
                <Link className="nav-link text-light small p-1" to="/company">
                  Company Master 
                </Link>
              </li>
              <li className="nav-item sidebar-subitem">
                <Link className="nav-link text-light small p-1" to="uom">
                  Unit of Measurement (UOM)
                </Link>
              </li>
              <li className="nav-item sidebar-subitem">
                <Link className="nav-link text-light small p-1" to="/users">
                  Users
                </Link>
              </li>
              <li className="nav-item sidebar-subitem">
                <Link className="nav-link text-light small p-1" to="userrole">
                  UserRole
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
