import { useState, useEffect, useContext,useMemo } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext , { useData } from "../context/DataContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal"; 
import { AuthContext } from "../context/AuthContext";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function HsnForm({ onClose,onSaved, hsnObject,setHsnObject,navigateToList,handleDelete }) {
  const { fetchHsn, hsn,companyname,companyid } = useContext(DataContext);
   const { username:ctxUsername, companyid: loginCompanyId, companyno: loginCompanyNo, authFetch } = useContext(AuthContext);
  const [selectedhsn, setSelectedHsn] = useState(hsnObject || null);
  const [formData, setFormData] = useState({
    id: null,    
    companyid:loginCompanyId ||null, 
    companyname:companyname,
    companyno: loginCompanyNo ||"",
    hsncode: "",
    hsndescription: "", 
    taxheaderid:null,
    taxname:" ",
    taxrate:0.00,
    effective_date:"",
    active: true,
    createdby: "",
    modifiedby: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const{taxmaster,fetchTaxMaster} = useData();
  const [selectedTax, setSelectedTax] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

 
  const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const uname = ctxUsername || fallbackParams.username || "admin";
  const cid = loginCompanyId || fallbackParams.companyid || null;
  const cno = loginCompanyNo || fallbackParams.companyno || ""; 
  console.log(fallbackParams.username);

  
 

    const taxOptions = useMemo(() => {
        return taxmaster.map((tm) => ({
          value: tm.id,           
          label: tm.taxname,
          ttaxrate:tm.taxrate,    
        }));
      }, [taxmaster]);

 



  const resetForm = () => { 
        let defaultCompanyName = "Default Company";

    if (Array.isArray(hsn)) {
        const match = hsn.find(
        (c) => Number(c.companyid) === Number(companyid ?? cid)
        );
        console.log("Matched company:", match);
        if (match) {
        defaultCompanyName = match.companyname; 
        }
    } 
    setFormData((prev) => ({
    ...prev,
    id: null,     
    companyid:cid,
    companyname:defaultCompanyName,
    companyno:cno,
    hsncode: "",
    hsndescription: "",
    effective_date:"",
    taxheaderid:null,
    taxname:"",
    taxrate:0.00,
    active: true,
    createdby: uname,
    modifiedby: uname,
    }));
    setIsEdit(false);
    setMessage("");
  }

  // Populate form for edit or new mode
  useEffect(() => {
  if (hsnObject && hsnObject.id) {
    // Edit mode
    setFormData({ ...hsnObject , taxheaderid:  hsnObject.taxheaderid  || null,});
    setIsEdit(true);
  } else {
    // New mode default Company name should be visible
    resetForm();
    
  }
}, [hsnObject,taxOptions]);

 useEffect(() => { 
      fetchTaxMaster();
    }, [fetchTaxMaster]); 

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

    if (!formData.hsncode  ) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = { 
        companyid:Number(formData.companyid),
        companyno:formData.companyno,
        hsncode: formData.hsncode,
        hsndescription: formData.hsndescription,
        effective_date:formData.effective_date,
        taxheaderid: Number(formData.taxheaderid),
        taxname:formData.taxname,
        taxrate: formData.taxrate,
        active: formData.active,
        createdby: formData.createdby || "admin",
        modifiedby: formData.modifiedby || "admin"
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/hsnupdate/${formData.id}` : `${API_URL}/addhsn/`;

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
      console.error("Error While Saving HSN:", err);

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
    if(hsnObject?.id){
        handleDelete(hsnObject.id);
        resetForm();
        setHsnObject(null);     
    }
    else
    {
        alert("No HSN Selected")
    }
 }
  
 const columns = [
    { field: "hsncode", label: "HSN Code" },
    { field: "hsndescription", label: "HSN Description" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    
  ];

  const searchFields = [
    { value: "hsncode", label: "HSN Code" },
    { value: "hsndescription", label: "HSN Description" },
    { value: "active", label: "Active" }, 
  ];


  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit HSN" : "New HSN"}</h4>
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
            <label className="form-label">HSN Code *</label>
            <input type="text" className="form-control" name="hsncode"
                   value={formData.hsncode} onChange={handleChange} style={{ width: "200px" }} />
          </div>

          <div className="mb-3">
            <label className="form-label">HSN Description </label>
            <textarea className="form-control" name="hsndescription"
                   value={formData.hsndescription} onChange={handleChange} rows={5} style={{ width: "450px" }} />
          </div>
        <div className="row mb-3">
            <div className="col-md-3">
            <label className="form-label">Tax Name</label>
            <Select
            options={taxOptions}
            value={taxOptions.find(opt => opt.value === formData?.taxheaderid) || null}
            onChange={(selectedTax) =>
                setFormData({ ...formData, taxname: selectedTax?.value,
                    taxrate: selectedTax?.ttaxrate
                 })
            }
            placeholder="-- Select Tax Name--"
            isClearable
            isSearchable    
            />  
          </div> 
          <div className="col-md-3">
            <label className="form-label">TaxRate</label>
            <input type="number" className="form-control" name="taxrate"
                   value={formData.taxrate} onChange={selectedTax}  style={{ width: "200px" }}
                   readOnly
                   />
          </div> 
          <div className="col-md-4">
            <label className="form-label">Effective Date</label>  
            <br />         
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border p-2 rounded w-full"
            />
          </div> 
          <div className="col-md-2">
            <br />
            <input type="checkbox" className="form-check-input" name="active"
                   checked={formData.active} onChange={handleChange}   />
            <label className="form-check-label">Active</label>
          </div>
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
      apiUrl={`${API_URL}/hsn/search/${cid}`}
      columns={columns}
      searchFields={searchFields}
        onSelect={(hsn) => {
        setFormData({ ...hsn }); // update form
        setHsnObject(hsn);       // important: now delete knows what to delete
        setIsEdit(true);
        setShowModal(false);
        }}
    />
        </div>
  );
}

export default HsnForm;
