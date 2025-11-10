import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import DataContext from "../context/DataContext"; 
import { FaSave, FaTimes } from "react-icons/fa";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";  
import Select from "react-select";   
import CurrencyForm from '../pages/CurrencyForm'




function CompanyForm({ onClose,onSaved, companyObject,navigateToList }) {
  const {  currencies,fetchCurrencies} = useContext(DataContext); 
  const {username:ctxUsername,authFetch} = useContext(AuthContext)
  const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const uname = ctxUsername || fallbackParams.username || "admin";
  const [formData, setFormData] = useState({
    id: null,
    companycode: "", 
    companyname:  "",
    companyno: "",
    adress: "",     
    gstno:"",
    phone:"",
    emailid:"",
    contactperson:"",
    currency:null,
    currencycode: "",
    active: true,
    createdby: "admin",
    modifiedby: uname
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); 
  const [showCurrencyModal,setShowCurrencyModal]= useState(false);

  useEffect(() => {
    fetchCurrencies();
  },[ ])

    const currecnySelection = useMemo(() =>{
        if(!currencies || !Array.isArray(currencies))             
            return [];
        return currencies.map (c => (
            {
                value: c.id,
                label: c.currencycode,
            }
        ) )},[currencies]
    );
  
 const handleOpenModal= () => {
  setShowCurrencyModal(true);
 }

 const resetForm = () => {
  let selectedCurrency = null;

  if (companyObject && currecnySelection.length > 0) {
    selectedCurrency = currecnySelection.find(
      c => c.value === Number(companyObject.currency)
    );
  }

  setFormData({
    id: companyObject?.id || null,
    companycode: companyObject?.companycode || "",
    companyname: companyObject?.companyname || "",
    companyno:companyObject?.companyno||"",
    adress: companyObject?.adress || "",
    gstno: companyObject?.gstno || "",
    phone: companyObject?.phone || "",
    emailid: companyObject?.emailid || "",
    contactperson: companyObject?.contactperson || "",
    currency: selectedCurrency?.value || null,
    currencycode: selectedCurrency?.label || "INR",
    active: companyObject?.active ?? true,
    createdby: companyObject?.createdby || "admin",
    modifiedby: uname,
  });

  setIsEdit(!!companyObject);
  setMessage("");
};

 
  // Populate form for edit or new mode
  useEffect(() => {
  if (companyObject && companyObject.id) {
    // Edit mode
    const selectedCurrency= currecnySelection.find(
            c => c.value === Number(companyObject.currency)
        )
    setFormData({ ...companyObject,
        currency:selectedCurrency?.value || null,
        currencycode:selectedCurrency?.label || "",
     });
    setIsEdit(true);
  } else {
    // New mode default Company name should be visible
    resetForm();
    
  }
}, [companyObject,currecnySelection]);

 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (name === "emailid") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setMessage(emailRegex.test(value) || value === "" ? "" : "Email Format is Wrong");
  }
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.companycode || !formData.companyname) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }
   if (formData.emailid) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailid)) {
      setMessage("Invalid email format");
      setLoading(false)
      return; // stop submission
    }
  }

    try {
      const payload = { 
        companycode: formData.companycode,
        companyname: formData.companyname,
        companyno: formData.compnyno,
        adress: formData.adress,
        gstno: formData.gstno,
        phone: formData.phone,
        emailid: formData.emailid,
        contactperson: formData.contactperson,
        currency: Number(formData.currency)||null,
        currencycode: formData.currencycode||"",
        active: formData.active,
        createdby: formData.createdby || "admin",
        modifiedby: formData.modifiedby || "admin"
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/company/Updatecompany/${formData.id}` : `${API_URL}/company/createcompany/`;

      console.log("Sending payload:", payload);

      const res = await authFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error details:", errorData);
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
      console.error("Error While Saving Company:", err);

      if (Array.isArray(err)) {
        // Backend returned multiple errors
        const messages = err.map(e => e?.msg || JSON.stringify(e)).join(", ");
        setMessage(messages);
      } else if (err?.message) {
        setMessage(err.message);
      } else {
        setMessage("Failed to save Company.");
      }

    } finally {
      setLoading(false);
    }
  };

 


 const columns = [
    { field: "companycode", label: "Company Code" },
    { field: "companyname", label: "Company Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    
  ];

  const searchFields = [
    { value: "companycode", label: "Company Code" },
    { value: "companyname", label: "Company Name" },
    { value: "active", label: "Active" }, 
  ];

  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit Company" : "New Company"}</h4>
         <div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            <i className="bi bi-plus-lg"></i>
          </button>
          {/* <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}>
            <i className="bi bi-dash-lg"></i>
          </button> */}
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)}>
            <i className="bi bi-search"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={()=>{
            console.log("Navigating to List");
            if(navigateToList) {navigateToList();
            }}}  >
            <i className="bi bi-list"></i>
          </button>
        </div>
      </div>

      <div className="card p-3 border border-secondary w-100" style={{ backgroundColor: "#ebe6e6ff" }}>
        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row mb-1">
          <div className="col-md-5">
            <label className="form-label">Company Name*</label>
            <input type="text" className="form-control" name="companyname"
                   value={formData.companyname || ""} onChange={handleChange} style={{ width: "400px" }} />
          </div>

          <div className="col-md-3">
            <label className="form-label">Company Code *</label>
            <input type="text" className="form-control" name="companycode"
                   value={formData.companycode} onChange={handleChange}   />
          </div> 
          <div className="col-md-2">
            <label className="form-label">Company No</label>
            <input type="text" className="form-control" name="companyno"
                   value={formData.companyno||"Auto No"} onChange={handleChange} 
                   readOnly
                   />
                  
          </div> 
          </div>
          <div className="row mb-1 align-items-start">
            {/* Address field (4 rows textarea) */}
            <div className="col-md-5 position-relative">
              <label className="form-label">Address*</label>
              <textarea
                className="form-control"
                name="adress"
                value={formData.adress}
                onChange={handleChange}
                rows={4}
                style={{ width: "400px", resize: "none" }}
              />
            </div>

            {/* Right side container for GST and Phone */}
            <div className="col-md-3 d-flex flex-column justify-content-between" style={{ height: "100px" }}>
              {/* GST on top line */}
              <div>
                <label className="form-label">GST No*</label>
                <input
                  type="text"
                  className="form-control"
                  name="gstno"
                  value={formData.gstno}
                  onChange={handleChange}
                  style={{ width: "300px" }}
                />
              </div>

              {/* Phone aligned to bottom of textarea */}
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: "300px" }}
                />
              </div>
            </div>
            </div>
          <div className="row mb-1">
          <div className="col-md-4">
            <label className="form-label">Email-id </label>
            <input type="text" className="form-control" name="emailid"
             value={formData.emailid} onChange={handleChange}   />
          </div>
         
          <div className="col-md-3 offset-md-1" >
            <label className="form-label">Contact Person</label>
            <input type="text" className="form-control" name="contactperson"
                   value={formData.contactperson} onChange={handleChange}  />
          </div>
          <div className="col-md-4">
            <label className="form-label">Currency</label>
            <div className="d-flex align-items-center">
              <div style={{width:"200px"}}>
              <div style={{ flexGrow: 1}}>
                <Select
                  options={currecnySelection}
                  value={
                    currecnySelection.find(
                      (opt) => opt.value === formData.currency
                    ) || null
                  }
                  onChange={(selectedCurrency) =>
                    setFormData((prev) => ({
                      ...prev,
                      currency: selectedCurrency?.value || null,
                      currencycode: selectedCurrency?.label || "INR",
                    }))
                  }
                  placeholder="Select Currency"
                  isClearable
                  isSearchable
                  filterOption={(option, inputValue) =>
                    option.label
                      .toLowerCase()
                      .startsWith(inputValue.toLowerCase())
                  }
                  styles={{
                    control: (base) => ({
                      ...base,
                      height: "38px",
                      minHeight: "38px",
                    }),
                  }}
                />
              </div>
                  </div>
              <button
                type="button"
                onClick={() => handleOpenModal(true)}
                className="btn btn-outline-primary ms-2"
                style={{ height: "38px" }}
              >
                +
              </button>
            </div>  
          </div>
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
      apiUrl={`${API_URL}/company/company/search/`}
      columns={columns}
      searchFields={searchFields}
        onSelect={(cmp) => {
        setFormData({ ...cmp }); // update form
        setIsEdit(true);
        setShowModal(false);
        }}
    />
    {/* ✅ State Modal */}
      {showCurrencyModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Currency</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCurrencyModal(false)}></button>
                </div>
                <div className="modal-body">
                  <CurrencyForm
                    onSaved={() => {
                      fetchCurrencies();
                      setShowCurrencyModal(false);
                    }}
                    onClose={() => setShowCurrencyModal(false)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowCurrencyModal(false)}></div>
        </>
      )}
           

        </div>
  );
}

export default CompanyForm;
