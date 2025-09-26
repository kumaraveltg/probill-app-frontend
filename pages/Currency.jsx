import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataCurrency from "../context/DataCurrency";
import { API_URL } from "../components/Config"; 
import CurrencyForm from "./CurrencyForm.jsx";
import { useNavigate } from "react-router-dom";

function Currency() {
    const {currencies,fetchCurrencies,Loading,total,error} = useContext(DataCurrency);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [currencyObject,setCurrencyObject]=useState();
    const [limit,setLimit] = useState(10);

 const filteredCurrency = currencies.filter(c =>
  [
    c.id,
    c.currencycode,
    c.currencyname,
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
  fetchCurrencies(page * limit, limit);
}, [page,limit]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setCurrencyObject(null);
};

const handleUomSaved = () => {
  fetchCurrencies(); // refresh list
};


useEffect(()=>{ 
currencyObject && setShowForm(true); 
},[currencyObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this UOM?"))
     return;
    try{
    const res = await fetch(`${API_URL}/currency/deletecurrency/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchCurrencies(page * limit, limit);
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
          <h2>Currency</h2>
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
                placeholder="Search Currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />  
        </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover">        
<thead className="table-light">
<tr> 
<th>Currency Code</th>
<th>Currency Name</th>   
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
) : filteredCurrency.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No Currency found.</td>
</tr>
) : (    
filteredCurrency.map((cur) => ( 
    <tr key={cur.id}>   
        <td>{cur.currencycode}</td>
        <td>{cur.currencyname}</td>  
        <td>{cur.active ? "Yes" : "No"}</td>
        <td>{cur.createdby}</td>
        <td>{cur.createdon}</td> 
        <td>{cur.modifiedby}</td>
        <td>{cur.modifiedon}</td>
        <td>
            <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setCurrencyObject(cur)}
            >
                <i className="bi bi-pencil"></i> 
            </button>
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
<div className="d-flex justify-content-between align-items-center my-3"
>    
    <div>Total Currencies: {total}</div>
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
        <CurrencyForm
            currencyObject={currencyObject}
            setCurrencyObject={setCurrencyObject}
            onClose={() => { setShowForm(false);
                 setCurrencyObject(null); 
                 fetchCurrencies(page * limit, limit); }
                }
            fetchCurrencies={fetchCurrencies}
            navigateToList={() => { setShowForm(false);
                 setCurrencyObject(null); 
                 fetchCurrencies(page * limit, limit); }
                }
            handleDelete={handleDelete}
            handleNew={handleNew} 
            onSaved={handleUomSaved}  
            
        />
        )} 
        </div>    
    );                

}
export default Currency;