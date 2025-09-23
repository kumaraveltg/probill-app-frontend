import React, { useContext, useEffect, useState } from "react";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import Select from "react-select";
import { useMemo } from "react";

// This is ONLY for modal use (no navigation logic)
function StateFormModal({ onClose, onSaved }) {
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const countryOptions = useMemo(
    () => countries.map(c => ({
      value: c.id,
      label: c.countryname,
      code: c.countrycode,
    })),
    [countries]
  );

  const handleCountryChange = (selected) => {
    setFormData(prev => ({
      ...prev,
      countryId: selected?.value || null,
      countryName: selected?.label || "",
      countryCode: selected?.code || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.stateCode || !formData.stateName || !formData.countryId) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/state/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          statecode: formData.stateCode,
          statename: formData.stateName,
          countryid: Number(formData.countryId) || 0,
          countryname: formData.countryName,
          countrycode: formData.countryCode,
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

      const savedStateData = await res.json();
      
      const stateDataForCity = {
        id: savedStateData.id,
        statename: formData.stateName,
        statecode: formData.stateCode,
        countryid: formData.countryId,
        countryname: formData.countryName,
        countrycode: formData.countryCode,
      };

      if (onSaved) {
        onSaved(stateDataForCity);
      }

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

  return (
    <div className="p-3">
      {message && <div className="alert alert-danger">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="required">State Code</label>
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
          <label className="required">State Name</label>
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
          <label className="required">Country Name</label>
          <div style={{ width: "350px" }}>
            <Select
              options={countryOptions}
              value={countryOptions.find(opt => opt.value === formData.countryId) || null}
              onChange={handleCountryChange}
              placeholder="-- Select Country --"
              isClearable
              isSearchable
            />
          </div>
        </div>

        <div className="mb-3">
          <label>Country Code</label>
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

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default StateFormModal;