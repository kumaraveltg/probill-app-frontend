import { useState, useEffect, useContext } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal"; 
import { AuthContext } from "../context/AuthContext";



const defaultPerms = [
    {
      module: "General Master",
      forms: "Country",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "General Master",
      forms: "State",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "General Master",
      forms: "City",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "General Master",
      forms: "Company Master",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "General Master",
      forms: "Currency",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "General Master",
      forms: "Unit of Messaurement(UOM)",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "General Master",
      forms: "Users",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "General Master",
      forms: "User Role",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "General Master",
      forms: "Financial Years",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
     {
      module: "Master",
      forms: "Products",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "Master",
      forms: "Customers",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
    {
      module: "Transaction",
      forms: "Sales Invoice",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
     {
      module: "Transaction",
      forms: "Receipts",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
     {
      module: "Reports",
      forms: "Sales Register",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
     {
      module: "Reports",
      forms: "Customerwise Outstanding",
      permtype: { view: true, edit: true, create: true, delete: true }
    },
  ];
 

 function UserRoleForm( {onSaved, userRoleObject, setUserRoleObject, navigateToList, handleDelete, onClose} ) {
 const {fetchUserRole,userRole,companyid,companyname,companyno } = useContext(DataContext); 
 const { accessToken,authFetch } = useContext(AuthContext);
 const[ selectedUsers,setSelectedUsers]= useState(userRoleObject||null);
 const [permissions, setPermissions] = useState(defaultPerms);
 const [expandedModule, setExpandedModule] = useState(null);
 const [ formData,setFormData]= useState(
    {
        id: null,
        companyid: companyid?? null,
        companyname: companyname?? "",
        companyno: companyno?? "", 
        rolename:"",
        permissions:[] ,
        active: true,
        createdby: "",
        modifiedby: ""
    } );
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
 

  const resetForm = () => {
    let defaultCompanyName = "Default Company";
    let defaultUsername= "";
    let defaultcompanyno="";
    
     const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
     console.log("globalparams:",fallbackParams);
      const cid = companyid ?? fallbackParams.companyid;
      const uname = fallbackParams.username;
      const cno = fallbackParams.companyno;

    
    if (Array.isArray(userRole)) {
      const match = userRole.find(
        (c) => c.companyid === (companyid ?? companyid)
      );
      console.log("Matched company:", match);
      if (match) {
        defaultCompanyName = match.companyname;
        defaultUsername  = match.username??uname; 
        defaultcompanyno = match.companyno && match.companyno.trim() !== "" ? match.companyno : cno;
      }else {
    defaultCompanyName = fallbackParams.companyname ?? defaultCompanyName;
    defaultUsername = uname ?? defaultUsername;
    defaultcompanyno = cno ?? defaultcompanyno;
    }
  }

    setFormData((prev) => ({
      ...prev,
      id: null,
        companyid: companyid?? null,
        companyname: defaultCompanyName,
        companyno: defaultcompanyno,
        rolename:"",
        permissions:defaultPerms||[],
        active: true,
        createdby:  defaultUsername,
        modifiedby: defaultUsername
    }));
    setIsEdit(false);
    setMessage("");
  }
// Populate form for edit or new mode
  useEffect(() => {
  if (userRoleObject && userRoleObject.id) {
    // Edit mode
    setFormData({ ...userRoleObject });
    setPermissions(userRoleObject.permissions || defaultPerms);
    setIsEdit(true);
  } else {
    // New mode default Company name should be visible
    resetForm();
    
  }
}, [userRoleObject]);

const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
 // toggle 
   const toggleModule = (moduleName) => {
    setExpandedModule(expandedModule === moduleName ? null : moduleName);
  };
// Handle permission checkbox changes
  const handlePermissionChange = (index, permKey) => (e) => {
    const newPerms = [...permissions];
    newPerms[index].permtype[permKey] = e.target.checked;
    setPermissions(newPerms);
  };
  
const handleDeleteClick= ()=>{
    if(userRoleObject?.id){
        handleDelete(userRoleObject.id);
        resetForm();
        setUserRoleObject(null);     
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

    if (!formData.rolename) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        companyid: Number(formData.companyid), 
        companyno: formData.companyno,
        rolename: formData.rolename,
        permissions: formData.permissions,
        active: formData.active,
        createdby: formData.createdby || "admin",
        modifiedby: formData.modifiedby || "admin"
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/updateuserrole/${formData.id}` : `${API_URL}/adduserrole/`;

      console.log("Access Token:", accessToken);
      console.log("Sending payload:", payload);
      console.log("Endpoint:", endpoint);

      const res = await authFetch(endpoint, {
        method,
        headers: {"Authorization": `Bearer ${accessToken}`  ,"Content-Type": "application/json" },
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

    } finally {
      setLoading(false);
    }
  };

const columns = [
    { field: "rolename", label: "Role Name" }, 
    { field: "companyname", label: "Company Name"  },
    
  ];

  const searchFields = [
    { value: "rolename", label: "Role Name" }, 
    { value: "companyname", label: "companyname" }, 
  ];

 // Group permissions by module
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});

  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit UserRole" : "New UserRole"}</h4>
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

      <div className="card p-3 border border-secondary w-100" style={{ backgroundColor: "#ebe6e6ff" }}>
        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
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
            </div>
          <div className="row mb-3">
            <div className="col-md-4">
                <label className="form-label">Role Name *</label>
                <input 
                    type="text" 
                    className="form-control" 
                    name="rolename"
                    value={formData.rolename} 
                    onChange={handleChange} 
                />
            </div>  
          </div>
          <div className="mb-3">
            <label>Permissions</label>
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
              <div key={moduleName} className="mb-2 border rounded p-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 text-start mb-1"
                  onClick={() => toggleModule(moduleName)}
                >
                  {moduleName} {expandedModule === moduleName ? "▲" : "▼"}
                </button>
                {expandedModule === moduleName && (
                  <table className="table table-bordered mb-0">
                    <thead>
                      <tr>
                        <th>Form</th>
                        <th>View</th>
                        <th>Edit</th>
                        <th>Create</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perms.map(p => (
                        <tr key={p.forms}>
                          <td>{p.forms}</td>
                          {["view", "edit", "create", "delete"].map(key => (
                            <td key={key}>
                              <input
                                type="checkbox"
                                checked={p.permtype[key]}
                                onChange={handlePermissionChange(p.module, p.forms, key)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
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
      apiUrl={`${API_URL}/search/${companyid}`}
      columns={columns}
      searchFields={searchFields}
        onSelect={(users) => {
        setFormData({ ...users }); // update form
        setUserRoleObject(users);       // important: now delete knows what to delete
        setIsEdit(true);
        setShowModal(false);
        }}
    />
     </div>
  );


}

export default UserRoleForm;