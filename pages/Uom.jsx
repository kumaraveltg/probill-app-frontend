import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config"; 
import UomForm from "./UomForm.jsx";
import { useNavigate } from "react-router-dom";

function Uom() {
    const {uoms,fetchUoms,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [uomObject,setUomObject]=useState();
    const [limit,setLimit] = useState(10);
    const [collapsed,setCollapsed]= useState("");

 const filteredUoms = uoms.filter(c =>
  [
    c.id,
    c.uomcode,
    c.uomname,
    c.active ? "Yes" : "No",
    c.companyid,
    c.companyname,  
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
  fetchUoms(page * limit, limit,total);
}, [page,limit,total]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setUomObject(null);
};

const handleUomSaved = () => {
  fetchUoms(); // refresh list
};


useEffect(()=>{ 
uomObject && setShowForm(true); 
},[uomObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this UOM?"))
     return;
    try{
    const res = await fetch(`${API_URL}/uomdelete/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchUoms(page * limit, limit);
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
        <div className="d-flex justify-content-between align-items-center mt-0 mb-2">
        {/* Left Title Section */}
        <div className="d-flex align-items-baseline">
            <h3 className="fw-bold mb-0 me-2">UOM</h3>
            <h5 className="text-muted mb-0">(Unit of Measurements)</h5>
        </div>

        {/* Search box */}
        <div className="col-md-4">
            <div className="input-group">
            <span className="input-group-text bg-primary text-white">
                <FaSearch />
            </span>
            <input
                type="text"
                className="form-control"
                placeholder="Search UOM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
        </div>

        {/* Button */}
        <div className="col-md-2 text-end">
            <button className="btn btn-primary" onClick={handleNew}>
            <FaPlus className="me-2" />
            New UOM
            </button>
        </div>
        </div>

<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover">        
<thead className="table-light">
<tr>
<th></th>
<th hidden>Company Name</th>
<th>UOM Code</th>
<th>UOM Name</th>   
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
) : filteredUoms.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No UOMs found.</td>
</tr>
) : (    
filteredUoms.map((uom) => ( 
    <tr key={uom.id}>   
        <td><button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setUomObject(uom)}
            >
                <i className="bi bi-pencil"></i> 
            </button></td>
        <td hidden>{uom.companyname}</td>
        <td>{uom.uomcode}</td>
        <td>{uom.uomname}</td>  
        <td>{uom.active ? "Yes" : "No"}</td>
        <td>{uom.createdby}</td>
        <td>{uom.createdon}</td> 
        <td>{uom.modifiedby}</td>
        <td>{uom.modifiedon}</td>
        <td> 
            <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(uom.id)}
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
                position:"fixed",
                bottom: 0,
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
    Total UOM's: {total}
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
        <UomForm
            uomObject={uomObject}
            setUomObject={setUomObject}
            onClose={() => { setShowForm(false);
                 setUomObject(null); 
                 fetchUoms(page * limit, limit); }
                }
            fetchUoms={fetchUoms}
            navigateToList={() => { setShowForm(false);
                 setUomObject(null); 
                 fetchUoms(page * limit, limit); }
                }
            handleDelete={handleDelete}
            handleNew={handleNew} 
            OnSaved={handleUomSaved}  
            
        />
        )} 
        </div>    
    );                

}
export default Uom;