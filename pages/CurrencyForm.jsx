import { useState, useEffect, useContext } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";
import DataCurrency from "../context/DataCurrency";

function CurrencyForm({ onClose,onSaved, currencyObject,setCurrencyObject,navigateToList,handleDelete }) {
  const { fetchCurrencies, currencies } = useContext(DataCurrency);
  const [selectedUom, setSelectedUom] = useState(currencyObject || null);
  const [formData, setFormData] = useState({
    id: null,     
    currencycode: "",
    currencyname: "",
    active: true,
    createdby: "admin",
    modifiedby: "admin"
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 

  const resetForm = () => { 
    setFormData((prev) => ({
      ...prev,
      id: null,      
      currencycode: "",
      currencyname: "",
      active: true,
      createdby: "admin",
      modifiedby: "admin",
    }));
    setIsEdit(false);
    setMessage("");
  }

  // Populate form for edit or new mode
  useEffect(() => {
  if (currencyObject && currencyObject.id) {
    // Edit mode
    setFormData({ ...currencyObject });
    setIsEdit(true);
  } else {
    // New mode default Company name should be visible
    resetForm();
    
  }
}, [currencyObject]);

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

    if (!formData.currencycode || !formData.currencyname) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = { 
        currencycode: formData.currencycode,
        currencyname: formData.currencyname,
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
    if(currencyObject?.id){
        handleDelete(currencyObject.id);
        resetForm();
        setCurrencyObject(null);     
    }
    else
    {
        alert("No uom Selected")
    }
 }
  
 const columns = [
    { field: "currencycode", label: "Currency Code" },
    { field: "currencyname", label: "Currency Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    
  ];

  const searchFields = [
    { value: "currencycode", label: "Currency Code" },
    { value: "currencyname", label: "Currency Name" },
    { value: "active", label: "Active" }, 
  ];


  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit Currency" : "New Currency"}</h4>
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
            <label className="form-label">Currency Code *</label>
            <input type="text" className="form-control" name="currencycode"
                   value={formData.currencycode} onChange={handleChange} style={{ width: "200px" }} />
          </div>

          <div className="mb-3">
            <label className="form-label">UOM Name *</label>
            <input type="text" className="form-control" name="currencyname"
                   value={formData.currencyname} onChange={handleChange} style={{ width: "400px" }} />
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
      apiUrl={`${API_URL}/currency/search`}
      columns={columns}
      searchFields={searchFields}
        onSelect={(cur) => {
        setFormData({ ...cur }); // update form
        setCurrencyObject(cur);       // important: now delete knows what to delete
        setIsEdit(true);
        setShowModal(false);
        }}
    />
        </div>
  );
}

export default CurrencyForm;
