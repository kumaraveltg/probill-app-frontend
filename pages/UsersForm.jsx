import { useState, useEffect, useContext,useMemo } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext, { useData } from "../context/DataContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal"; 
import { AuthContext } from "../context/AuthContext";
import { Multiselect } from "multiselect-react-dropdown";


 function UsersForm( {onSaved, usersObject, setUsersObject, navigateToList, handleDelete, onClose} ) {
 const { acessToken, authFetch, username: ctxUsername, companyid: defaultcompanyid, companyno: defaultCompanyno } = useContext(AuthContext);
 const {companies,fetchCompanies,userRole,fetchUserRole}= useData();
 const[ selectedUsers,setSelectedUsers]= useState(usersObject||null);  
  const [ formData,setFormData]= useState(
    {
        id: null,
        companyid: defaultcompanyid||null,
        companyname:"",
        companyno: defaultCompanyno?? "",
        username: "",
        password:"",
        firstname: "",
        emailid: "",
        usertype:"",
        userroleids:[],
        active: true,
        createdby: "",
        modifiedby: ""
    } );
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

   
  const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const uname = ctxUsername || fallbackParams.username || "admin";
  const cid = defaultcompanyid || fallbackParams.companyid || companyid;
  const cno = defaultCompanyno || fallbackParams.companyno || companyno;
  const roleOptions = useMemo(() => (userRole || []).map(c => ({ value: c.id, label: c.rolename,  })), [userRole]);

 useEffect(() => {
     if (!companies.length) {
       fetchCompanies();
       fetchUserRole();
     }
   }, [ fetchCompanies,fetchUserRole]);

  useEffect(() => {
    if (  Array.isArray(companies) && companies.length > 0) {
      const defaultCompany = companies.find(c => c.companyid === defaultcompanyid);
      if (defaultCompany) {
        setFormData(prev => ({
          ...prev,
          companyname: defaultCompany.companyname,
          companyno: defaultCompany.companyno,
          companyid: defaultCompany.companyid
        }));
       
        console.log("Default company set:", defaultCompany.companyname);
      }
    }
  }, [companies, defaultcompanyid ]);

  const handleRoleChange = (selectedList) => {
    setFormData((prev) => ({
      ...prev,
      userroleids: selectedList.map((item) => item.value),
    }));
  };

  const resetForm = () => { 
    if (!Array.isArray(companies)) {
    console.warn("companies is undefined or not an array:", companies);
    return;  
    }
    const defaultCompany = companies.find(c => c.companyid === defaultcompanyid) || { companyname: "", companyno: "" };
    setFormData((prev) => ({
      ...prev,
      id: null,
        companyid: cid?? null,
        companyname: defaultCompany.companyname,
        companyno: cno,
        username: "",
        password: "",
        firstname: "",
        emailid: "",
        userroleids: [],
        usertype:"",
        active: true,
        createdby:  uname,
        modifiedby: uname
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
        setUsersObject(null);     
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
        password:   formData.password || "123456",
        firstname: formData.firstname,
        emailid: formData.emailid,
        userroleids: formData.userroleids,
        usertype: formData.usertype||"USERS",
        active: formData.active,
        createdby: uname,
        modifiedby: uname
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/users/updateuser/${formData.id}` : `${API_URL}/users/users/`;

      console.log("Access Token:", acessToken);
      console.log("Sending payload:", payload);
      console.log("Endpoint:", endpoint);

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
      const errorData = await res.json();
      if (errorData.detail) {
       throw errorData.detail; // array or string
            }
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error While Saving Users:", err);

      if (Array.isArray(err)) {
        // Backend returned multiple errors
        const messages = err.map(e => e?.msg || JSON.stringify(e)).join(", ");
        setMessage(messages);
      } else if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage(JSON.stringify(err));
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
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "3px" }}>
        <h4 className="mb-0">{isEdit ? "Edit UOM" : "New UOM"}</h4>
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
          <button type="button" className="btn btn-secondary" onClick={()=>{
            console.log("Navigating to List");
            if(navigateToList) {navigateToList();
            }}} >
            <i className="bi bi-list"></i>
          </button>
        </div> 
      </div>

      <div className="card p-1 border border-secondary w-100" style={{ backgroundColor: "#ebe6e6ff" }}>
        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
         {/* <div className="row mb-1">
          <div className="col-md-6">
            <label className="form-label">Company Name*</label>
            <input type="text" className="form-control" name="companyname"
                   value={formData.companyname || companyname || ""} readOnly   />
          </div>
          <div className="col-md-6">
            <label className="form-label">Company No*</label>
            <input type="text" className="form-control" name="companyno"
                   value={formData.companyno || companyno || ""} readOnly style={{ width: "200px" }} />
          </div>
            </div>*/}
          <div className="row mb-1">
            <div className="col-md-3">
                <label className="form-label">User Name *</label>
                <input 
                    type="text" 
                    className="form-control" 
                    name="username"
                    value={formData.username} 
                    onChange={handleChange} 
                />
            </div>

            <div className="col-md-2">
                <label className="form-label">Password *</label>
                <input 
                    type="password" 
                    className="form-control" 
                    name="password"
                    value={formData.password || "123456"} 
                    onChange={handleChange} 
                    readOnly
                />
            </div>
                <div className="col-md-3">
            <label className="form-label">User Type</label>
          <select
            className="form-select"
            value={formData.usertype||"USERS"}            
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                usertype: e.target.value,
              }))
            } 
            disabled
          >
            <option value="">Select User Type</option>
            <option value="USERS">USERS</option>
            <option value="ADMIN">ADMIN</option>
            
          </select>
           </div>
            <div className="col-md-4">
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
            <div className="row mb-1">
            <div className="col-md-3">
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
            <div className="col-md-3">
              <label className="form-label fw-bold">Select Roles</label>
              <Multiselect
                options={roleOptions}
                displayValue="label"
                selectedValues={roleOptions.filter((r) =>
                  formData.userroleids.includes(r.value)
                )}
                onSelect={handleRoleChange}
                onRemove={handleRoleChange}
                showCheckbox
                placeholder="Choose roles"
                style={{
                  multiselectContainer: { color: "black" },
                  chips: { background: "#0d6efd" }, // Bootstrap blue
                }}
              />
            </div>
            
            </div>   
            <div className="col-md-4 mb-3">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" name="active"
                checked={formData.active} onChange={handleChange} />
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
      apiUrl={`${API_URL}/users/search/${defaultcompanyid}`}
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