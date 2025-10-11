import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";  
import CustomerForm from "./CustomerForm";
import { useNavigate } from "react-router-dom";

function Customer() {
    const {customer,fetchCustomer,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [customerObject,setCustomerObject]=useState();
    const [limit,setLimit] = useState(50);

 const filteredCustomer = customer.filter(c =>
  [
    c.id,
    c.customername,
    c.contactperson,
    c.currencyname,
    c.address1,
    c.address2,
    c.cityname,
    c.statename,
    c.countryname,
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
    fetchCustomer(page * limit, limit);
}, [page,limit ]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setCustomerObject(null);
};

const handleSaved = () => {
  fetchCustomer(); // refresh list
};


useEffect(()=>{ 
customerObject && setShowForm(true); 
},[customerObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this Customer?"))
     return;
    try{
    const res = await fetch(`${API_URL}/custdelete/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchCustomer(page * limit, limit);
    }   
    else {
        console.error("Failed to delete Customer");
    }
 }  catch(err){
    console.error("Error deleting Customer:", err);
 }
};
    return (    
        <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2>Customer </h2>
           
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
                    placeholder="Search Customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                </div>
            </div>

            {/* Button */}
            <div className="col-md-4 text-end">
                <button className="btn btn-primary" onClick={handleNew}>
                <FaPlus className="me-2" />
                New Customer
                </button>
            </div>
            </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover">        
<thead className="table-light">
<tr>
<th>Company Name</th>
<th>Customer Name</th>
<th>Contact Person</th>
<th>Address1</th>  
<th>Address2</th> 
<th>City Name</th>
<th>State Name</th>
<th>Country</th>
<th>Currency</th> 
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
) : filteredCustomer.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No Customer found.</td>
</tr>
) : (    
filteredCustomer.map((i) => ( 
    <tr key={i.id}>   
        <td>{i.customername}</td>
        <td>{i.contactperson}</td>
        <td>{i.address1}</td>
        <td>{i.address2}</td>
        <td>{i.cityname}</td>
        <td>{i.statename}</td>
        <td>{i.countryname}</td>
        <td>{i.currencyname}</td> 
        <td>{i.active ? "Yes" : "No"}</td>
        <td>{i.createdby}</td>
        <td>{i.createdon}</td> 
        <td>{i.modifiedby}</td>
        <td>{i.modifiedon}</td>
        <td>
            <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setCustomerObject(i)}
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
            <div>Total Customers: {total}</div>
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
        <option value={50}>100</option>
        <option value={250}>500</option>
        <option value={1000}>1000</option>
        <option value={10000}>10000</option>
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
        <CustomerForm
            customerObject={customerObject}
            setCustomerObject={setCustomerObject}
            onClose={() => { setShowForm(false);
                 setCustomerObject(null); 
                 fetchCustomer(page * limit, limit); }
                }
            fetchCustomer={fetchCustomer}
            navigateToList={() => { setShowForm(false);
                 setCustomerObject(null); 
                 fetchCustomer(page * limit, limit); }
                }
            handleDelete={handleDelete}
            handleNew={handleNew} 
            onSaved={handleSaved}
            
        />
        )} 
        </div>    
    );                

}
export default Customer;