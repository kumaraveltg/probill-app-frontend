import { useState, useEffect, useContext } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal"; 

 function UsersForm(onClose,onSaved, usersObject,setUsersObject,navigateToList,handleDelete) {
 const {fetchUsers,busers,companyid,companyname,authFetch } = useContext(DataContext); 
 const[ selectedUsers,setSelectedUsers]= useState(usersObject||null);
 const [ formData,setFormData]= useState(
    {
        id: null,
        companyid: companyid?? null,
        companyname: companyname?? "",
        username: "",
        firstname: "",
        emailid: "",
        userroleid: null,
        active: true,
        createdby: "admin",
        modifiedby: "admin"
    } );
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    let defaultCompanyName = "Default Company";
    
    if (Array.isArray(busers)) {
      const match = busers.find(
        (c) => c.companyid === (companyid ?? companyid)
      );
      console.log("Matched company:", match);
      if (match) {
        defaultCompanyName = match.companyname;
      }
    }

    setFormData((prev) => ({
      ...prev,
      id: null,
        companyid: companyid?? null,
        companyname: companyname?? "",
        username: "",
        firstname: "",
        emailid: "",
        userroleid: null,
        active: true,
        createdby:  "",
        modifiedby: ""
    }));
    setIsEdit(false);
    setMessage("");
  }
// Populate form for edit or new mode
  useEffect(() => {
  if (usersObject && usersObject.id) {
    // Edit mode
    setFormData({ ...usersObject });
    setIsEdit(true);
  } else {
    // New mode default Company name should be visible
    resetForm();
    
  }
}, [usersObject]);

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

const handleDeleteClick= ()=>{
    if(usersObject?.id){
        handleDelete(usersObject.id);
        resetForm();
        setUomObject(null);     
    }
    else
    {
        alert("No users Selected")
    }
 }
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.username) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        companyid: Number(formData.companyid), 
        companyno: formData.companyno,
        username: formData.username,
        firstname: formData.firstname,
        emailid: formData.emailid,
        userroleid: 1,
        active: formData.active,
        createdby: formData.createdby || "admin",
        modifiedby: formData.modifiedby || "admin"
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/users/updateusers/${formData.id}` : `${API_URL}/users/users/`;

      console.log("Sending payload:", payload);

      const res = await authFetch(endpoint, {
        method,
        headers: {"Authorization": `Bearer ${acessToken}`  ,"Content-Type": "application/json" },
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
      console.error("Error While Saving Users:", err);

      if (Array.isArray(err)) {
        // Backend returned multiple errors
        const messages = err.map(e => e?.msg || JSON.stringify(e)).join(", ");
        setMessage(messages);
      } else if (err?.message) {
        setMessage(err.message);
      } else {
        setMessage("Failed to save Users.");
      }

    } finally {
      setLoading(false);
    }
  };

const columns = [
    { field: "username", label: "User Name" },
    { field: "firstname", label: "First Name" },
    { field: "companyname", label: "Company Name"  },
    
  ];

  const searchFields = [
    { value: "username", label: "User Name" },
    { value: "firstname", label: "First Name" },
    { value: "companyname", label: "companyname" }, 
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

          <div className="row mb-3">
            <div className="col-md-4">
                <label className="form-label">User Name *</label>
                <input 
                type="text" 
                className="form-control" 
                name="username"
                value={formData.username} 
                onChange={handleChange} 
                />
            </div>

            <div className="col-md-8">
                <label className="form-label">First Name *</label>
                <input 
                type="text" 
                className="form-control" 
                name="firstname"
                value={formData.firstname} 
                onChange={handleChange} 
                />
            </div>
            </div>
            {/* Second Row */}
            <div className="row mb-3">
            <div className="col-md-6">
                <label className="form-label">Email Id</label>
                <input 
                type="email" 
                className="form-control" 
                name="emailid"
                placeholder="example@gmail.com"
                value={formData.emailid} 
                onChange={handleChange} 
                />
            </div>

            <div className="col-md-6">
                <label className="form-label">User Role</label>
                <input 
                type="text" 
                className="form-control" 
                name="userroleid"
                value={formData.userroleid} 
                onChange={handleChange} 
                />
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
      apiUrl={`${API_URL}/users/search/${companyid}`}
      columns={columns}
      searchFields={searchFields}
        onSelect={(users) => {
        setFormData({ ...users }); // update form
        setUsersObject(users);       // important: now delete knows what to delete
        setIsEdit(true);
        setShowModal(false);
        }}
    />
     </div>
  );


}

export default UsersForm;