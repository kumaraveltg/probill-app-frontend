import React, { useContext, useEffect, useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import StateForm from "./StateForm";
 

/* STATE LIST <COMPONENT--------></COMPONENT-------->*/
function State(){
    const {states,total,fetchStates,loading,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [stateObject,setStateObject]=useState();
    const [limit,setLimit] = useState(10);  
    const[collapsed,setCollapsed]= useState(false);
 

const filteredStates = states.filter(c =>
  [
    c.id,
    c.countryid,
    c.countryname,
    c.statecode,
    c.statename,
    c.active ? "Yes" : "No",
    c.createdby,
    c.modifiedby,
    c.createdon,
    c.modifiedon
  ]
  .join(" ")
  .toLowerCase()
  .includes(search.toLowerCase())
);
useEffect(() => {
  fetchStates(page * limit, limit);
}, [page,limit]);

 

 
//New State 
const handleNew = () => {
    setShowForm(true);
    setStateObject(null);
};

useEffect(()=>{ 
stateObject && setShowForm(true);
},[stateObject])



const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this State?"))
     return;
 
 try{
    const res = await fetch(`${API_URL}/statedelete/${id}`, 
      { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`); 
        fetchStates(page * limit, limit); 
      // Refresh city list after deletion
        alert("State deleted successfully."); 

 }catch(err){
    console.error("Error Deleteing States:",err);
    alert("Failed to delete entry: " + (err.message || ""));
 }
};

return (
    <div className="container-fluid px-0 py-0"> 
      {!showForm ? (
        <>
         <div className="d-flex justify-content-between align-items-center mt-0 mb-0">
        <div className="row mb-3 align-items-center">
        <div className="col-md-3"> 
       <h2 className="me-3 mb-0">State</h2>
        </div>
    </div>
     {/* Search box */}
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-primary text-white">
                    <FaSearch />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
             <div className="col-md-3 text-end">
                <button className="btn btn-primary" onClick={handleNew}>
                  <FaPlus className="me-2" />
                  New State
                </button>
              </div>
            </div>  
      <div style={{ maxHeight: "500px", overflowY: "auto" }}>        
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th></th>
            <th>State Code</th>
            <th>State Name</th>
            <th>Country Name</th>
            <th>Active</th>
            <th>Created by</th>
            <th>Created On</th>
            <th>Modified by</th>
            <th>Modified On</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {filteredStates.map((c, id) => (
            <tr key={id}>
              <td><button
                  className="btn btn-sm btn-edit me-2"
                  onClick={()=>  setStateObject(c)}
                >
                  <i className="bi bi-pencil"></i>
                </button> </td>
              <td>{c.statecode}</td>
              <td>{c.statename}</td>
              <td>{c.countryname}</td>
              <td>{c.active ? "Yes" : "No"}</td>
              <td>{c.createdby}</td>
              <td>{c.createdon}</td>
              <td>{c.modifiedby}</td>
              <td>{c.modifiedon}</td>
              <td> 
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(c.id)}
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </td>
            </tr>
          ))}
          {states.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center">
                No States found
              </td>
            </tr>
          )}
            {filteredStates.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center">
                No matching States found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>  
            {/* Pagination / Footer */}
       <div  className="bg-light border-top d-flex justify-content-between align-items-center px-4 py-2 shadow-sm flex-wrap"
      style={{ 
        bottom: 0, 
        position: "fixed",
        left: collapsed ? "70px" : "220px", // dynamic based on sidebar
        width: `calc(100% - ${collapsed ? 70 : 220}px)`, // adjust with sidebar
        zIndex: 1030,
        height: "50px",
        transition: "all 0.3s ease",
        backgroundColor: "#f8f9fa",
      }}
    >
  {/* ✅ Left section - Total count */}
  <div className="fw-semibold text-secondary">
    Total States: {total}
  </div>

  {/* ✅ Middle section - Rows per page */}
  <div className="d-flex align-items-center">
    <label className="mb-0 me-2 text-secondary fw-semibold">Rows:</label>
    <select
      value={limit === total ? "all" : limit}
      onChange={(e) => {
        const selectedValue = e.target.value;
        if (selectedValue === "all") {
          setLimit(total); // show all
          setPage(0);
        } else {
          setLimit(Number(selectedValue));
          setPage(0);
        }
      }}
      className="form-select form-select-sm"
      style={{ width: "90px" }}
    >
      <option value={10}>10</option>
      <option value={25}>25</option>
      <option value={100}>100</option>
      <option value={500}>500</option>
      <option value="all">All</option>
    </select>
  </div>

  {/* ✅ Right section - Pagination buttons */}
  {limit !== total && (
    <div className="d-flex align-items-center mt-2 mt-sm-0">
      <button
        className="btn btn-outline-secondary btn-sm me-2"
        onClick={() => setPage((p) => Math.max(p - 1, 0))}
        disabled={page === 0}
      >
        Previous
      </button>
      <span className="fw-semibold text-secondary">Page {page + 1}</span>
      <button
        className="btn btn-outline-secondary btn-sm ms-2"
        onClick={() =>
          setPage((p) => ((p + 1) * limit < total ? p + 1 : p))
        }
        disabled={(page + 1) * limit >= total}
      >
        Next
      </button>
    </div>
  )}
</div>
    </>
      ) 
      : (
        <>
        <StateForm stateValueEdit={stateObject}
          onClose={() => setShowForm(false)}
          onSaved={()=>fetchStates(page*limit,limit)} // ✅ refresh list after save
          navigateToList={() => setShowForm(false)}
          handleDelete={handleDelete}
          handleNew={handleNew}           
        />
        {/* <p>{stateObject.id}</p> */}
        </>
      )}
    </div>
  );
}

export default State;