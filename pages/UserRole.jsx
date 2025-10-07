import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext.jsx";
import { API_URL } from "../components/Config.jsx"; 
import UserRoleForm from "./UserRoleForm.jsx"; 


 function UserRole() {
    const {userRole,fetchUserRole,total,Loading,error } = useContext(DataContext); 
    const [showForm,setShowForm] = useState(false);
    const [search,setSearch] = useState("");
    const [page,setPage] =  useState(0);
    const [limit,setLimit] = useState(10);
    const [userRoleObject,setUserRoleObject] = useState();

    const filteredUserRole = userRole.filter(c =>
    [
      c.id, 
      c.companyid,
      c.companyname,
      c.companyno,
      c.rolename,
      c.createdon,
      c.createdby,
      c.modifiedby,
      c.modifiedon,
      c.active,
    ].join (" ")
    .toLowerCase()
    .includes(search.toLowerCase())
    );
 

    useEffect(
      ()=> {
        fetchUserRole(page*limit,limit)
      },[page,limit]
    )
  
//New Users
 const handleNew= ()=> {
   setShowForm(true);
   setUserRoleObject(null);
 };

 const handleUserSaved = () => {
   fetchUserRole();

 };

 useEffect( ()=> {
  userRoleObject && setShowForm(true)
 },[userRoleObject]  
);


const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this UserRole?")) {
    return; // user clicked cancel, so exit
  }

  try {
    const res = await fetch(`${API_URL}/deleteuserrole/${id}`, { method: "DELETE" });
    console.log("Delete response:", res);

    if (res.ok) {
      console.log("User deleted successfully");
      fetchUserRole(page * limit, limit);
    } else {
      console.error("Failed to delete user", await res.text());
    }
  } catch (err) {
    console.error("Error deleting user:", err);
  }
};

return (    
    <div className="container-fluid">
    <div className="d-flex justify-content-between align-items-center my-3">
    <h2>UserRole </h2>
     
    </div>  
    {!showForm ? (
    <>
    <div className="row mb-3 align-items-center">
            {/* Search box */}
            <div className="col-md-8">
                <div className="input-group">
                <span className="input-group-text bg-primary text-white">
                    <FaSearch />
                </span>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search Tax..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                </div>
            </div>

            {/* Button */}
            <div className="col-md-4 text-end">
                <button className="btn btn-primary" onClick={handleNew}>
                <FaPlus className="me-2" />
                New UserRoles
                </button>
            </div>
            </div>
    <div style={{ maxHeight: "500px", overflowY: "auto" }}>   
    <table className="table table-bordered table-hover">        
    <thead className="table-light">
    <tr>
    <th>Company Name</th>
    <th>User Role</th> 
    <th>Permissions</th> 
    <th>Active</th>
    <th>Created By</th>
    <th>Created On</th> 
    <th>Modified By</th>
    <th>Modified On</th>
    <th>Actions</th>
    </tr>   
    </thead>
    <tbody>
    {Loading ? (    
    <tr>
    <td colSpan="9" className="text-center">Loading...</td>
    </tr>   
    ) : error ? (
    <tr>
    <td colSpan="9" className="text-center text-danger">Error: {error}</td>     
    </tr>
    ) : filteredUserRole.length === 0 ? (
    <tr>    
    <td colSpan="9" className="text-center">No Users found.</td>
    </tr>
    ) : (    
    filteredUserRole.map((u) => ( 
    <tr key={u.id}>   
    <td>{u.companyname}</td>
    <td>{u.rolename}</td> 
    <td>{Array.isArray(u.permissions) 
     ? u.permissions.map(p => `${p.module}:${p.forms}`).join(", ") 
     : "-"}</td>
    <td>{u.active ? "Yes" : "No"}</td>
    <td>{u.createdby}</td>
    <td>{u.createdon}</td> 
    <td>{u.modifiedby}</td>
    <td>{u.modifiedon}</td>
    <td>
      <button 
          className="btn btn-sm btn-primary me-2" 
          onClick={() => setUserRoleObject(u)}
      >
          <i className="bi bi-pencil"></i> 
      </button>
      <button 
          className="btn btn-sm btn-danger"
          onClick={() => handleDelete(u.id)}
      >
          <i className="bi bi-trash3"></i>
      </button>   
    </td>
    </tr>    
    ))  
    )}
    </tbody>
    </table>
    </div>
    <div className="d-flex justify-content-between align-items-center my-3"
    >    
    <div>Total UserRole: {total}</div>
    <label>
    Rows:
    <select
    value={limit}
    onChange={(e) => {
    setLimit(Number(e.target.value));
    setPage(0);
    }}
    className="form-select form-select-sm d-inline-block ms-1"
    style={{ width: "70px" }}
    >
    <option value={10}>10</option>
    <option value={25}>25</option>
    <option value={100}>100</option>
    <option value={500}>500</option>
    </select>
    </label>
    <div>
    <button 
      className="btn btn-secondary me-2"
      onClick={() => setPage((p) => Math.max(p - 1, 0))}
      disabled={page === 0}
    >
      Previous
    </button>
    <span>Page {page + 1}</span>
    <button
      className="btn btn-secondary ms-2"
      onClick={() => setPage((p) => (total > (p + 1) * limit ? p + 1 : p))}
      disabled={(page + 1) * limit >= total}
    >
      Next
    </button>
    </div>
    </div>
    </>     
    ) : (
    <UserRoleForm
      userRoleObject={userRoleObject}
      setUserRoleObject={setUserRoleObject}
      onClose = {() => { setShowForm(false);  setUserRoleObject(null); fetchUserRole(page * limit, limit); } }
      fetchUserRole={fetchUserRole}
      navigateToList={() => { setShowForm(false);  setUserRoleObject(null); fetchUserRole(page * limit, limit); } }
      handleDelete={handleDelete}
      handleNew={handleNew} 
      onSaved={handleUserSaved}        
    />
    )} 
    </div>    
    );                 
    } ;
export default UserRole;