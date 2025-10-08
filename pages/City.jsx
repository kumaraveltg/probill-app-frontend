 import React, { use } from 'react'
 import { useState,useEffect,useContext } from 'react';
 import  DataContext   from '../context/DataContext';
 import { API_URL } from '../components/Config';
 import { FaPlus, FaSearch } from 'react-icons/fa';
 import CityForm from './CityForm'; 
  
 
 // City List Page
 function City() {
  const {citys,fetchCities,loading,error,total} = useContext(DataContext);
  const [showForm,setShowForm]=useState(false);
  const [search,setSearch]= useState('');
  const [cityObject,setCityObject]= useState(null);
  const [page,setPage]= useState(0);
  const [limit,setLimit] = useState(10);

  const filteredCities = citys.filter(city =>
    city.cityname.toLowerCase().includes(search.toLowerCase()) ||
    city.citycode.toLowerCase().includes(search.toLowerCase()) ||
    (city.statename && city.statename.toLowerCase().includes(search.toLowerCase())) ||
    (city.countryname && city.countryname.toLowerCase().includes(search.toLowerCase()))
    );

  useEffect(() => {
    fetchCities(page * limit, limit);
  }, [page, limit]);

  //New City Form
  const handleAddCity = () => {
    setCityObject(null);
    setShowForm(true);
  };

  const handleEditCity = (city) => {
    setCityObject(city);
    setShowForm(true);
  };
  console.log("handleEditCity cityObject:", cityObject);
  
  const handleDeleteCity = async (cityId) => {
    if (window.confirm("Are you sure you want to delete this city?")) {
      try { 
        const res = await fetch(`${API_URL}/city/${cityId}`, {  
          method: "DELETE",
        });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`); 
        fetchCities(page * limit, limit); 
      // Refresh city list after deletion
        alert("City deleted successfully.");
        
      } catch (err) { 
        console.error("Failed to delete city:", err);
        alert("Failed to delete city. Please try again.");
      } 
    }
  } 
   return (
     <div className="container-fluid ">
      {!showForm ? (
        <>
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 p-2 bg-light rounded shadow-sm">
        {/* Left: Title + New Button */}
        <div className="d-flex align-items-center mb-2 mb-md-0">
          <h4 className="me-3 mb-0">City List</h4>
          <button className="btn btn-sm btn-outline-primary" onClick={handleAddCity}>
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
                <th>City Code</th>
                <th>City Name</th>
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
              {filteredCities.map((c, id) => (
                <tr key={id}>
                  <td>{c.citycode}</td>
                  <td>{c.cityname}</td>
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
                      onClick={()=>  handleEditCity(c)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCity(c.id)}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {citys.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">
                    No Cities found
                  </td>
                </tr>
              )}
                {filteredCities.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center">
                    No matching Cities found
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
        <CityForm cityValueEdit={cityObject}
          onClose={() => setShowForm(false)}
          onSaved={()=>fetchCities(page*limit,limit)} // ✅ refresh list after save
          navigateToList={() => setShowForm(false)}
          handleDelete={handleDeleteCity}
          handleAdd={handleAddCity}  /> 
        </>
      )}
    </div>
  );
}

 export default City