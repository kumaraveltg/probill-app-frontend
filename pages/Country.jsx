import React, { useEffect, useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import SearchModal from "../components/SearchModal";

// ================== COUNTRY  LIST COMPONENT ==================
function Country() {
  const [countries, setCountries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [ search, setSearch] = useState('');
  const [editcountry,setEditcountry]= useState(null);

  // Fetch countries function in component scope
  const fetchCountries = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/country/?skip=0&limit=100"
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setCountries(data.sort((a,b) => a.countryname.localeCompare(b.countryname)));
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCountries();
  }, []);

  const filteredCountries = countries.filter(c =>
    [c.countrycode,c.countryname,c.active?"Yes":"No",c.createdby,c.createdon,c.modifiedby,c.modifiedby]
    .join(" ")
    .toLowerCase().includes(search.toLowerCase())
  );
console.log("filtered:",filteredCountries);
console.log("countries:",fetchCountries)
  

  const handleDelete = async(id) => {
    if (!window.confirm("Are You Sure you want to Delete this Country?"))
    { return;

    }
    try {
       const res= await fetch(`http://127.0.0.1:8000/country/${id}`,
       { method:"DELETE",}
       );
       if(!res.ok){
          throw new Error(`Failed Delete Status: ${res.status}`);
       }
    
    alert("Country deleted Sucessfully");
      fetchCountries(); 
  } catch (err){
    console.error("Error deleteing country:",err);
    alert ("Failed to delete entry")
  }
  };

  const handleNew = () => { 
    setShowForm(true); 
    setEditcountry(null);
  };
  const handleEdit = (country) => {
    setEditcountry(country)
    setShowForm(true)
    console.log("Edit country", country.id);
    // Implement edit logic if needed
  };

  return (
    <div className="container-fluid ">
      {!showForm ? (
        <>
          <h4>Country List</h4>
          
              {/* Button Column */}
          <div className="row mb-3 align-items-center">
          <div className="col-md-6">
            <button className="btn btn-new" onClick={handleNew}>
              <FaPlus className="me-1" /> New Country
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
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Country Code</th>
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
              {filteredCountries.map((c, id) => (
                <tr key={id}>
                  <td>{c.countrycode}</td>
                  <td>{c.countryname}</td>
                  <td>{c.active ? "Yes" : "No"}</td>
                  <td>{c.createdby}</td>
                  <td>{c.createdon}</td>
                  <td>{c.modifiedby}</td>
                  <td>{c.modifiedon}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-edit me-2"
                      onClick={() => handleEdit(c)}
                    >
                      <i class="bi bi-pencil"></i>
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
              {countries.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">
                    No countries found
                  </td>
                </tr>
              )}
                {filteredCountries.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">
                    No matching countries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      ) 
      : (
        <CountryForm
          editcountry= {editcountry}
          onClose={() => setShowForm(false)}
          onSaved={fetchCountries} // ✅ refresh list after save
          navigateToList={() => setShowForm(false)}
          handleDelete={handleDelete}
          handleNew={handleNew}
        />
      )}
    </div>
  );
}



// ================== COUNTRY FORM COMPONENT ==================
function CountryForm({ onClose, onSaved,editcountry,navigateToList,handleDelete }) {
  const [formData, setFormData] = useState({
    countryCode: "",
    countryName: "",
    active: true,
    createdby: "admin",
    modifiedby: "admin",
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
 


  useEffect ( () => {
    if (editcountry) {
      setFormData({
        id : editcountry.id,
        countryCode :editcountry.countrycode,
        countryName :editcountry.countryname,
        active : editcountry.active,
        modifiedby:editcountry.modifiedby
      });
    }
  },[editcountry] );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
     const url = editcountry?`http://127.0.0.1:8000/countryupdate/${editcountry.id}`:`http://127.0.0.1:8000/country/`;
      

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        countrycode: formData.countryCode,
        countryname: formData.countryName,
        active: formData.active,
        createdby: formData.createdby,
        modifiedby: formData.modifiedby,
      }),
    });

    if (!res.ok) {
      // Try to parse backend error message
      let errorMessage = `HTTP error! Status: ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData?.detail) {
          errorMessage = errorData.detail; // ✅ backend message
        }
      } catch {
        const text = await res.text();
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    }

    await res.json();
    onSaved(); // refresh parent list
    onClose(); // close form
  } catch (err) {
    console.error("Error While Saving Country:", err);
    setMessage(err.message || "Failed to save country."); // ✅ show backend message
  } finally {
    setLoading(false);
  }
};
/* toolbar action*/
  const handleNew = () => {
          setFormData({
          countryCode: "",
          countryName: "",
          active : true,
          createdby : "admin",
          modifiedby: "admin"
        });
        setMessage("");        
        if (editcountry && typeof handleNew === "function") {
        handleNew(); // call parent to clear editcountry
        }
         };
      

    const hadlelist= () => {
      if(navigateToList) navigateToList();
    }
    const handleDeleteClick = () => {
  if (handleDelete && editcountry?.id) {
    handleDelete(editcountry.id);   // 👈 pass id
    handleNew()              // 👈 go back to list
  } else {
    alert("No country selected to delete!");
  }
};

 const columns = [
    { field: "countrycode", label: "Code" },
    { field: "countryname", label: "Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
  ];

  const searchFields = [
    { value: "countrycode", label: "Country Code" },
    { value: "countryname", label: "Country Name" },
    { value: "active", label: "Active" },
  ];
const handleSelectCountry  = (country) => {
    setFormData({
      id: country.id,
      countryCode: country.countrycode,
      countryName: country.countryname,
      active: country.active,
      createdby: country.createdby,
      modifiedby: country.modifiedby,
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
        <h4 className="mb-0 ">{editcountry ? "Edit Country" : "New Country"}</h4>

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
          <label className="required" htmlFor="countryCode">Country Code</label>
          <input
            type="text"
            name="countryCode"
            className="form-control"
            value={formData.countryCode}
            onChange={handleChange}
            required
            style={{width:"150px"}}
          />
        </div>

        <div className="mb-3">
          <label className="required" htmlFor="countryName">Country Name </label>
          <input
            type="text"
            name="countryName"
            className="form-control"
            value={formData.countryName}
            onChange={handleChange}
            required
             style={{width:"350px"}}
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
          {loading ? "Saving..." :editcountry? "Update" : "Save"  }
        </button>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
      <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl="http://localhost:8000/country/search"
        columns={columns}
        searchFields={searchFields}
        onSelect={handleSelectCountry}
      />
    </div>
  );
}

export default Country;
