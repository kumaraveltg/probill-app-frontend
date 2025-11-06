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
  const [collapsed,setCollapsed]= useState(false);

  const filteredCities = citys.filter(city =>
    city.cityname.toLowerCase().includes(search.toLowerCase()) ||
    city.citycode.toLowerCase().includes(search.toLowerCase()) ||
    (city.statename && city.statename.toLowerCase().includes(search.toLowerCase())) ||
    (city.countryname && city.countryname.toLowerCase().includes(search.toLowerCase()))
    );

  useEffect(() => {
    fetchCities(page * limit, limit);
  }, [page, limit,total]);

  //New City Form
  const handleAddCity = () => {
    setCityObject(null);
    setShowForm(true);
  };

  const handleEditCity = (city) => {
    setCityObject(city);
    setShowForm(true);
  };
 
  
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
     <div className="container-fluid px-0 py-0"> 
      {!showForm ? (
        <>
      <div className="d-flex justify-content-between align-items-center mt-0 mb-0">
              <div className="row mb-3 align-items-center">
                  <div className="col-md-3">
                  <h2>City</h2>
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
                      placeholder="Search City..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
      
                {/* Button */}
                <div className="col-md-3 text-end">
                  <button className="btn btn-primary" onClick={handleAddCity}>
                    <FaPlus className="me-2" />
                    New City
                  </button>
                </div>
              </div>
         <div style={{ maxHeight: "500px", overflowY: "auto" }}>        
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th></th>
                <th>City Code</th>
                <th>City Name</th>
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
              {filteredCities.map((c, id) => (
                <tr key={id}>
                  <td><button
                      className="btn btn-sm btn-primary me-2"
                      onClick={()=>  handleEditCity(c)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button></td>
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
           {/* Pagination / Footer */}
                  <div   className="bg-light border-top d-flex justify-content-between align-items-center px-4 py-2 shadow-sm flex-wrap"
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
    Total Cities: {total}
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