import { useState, useContext, useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";   
import CompanyForm from "./CompanyForm.jsx";
import { AuthContext } from "../context/AuthContext.jsx";


function Company() {
  const { companies, fetchCompanies, Loading, total, error  } = useContext(DataContext);
  const { accessToken } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [companyObject, setCompanyObject] = useState(null);
  const [limit, setLimit] = useState(10);   
  const[collapsed,setCollapsed]= useState(false);

  // Filter companies based on search input
  const filteredCompanies = Array.isArray(companies)
    ? companies.filter(c =>
        [
          c.id,
          c.companycode,
          c.companyname,
          c.active ? "Yes" : "No",       
          c.createdby,
          c.modifiedby,
          c.createdon,
          c.modifiedon,
          c.adress,
          c.gstno,
          c.phone,
          c.emailid,
          c.contactperson,
          c.currency,
          c.currencycode,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : []; 

    
    useEffect(() => {
        console.log("Current Access Token in useEffect:", accessToken);
    if (accessToken) { 
      fetchCompanies(accessToken);
    }
  }, [accessToken]);


  const handleNew = () => {
    setShowForm(true);
    setCompanyObject(null);
  };

  const handleCompanySaved = () => {
    fetchCompanies( accessToken); // refresh list after save
  };

   

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      const res = await fetch(`${API_URL}/company/deletecompany/${id}`, 
        { method: "DELETE" ,
        headers: {
        'Authorization': `Bearer ${accessToken}` // Add auth header if needed
      }}

      );
      console.log("company delete",res);
      if (res.ok) {
        fetchCompanies(page * limit, limit); 
      } 
      else {
         const errorData = await res.json().catch(() => ({}));  
         throw new Error(errorData.detail || `Delete failed with status ${res.status}`);
         
      }
    } catch (err) {
      console.error("Error deleting company:", err);
    }
  };

  return (
    <div className="container-fluid px-0 py-0"> 
         {!showForm ? (
           <>
         <div className="d-flex justify-content-between align-items-center mt-0 mb-0">
                 <div className="row mb-3 align-items-center">
                     <div className="col-md-3">
                     <h2>Company</h2>
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
                         placeholder="Search Company..."
                         value={search}
                         onChange={(e) => setSearch(e.target.value)}
                       />
                     </div>
                   </div>
         
                   {/* Button */}
                   <div className="col-md-3 text-end">
                     <button className="btn btn-primary" onClick={handleNew}>
                       <FaPlus className="me-2" />
                       New Company
                     </button>
                   </div>
                 </div>

          {/* Company table */}
    <div style={{ maxHeight: "500px", overflowY: "auto"}}>
      <table className="table table-bordered table-hover"  style={{ width: "100%", tableLayout: "fixed", minWidth: "1600px" }}>
        <thead className="table-light">
          <tr>
            <th style={{width:"80px"}}></th>
            <th style={{width:"350px"}}>Company Name</th>
            <th style={{width:"200px"}}>Company Code</th>
            <th style={{width:"650px"}}>Address</th>
            <th style={{width:"200px"}}>Gst No</th>
            <th style={{width:"100px"}}>Phone No</th>
            <th style={{width:"350px"}}>Email-id</th>
            <th style={{width:"350px"}}>Contact Person</th>
            <th style={{width:"150px"}}>Curency Code</th>
            <th style={{width:"150px"}}>Active</th>
            <th style={{width:"250px"}}>Created By</th>
            <th style={{width:"200px"}}>Created On</th>
            <th style={{width:"200px"}}>Modified By</th>
            <th style={{width:"200px"}}>Modified On</th> 
          </tr>
        </thead>
<tbody>
  {Loading ? (
    <tr>
      <td colSpan="13" className="text-center">Loading...</td>
    </tr>
  ) : error ? (
    <tr>
      <td colSpan="13" className="text-center text-danger">Error: {error}</td>
    </tr>
  ) : filteredCompanies.length === 0 ? (
    <tr>
      <td colSpan="13" className="text-center">No companies found.</td>
    </tr>
  ) : (
filteredCompanies.map((c) => (
<tr key={c.id}>
    <td> <button
        className="btn btn-sm btn-primary me-2"
        onClick={() => {setCompanyObject(c); setShowForm(true)} }
    >
        <i className="bi bi-pencil"></i>
    </button></td>
    <td>{c.companyname || ""}</td>
    <td>{c.companycode || ""}</td>
    <td >{c.adress || ""}</td>
    <td>{c.gstno || ""}</td>
    <td>{c.phone || ""}</td>
    <td>{c.emailid || ""}</td>
    <td>{c.contactperson || ""}</td>
    <td>{c.currencycode || "N/A"}</td>
    <td>{c.active ? "Yes" : "No"}</td>
    <td>{c.createdby || ""}</td>
    <td>{c.createdon}</td>
    <td>{c.modifiedby || ""}</td>
    <td>{c.modifiedon }</td> 
    <td>
    {/* Edit/Delete buttons */}
    
    {/* <button
        className="btn btn-sm btn-danger"
        onClick={() => handleDelete(c.id)}
    >
        <i className="bi bi-trash3"></i>
    </button> */}
    </td>
</tr>
))
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
    Total Companies: {total}
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
      ) : 
        (
          <CompanyForm
            companyObject={companyObject}
            setCompanyObject={setCompanyObject}
            onClose={() => { setShowForm(false); setCompanyObject(null); }}
            fetchCompanies={() => fetchCompanies (accessToken)} 
            handleNew={handleNew} 
            onSaved={handleCompanySaved}   
            navigateToList={() => { setShowForm(false);
            setCompanyObject(null); }  }
          />
            
      )
    
      }
    </div>
  );
}

export default Company;
