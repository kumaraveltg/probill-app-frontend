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
    const [collapsed,setCollapsed]= useState("")

 const filteredCustomer = customer.filter(c =>
  [
    c.id,
    c.companyname,
    c.customername,
    c.contactperson,
    c.currencycode,
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
}, [page,limit,total ]);

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
       <div className="container-fluid px-0 py-0"> 
{!showForm ? (
<>
<div className="d-flex justify-content-between align-items-center mt-0 mb-0">
        <div className="row mb-3 align-items-center">
            <div className="col-md-5">
            <h2>Customer</h2>
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
                placeholder="Search Finacial Year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
        </div>

        {/* Button */}
        <div className="col-md-2 text-end">
            <button className="btn btn-primary" onClick={handleNew}>
            <FaPlus className="me-2" />
            New Customer
            </button>
        </div>
        </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover"  style={{ width: "100%", tableLayout: "fixed", minWidth: "1600px" }}>
<thead className="table-light">
<tr>  
<th style={{width:"50px"}}></th>
<th style={{width:"400px"}}>Customer Name</th>
<th  style={{width:"300px"}}>Contact Person</th>
<th  style={{width:"300px"}}>Address1</th>  
<th  style={{width:"300px"}}>Address2</th> 
<th  style={{width:"300px"}}>City Name</th>
<th  style={{width:"300px"}}>State Name</th>
<th  style={{width:"300px"}}>Country</th>
<th  style={{width:"100px"}}>Currency</th> 
<th  style={{width:"100px"}}>Active</th>
<th  style={{width:"200px"}}>Created By</th>
<th  style={{width:"200px"}}>Created On</th> 
<th  style={{width:"200px"}}>Modified By</th>
<th  style={{width:"200px"}}>Modified On</th>
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
) : filteredCustomer.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No Customer found.</td>
</tr>
) : (    
filteredCustomer.map((i) => ( 
    <tr key={i.id}> 
        <td> <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setCustomerObject(i)}
            >
                <i className="bi bi-pencil"></i> 
            </button></td> 
        <td>{i.customername}</td>
        <td>{i.contactperson}</td>
        <td>{i.address1}</td>
        <td >{i.address2}</td>
        <td  >{i.cityname}</td>
        <td  >{i.statename}</td>
        <td  >{i.countryname}</td>
        <td  >{i.currencycode}</td> 
        <td  >{i.active ? "Yes" : "No"}</td>
        <td  >{i.createdby}</td>
        <td  >{i.createdon}</td> 
        <td  >{i.modifiedby}</td>
        <td >{i.modifiedon}</td>
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
    Total Customers: {total}
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