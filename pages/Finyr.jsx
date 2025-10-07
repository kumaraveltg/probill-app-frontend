import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa"; 
import { API_URL } from "../components/Config"; 
import FinyrForm  from "./FinyrForm.jsx";
import { useNavigate } from "react-router-dom";
import DataContext from "../context/DataContext.jsx";

function Finyr() {
    const {finyr,fetchFinyr,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [finyrObject,setFinyrObject]=useState();
    const [limit,setLimit] = useState(10);

 const filteredFinyr = finyr.filter(c =>
  [
    c.id,
    c.finyrname,
    c.startdate,
    c.enddate,
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
  fetchFinyr(page * limit, limit);
}, [page,limit]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setFinyrObject(null);
};

const handleSaved = () => {
  fetchFinyr(); // refresh list
};


useEffect(()=>{ 
finyrObject && setShowForm(true); 
},[finyrObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this Financial Year?"))
     return;
    try{
    const res = await fetch(`${API_URL}/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchFinyr(page * limit, limit);
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
          <h2>Financial Year</h2>
         
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
                New Financial Year
                </button>
            </div>
            </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover">        
<thead className="table-light">
<tr> 
<th>Finyear Name</th>
<th>Start Date</th>   
<th>End Date</th>  
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
) : filteredFinyr.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No Currency found.</td>
</tr>
) : (    
filteredFinyr.map((fin) => ( 
    <tr key={fin.id}>   
        <td>{fin.finyrname}</td>
        <td>{fin.startdate}</td>  
        <td>{fin.enddate}</td>  
        <td>{fin.active ? "Yes" : "No"}</td>
        <td>{fin.createdby}</td>
        <td>{fin.createdon}</td> 
        <td>{fin.modifiedby}</td>
        <td>{fin.modifiedon}</td>
        <td>
            <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setFinyrObject(fin)}
            >
                <i className="bi bi-pencil"></i> 
            </button>
            <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(fin.id)}
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
    <div>Total Finacial Years: {total}</div>
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
            onClick={() => setPage((p) => (total > (p + 1) * limit ? p + 1 : p))}
            disabled={(page + 1) * limit >= total}
        >
            Next
        </button>
    </div>
</div>
</>     
        ) : (
        <FinyrForm
            finyrObject={finyrObject}
            setFinyrObject={setFinyrObject}
            onClose={() => { setShowForm(false);
                 setFinyrObject(null); 
                 fetchFinyr(page * limit, limit); }
                }
            fetchFinyr={fetchFinyr}
            navigateToList={() => { setShowForm(false);
                 setFinyrObject(null); 
                 fetchFinyr(page * limit, limit); }
                }
            handleDelete={handleDelete}
            handleNew={handleNew} 
            onSaved={handleSaved}  
            
        />
        )} 
        </div>    
    );                

}
export default Finyr;