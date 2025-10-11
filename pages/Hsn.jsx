import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa"; 
import { API_URL } from "../components/Config"; 
import HsnForm from "./HsnForm.jsx";
import { useNavigate } from "react-router-dom";
import DataContext from "../context/DataContext.jsx";

function Hsn() {
    const {hsn,fetchHsn,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [hsnObject,setHsnObject]=useState();
    const [limit,setLimit] = useState(100);

 const filteredHsn = (hsn||[]).filter(c =>
  [
    c.id,
    c.companyname,
    c.hsncode,
    c.hsndescription,
    c.taxheaderid,
    c.taxname,
    c.taxrate,
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
  fetchHsn(page * limit, limit);
}, [page,limit ]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setHsnObject(null);
};

const handleSaved = () => {
  fetchHsn(); // refresh list
};


useEffect(()=>{ 
hsnObject && setShowForm(true); 
},[hsnObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this UOM?"))
     return;
    try{
    const res = await fetch(`${API_URL}/hsn/hsndelete/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchHsn(page * limit, limit);
    }   
    else {
        console.error("Failed to delete HSN");
    }
 }  catch(err){
    console.error("Error deleting HSN:", err);
 }
};
    return (    
        <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2>HSN</h2>
         </div>  
        {!showForm ? (
        <>
        <div className="row mb-3 align-items-center">
            {/* Search box */}
            <div className="col-md-8">
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

            {/* Button */}
            <div className="col-md-4 text-end">
                <button className="btn btn-primary" onClick={handleNew}>
                <FaPlus className="me-2" />
                New HSN
                </button>
            </div>
            </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover">        
<thead className="table-light">
<tr> 
<th>Company Name</th>
<th>HSN Code</th>
<th>HSN Description</th>   
<th>Taxname</th>
<th>Taxrate</th>
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
    <td colSpan="9" className="text-center">Loading...</td>
</tr>   
) : error ? (
<tr>
    <td colSpan="9" className="text-center text-danger">Error: {error}</td>     
</tr>
) : filteredHsn.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No HSN found.</td>
</tr>
) : (    
filteredHsn.map((hsn) => ( 
    <tr key={hsn.id}>  
        <td>{hsn.companyname}</td> 
        <td>{hsn.hsncode}</td>
        <td>{hsn.hsndescription}</td>  
        <td>{hsn.taxname}</td>
        <td>{hsn.taxrate}</td>
        <td>{hsn.active ? "Yes" : "No"}</td>
        <td>{hsn.createdby}</td>
        <td>{hsn.createdon}</td> 
        <td>{hsn.modifiedby}</td>
        <td>{hsn.modifiedon}</td>
        <td>
            <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setHsnObject(hsn)}
            >
                <i className="bi bi-pencil"></i> 
            </button>
            <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(hsn.id)}
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
<div className="d-flex justify-content-between align-items-center my-3"
>    
    <div>Total HSN: {total}</div>
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
        <option value={10}>100</option>
        <option value={500}>500</option>
        <option value={1000}>1000</option>
        <option value={5000}>5000</option>
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
        ) : (
        <HsnForm
            hsnObject={hsnObject}
            setHsnObject={setHsnObject}
            onClose={() => { setShowForm(false);
                 setHsnObject(null); 
                 fetchHsn(page * limit, limit); }
                }
            fetchHsn={fetchHsn}
            navigateToList={() => { setShowForm(false);
                 setHsnObject(null); 
                 fetchHsn(page * limit, limit); }
                }
            handleDelete={handleDelete}
            handleNew={handleNew} 
            onSaved={handleSaved}  
            
        />
        )} 
        </div>    
    );                

}
export default Hsn;