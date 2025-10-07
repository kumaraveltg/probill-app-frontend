import { useState, useEffect, useContext, useCallback } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";

function FinyrForm({ onClose, onSaved, finyrObject, setFinyrObject, navigateToList, handleDelete }) {
  const { acessToken, authFetch,username: ctxUsername} = useContext(AuthContext);
  const [formData, setFormData] = useState({
    id: null,
    finyrname: "",
    startdate: "",
    enddate: "",
    active: true,
    createdby: "",
    modifiedby: ""
  });

  const [periods, setPeriods] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
 const uname = ctxUsername || fallbackParams.username || "system";

  // Reset form for new entry
  const resetForm = () => {
    setFormData({
      id: null,
      finyrname: "",
      startdate: "",
      enddate: "",
      active: true,
      createdby: uname ||"",
      modifiedby: uname||""
    });
    setPeriods([{ periodno: 1, periodname: "", startdate: "", enddate: "", status: "Open", selected: false, key: 1 }]);
    setIsEdit(false);
    setMessage("");
  };

  // Populate form for edit or new
  useEffect(() => {
    if (finyrObject && finyrObject.id) {
      setFormData({ ...finyrObject });
      setIsEdit(true);
    } else {
      resetForm();
    }
  }, [finyrObject]);

  //grid check box - all 
  const handleSelectAll = (checked) => {
  setSelectAll(checked);
  setPeriods((prev) =>
    prev.map((p) => ({ ...p, selected: checked }))
  );
    };
  // Fetch periods for selected FinYr
  const fetchFinyrDetails = useCallback(async (finyrId) => {
    try {
      const res = await authFetch(`${API_URL}/finyr/${finyrId}`, {
        headers: { Authorization: `Bearer ${acessToken}` }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setPeriods(
        data.periods && data.periods.length > 0
          ? data.periods.map((p, idx) => ({ ...p, key: p.periodno || idx, selected: false }))
          : [{ periodno: 1, periodname: "", startdate: "", enddate: "", status: "Open", selected: false, key: 1 }]
      );
    } catch (err) {
      console.error("Failed to fetch periods:", err);
      setPeriods([{ periodno: 1, periodname: "", startdate: "", enddate: "", status: "Open", selected: false, key: 1 }]);
    }
  }, [acessToken, authFetch]);

  useEffect(() => {
    if (formData.id) fetchFinyrDetails(formData.id);
  }, [formData.id, fetchFinyrDetails]);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Handle periods grid changes
  const handlePeriodChange = (index, field, value) => {
    setPeriods((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };
  // generate periods using button

  const generatePeriods = async (startdate, enddate, finyrid) => {
  try {
    const res = await fetch(`${API_URL}/generate_periods`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startdate, enddate }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Failed to generate periods");
    }

    const data = await res.json();
    setPeriods(data); // update your frontend grid
  } catch (error) {
    console.error("Error generating periods:", error);
    setMessage("Failed to generate periods");
  }
};


//addperiod row
 const addPeriodRow = () => {
  setPeriods((prev) => [
    ...prev,
    {
      key: Date.now(),
      finyrid: formData.id || 0,  // <-- use the saved finyr id
      periodname: "",
      startdate: "",
      enddate: "",
      status: "Open",
      selected: false
    }
  ]);
};


  const toggleSelectPeriod = (idx) => {
  setPeriods((prev) => {
    const updated = [...prev];
    updated[idx].selected = !updated[idx].selected;

    // Update "Select All" if all rows are selected
    const allSelected = updated.every((p) => p.selected);
    setSelectAll(allSelected);

    return updated;
  });
};

  const handleDeletePeriods = () => {
    const remaining = periods.filter(p => !p.selected);
    if (remaining.length === 0) {
      alert("At least 1 period must remain!");
      return;
    }
    setPeriods(remaining);
  };

  // Handle submit
  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    if (!formData.finyrname) {
      setMessage("Please fill in the Financial Year name.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
      finyrname: formData.finyrname,
      startdate: formData.startdate,
      enddate: formData.enddate,
      active: formData.active,
      createdby: formData.createdby || uname,
      modifiedby: formData.modifiedby || uname,
    };

      const endpoint = isEdit ? `${API_URL}/updatefinyr/${formData.id}` : `${API_URL}/addfinyr/`;

      const res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw errData?.detail || new Error(`HTTP error ${res.status}`);
      }
      const savedFinyr = await res.json(); 
     setFormData((prev) => ({ ...prev, id: savedFinyr.id })); 
     await generatePeriods(savedFinyr.startdate, savedFinyr.enddate, savedFinyr.id);
     setMessage("Financial year and periods saved successfully!");
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error saving FinYr:", err);
      setMessage(err?.message || "Failed to save FinYr.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (formData?.id) {
      handleDelete(formData.id);
      resetForm();
    } else {
      alert("No Financial Year selected");
    }
  };

  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit Financial Year" : "New Financial Year"}</h4>
        <div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            <i className="bi bi-plus-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}>
            <i className="bi bi-dash-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)}>
            <i className="bi bi-search"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigateToList?.()}>
            <i className="bi bi-list"></i>
          </button>
        </div>
      </div>

      {message && <div className="alert alert-danger mt-2">{message}</div>}
    
      {/* ===== HEADER FORM (non-grid tab) ===== */}
       <form onSubmit={handleSubmit}>
      <div className="card p-3 border border-secondary w-100 mt-2" style={{ backgroundColor: "#ebe6e6ff" }}>
        <div className="row mb-3">
         <div className="col-md-3">
          <label className="form-label">Financial Year Name</label>
          <input type="text" className="form-control" name="finyrname"
                 value={formData.finyrname} onChange={handleChange} style={{ width: "200px" }} />
        </div>

        <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input type="date" className="form-control" name="startdate"
                 value={formData.startdate} onChange={handleChange} style={{ width: "200px" }} />
        </div>

        <div className="col-md-3">
          <label className="form-label">End Date</label>
          <input type="date" className="form-control" name="enddate"
                 value={formData.enddate} onChange={handleChange} style={{ width: "200px" }} />
        </div>
        </div>

        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" name="active"
                 checked={formData.active} onChange={handleChange} />
          <label className="form-check-label">Active</label>
        </div>
      </div>

      {/* ===== PERIODS GRID ===== */}
      
      <div
        className="mt-3 p-2"
        style={{
            backgroundColor: "#ebe6e6ff",
            border: "1px solid #ced4da",
            borderRadius: "8px",
        }}
        >
  {/* ===== Title and Buttons (Always Visible) ===== */}
  <div className="d-flex justify-content-between align-items-center mb-2">
    <h5 className="m-0">Financial Year Details</h5>
    <div className="d-flex gap-2">
      <button type="button" className="btn btn-secondary" onClick={addPeriodRow}>
        <i className="bi bi-plus-lg"></i>
      </button>
      <button type="button" className="btn btn-danger" onClick={handleDeletePeriods}>
        <i className="bi bi-trash3"></i>
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => generatePeriods(formData.startdate, formData.enddate)}
      >
        Generate Periods
      </button>
    </div>
  </div>
        <div
    style={{
      maxHeight: "300px",
      overflowY: "auto",
      overflowX: "auto",
      border: "1px solid #ced4da",
      position: "relative",
    }}
  > 
        <table className="table table-bordered mb-0" style={{ minWidth: "800px" }}>
         <thead className="table-light">
            <tr>
          <th> <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}/></th>
              <th>Sl.No.</th> 
              <th>Period Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((p, idx) => (
              <tr key={p.key}>
                <td>
                  <input type="checkbox" checked={p.selected || false} onChange={() => toggleSelectPeriod(idx)} />
                </td>
                <td>{idx + 1}</td>                
                <td>
                  <input type="text" className="form-control" value={p.periodname}
                         onChange={(e) => handlePeriodChange(idx, "periodname", e.target.value)} />
                </td>
                <td>
                  <input type="date" className="form-control" value={p.startdate}
                         onChange={(e) => handlePeriodChange(idx, "startdate", e.target.value)} />
                </td>
                <td>
                  <input type="date" className="form-control" value={p.enddate}
                         onChange={(e) => handlePeriodChange(idx, "enddate", e.target.value)} />
                </td>
                <td>
                  <select className="form-select" value={p.status}
                          onChange={(e) => handlePeriodChange(idx, "status", e.target.value)}>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

     

      {/* ===== SUBMIT / CANCEL BUTTONS ===== */}
      <div className="mt-3 d-flex gap-2">
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          <FaSave className="me-1" /> {loading ? "Saving.." : isEdit ? "Update" : "Save"}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
          <FaTimes className="me-1" /> Cancel
        </button>
      </div>
     </form>
      <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl={`${API_URL}/finyr/search`}
        columns={[
          { field: "finyrname", label: "Financial Year" },
          { field: "startdate", label: "Start Date" }
        ]}
        searchFields={[
          { value: "finyrname", label: "Financial Year" },
          { value: "startdate", label: "Start Date" }
        ]}
        onSelect={(fin) => {
          setFormData({ ...fin });
          setFinyrObject(fin);
          setIsEdit(true);
          setShowModal(false);
        }}
      />
    </div>
  );
}

export default FinyrForm;
