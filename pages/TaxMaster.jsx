import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config"; 
import TaxMasterForm from "./TaxMasterForm.jsx";
import { useNavigate } from "react-router-dom";

function TaxMaster() {
    const {taxmaster,fetchTaxMaster,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [taxObject,setTaxObject]=useState();
    const [limit,setLimit] = useState(10);
    const [collapsed,setCollapsed]= useState("");

 const filteredTax = taxmaster.filter(c =>
  [
    c.id,
    c.taxname,
    c.taxtype,
    c.taxrate,
    c.active ? "Yes" : "No",
    c.companyid,
    c.companyname,  
    c.createdby,
    c.modifiedby,
    c.createdon,
    c.modifiedon,
  ]
  .join(" ")
  .toLowerCase()
  .includes(search.toLowerCase())
);
useEffect(() => {
  fetchTaxMaster(page * limit, limit,total);
}, [page,limit,total]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setTaxObject(null);
};

const handleTaxSaved = () => {
  fetchTaxMaster(); // refresh list
};


useEffect(()=>{ 
taxObject && setShowForm(true); 
},[taxObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this Taxmaster?"))
     return;
    try{
    const res = await fetch(`${API_URL}/deletetax/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchTaxMaster(page * limit, limit);
    }   
    else {
        console.error("Failed to delete UOM");
    }
 }  catch(err){
    console.error("Error deleting UOM:", err);
 }
};
    return (    
       <div className="container-fluid px-0 py-0"> 
         {!showForm ? (
                <>
              <div className="d-flex justify-content-between align-items-center mt-0 mb-0">
                      <div className="row mb-3 align-items-center">
                          <div className="col-md-5">
                          <h2>TaxMaster</h2>
                        </div>
                      </div>
                        {/* Search box */}
                        <div className="col-md-5">
                          <div className="input-group">
                            <span className="input-group-text bg-primary text-white">
                              <FaSearch />
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search Tax Master..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>
                        </div>
              
                        {/* Button */}
                        <div className="col-md-2 text-end">
                          <button className="btn btn-primary" onClick={handleNew}>
                            <FaPlus className="me-2" />
                            New Tax Master
                          </button>
                        </div>
                      </div>
            
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>   
            <table className="table table-bordered table-hover">        
            <thead className="table-light">
            <tr>
            <th></th>
            <th hidden>Company Name</th>
            <th>Tax Name </th>
            <th>Tax Type</th>   
            <th>Tax Rate</th>
            <th>Active</th>
            <th>Created By</th>
            <th>Created On</th> 
            <th>Modified By</th>
            <th>Modified On</th>
            <th> </th>
            </tr>   
            </thead>
            <tbody>
            {Loading ? (    
            <tr>
                <td colSpan="9" className="text-center">Loading...</td>
            </tr>   
            ) : error ? (
            <tr>
                <td colSpan="9" className="text-center text-danger">Error: {error}</td>     
            </tr>
            ) : filteredTax.length === 0 ? (
            <tr>    
                <td colSpan="9" className="text-center">No Tax found.</td>
            </tr>
) : (    
filteredTax.map((tax) => ( 
    <tr key={tax.id}>  
        <td><button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setTaxObject(tax)}
            >
                <i className="bi bi-pencil"></i> 
            </button></td> 
        <td hidden>{tax.companyname}</td>
        <td>{tax.taxname}</td>
        <td>{tax.taxtype}</td>  
        <td>{tax.taxrate}</td>  
        <td>{tax.active ? "Yes" : "No"}</td>
        <td>{tax.createdby}</td>
        <td>{tax.createdon ? new Date(tax.createdon).toLocaleString() : ""}</td>
        <td>{tax.modifiedby}</td>         
        <td>{tax.modifiedon ? new Date(tax.modifiedon).toLocaleString() : ""}</td>
        <td>
            
            <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(tax.id)}
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
    Total Taxmaster: {total}
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
        ) : (
        <TaxMasterForm
            taxObject={taxObject}
            setTaxObject={setTaxObject}
            onClose={() => { setShowForm(false);
                 setTaxObject(null); 
                 fetchTaxMaster(page * limit, limit); }
                }
            fetchTaxMaster={fetchTaxMaster}
            navigateToList={() => { setShowForm(false);
                 setTaxObject(null); 
                 fetchTaxMaster(page * limit, limit); }
                }
            handleDelete={handleDelete}
            //handleNew={handleNew} 
            OnSaved={handleTaxSaved}              
        />
        )} 
        </div>    
    );     
}
export default TaxMaster;