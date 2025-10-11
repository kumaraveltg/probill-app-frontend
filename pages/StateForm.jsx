import React, { useContext, useEffect, useState } from "react";
import SearchModal from "../components/SearchModal";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import Select from "react-select";
import { useMemo } from "react";  

// State Form

  function StateForm({ onClose, onSaved, stateValueEdit, navigateToList, handleDelete }) {
  const { countries } = useContext(DataContext);
  const [formData, setFormData] = useState({
    stateCode: "",
    stateName: "",
    countryId: 0,
    countryName: "",
    countryCode: "",
    active: true,
    createdby: "admin",
    modifiedby: "admin",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 

  // ✅ Memoize dropdown options
  const countryOptions = useMemo(
    () =>
      countries.map(c => ({
        value: c.id,
        label: c.countryname,
        code: c.countrycode,
      })),
    [countries]
  );
     

  // ✅ Initialize form when editing
  useEffect(() => {
    if (stateValueEdit && countryOptions.length > 0) {
      const selectedCountry = countryOptions.find(
        c => c.value === Number(stateValueEdit.countryid)
      );

      setFormData({
        id: stateValueEdit.id,
        stateCode: stateValueEdit.statecode,
        stateName: stateValueEdit.statename,
        countryId: selectedCountry?.value || null,
        countryName: selectedCountry?.label || "",
        countryCode: selectedCountry?.code || "",
        active: !!stateValueEdit.active,
        createdby: stateValueEdit.createdby || "admin",
        modifiedby: stateValueEdit.modifiedby || "admin",
      });
    }
  }, [stateValueEdit, countryOptions]);

  // ✅ Reset form (instead of duplicate handleNew)
  const resetForm = () => {
    setFormData({
      stateCode: "",
      stateName: "",
      countryId: 0,
      countryName: "",
      countryCode: "",
      active: true,
      createdby: "admin",
      modifiedby: "admin",
    });
    setMessage("");
  };

  // ✅ Dropdown handler
  const handleCountryChange = (selected) => {
    setFormData(prev => ({
      ...prev,
      countryId: selected?.value || null,
      countryName: selected?.label || "",
      countryCode: selected?.code || "",
    }));
  };

  // ✅ Generic input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ✅ Save
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const url = stateValueEdit
        ? `${API_URL}/stateupdate/${stateValueEdit.id}`
        : `${API_URL}/state/`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statecode: formData.stateCode,
          statename: formData.stateName,
          countryid: Number(formData.countryId)||0,
          countryname: formData.countryName,
          active: formData.active,
          createdby: formData.createdby,
          modifiedby: formData.modifiedby,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        let message = `Http error! Status: ${res.status}`;
        if (errorData) {
        message = Object.values(errorData).flat().join(", ");
      }
        throw new Error(message);
      }
      const handleStateSave = await res.json();
      
      const stateDataForCity = {
      id: savedStateData.id || stateValueEdit?.id,
      statename: formData.stateName,
      statecode: formData.stateCode,
      countryid: formData.countryId,
      countryname: formData.countryName,
      countrycode: formData.countryCode,
    };

        if (onSaved) {
        onSaved(stateDataForCity);
      }

      // 2. Call onClose to close the modal
      if (onClose) {
        onClose();
      } 
    } catch (err) {
      console.error("Error while Saving State:", err);
      setMessage(err.message || "Failed to Save State");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete wrapper
  const handleDeleteClick = () => {
    if (stateValueEdit?.id) {
      handleDelete(stateValueEdit.id);
      resetForm();
    } else {
      alert("No state selected to delete!");
    }
  };
 
      
      

  // ✅ Reusable config (move outside if needed)
  const columns = [
    { field: "statecode", label: "State Code" },
    { field: "statename", label: "State Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    { field: "countryname", label: "Country Name" },
  ];

  const searchFields = [
    { value: "statecode", label: "State Code" },
    { value: "statename", label: "State Name" },
    { value: "active", label: "Active" },
    { value: "countryname", label: "Country Name" },
  ];

  return (
    <div className="card w-100">
      {/* Header Toolbar */}
      <div
        className="d-flex justify-content-between align-items-center w-100"
        style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}
      >
        <h4 className="mb-0">{stateValueEdit ? "Edit State" : "New State"}</h4>
        {navigateToList && (<div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            <i className="bi bi-plus-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}>
            <i className="bi bi-dash-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)}>
            <i className="bi bi-search"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={()=>{
            console.log("Navigating to List");
            if(navigateToList) {navigateToList();
            }}} >
            <i className="bi bi-list"></i>
          </button>
        </div>)}
      </div>

      {/* Form */}
      <div className="card p-3 border border-secondary w-100" style={{ backgroundColor: "#ebe6e6ff" }}>
        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="required" htmlFor="stateCode">State Code</label>
            <input
              type="text"
              name="stateCode"
              className="form-control"
              value={formData.stateCode}
              onChange={handleChange}
              required
              style={{ width: "150px" }}
            />
          </div>

          <div className="mb-3">
            <label className="required" htmlFor="stateName">State Name</label>
            <input
              type="text"
              name="stateName"
              className="form-control"
              value={formData.stateName}
              onChange={handleChange}
              required
              style={{ width: "350px" }}
            />
          </div>

          <div className="mb-3">
            <label className="required" htmlFor="countryId">Country Name</label>
            <div style={{ width: "350px" }}>
              <Select
                options={countryOptions}
                value={countryOptions.find(opt => opt.value === formData.countryId) || null}
                onChange={handleCountryChange}
                placeholder="-- Select Country --"
                isClearable
                isSearchable
                filterOption={(option, inputValue) =>
                  option.label.toLowerCase().startsWith(inputValue.toLowerCase())
                }
              />
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="">Country Code</label>
            <input
              type="text"
              className="form-control"
              value={formData.countryCode || ""}
              readOnly
              style={{ width: "150px", backgroundColor: "#D3D3D3" }}
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

          <button type="submit" className="btn btn-success me-2" disabled={loading}>
            {loading ? "Saving..." : stateValueEdit ? "Update" : "Save"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>

      {/* Search Modal */}
      <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl={`${API_URL}/state/search`}
        columns={columns}
        searchFields={searchFields}
        onSelect={(stateValueEdit) => {
          const selectedCountry = countryOptions.find(  
              c => c.value === Number(stateValueEdit.countryid));
          setFormData({
            id: stateValueEdit.id,
            stateCode: stateValueEdit.statecode,
            stateName: stateValueEdit.statename,
            countryId: Number(stateValueEdit.countryid) || 0,
            countryName:selectedCountry?.label|| stateValueEdit.countryname||"",
            countryCode: selectedCountry?.code ||"",
            active: !!stateValueEdit.active,
            createdby: stateValueEdit.createdby,
            modifiedby: stateValueEdit.modifiedby,
          });
        }}
      />
    </div>
  );
}
export default StateForm;