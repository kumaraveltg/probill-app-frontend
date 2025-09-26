import { useState, useEffect, useContext } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";

function UomForm({ onClose,OnSaved, uomObject,setUomObject,navigateToList,handleDelete }) {
  const { fetchUoms, uoms,companyid, companyname } = useContext(DataContext);
  const [selectedUom, setSelectedUom] = useState(uomObject || null);
  const defaultcompanyid=1; // -- need to check the global parameters
  const [formData, setFormData] = useState({
    id: null,
    companyid: companyid ?? defaultcompanyid,
    companyname: companyname ?? "",
    uomcode: "",
    uomname: "",
    active: true,
    createdby: "admin",
    modifiedby: "admin"
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 

  const resetForm = () => {
    let defaultCompanyName = "Default Company";
    
    if (Array.isArray(uoms)) {
      const match = uoms.find(
        (c) => c.companyid === (companyid ?? defaultcompanyid)
      );
      console.log("Matched company:", match);
      if (match) {
        defaultCompanyName = match.companyname;
      }
    }

    setFormData((prev) => ({
      ...prev,
      id: null,
      companyid: companyid ?? defaultcompanyid,
      companyname: companyname ?? defaultCompanyName,
      uomcode: "",
      uomname: "",
      active: true,
      createdby: "admin",
      modifiedby: "admin",
    }));
    setIsEdit(false);
    setMessage("");
  }

  // Populate form for edit or new mode
  useEffect(() => {
  if (uomObject && uomObject.id) {
    // Edit mode
    setFormData({ ...uomObject });
    setIsEdit(true);
  } else {
    // New mode default Company name should be visible
    resetForm();
    
  }
}, [uomObject]);

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

    if (!formData.uomcode || !formData.uomname) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        companyid: Number(formData.companyid),
        companyname: formData.companyname || "",
        uomcode: formData.uomcode,
        uomname: formData.uomname,
        active: formData.active,
        createdby: formData.createdby || "admin",
        modifiedby: formData.modifiedby || "admin"
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/uom/${formData.id}` : `${API_URL}/uom/`;

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
      OnSaved();
      onClose();
    } catch (err) {
      console.error("Error While Saving UOM:", err);

      if (Array.isArray(err)) {
        // Backend returned multiple errors
        const messages = err.map(e => e?.msg || JSON.stringify(e)).join(", ");
        setMessage(messages);
      } else if (err?.message) {
        setMessage(err.message);
      } else {
        setMessage("Failed to save UOM.");
      }

    } finally {
      setLoading(false);
    }
  };

 const handleDeleteClick= ()=>{
    if(uomObject?.id){
        handleDelete(uomObject.id);
        resetForm();
        setUomObject(null);     
    }
    else
    {
        alert("No uom Selected")
    }
 }
  
 const columns = [
    { field: "uomcode", label: "UOM Code" },
    { field: "uomname", label: "UOM Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    
  ];

  const searchFields = [
    { value: "uomcode", label: "UOM Code" },
    { value: "uomname", label: "UOM Name" },
    { value: "active", label: "Active" }, 
  ];


  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit UOM" : "New UOM"}</h4>
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

      <div className="card p-3 border border-secondary w-100" style={{ backgroundColor: "#ebe6e6ff" }}>
        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Company Name*</label>
            <input type="text" className="form-control" name="companyname"
                   value={formData.companyname || companyname || ""} readOnly style={{ width: "400px" }} />
          </div>

          <div className="mb-3">
            <label className="form-label">UOM Code *</label>
            <input type="text" className="form-control" name="uomcode"
                   value={formData.uomcode} onChange={handleChange} style={{ width: "200px" }} />
          </div>

          <div className="mb-3">
            <label className="form-label">UOM Name *</label>
            <input type="text" className="form-control" name="uomname"
                   value={formData.uomname} onChange={handleChange} style={{ width: "400px" }} />
          </div>

          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" name="active"
                   checked={formData.active} onChange={handleChange} />
            <label className="form-check-label">Active</label>
          </div>

          <div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              <FaSave className="me-1" /> {loading ? "Saving.." :isEdit? "Update" : "Save" }
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              <FaTimes className="me-1" /> Cancel
            </button>
          </div>
        </form>
      </div>
      <SearchModal
      show={showModal}
      onClose={()=>setShowModal(false)}
      apiUrl={`${API_URL}/uom/search/${defaultcompanyid}`}
      columns={columns}
      searchFields={searchFields}
        onSelect={(uom) => {
        setFormData({ ...uom }); // update form
        setUomObject(uom);       // important: now delete knows what to delete
        setIsEdit(true);
        setShowModal(false);
        }}
    />
        </div>
  );
}

export default UomForm;
