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
    <div className="container-fluid ">
      {!showForm ? (
        <>
          <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 p-2 bg-light rounded shadow-sm">

  {/* Left: Title + New Button */}
  <div className="d-flex align-items-center mb-2 mb-md-0">
    <h4 className="me-3 mb-0">State List</h4>
    <button className="btn btn-sm btn-outline-primary" onClick={handleNew}>
      <FaPlus className="me-1" /> New
    </button>
  </div>

  {/* Center: Search Box */}
  <div className="d-flex align-items-center flex-grow-1 mx-2 mb-2 mb-md-0" style={{ maxWidth: "400px" }}>
    <span className="input-group-text"><FaSearch /></span>
    <input
      type="text"
      className="form-control"
      placeholder="Search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <h6 className="ms-2 text-small">No.of Records:{total}</h6>
  </div>

  {/* Right: Pagination + Row Selector */}
  <div className="d-flex align-items-center mb-2 mb-md-0 flex-wrap">
    <label className="me-2 mb-0">
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

    <button
      className="btn btn-sm btn-outline-primary me-1"
      disabled={page === 0}
      onClick={() => setPage(page - 1)}
    >
      Previous
    </button>

    <span className="mx-1">
      Page {page + 1} of {Math.ceil(total / limit)}
    </span>

    <button
      className="btn btn-sm btn-outline-primary ms-1"
      disabled={(page + 1) * limit >= total}
      onClick={() => setPage(page + 1)}
    >
      Next
    </button>
  </div>

</div>
      <div style={{ maxHeight: "500px", overflowY: "auto" }}>        
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>State Code</th>
            <th>State Name</th>
            <th>Country Name</th>
            <th>Active</th>
            <th>Created by</th>
            <th>Created On</th>
            <th>Modified by</th>
            <th>Modified On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStates.map((c, id) => (
            <tr key={id}>
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
                  className="btn btn-sm btn-primary me-2"
                  onClick={()=>  setStateObject(c)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
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