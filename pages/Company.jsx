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
      } else {
        console.error("Failed to delete company");
      }
    } catch (err) {
      console.error("Error deleting company:", err);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center my-3">
        <h2>Company </h2>
        <button className="btn btn-primary" onClick={handleNew}>
          <FaPlus className="me-2" /> New Company
        </button>
      </div>

      {!showForm ? (
        <>
          {/* Search input */}
          <div className="input-group mb-3">
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

          {/* Company table */}
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Company Name</th>
                  <th>Company Code</th>
                  <th>Address</th>
                  <th>Gst No</th>
                  <th>Phone No</th>
                  <th>Email-id</th>
                  <th>Contact Person</th>
                  <th>Curency Code</th>
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
                    <td>{c.companyname || ""}</td>
                    <td>{c.companycode || ""}</td>
                    <td>{c.adress || ""}</td>
                    <td>{c.gstno || ""}</td>
                    <td>{c.phone || ""}</td>
                    <td>{c.emailid || ""}</td>
                    <td>{c.contactperson || ""}</td>
                    <td>{c.currencycode || "N/A"}</td>
                    <td>{c.active ? "Yes" : "No"}</td>
                    <td>{c.createdby || ""}</td>
                    <td>{c.createdon ? new Date(c.createdon).toLocaleString() : ""}</td>
                    <td>{c.modifiedby || ""}</td>
                    <td>{c.modifiedon ? new Date(c.modifiedon).toLocaleString() : ""}</td> 
                    <td>
                    {/* Edit/Delete buttons */}
                    <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => {setCompanyObject(c); setShowForm(true)} }
                    >
                        <i className="bi bi-pencil"></i>
                    </button>
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

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center my-3">
            <div>Total Companies: {total || 0}</div>
            <label>
              Rows:
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
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
