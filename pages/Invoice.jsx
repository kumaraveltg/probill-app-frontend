import { useState,useContext,useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";  
import InvoiceForm from "./InvoiceForm"; 

function Invoice() {
    const {invoice,fetchInvoices,Loading,total,error} = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [invoiceObject,setInvoiceObject]=useState();
    const [limit,setLimit] = useState(100);

 const filteredInvoice = invoice.filter(c =>
  [
    c.id,
    c.companyname,
    c.invoiceno,
    c.invoicedate,
    c.referenceno,
    c.referencedate,
    c.customername,
    c.currencycode,
    c.exrate,
    c.grossamount,
    c.taxamt,
    c.totnetamount,
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
    fetchInvoices(page * limit, limit);
    console.log("fetch Data",invoice);
}, [page,limit ]);

//New UOM 
const handleNew = () => {
    setShowForm(true);
    setInvoiceObject(null);
};

const handleSaved = () => {
  fetchInvoices(); // refresh list
};


useEffect(()=>{ 
invoiceObject && setShowForm(true); 
},[invoiceObject])

const handleDelete = async(id) => {
 if (!window.confirm("Are you Sure Want to Delete this Invoiceno?"))
     return;
    try{
    const res = await fetch(`${API_URL}/invoicedelete/${id}`, 
      { method: "DELETE" });
    if (res.ok) {
        fetchInvoices(page * limit, limit);
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
          <h2>Invoice </h2>
           
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
                    placeholder="Search Invoices..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                </div>
            </div>

            {/* Button */}
            <div className="col-md-4 text-end">
                <button className="btn btn-primary" onClick={handleNew}>
                <FaPlus className="me-2" />
                New Invoice
                </button>
            </div>
            </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
<table className="table table-bordered table-hover">        
<thead className="table-light">
<tr>
<th>Company Name</th>
<th>Invoice No</th>
<th>Invoice Date</th>
<th>Reference No</th>
<th>Reference Date</th>
<th>Customer Name</th>
<th>Currency</th>
<th>ExChage Rate</th>  
<th>Gross Amount</th> 
<th>Tax Amount</th>
<th>Net Amount</th> 
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
) : filteredInvoice.length === 0 ? (
<tr>    
    <td colSpan="9" className="text-center">No Invoices found.</td>
</tr>
) : (    
filteredInvoice.map((i) => ( 
    <tr key={i.id}> 
        <td>{i.companyname}</td>  
        <td>{i.invoiceno}</td>
        <td>{i.invoicedate}</td>
        <td>{i.referenceno}</td>
        <td>{i.referencedate}</td>
        <td>{i.customername}</td>
        <td>{i.currencycode}</td>
        <td>{i.exrate}</td>
        <td>{i.grossamount}</td>
        <td>{i.taxamt}</td>
        <td>{i.totnetamount}</td> 
        <td>{i.createdby}</td>
        <td>{i.createdon}</td> 
        <td>{i.modifiedby}</td>
        <td>{i.modifiedon}</td>
        <td>
            <button 
                className="btn btn-sm btn-primary me-2" 
                onClick={() => setInvoiceObject(i)}
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
            <div>Total Invoices: {total}</div>
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
        <InvoiceForm
            invoiceObject={invoiceObject}
            setInvoiceObject={setInvoiceObject}
            onClose={() => { setShowForm(false);
                 setInvoiceObject(null); 
                 fetchInvoices(page * limit, limit); }
                }
            fetchInvoices={fetchInvoices}
            navigateToList={() => { setShowForm(false);
                 setInvoiceObject(null); 
                 fetchInvoices(page * limit, limit); }
                }
            handleDelete={handleDelete}
            handleNew={handleNew} 
            onSaved={handleSaved}
            
        />
        )} 
        </div>    
    );                

}
export default Invoice;