import React, { useContext, useEffect, useState } from "react";
import SearchModal from "../components/SearchModal";
import { FaSearch, FaPlus } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
 

/* STATE LIST <COMPONENT--------></COMPONENT-------->*/
function State(){
    const {states,fetchStates,loading,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [editState,setEditState]=useState();
    const [page,setPage]= useState(0);
    const [stateObject,setStateObject]=useState()
    const limit = 10;


  

// //fetch State API
// const skip = page * limit;
// const fetchStates= async () => {
//     try {
//         const res = await fetch(`${API_URL}/states/?skip=${skip}&limit=${limit}`);
//         if(!res.ok)  throw new Error(`Http Error ! status:${res.status}`) ;
//         const data = await res.json();
//         setStates(data.sort((a,b) => a.statename.localeCompare(b.statename)));
        
//     } catch(err) {
//         console.error("Error Fetching countries:",err);
//     }
// }
//initial fetch
//useEffect(() => {fetchStates();},[]);

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

console.log(filteredStates);
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
 {
    return;
 }
 try{
    const res = await fetch(`${API_URL}/state/${id}`, {method: "DELETE"});
    if(!res.ok) {throw new Error(`Failed Status Delete:${res.status}`); }
    alert("State Deleted Sucessfully"); fetchStates();

 }catch(err){
    console.error("Error Deleteing States:",err);
    alert("Failed to delete Entry")
 }
};

return (
    <div className="container-fluid ">
      {!showForm ? (
        <>
          <h4>State List</h4>
          
              {/* Button Column */}
          <div className="row mb-3 align-items-center">
          <div className="col-md-6">
            <button className="btn btn-new" onClick={handleNew}>
              <FaPlus className="me-1" /> New State
            </button>
        </div>
        <div className="col-md-6 text-start">
          <div className="input-group">
            <span className="input-group-text"> <FaSearch /> </span>
            <input type="text"
            className="form-control"
            placeholder="Search"
            value={search}
            onChange={(e)=> setSearch(e.target.value)}
            />
          </div>
        </div>
        </div>
            {/* Pagination buttons */}
        <div style={{ marginTop: "10px" }}>
            <button 
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            >
            Previous
            </button>

            <span style={{ margin: "0 10px" }}>Page {page + 1}</span>

            <button onClick={() => setPage(page + 1)}>Next</button>
        </div> 
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
                    //   className="btn btn-sm btn-edit me-2"
                      onClick={()=>  setStateObject(c)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(c.id)}
                    >
                      <i class="bi bi-trash3"></i>
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
        </>
      ) 
      : (
        <><StateForm stateValueEdit={stateObject}
          onClose={() => setShowForm(false)}
          onSaved={fetchStates} // ✅ refresh list after save
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

// State Form
// function StateForm({editState}){
    function StateForm({onClose, onSaved,editState,navigateToList,handleDelete,stateValueEdit }){
    const { countries } = useContext(DataContext);
    // console.log("countries:",countries);
    console.log("State****"+stateValueEdit)
    const [formData,setFormData] = useState(
        {
            stateCode: "",
            stateName: "",
            countryid: 0,
            countryName: "",
            active: true,
            createdby: "admin",
            modifiedby: "admin",
        }  );
    const [showModal,setShowModal]= useState(false);
    const [selectedStates,setSelectedStates] = useState(null);
    const [loading,setLoading] = useState(false);
    const [message,setMessage] = useState("");
    useEffect( ()=> {
        if(stateValueEdit){
            setFormData({
            id: stateValueEdit.id,
            stateCode: stateValueEdit.statecode,
            stateName: stateValueEdit.statename,
            countryId: stateValueEdit?.countryid,
            contryName:stateValueEdit.countryname||"",
            active: stateValueEdit.active,
            modifiedby:stateValueEdit.modifiedby||"admin",
        });
        }
    },[]  );

    console.log(editState);

const handleChange = (e)=>{
    const {name,value,type,checked}= e.target;
    setFormData(
        (prev)=>({
            ...prev,[name]: type== "checkbox"? checked:value,
        })   );
};

const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try{
        const url= editState?`${API_URL}/stateupdate/${editState.id}`:`${API_URL}/state/`;
        const res = await fetch(url,{
            method:"POST",
            headers:{"Content-Type": "application/json"},
            body:JSON.stringify({
                statecode: formData.stateCode,
                statename: formData.stateName,
                countryid:formData.countryId,
                countryname:formData.countryName,
                active:formData.active,
                createdby:formData.createdby,
                modifiedby:formData.modifiedby,
            }),       });
        if(!res.ok) {
            let errorMessage= `Http error! Status: ${res.status}`;
            try{
                const errorData = await res.json();
                if(errorData?.detail){
                    errorMessage = errorData.detail;
                }
            } catch {
                const text = await res.text();
                if(text) errorMessage= text;
            } throw new Error(errorMessage);
            
        } 
        await res.json();
        onSaved();
        onClose();
    }catch(err){
        console.error("Error while Saving State:",err);
        setMessage(err.message||"Failed to Save States");
    }finally{
        setLoading(false);
    }
};
/* toolbar action*/
  const handleNew = () => {
          setFormData({
          stateCode: "",
          stateName: "",
          countryId: 0,
          countryName:"",
          active : true,
          createdby : "admin",
          modifiedby: "admin"
        });
        setMessage("");        
        if (editState && typeof handleNew === "function") {
        handleNew(); // call parent to clear editcountry
        }
         };
      

    const hadlelist= () => {
      if(navigateToList) navigateToList();
    }
    const handleDeleteClick = () => {
  if (handleDelete && editState?.id) {
    handleDelete(editState.id);   // 👈 pass id
    handleNew()              // 👈 go back to list
  } else {
    alert("No country selected to delete!");
  }
};

 const columns = [
    { field: "statecode", label: "State Code" },
    { field: "statename", label: "State Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
  ];

  const searchFields = [
    { value: "statecode", label: "State Code" },
    { value: "statename", label: "State Name" },
    { value: "active", label: "Active" },
  ];
const handleSelectState  = (states) => {
    setFormData({
      id: states.id,
      stateCode: states.statecode,
      stateName: states.statename,
      countryId:states.countryid,
      countryName: states.countryname,
      active: !!states.active,
      createdby: states.createdby,
      modifiedby: states.modifiedby,
    });
    };
    console.log(handleSelectState);
    console.log("formData.countryId:", formData.countryid); 
 return (
    <div className="card w-100">
    <div className="d-flex justify-content-between align-items-center w-100 "
       style={{
      backgroundColor: "	#ebe6e6ff", // light grey background
      border: "1px solid #ced4da", // border
      borderRadius: "5px"           // optional rounded corners
      }}
      >
        <h4 className="mb-0 ">{editState ? "Edit Country" : "New Country"}</h4>

        {/* Left-side Buttons */}
        <div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-primary " onClick={handleNew}>
            <i class="bi bi-plus-lg"></i> {/* Add */}
          </button>
          <button type="button" className="btn btn-danger " onClick={handleDeleteClick}>
             <i class="bi bi-dash-lg"></i> {/* Remove */}
          </button>
          <button type="button" className="btn btn-info" onClick={()=> setShowModal(true)} >
             <i class="bi bi-search"></i> {/* Search */}
          </button>
          <button type="button" className="btn btn-secondary" onClick={hadlelist}>
            <i class="bi bi-list"></i> {/* List */}
          </button>

          {/* Dropdown Button for Preview */}
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-warning dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"  >
               <i class="bi bi-chat-square-dots"></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" type="button">
                  Preview
                </button>
              </li> 
              <li>
                <button className="dropdown-item" type="button">
                  Print
                </button>
              </li>              
            </ul>
          </div>
        </div>
       </div>  
     <div className="card p-3 border border-secondary w-100" style={{backgroundColor:"#ebe6e6ff"}} >
              
      {message && <div className="alert alert-danger">{message}</div>}
    
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="required" htmlFor="stateCode">State Code</label>
          <input
            type="text"
            name="stateCode"
            className="form-control"
            value={formData.stateCode}
            onChange={handleChange}
            required
            style={{width:"150px"}}
          />
        </div>

        <div className="mb-3">
          <label className="required" htmlFor="stateName">State Name </label>
          <input
            type="text"
            name="stateName"
            className="form-control"
            value={formData.stateName}
            onChange={handleChange}
            required
             style={{width:"350px"}}
          />
        </div>
        <div className="mb-3">
        <label className="required" htmlFor="countryId">Country Name</label>
        <select
            name="countryId"
            className="form-control"
            value={formData.countryId}
            onChange={handleChange}            
            /*{(e) => {
             setFormData({ ...formData, countryId: Number(e.target.value) })
            }}*/
            required

            style={{ width: "350px" }}
        >
            <option value="">-- Select Country --</option>
            {countries.map((c) => (
            <option key={c.id} value={c.id}>
                {c.countryname}
            </option>
            ))}
        </select>
         
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            name="active"
            className="form-check-input"
            checked={formData.active}
            onChange={handleChange}
          />
          <label className="form-check-label">Active</label>
        </div>

        <button
          type="submit"
          className="btn btn-success me-2"
          disabled={loading}
        >
          {loading ? "Saving..." :editState? "Update" : "Save"  }
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
      <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl={`${API_URL}/state/search`}
        columns={columns}
        searchFields={searchFields}
        onSelect={handleSelectState}
      />
    </div>
  );

}
export default State;
