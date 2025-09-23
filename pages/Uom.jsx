import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config"; 

function Uom() {
    const {uoms,fetchUoms,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [uomObject,setUomObject]=useState();
    const [limit,setLimit] = useState(10);

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
  fetchUoms(page * limit, limit);
}, [page,limit]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setUomObject(null);
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
        <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2>Unit of Measurement (UOM)</h2>
          <button className="btn btn-primary" onClick={handleNew}>
            <FaPlus className="me-2" />
            New UOM
          </button>
        </div>  
        {!showForm ? (
        <>
        <div className="input-group mb-3">  
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
<div className="table-responsive">
<table className="table table-bordered table-hover">        
<thead className="table-light">
<tr>
<th>Company Name</th>
<th>UOM Code</th>
<th>UOM Name</th>   
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
) : filteredUoms.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No UOMs found.</td>
</tr>
) : (    
filteredUoms.map((uom) => ( 
    <tr key={uom.id}>   
        <td>{uom.companyname}</td>
        <td>{uom.uomcode}</td>
        <td>{uom.uomname}</td>  
        <td>{uom.active ? "Yes" : "No"}</td>
        <td>{uom.createdby}</td>
        <td>{uom.createdon}</td> 
        <td>{uom.modifiedby}</td>
        <td>{uom.modifiedon}</td>
        <td>
            <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setUomObject(uom)}
            >
                <i className="bi bi-pencil"></i> 
            </button>
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
<div className="d-flex justify-content-between align-items-center my-3">    
    <div>Total UOMs: {total}</div>
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
        <UomForm
            uomObject={uomObject}
            onClose={() => { setShowForm(false); setUomObject(null); fetchUoms(page * limit, limit); }}
        />
        )} 
        </div>    
    );                

}
export default Uom;