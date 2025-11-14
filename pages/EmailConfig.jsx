import { useState, useEffect, useContext } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../components/Config"; 

function EmailConfig({ onSaved = () => {},  onClose = () => {},   navigateToList = null  }) {
  const { username: ctxUsername, companyid: defaultCompanyid, companyno: defaultCompanyno } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    id: null,     
    companyid: defaultCompanyid,   
    companyno:defaultCompanyno,
    smtp_host: "",
    smtp_port:"", 
    use_tls:"",
    email_from:"",
    email_password:"", 
    createdon: "", 
  });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 
  const fetchEmailConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/getemailconfig/${defaultCompanyid}`);
      if (!res.ok) return; // No config → keep blank form

      const data = await res.json();

      if (data) {
        setFormData({
          ...formData,
          id: data.id,
          smtp_host: data.smtp_host ?? "",
          smtp_port: data.smtp_port ?? "",
          use_tls: data.use_tls ?? true,
          email_from: data.email_from ?? "",
          email_password: data.email_password, // Do not pre-fill password
          companyid: data.companyid,
          companyno: data.companyno,
        });

        setIsEdit(true);
      }
    } catch (error) {
      console.error("Error loading email config:", error);
    }
  };

  useEffect(() => {
    fetchEmailConfig();
  }, []);

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
    try {
      const payload = { 
        id:formData.id||null,
        companyid: formData.companyid,
        companyno: formData.companyno,
        smtp_host: formData.smtp_host||"",
        smtp_port:formData.smtp_port||"", 
        use_tls:formData.use_tls||"true",
        email_from:formData.email_from||"",
        email_password:formData.email_password||"",  
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/updateemailcon/${formData.id}` : `${API_URL}/addemailset/`;

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
      console.error("Error While Saving EmailConfig:", err);  
    } finally {
      setLoading(false);
    }
  };

  const handleTestMail = async () => {
  setMessage("Sending test email...");
  setLoading(true);

  const testPayload = {
    smtp_host: formData.smtp_host,
    smtp_port: formData.smtp_port,
    email_from: formData.email_from,
    email_password: formData.email_password,
    use_tls: formData.use_tls,
  };

  try {
    const res = await fetch(`${API_URL}/send-test-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testPayload),
    });

    const data = await res.json();

    if (data.ok) {
      setMessage(data.msg);        // SUCCESS MESSAGE
    } else {
      setMessage(data.msg);        // ERROR MESSAGE
    }

  } catch (err) {
    setMessage("❌ Error connecting to SMTP server");
  }

  setLoading(false);
};

   
 
  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit Email Configuration" : "New Email Configuration"}</h4>
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
           
         {/* <div className="col-md-2">
            <label className="form-label">Company Id *</label>
            <input type="text" className="form-control" name="companyid"
                   value={formData.companyid} onChange={handleChange}  />
          </div>*/}

          <div className="col-md-2">
            <label className="form-label">Company No *</label>
            <input type="text" className="form-control" name="companyno"
                   value={formData.companyno} onChange={handleChange} disabled />
          </div>
          <div className="col-md-3">
            <label className="form-label">SMTP Host </label>
            <input type="text" className="form-control" name="smtp_host"
                   value={formData.smtp_host} onChange={handleChange}   />
          </div>
           <div className="col-md-3">
            <label className="form-label">SMTP Port </label>
            <input type="text" className="form-control" name="smtp_port"
                   value={formData.smtp_port} onChange={handleChange}   />
          </div>
            <div className="col-md-3">
            <label className="form-label">Email From </label>
            <input type="text" className="form-control" name="email_from"
                   value={formData.email_from} onChange={handleChange}   />
          </div>  
          <div className="col-md-3">
            <label className="form-label">Email Password</label>
            <input type="text" className="form-control" name="email_password"
                   value={formData.email_password} onChange={handleChange}   />
          </div>
            
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" name="use_tls"
                   checked={formData.use_tls} onChange={handleChange} />
            <label className="form-check-label">USE TLS</label>
          </div> 

          <div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              <FaSave className="me-1" /> {loading ? "Saving.." :isEdit? "Update" : "Save" }
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleTestMail} disabled={loading}>
              <FaTimes className="me-1" /> Test Mail       </button>
          </div>
        </form>
      </div>     
        </div>
  );
}

export default EmailConfig;
