import React, { useContext, useEffect, useState } from "react";
import SearchModal from "../components/SearchModal";
import { FaSearch, FaPlus } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import Select from "react-select";
import { useMemo } from "react";
 

/* STATE LIST <COMPONENT--------></COMPONENT-------->*/
function State(){
    const {states,total,fetchStates,loading,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [editState,setEditState]=useState();
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
 {
    return;
 }
 try{
    const res = await fetch(`${API_URL}/state/${id}`, {method: "DELETE"});
    if(!res.ok) {throw new Error(`Failed Status Delete:${res.status}`); }
    alert("State Deleted Sucessfully");
    fetchStates(page * limit, limit);

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
          
            {/* Actions Row: New + Search + Pagination */}
            <div className="row mb-3 align-items-center">

              {/* New State Button */}
              <div className="col-md-3">
                <button className="btn btn-sm btn-outline-primary w-30" onClick={handleNew}>
                  <FaPlus className="me-1" /> New 
                </button>
              </div>

              {/* Search Box */}
              <div className="col-md-5 w-40">
                <div className="input-group">
                  <span className="input-group-text"><FaSearch /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <span className="mb-3 mx-3"> Total Records:{total}</span>
                </div>
              </div>

              {/* Pagination */}
              <div className="col-md-4 text-end">
                 
                <label className="me-2">
                  Rows:{" "}
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(0);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                  </select>
                </label>

                <button
                  className="btn btn-sm  btn-outline-primary me-2"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>

                <span>
                  Page {page + 1} of {Math.ceil(total / limit)}
                </span>

                <button
                  className="btn btn-sm btn-outline-primary ms-2"
                  disabled={(page + 1) * limit >= total}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
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

// State Form

    function StateForm({onClose, onSaved,editState,navigateToList,handleDelete,stateValueEdit }){
    const { countries } = useContext(DataContext);
    const [formData,setFormData] = useState(
      {
        stateCode: "",
        stateName: "",
        countryId: 0,
        countryName: "",
        active: true,
        createdby: "admin",
        modifiedby: "admin",
      }  );
    const [showModal,setShowModal]= useState(false);
    const [selectedStates,setSelectedStates] = useState(null);
    const [loading,setLoading] = useState(false);
    const [message,setMessage] = useState("");

   const countryOptions = useMemo( ()=> countries.map(c => ({
    value: c.id,        // countryid
    label: c.countryname, // countryname
    code: c.countrycode  // keep code also if you want to auto-populate later
      })),[countries]);

      console.log("Countries:", countries);
      

  useEffect( ()=> {
    if(stateValueEdit && countryOptions.length > 0){      
      const selectedCountry = countryOptions.find(
      c => c.value === Number(stateValueEdit.countryid)
      );
      setFormData( prev=>({
        ...prev,
        id: stateValueEdit.id,
        stateCode: stateValueEdit.statecode,
        stateName: stateValueEdit.statename,
        countryId: selectedCountry?.value || null, // ✅ safe
        countryName: selectedCountry?.label || "",
        countryCode: selectedCountry?.code || "",
        active: stateValueEdit.active,
        createdby: stateValueEdit.createdby || "admin",
        modifiedby: stateValueEdit.modifiedby || "admin",
      }));
    }
  },[stateValueEdit,countryOptions]);

  useEffect(() => {
  console.log("📝 formData changed:", formData);
}, [formData]);

   // Handle dropdown change
  const handleCountryChange = (selected) => {
    console.log("👉 Selected from dropdown:", selected);
    setFormData(prev => ({
      ...prev,
      countryId: selected ? selected.value : null,
      countryName: selected ? selected.label : "",
      countryCode: selected ? selected.code : ""
    }));
  }; 

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
  if (handleDelete && stateValueEdit?.id) {
    handleDelete(stateValueEdit.id);   // 👈 pass id
    handleNew()              // 👈 go back to list
  } else {
    alert("No country selected to delete!");
  }
};

 const columns = [
    { field: "statecode", label: "State Code" },
    { field: "statename", label: "State Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    { field: "countryname",label:"Country Name"},
     
  ];

  const searchFields = [
    { value: "statecode", label: "State Code" },
    { value: "statename", label: "State Name" },
    { value: "active", label: "Active" },
    { value: "countryname",label: "Country Name"},
    
  ];
const handleSelectState  = (stateValueEdit) => {
    setFormData({
      id: stateValueEdit.id,
      stateCode: stateValueEdit.statecode,
      stateName: stateValueEdit.statename,
      countryId: Number(stateValueEdit.countryid) || 0,
      countryName: stateValueEdit.countryname,
      active: !!stateValueEdit.active,
      createdby: stateValueEdit.createdby,
      modifiedby: stateValueEdit.modifiedby,
    });
    }; 
     
 return (
    <div className="card w-100">
    <div className="d-flex justify-content-between align-items-center w-100 "
       style={{
      backgroundColor: "	#ebe6e6ff", // light grey background
      border: "1px solid #ced4da", // border
      borderRadius: "5px"           // optional rounded corners
      }}
      >
        <h4 className="mb-0 ">{stateValueEdit ? "Edit State" : "New State"}</h4>

        {/* Left-side Buttons */}
        <div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-secondary " onClick={handleNew}>
            <i className="bi bi-plus-lg"></i> {/* Add */}
          </button>
          <button type="button" className="btn btn-secondary " onClick={handleDeleteClick}>
             <i className="bi bi-dash-lg"></i> {/* Remove */}
          </button>
          <button type="button" className="btn btn-secondary" onClick={()=> setShowModal(true)} >
             <i className="bi bi-search"></i> {/* Search */}
          </button>
          <button type="button" className="btn btn-secondary" onClick={hadlelist}>
            <i className="bi bi-list"></i> {/* List */}
          </button>

          {/* Dropdown Button for Preview */}
          <div className="btn-group">
            <button
              type="button"
              className="btn btn-secondary dropdown-toggle"
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
        <div style={{ width: "350px" }}>
                    {countryOptions.length > 0 ? (
              <Select
                options={countryOptions}
                value={countryOptions.find(opt => opt.value === formData.countryId) || null}
                onChange={(selected) => {
                  //console.log("Selected country:", selected);
                  setFormData(prev => ({
                    ...prev,
                    countryId: selected ? selected.value : null,
                    countryName: selected ? selected.label : "",
                    countryCode: selected ? selected.code : ""
                  }));
                }}
                placeholder="-- Select Country --"
                isClearable
                isSearchable 
                filterOption={(option, inputValue) =>
                  option.label.toLowerCase().startsWith(inputValue.toLowerCase())
                }
              />
            ) : (
              <div>Loading countries...</div>
            )}
                    
        </div>
        </div>
        <div>
        <label htmlFor="">Country Code</label>
          <input
          type="text"
          className="form-control"
          value={formData.countryCode || ""}
          readOnly
          style={{width:"150px" , backgroundColor: "#D3D3D3" }}
          
        />     
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
          {loading ? "Saving..." :stateValueEdit? "Update" : "Save"  }
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
