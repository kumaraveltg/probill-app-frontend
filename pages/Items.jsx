import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config"; 
import ItemsForm from "./ItemsForm.jsx";
import { useNavigate } from "react-router-dom";

function Items() {
    const {items,fetchItems,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [itemsObject,setItemsObject]=useState();
    const [limit,setLimit] = useState(100);

 const filteredItems = items.filter(c =>
  [
    c.id,
    c.productcode,
    c.productname,
    c.productspec,
    c.suom,
    c.hsncode,
    c.taxname,
    c.taxrate,
    c.selling_price,
    c.active ? "Yes" : "No",
    c.companyid,
    c.companyname, 
    c.companyno, 
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
    fetchItems(page * limit, limit);
}, [page,limit ]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setItemsObject(null);
};

const handleSaved = () => {
  fetchItems(); // refresh list
};


useEffect(()=>{ 
itemsObject && setShowForm(true); 
},[itemsObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this Items?"))
     return;
    try{
    const res = await fetch(`${API_URL}/productdelete/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchItems(page * limit, limit);
    }   
    else {
        console.error("Failed to delete Items");
    }
 }  catch(err){
    console.error("Error deleting Items:", err);
 }
};
    return (    
        <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2>Items </h2>
           
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
                    placeholder="Search Item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                </div>
            </div>

            {/* Button */}
            <div className="col-md-4 text-end">
                <button className="btn btn-primary" onClick={handleNew}>
                <FaPlus className="me-2" />
                New Items
                </button>
            </div>
            </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover">        
<thead className="table-light">
<tr>
<th>Company Name</th>
<th>Item Code</th>
<th>Item Name</th>  
<th>Item Sepcification</th> 
<th>Selling UOM</th>
<th>HSN/SAC Code</th>
<th>Tax </th>
<th>Tax Rate %</th>
<th>Selling Rate</th>
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
) : filteredItems.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No Items found.</td>
</tr>
) : (    
filteredItems.map((i) => ( 
    <tr key={i.id}>   
        <td>{i.companyname}</td>
        <td>{i.productcode}</td>
        <td>{i.productname}</td>
        <td>{i.productspec}</td>
        <td>{i.suom}</td>
        <td>{i.hsncode}</td>
        <td>{i.taxname}</td>
        <td>{i.taxrate}</td>
        <td>{i.selling_price}</td>  
        <td>{i.active ? "Yes" : "No"}</td>
        <td>{i.createdby}</td>
        <td>{i.createdon}</td> 
        <td>{i.modifiedby}</td>
        <td>{i.modifiedon}</td>
        <td>
            <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setItemsObject(i)}
            >
                <i className="bi bi-pencil"></i> 
            </button>
            <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(i.id)}
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
    <div>Total Items: {total}</div>
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
        <option value={100}>100</option>
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
        <ItemsForm
            itemsObject={itemsObject}
            setItemsObject={setItemsObject}
            onClose={() => { setShowForm(false);
                 setItemsObject(null); 
                 fetchItems(page * limit, limit); }
                }
            fetchItemss={fetchItems}
            navigateToList={() => { setShowForm(false);
                 setItemsObject(null); 
                 fetchItems(page * limit, limit); }
                }
            handleDelete={handleDelete}
            handleNew={handleNew} 
            onSaved={handleSaved}
            
        />
        )} 
        </div>    
    );                

}
export default Items;