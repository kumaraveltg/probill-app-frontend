import { useState, useEffect, useContext } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext from "../../context/DataContext";
import { API_URL } from "../../components/Config";
import SearchModal from "../../components/SearchModal"; 

function LicensesForm({ onClose,onSaved, licenseObject,setLicenseObject,navigateToList,handleDelete }) {
  const { fetchLicense, license } = useContext(DataContext);
  const [formData, setFormData] = useState({
    id: null,     
    companyid: "",    
    companyname:"",
    companyno:"",
    planname: "",
    planperiod:"",
    startdate:"",
    enddate:"",
    licensekey:"",
    userlimit:0,
    active: true,
    createdby: " ",
    modifiedby: " "
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 

  const resetForm = () => { 
    setFormData((prev) => ({
    ...prev,
    companyid: "",
    companyname:"",
    companyno:"",
    planname: "",
    planperiod:"",
    startdate:"",
    enddate:"",
    licensekey:"",
    userlimit:0,
    active: true,
    createdby: " ",
    modifiedby: " "
    }));
    setIsEdit(false);
    setMessage("");
  }

  // Populate form for edit or new mode
  useEffect(() => {
  if (licenseObject && licenseObject.id) {
    // Edit mode
    setFormData({ ...licenseObject });
    setIsEdit(true);
  } else {
    // New mode default Company name should be visible
    resetForm();
    
  }
}, [licenseObject]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.companyno ) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = { 
        currencycode: formData.currencycode,
        currencyname: formData.currencyname,
        symbol: formData.symbol,
        active: formData.active,
        createdby: formData.createdby || "admin",
        modifiedby: formData.modifiedby || "admin"
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/currency/updatecurrency/${formData.id}` : `${API_URL}/currency/addcurrency/`;

      console.log("Sending payload:", payload);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Handle array of validation errors or detail
        if (Array.isArray(errorData)) {
          throw errorData;
        } else if (errorData?.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
      }
      await res.json();
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error While Saving Currency:", err);  
    } finally {
      setLoading(false);
    }
  };

 const handleDeleteClick= ()=>{
    if(licenseObject?.id){
        handleDelete(licenseObject.id);
        resetForm();
        setLicenseObject(null);     
    }
    else
    {
        alert("No Currency Selected")
    }
 }
  
 const columns = [
    { field: "companyno", label: "Company No" }, 
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    
  ];

  const searchFields = [
    { value: "companyno", label: "Company No" }, 
    { value: "active", label: "Active" }, 
  ];
 
  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit Licenses" : "New Licenses"}</h4>
        {navigateToList && (<div className="btn-toolbar gap-2" role="toolbar">
          {/*<button type="button" className="btn btn-secondary" onClick={resetForm}>
            <i className="bi bi-plus-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}>
            <i className="bi bi-dash-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)}>
            <i className="bi bi-search"></i>
          </button>*/}
          <button type="button" className="btn btn-secondary" onClick={()=>{
            console.log("Navigating to List");
            if(navigateToList) {navigateToList();
            }}} >
            <i className="bi bi-list"></i>
          </button>
        </div>)}
      </div>

      <div className="card p-3 border border-secondary w-100" style={{ backgroundColor: "#ebe6e6ff" }}>
        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Company Name</label>
            <input type="text" className="form-control" name="companyname"
                   value={formData.companyname} onChange={handleChange}  />
          </div>

          <div className="col-md-2">
            <label className="form-label">Company No *</label>
            <input type="text" className="form-control" name="companyno"
                   value={formData.companyno} onChange={handleChange}  />
          </div>
          <div className="col-md-2">
            <label className="form-label">Plan Name</label>
            <input type="text" className="form-control" name="planname"
                   value={formData.planname} onChange={handleChange}   />
          </div>
            <div className="col-md-2">
            <label className="form-label">Plan Period</label>
            <input type="text" className="form-control" name="planperiod"
                   value={formData.planperiod} onChange={handleChange}   />
          </div>
          </div> 
          <div className="row mb-3">
          <div className="col-md-2">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" name="startdate"
                   value={formData.startdate} onChange={handleChange}  />
          </div>

          <div className="col-md-2">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" name="enddate"
                   value={formData.enddate} onChange={handleChange}  />
          </div>
          <div className="col-md-4">
            <label className="form-label">License Key</label>
            <input type="text" className="form-control" name="licensekey"
                   value={formData.licensekey} onChange={handleChange}   />
          </div>
          <div className="col-md-1">
            <label className="form-label">User Limit</label>
            <input type="text" className="form-control" name="userlimit"
                   value={formData.userlimit} onChange={handleChange}   />
          </div>
          </div>
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" name="active"
                   checked={formData.active} onChange={handleChange} />
            <label className="form-check-label">Active</label>
          </div> 
          <div>
            {/*<button type="submit" className="btn btn-primary me-2" disabled={loading}>
              <FaSave className="me-1" /> {loading ? "Saving.." :isEdit? "Update" : "Save" }
            </button>*/}
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              <FaTimes className="me-1" /> Cancel
            </button>
          </div>
        </form>
      </div>
     
        </div>
  );
}

export default LicensesForm;
