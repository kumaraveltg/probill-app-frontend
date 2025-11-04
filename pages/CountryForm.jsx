import React, { useContext, useEffect, useState } from "react";
import SearchModal from "../components/SearchModal"; 
import { API_URL } from "../components/Config";
import Select from "react-select";
import { useMemo } from "react";  
import {AuthContext} from "../context/AuthContext";


function CountryForm({ onClose, onSaved,editcountry,navigateToList,handleDelete }) {
  const [formData, setFormData] = useState({
    countryCode: "",
    countryName: "",
    active: true,
    createdby: "admin",
    modifiedby: "admin",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 


  useEffect ( () => {
    if (editcountry) {
      setFormData({
        id : editcountry.id,
        countryCode :editcountry.countrycode,
        countryName :editcountry.countryname,
        active : editcountry.active,
        modifiedby:editcountry.modifiedby
      });
    }
  },[editcountry] );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
     const url = editcountry?`${API_URL}/countryupdate/${editcountry.id}`:`${API_URL}/country/`;
      

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        countrycode: formData.countryCode,
        countryname: formData.countryName,
        active: formData.active,
        createdby: formData.createdby,
        modifiedby: formData.modifiedby,
      }),
    });

    if (!res.ok) {
      // Try to parse backend error message
      let errorMessage = `HTTP error! Status: ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData?.detail) {
          errorMessage = errorData.detail; // ✅ backend message
        }
      } catch {
        const text = await res.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    await res.json();
    onSaved(); // refresh parent list
    onClose(); // close form
  } catch (err) {
    console.error("Error While Saving Country:", err);
    setMessage(err.message || "Failed to save country."); // ✅ show backend message
  } finally {
    setLoading(false);
  }
};
/* toolbar action*/
  const handleNew = () => {
          setFormData({
          countryCode: "",
          countryName: "",
          active : true,
          createdby : "admin",
          modifiedby: "admin"
        });
        setMessage("");        
        if (editcountry && typeof handleNew === "function") {
        handleNew(); // call parent to clear editcountry
        }
         };
      

    const hadlelist= () => {
      if(navigateToList) navigateToList();
    }
    const handleDeleteClick = () => {
  if (handleDelete && editcountry?.id) {
    handleDelete(editcountry.id);   // 👈 pass id
    handleNew()              // 👈 go back to list
  } else {
    alert("No country selected to delete!");
  }
};

 const columns = [
    { field: "countrycode", label: "Code" },
    { field: "countryname", label: "Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
  ];

  const searchFields = [
    { value: "countrycode", label: "Country Code" },
    { value: "countryname", label: "Country Name" },
    { value: "active", label: "Active" },
  ];
const handleSelectCountry  = (country) => {
    setFormData({
      id: country.id,
      countryCode: country.countrycode,
      countryName: country.countryname,
      active: country.active,
      createdby: country.createdby,
      modifiedby: country.modifiedby,
    });
    };


  return (
    <div className="card w-100">
    <div className="d-flex justify-content-between align-items-center w-100 "
       style={{
      backgroundColor: "#E3E4E6", // light grey background
      border: "1px solid #E3E4E6", // border
      borderRadius: "5px"           // optional rounded corners
      }}
      >
        <h4 className="mb-0 ">{editcountry ? "Edit Country" : "New Country"}</h4>

        {/* Left-side Buttons */}
        <div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-primary " onClick={handleNew}>
            <i className="bi bi-plus-lg"></i> {/* Add */}
          </button>
          <button type="button" className="btn btn-danger " onClick={handleDeleteClick}>
             <i className="bi bi-dash-lg"></i> {/* Remove */}
          </button>
          <button type="button" className="btn btn-info" onClick={()=> setShowModal(true)} >
             <i className="bi bi-search"></i> {/* Search */}
          </button>
          <button type="button" className="btn btn-secondary" onClick={hadlelist}>
            <i className="bi bi-list"></i> {/* List */}
          </button>

          {/* Dropdown Button for Preview */}
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-warning dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"  >
               <i class="bi bi-chat-square-dots"></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" type="button">
                  Preview
                </button>
              </li> 
              <li>
                <button className="dropdown-item" type="button">
                  Print
                </button>
              </li>              
            </ul>
          </div>
        </div>
       </div>  
     <div className="card p-3 border border-secondary w-100" style={{backgroundColor:"#E3E4E6"}} >
              
      {message && <div className="alert alert-danger">{message}</div>}
    
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="required" htmlFor="countryCode">Country Code</label>
          <input
            type="text"
            name="countryCode"
            className="form-control"
            value={formData.countryCode}
            onChange={handleChange}
            required
            style={{width:"150px"}}
          />
        </div>

        <div className="mb-3">
          <label className="required" htmlFor="countryName">Country Name </label>
          <input
            type="text"
            name="countryName"
            className="form-control"
            value={formData.countryName}
            onChange={handleChange}
            required
             style={{width:"350px"}}
          />
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="active"
            className="form-check-input"
            checked={formData.active}
            onChange={handleChange}
          />
          <label className="form-check-label">Active</label>
        </div>

        <button
          type="submit"
          className="btn btn-success me-2"
          disabled={loading}
        >
          {loading ? "Saving..." :editcountry? "Update" : "Save"  }
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
      <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl= {`${API_URL}/country/search`}
        columns={columns}
        searchFields={searchFields}
        onSelect={handleSelectCountry}
      />
    </div>
  );
};

export default CountryForm