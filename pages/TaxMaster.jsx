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
  fetchTaxMaster(page * limit, limit);
}, [page,limit]);

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
        <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2>TaxMaster</h2>          
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
                New TaxMaster
                </button>
            </div>
            </div>
            
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>   
            <table className="table table-bordered table-hover">        
            <thead className="table-light">
            <tr>
            <th>Company Name</th>
            <th>Tax Name </th>
            <th>Tax Type</th>   
            <th>Tax Rate</th>
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
            ) : filteredTax.length === 0 ? (
            <tr>    
                <td colSpan="9" className="text-center">No Tax found.</td>
            </tr>
) : (    
filteredTax.map((tax) => ( 
    <tr key={tax.id}>   
        <td>{tax.companyname}</td>
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
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setTaxObject(tax)}
            >
                <i className="bi bi-pencil"></i> 
            </button>
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
<div className="d-flex justify-content-between align-items-center my-3"
>    
    <div>Total Taxs: {total}</div>
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
            disabled={(page + 1) * limit >= total}>
            Next
        </button>
    </div>
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