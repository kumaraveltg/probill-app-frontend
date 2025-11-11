import { useState, useEffect, useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import DataContext from "../context/DataContext"; 
import { FaSave, FaTimes } from "react-icons/fa";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";  
import Select from "react-select";   
import CurrencyForm from '../pages/CurrencyForm'




function CompanyForm({ onClose,onSaved, companyObject,navigateToList }) {
  const {  currencies,fetchCurrencies,license,fetchLicense} = useContext(DataContext); 
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
  },
); 
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); 
  const [showCurrencyModal,setShowCurrencyModal]= useState(false);
  const [licenseData,setLicenseData] = useState({
    id: null, 
    companyid:null,
    companyno: "",
    planname: "",     
    planperiod:"",  
    licensestatus:"Pending",
    active: true,
    createdby: "admin",
    modifiedby: uname
  })

  useEffect(() => {
    fetchCurrencies(); 
    fetchLicense();
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
   
    const licenseOptions = useMemo(() => {
      if(!license|| !Array.isArray(license))
        return [];
      return license.map( c => ({
          value: c.id,
          label: c.planname,
          planperiod:c.planperiod,
          companyid: c.companyid,
        })
      )
    },[license]
    )

    console.log("selected Licenseoption",licenseOptions);

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
  let selectedlicense = null
  if(licenseData && licenseOptions.length> 0){
    selectedlicense = licenseOptions.find(
      c => c.label === licenseData.planname && c.companyid === companyObject.id
    )
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
    planname: selectedlicense?.label || licenseData?.planname || "",
    planperiod: selectedlicense?.planperiod || licenseData?.planperiod || "",
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
    // 🔹 Match currency
    const selectedCurrency = currecnySelection.find(
      c => c.value === Number(companyObject.currency)
    );

    // 🔹 Match license
    const selectedLicense = licenseOptions.find(
      c =>
        c.label === companyObject.planname && // ✅ use companyObject.planname instead
        c.companyid === companyObject.id
    );

    // 🔹 Update form only when companyObject exists
    setFormData({
      ...companyObject,
      currency: selectedCurrency?.value || null,
      currencycode: selectedCurrency?.label || "",
      planname: selectedLicense?.label || companyObject?.planname || "",
      planperiod: selectedLicense?.planperiod || companyObject?.planperiod || "",
    });

    setIsEdit(true);
  } else {
    // New mode
    resetForm();
  }
}, [companyObject, currecnySelection, licenseOptions]);

 
  const handleChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value
  }));

  // Simple live email validation
  if (name === "emailid") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setMessage(!value || emailRegex.test(value) ? "" : "Email format is wrong");
  }
};

const handlePayNow= async(e)=>{
  setLoading(false);
}

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage(""); // clear old message

  try {
    // 🔹 Basic validation
    if (!formData.companycode || !formData.companyname || !licenseData.planname) {
      throw new Error("Please fill in all required fields.");
    }

    // 🔹 Email validation
    if (formData.emailid) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailid)) {
        throw new Error("Invalid email format.");
      }
    }

    // 🔹 Prepare company payload
    const companyPayload = {
      companycode: formData.companycode,
      companyname: formData.companyname,
      companyno: formData.companyno,
      adress: formData.adress,
      gstno: formData.gstno,
      phone: formData.phone,
      emailid: formData.emailid,
      contactperson: formData.contactperson,
      currency: Number(formData.currency) || null,
      currencycode: formData.currencycode || "",
      active: formData.active,
      createdby: formData.createdby || "admin",
      modifiedby: formData.modifiedby || "admin",
    };
    console.log("Final Company Payload to send:", companyPayload);
    // 🔹 Create/Update company
    const companyEndpoint = isEdit
      ? `${API_URL}/company/Updatecompany/${formData.id}`
      : `${API_URL}/company/createcompany/`;

    const companyRes = await authFetch(companyEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyPayload),
    });

    if (!companyRes.ok) {
      const errorData = await companyRes.json();
      const errorMessage = Array.isArray(errorData)
        ? errorData.map(e => e?.msg || JSON.stringify(e)).join(", ")
        : errorData?.detail || `HTTP Error ${companyRes.status}`;
      throw new Error(errorMessage);
    }

    const companyInfo = await companyRes.json();
    console.log("full companyInfor",companyInfo);
    console.log("companyInfo",companyInfo.id);

    // 🔹 Prepare license payload
    const licensePayload = {
      companyid: companyInfo.id,
      companyno: companyInfo.companyno,
      planname: licenseData.planname||"",
      planperiod: licenseData.planperiod||"",
      active: licenseData.active,
      createdby: "admin",
      modifiedby: uname || "admin",
    };
     console.log("Final License Payload to send:", licensePayload);
    // 🔹 Create/Update license
    const licenseEndpoint = isEdit
      ? `${API_URL}/licenseupdate/${licenseData.id}`
      : `${API_URL}/addlicense/`;

    const licenseRes = await authFetch(licenseEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(licensePayload),
    });

    if (!licenseRes.ok) {
      const errorData = await licenseRes.json();
      const errorMessage = Array.isArray(errorData)
        ? errorData.map(e => e?.msg || JSON.stringify(e)).join(", ")
        : errorData?.detail || `HTTP Error ${licenseRes.status}`;
      throw new Error(errorMessage);
    }
    if (!licenseRes.ok) {
    // ❌ License failed -> rollback company
    await authFetch(`${API_URL}/company/deletecompany/${companyInfo.id}`, {
      method: "DELETE",
    });

    const errorData = await licenseRes.json();
    throw new Error(errorData.detail || "License creation failed. Rolled back company.");
  }
    // ✅ Success
    onSaved();
    onClose();
  } catch (err) {
    console.error("Error while saving company/license:", err);
    setMessage(err.message || "Failed to save company/license.");
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
          <div className="row mb-3">
            <div className="col-md-2">
              <label htmlFor="planname" className="form-label">
                Plan Name
              </label>
              <select
              id="planname"
              name="planname"
              className="form-select"
              value={licenseData.planname || ""}
              onChange={(e) => {
                const planname = e.target.value.toUpperCase(); 
                let updatedData = { ...licenseData, planname };

                if (planname === "TRIAL") {
                  updatedData = {
                    ...updatedData,
                    planperiod: "7 Days",
                    amount: 0,
                  };
                } else {
                  updatedData = {
                    ...updatedData,
                    planperiod: "",
                    amount: 0,
                  };
                } 
                setLicenseData(updatedData);
              }}
              required
            >
              <option value="">-- Select Plan --</option>
              <option value="TRIAL">Trial</option>
              <option value="PRO">Pro</option>
              <option value="ENTERPRISES">Enterprises</option>
            </select> 
            </div>

            {/* 🔹 Plan Period Dropdown */}
            <div className="col-md-2">
              <label htmlFor="planperiod" className="form-label">
                Plan Period
              </label>
             <select
              id="planperiod"
              name="planperiod"
              className="form-select"
              value={licenseData.planperiod || ""}
              onChange={(e) => {
                const period = e.target.value.toUpperCase();
                let amount = 0;

                // 🧮 Calculate amount based on plan + period
                if (licenseData.planname === "PRO") {
                  amount = period === "MONTHLY" ? 499 : 499 * 12;
                } else if (licenseData.planname === "ENTERPRISES") {
                  amount = period === "MONTHLY" ? 799 : 799 * 12;
                } 
                setLicenseData({
                  ...licenseData,
                  planperiod: period,
                  amount,
                });
              }}
              required
              disabled={licenseData.planname === "TRIAL"}
            >
              <option value="">-- Select Period --</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">License Status</label>
              <input type="text" className="form-control" name="licensestatus"
                      value={licenseData.licensestatus||"Pending"} onChange={handleChange} 
                      readOnly/> 
            </div >  
              {licenseData.planperiod && (
             
              <div className="col-md-2 fw-bold text-success">
                 <br />
                 <br />
                💰 Amount: ₹{licenseData.amount}
              </div>
            )} 
          <div className="col-md-2">
            <br />
            <br />
            <input type="checkbox" className="form-check-input" name="active"
                   checked={formData.active} onChange={handleChange} />
            <label className="form-check-label">Active</label>
          </div>
          </div>

          <div >
           {(() => {
            const plan = licenseData.planname?.toUpperCase();
            const status = licenseData.licensestatus?.toLowerCase();

            // 🔹 CASE 1: Trial plan → normal Save/Update
            if (plan === "TRIAL") {
              return (
                <>
                  <button
                    type="submit"
                    className="btn btn-primary me-2"
                    disabled={loading}
                  >
                    <FaSave className="me-1" /> 
                    {loading ? "Saving.." : isEdit ? "Update" : "Save"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    <FaTimes className="me-1" /> Cancel
                  </button>
                </>
              );
            }

            // 🔹 CASE 2: New license (not edit mode) → Pay Now
            if (!isEdit) {
              return (
                <>
                  <button
                    onClick={handlePayNow}
                    className="btn btn-success me-2"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Pay Now"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    <FaTimes className="me-1" /> Cancel
                  </button>
                </>
              );
            }

            // 🔹 CASE 3: Edit mode → show Pay Now only if status is pending or failed
            if (isEdit && (status === "pending" || status === "failed")) {
              return (
                <>
                  <button
                    onClick={handlePayNow}
                    className="btn btn-warning me-2"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Pay Now"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    <FaTimes className="me-1" /> Cancel
                  </button>
                </>
              );
            }

            // 🔹 CASE 4: Already paid or trial → disable Pay Now
            return (
              <>
                <button
                  className="btn btn-secondary me-2"
                  disabled
                >
                  <FaSave className="me-1" /> Already Paid
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  <FaTimes className="me-1" /> Cancel
                </button>
              </>
            );
          })()}
             
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
