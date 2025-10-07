import { useState, useEffect, useContext, useCallback } from "react";
import { FaSave, FaTimes } from "react-icons/fa"; 
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";
import DataContext from "../context/DataContext";

function TaxMasterForm({ onClose, onSaved, taxObject, setTaxObject, navigateToList, handleDelete }) {
  const {taxmaster,companyname,companyno,companyid } = useContext(DataContext)
  const { acessToken, authFetch,username: ctxUsername,companyid: defaultcompanyid,companyno:defaultCompanyno} = useContext(AuthContext);
  const [activeTab,setActiveTab]= useState("taxDetails")
  const [taxdetails, setTaxDetails] = useState([{ key: 1, taxsupply: "", taxslabname: "", gtaxrate: 0, selected: false }]);
  const [formData, setFormData] = useState({
    id: null,
    companyid:  defaultcompanyid,
    companyname: companyname ??"",
    companyno:companyno ??"",
    taxname: "",
    taxtype: "GST",
    taxrate: 0,
    active: true,
    createdby: "",
    modifiedby: ""
  });
   const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectAll, setSelectAll] = useState(false);

 const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
 const uname = ctxUsername || fallbackParams.username || "admin";
 const cid = defaultcompanyid || fallbackParams.companyid || companyid;
 const cno = defaultCompanyno || fallbackParams.companyno || companyno;
  // Reset form for new entry
  const resetForm = () => {
    let defaultCompanyName = "Default Company";
    let defaultCompanyno = "Default Company"
    
    if (Array.isArray(taxmaster)) {
      const match = taxmaster.find(
        (c) => c.companyid === ( defaultcompanyid)
      );
      console.log("Matched company:", match);
      if (match) {
        defaultCompanyName = match.companyname;
        defaultCompanyno = match.companyno;
      }
    }
    setFormData({
      id: null,
      companyid: cid,
      companyname: companyname??defaultCompanyName,
      companyno:cno,
      taxname: "",
      taxtype: "GST",
      taxrate: null,
      active: true,
      createdby: uname ||"",
      modifiedby: uname||""
    });
    setTaxDetails([{ key: 1, taxheaderid: 0, taxsupply: "", taxslabname: "", gtaxrate:0, rowno: 1,selected: false }]);
    setIsEdit(false);
    setMessage("");
  };




  // Populate form for edit or new
  useEffect(() => {
    if (taxObject && taxObject.id) {
      setFormData( {
        id: taxObject.id,
        companyid: taxObject.companyid,
        companyname: taxObject.companyname,
        companyno: taxObject.companyno,
        taxname: taxObject.taxname,
        taxtype: taxObject.taxtype || "GST",
        taxrate: taxObject.taxrate,
        active: taxObject.active ?? true,
        createdby: taxObject.createdby || uname,
        modifiedby: uname
       });
      setIsEdit(true);
    } else {
      resetForm();
    }
  }, [taxObject,uname]);

  //grid check box - all 
  const handleSelectAll = (checked) => {
  setSelectAll(checked);
  setTaxDetails((prev) =>
    prev.map((p) => ({ ...p, selected: checked }))
  );
    };
   
  const fetchTaxDetails = useCallback(async (taxheaderid) => {
  console.log("🔍 fetchTaxDetails STARTED with ID:", taxheaderid);
  
  try {
    const url = `${API_URL}/gettaxdetails/${taxheaderid}`;
    const res = await authFetch(url, {
      headers: { Authorization: `Bearer ${acessToken}` }
    });
    
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    
    const data = await res.json();
    console.log("🔍 Fetched data:", data);
    
    // ✅ Fix: Use correct field names from API
    const taxDetails = data.taxdtl || data.taxdetails || [];
    const taxHeader = data.taxhdr || data.taxheader || {};
    
    console.log("🔍 Tax Details Array:", taxDetails);
    console.log("🔍 Tax Details Length:", taxDetails.length);
    
    setTaxDetails(
      taxDetails.length > 0
        ? taxDetails.map((p, idx) => ({ 
            ...p, 
            key: idx + 1, 
            taxheaderid: p.taxheaderid || taxHeader?.id || taxheaderid, 
            selected: false,
            rowno: idx + 1,
            gtaxrate: p.gtaxrate || p.taxrate || 0
          }))
        : [{ 
            taxsupply: "", 
            taxslabname: "", 
            gtaxrate: formData.taxrate || 0,
            selected: false, 
            key: 1, 
            rowno: 1,
            taxheaderid: taxheaderid 
          }]
    );
    console.log("✅ setTaxDetails called successfully");
  } catch (err) {
    console.error("❌ Error in fetchTaxDetails:", err);
    setTaxDetails([{ 
      taxsupply: "", 
      taxslabname: "", 
      gtaxrate: 0, 
      selected: false, 
      key: 1, 
      rowno: 1,
      taxheaderid: null 
    }]);
  }
}, [acessToken, authFetch, API_URL, formData.taxrate]);

useEffect(() => {
  console.log("useEffect triggered - formData.id:", formData.id);
  if (formData.id) {
    console.log("Fetching tax details for ID:", formData.id);
    fetchTaxDetails(formData.id);
  } else {
    console.log("No formData.id, skipping fetch");
  }
}, [formData.id, fetchTaxDetails]);
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
    setTaxDetails((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };
  // generate Tax using button

 const generateTaxDet = async (taxtype, taxrate) => {
  try {
    const payload = {
      taxtype,
      taxrate: parseFloat(taxrate),  // ensure numeric
    };

    console.log("Sending payload:", payload);

    const res = await fetch(`${API_URL}/taxdet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to generate TaxDetails");
    setTaxDetails(data);
    console.log("generate Tax",data);
  } catch (error) {
    console.error("Error generating TaxDetails:", error);
  }
};



//addperiod row
 const addPeriodRow = () => {
  setTaxDetails((prev) => [
    ...prev,
    {
      key: Date.now(),
      taxheaderid: formData.id || 0,  
      taxsupply: "",
      taxslabname: "",
      gtaxrate: 0 ,
      selected: false
    }
  ]);
};


  const toggleSelectPeriod = (idx) => {
  setTaxDetails((prev) => {
    const updated = [...prev];
    updated[idx].selected = !updated[idx].selected;

    // Update "Select All" if all rows are selected
    const allSelected = updated.every((p) => p.selected);
    setSelectAll(allSelected);

    return updated;
  });
};

  const handleDeletePeriods = () => {
    const remaining = taxdetails.filter(p => !p.selected);
    if (remaining.length === 0) {
      alert("At least 1 period must remain!");
      return;
    }
    setTaxDetails(remaining);
  };

  // Handle submit
  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");

    if (!formData.taxname) {
      setMessage("Please fill in the Tax name.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
      companyid: cid,
      companyno: cno || "", // ✅ always send string
      companyname: companyname || "",
      taxname: formData.taxname,
      taxtype: formData.taxtype,
      taxrate: Number(formData.taxrate)||0,
      active: formData.active,
      createdby: formData.createdby || uname,
      modifiedby: formData.modifiedby || uname, 
    };

      const endpoint = isEdit ? `${API_URL}/taxupdate/${formData.id}` : `${API_URL}/taxmaster/`;

      const res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${acessToken}`},
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw errData?.detail || new Error(`HTTP error ${res.status}`);
      }
      const savedTaxHeader = await res.json(); 
     setFormData((prev) => ({ ...prev, id: savedTaxHeader.id })); 
     await generateTaxDet(savedTaxHeader.taxtype, savedTaxHeader.taxrate);
     setMessage("Tax Header and Tax Details saved successfully!");
      if (typeof onSaved === "function") {
        onSaved();
      }
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
      alert("No Taxes  selected");
    }
  };

  return (
    
    <div className="card w-100">
        {message && <div className="alert alert-danger mt-2">{message}</div>}
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

    
    
      {/* ===== HEADER FORM (non-grid tab) ===== */}
       <form onSubmit={handleSubmit}>
      <header className="card p-3 border border-secondary w-100 mt-2" style={{ backgroundColor: "#ebe6e6ff" }}>
        <div className="row mb-3">
         <div className="col-md-3">
          <label className="form-label">Company Name</label>
          <input type="text" className="form-control" name="companyname"
          readOnly
                 value={formData.companyname} onChange={handleChange} style={{ width: "200px" }} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Company No</label>
          <input type="text" className="form-control" name="companyno"
          readOnly
                 value={formData.companyno} onChange={handleChange} style={{ width: "100px" }} />
        </div>
         <div className="col-md-2">
          <label className="form-label">Tax Type</label>
          <input type="text" className="form-control" name="taxtype"
                 value={formData.taxtype} onChange={handleChange} style={{ width: "100px" }} readOnly />
        </div>
         <div className="col-md-3">
          <label className="form-label">Tax Name</label>
          <input type="text" className="form-control" name="taxname"
                 value={formData.taxname} onChange={handleChange} style={{ width: "200px" }} />
        </div>

        <div className="col-md-2">
          <label className="form-label">Tax Rate</label>
          <input type="number" className="form-control" name="taxrate"
                 value={formData.taxrate||0} onChange={handleChange} style={{ width: "100px" }} />
        </div> 
        </div>

        <div className="form-check mb-3">
          <input type="checkbox" className="form-check-input" name="active"
                 checked={formData.active} onChange={handleChange} />
          <label className="form-check-label">Active</label>
        </div>
      </header>

      {/* ===== PERIODS GRID ===== */}
      <ul className="nav nav-tabs mt-3" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "taxDetails" ? "active" : ""}`}
            type="button"
            style={{ backgroundColor: "#ebe6e6ff" }}
            onClick={() => setActiveTab("taxDetails")}
          >
            Tax Details
          </button>
        </li>
        {/* Add more tabs here if needed */}
        {/* <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === "otherTab" ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab("otherTab")}
          >
            Other Tab
          </button>
        </li> */}
      </ul>
       <div className="tab-content mt-3">
        {activeTab === "taxDetails" && (
          <div
            className="tab-pane fade show active p-2"
            style={{
              backgroundColor: "#ebe6e6ff",
              border: "1px solid #ced4da",
              borderRadius: "1px",
            }}
          >
            {/* Title and Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-1"> 
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
                  onClick={() => generateTaxDet(formData.taxtype, formData.taxrate||0)}
                >
                  Generate Tax
                </button>
              </div>
            </div>

            {/* Table */}
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
                    <th>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th>Sl.No.</th>
                    <th>Tax Supply</th>
                    <th>Tax SlabName</th>
                    <th>Tax Rate</th> 
                  </tr>
                </thead>
                <tbody>
                  {taxdetails.map((p, idx) => (
                    <tr key={p.key}>
                      <td>
                        <input
                          type="checkbox"
                          checked={p.selected || false}
                          onChange={() => toggleSelectPeriod(idx)}
                        />
                      </td>
                      <td>{p.rowno?? idx + 1}</td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={p.taxsupply}
                          onChange={(e) => handlePeriodChange(idx, "taxsupply", e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={p.taxslabname}
                          onChange={(e) => handlePeriodChange(idx, "taxslabname", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={p.gtaxrate}
                          onChange={(e) => handlePeriodChange(idx, "gtaxrate", e.target.value)}
                        />
                      </td>  

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
        apiUrl={`${API_URL}/tax/search/${companyid}`}
        columns={[
          { field: "taxname", label: "Tax Name" },
          { field: "active", label: "active" }
        ]}
        searchFields={[
          { value: "taxname", label: "Tax Name" },
          { value: "active", label: "active" }
        ]}
        onSelect={(fin) => {
          setFormData({ ...fin });
          setTaxObject(fin);
          setIsEdit(true);
          setShowModal(false);
        }}
      />
    </div>
  );
}

export default TaxMasterForm;
