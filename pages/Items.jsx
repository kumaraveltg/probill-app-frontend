import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config"; 
import ItemsForm from "./ItemsForm.jsx"; 

function Items() {
    const {items,fetchItems,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [itemsObject,setItemsObject]=useState();
    const [limit,setLimit] = useState(100);
    const [collapsed,setCollapsed]= useState(null);

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
    fetchItems(page * limit, limit,total);
}, [page,limit,total ]);

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
        <div className="container-fluid px-0 py-0"> 
         {!showForm ? (
                <>
              <div className="d-flex justify-content-between align-items-center mt-0 mb-0">
                      <div className="row mb-3 align-items-center">
                          <div className="col-md-5">
                          <h2>Item</h2>
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
                              placeholder="Search Item..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                            />
                          </div>
                        </div>
              
                        {/* Button */}
                        <div className="col-md-2 text-end">
                          <button className="btn btn-primary" onClick={handleNew}>
                            <FaPlus className="me-2" />
                            New Item
                          </button>
                        </div>
                      </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover"  style={{ width: "100%", tableLayout: "fixed", minWidth: "1600px" }}>
<thead className="table-light">
<tr>
 <th style={{width:"50px"}}></th>
<th hidden>Company Name</th>
<th style={{width:"200px"}}>Item Code</th>
<th style={{width:"400px"}}>Item Name</th>  
<th style={{width:"400px"}}>Item Sepcification</th> 
<th style={{width:"150px"}}>Selling UOM</th>
<th style={{width:"150px"}}>HSN/SAC Code</th>
<th style={{width:"100px"}}>Tax </th>
<th style={{width:"100px"}}>Tax Rate %</th>
<th style={{width:"150px"}}>Selling Rate</th>
<th style={{width:"60px"}}>Active</th>
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
        <td> <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setItemsObject(i)}
            >
                <i className="bi bi-pencil"></i> 
            </button></td>  
        <td hidden>{i.companyname}</td>
        <td>{i.productcode}</td>
        <td>{i.productname}</td>
        <td>{i.productspec}</td>
        <td>{i.suom}</td>
        <td>{i.hsncode}</td>
        <td>{i.taxname}</td>
        <td>{Number(i.taxrate).toFixed(2)}</td>
        <td>{Number(i.selling_price).toFixed(2)}</td>
        <td>{i.active ? "Yes" : "No"}</td>
        <td>{i.createdby}</td>
        <td>{i.createdon}</td> 
        <td>{i.modifiedby}</td>
        <td>{i.modifiedon}</td>
        <td>
           
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
      <option value={100}>100</option>
      <option value={200}>200</option>
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