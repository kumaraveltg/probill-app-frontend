import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa"; 
import { API_URL } from "../../components/Config.jsx"; 
import LicensesForm from "../Admin/LicensesForm.jsx";
import DataContext from "../../context/DataContext.jsx";

function License() {
    const {license,fetchLicense,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [licenseObject,setLicenseObject]=useState();
    const [limit,setLimit] = useState(10);

 const filteredLicense = license.filter(c =>
  [
    c.id,
    c.companyname,
    c.companyno,
    c.planname,
    c.planperiod,
    c.startdate,
    c.enddate,
    c.userlimit,
    c.licensekey,
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
  fetchLicense(page * limit, limit,total);
}, [page,limit,total]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setLicenseObject(null);
};

const handleSaved = () => {
  fetchLicense(); // refresh list
};


useEffect(()=>{ 
licenseObject && setShowForm(true); 
},[licenseObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this UOM?"))
     return;
    try{
    const res = await fetch(`${API_URL}/licensedelete/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchLicense(page * limit, limit);
    }   
    else {
        console.error("Failed to delete Currency");
    }
 }  catch(err){
    console.error("Error deleting Currency:", err);
 }
};
    return (
  <div className="container-fluid px-0 py-0">
    {!showForm ? (
      <>
        <div className="d-flex justify-content-between align-items-center mt-0 mb-0">
        <div className="row mb-3 align-items-center">
            <div className="col-md-3">
            <h2>License</h2>
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
                placeholder="Search Tax..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Button 
          <div className="col-md-3 text-end">
            <button className="btn btn-primary" onClick={handleNew}>
              <FaPlus className="me-2" />
              New Licenses
            </button>
          </div>*/}
        </div>

        {/* Table */}
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <table className="table table-bordered table-hover"  style={{ width: "100%", tableLayout: "fixed", minWidth: "1600px" }}>
            <thead className="table-light">
              <tr>
                <th style={{width:"50px"}}></th>
                <th style={{width:"200px"}}>Company name</th>
                <th style={{width:"120px"}}>Company No</th>
                <th style={{width:"200px"}}>Planname</th>
                <th style={{width:"200px"}}>Plan Period</th>
                <th style={{width:"150px"}}>Start Date</th>
                <th style={{width:"150px"}}>End Date</th>
                <th style={{width:"350px"}}>License Key</th>
                <th style={{width:"100px"}}>User Limit</th>
                <th style={{width:"100px"}}>Active</th>
                <th style={{width:"150px"}}>Created By</th>
                <th style={{width:"200px"}}>Created On</th>
                <th style={{width:"150px"}}>Modified By</th>
                <th style={{width:"200px"}}>Modified On</th>
                <th style={{width:"50px"}}></th>
              </tr>
            </thead>
            <tbody>
              {Loading ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="text-center text-danger">
                    Error: {error}
                  </td>
                </tr>
              ) : filteredLicense.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    No Licenses found.
                  </td>
                </tr>
              ) : (
                filteredLicense.map((cur) => (
                  <tr key={cur.id}>
                    <td><button
                        className="btn btn-sm btn-primary me-2"
                        onClick={() => setLicenseObject(cur)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button></td>
                    <td>{cur.companyname}</td>
                    <td>{cur.companyno}</td>
                    <td>{cur.planname}</td>
                    <td>{cur.planperiod}</td>
                    <td>{cur.startdate}</td>
                    <td>{cur.enddate}</td>
                    <td>{cur.licensekey}</td>
                    <td>{cur.userlimit}</td>
                    <td>{cur.active ? "Yes" : "No"}</td>
                    <td>{cur.createdby}</td>
                    <td>{cur.createdon}</td>
                    <td>{cur.modifiedby}</td>
                    <td>{cur.modifiedon}</td>
                    <td> 
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(cur.id)}
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

        {/* Pagination / Footer */}
        <div className="d-flex justify-content-between align-items-center my-3">
          <div>Total Licenses: {total}</div>
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
              onClick={() =>
                setPage((p) => (total > (p + 1) * limit ? p + 1 : p))
              }
              disabled={(page + 1) * limit >= total}
            >
              Next
            </button>
          </div>
        </div>
      </>
    ) : (
      <LicensesForm
        licenseObject={licenseObject}
        setLicenseObject={setLicenseObject}
        onClose={() => {
          setShowForm(false);
          setLicenseObject(null);
          fetchLicense(page * limit, limit);
        }}
        fetchLicense={fetchLicense}
        navigateToList={() => {
          setShowForm(false);
          setLicenseObject(null);
          fetchLicense(page * limit, limit);
        }}
        handleDelete={handleDelete}
        handleNew={handleNew}
        onSaved={handleSaved}
      />
    )}
  </div>
);
}
export default License;