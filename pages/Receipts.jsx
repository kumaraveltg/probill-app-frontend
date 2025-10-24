import { useState, useContext, useEffect } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import DataContext from "../context/DataContext";
import { API_URL } from "../components/Config";
import ReceiptsForm from "./ReceiptsForm";

function Receipts() {
    const { receipts = [], fetchReceipts, Loading, total, error } = useContext(DataContext);
    const [showForm,setShowForm]=useState(false);
    const [search,setSearch]= useState('');
    const [page,setPage]= useState(0);
    const [receiptsObject, setReceiptsObject] = useState(null);
    const [limit,setLimit] = useState(100);
    const filteredReceipts = receipts.filter((c) => {
        const hay = [
            c.id,
            c.companyname,
            c.receiptno,
            c.receiptdate,
            c.customername,
            c.currencycode,
            c.exrate,
            c.paymentmode,
            c.totalreceiptamount,
            c.createdby,
            c.modifiedby,
            c.createdon,
            c.modifiedon,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return hay.includes(search.toLowerCase());
    });

useEffect(() => {
    fetchReceipts(page * limit, limit);
    console.log("fetch Data",receipts);
}, [page, limit]);
//New Receipts
const handleNew = () => {
    setShowForm(true);
    setReceiptsObject(null);
};
const handleSaved = () => {
  fetchReceipts(); // refresh list
};
useEffect(()=>{ 
 receiptsObject && setShowForm(true);
},[receiptsObject])

const handleDelete = async(id) => { 
    if (!window.confirm("Are you Sure Want to Delete this Receiptnumber?"))
        return;
    try {
        const response = await fetch(`${API_URL}/deletereceipt/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        }); 
        if (response.ok) {
            fetchReceipts(); // Refresh list after deletion
        }   
    } catch (error) {
        console.error("Error deleting receipt:", error);
    }   
};
  return (
    <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center my-3">
          <h2>Receipts </h2>           
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
                New Receipts
                </button>
            </div>
            </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>   
          
    <table className="table table-striped"> 
        <thead>
            <tr>
                <th>Company Name</th>
                <th>Receipt No</th>
                <th>Receipt Date</th>
                <th>Customer Name</th>
                <th>Currency</th>
                <th>Exchange Rate</th>
                <th>Paymentmode</th>
                <th>Total Receipt Amt.</th>  
                <th>createdby</th>
                <th>createdon</th>
                <th>modifiedby</th>
                <th>modifiedon</th>
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
        ) : filteredReceipts.length === 0 ? (
        <tr>    
            <td colSpan="9" className="text-center">No Receipts found.</td>
        </tr>
        ) : (
        filteredReceipts.map((receipt) => (
            <tr key={receipt.id}>
                <td>{receipt.companyname}</td>
                <td>{receipt.receiptno}</td>
                <td>{receipt.receiptdate}</td>  
                <td>{receipt.customername}</td>
                <td>{receipt.currencycode}</td>
                <td>{receipt.exrate}</td>
                <td>{receipt.paymentmode}</td>       
                <td>{receipt.totalreceiptamount}</td>
                <td>{receipt.createdby}</td>
                <td>{receipt.createdon}</td>
                <td>{receipt.modifiedby}</td>
                <td>{receipt.modifiedon}</td>
                <td>
                <button
                    className="btn btn-sm btn-primary me-2" 
                    onClick={() => {
                        setReceiptsObject(receipt);
                    }}
                >  <i className="bi bi-pencil"></i>      
                </button>
                <button
                    className="btn btn-sm btn-danger"   
                    onClick={() => handleDelete(receipt.id)}
                > <i className="bi bi-trash3"></i>
                </button>
            </td>
        </tr>
    ))) }
    </tbody>
    </table>
</div>
    <div className="d-flex justify-content-between align-items-center my-3"
        >    
            <div>Total Receipts: {total}</div>
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
            <ReceiptsForm   
                receiptsObject={receiptsObject}
                onClose={() => setShowForm(false)} 
                onSaved={handleSaved}   
                handleDelete={handleDelete}
                handleNew={handleNew} 
                fetchReceipts={fetchReceipts}
                navigateToList={() => { setShowForm(false);
                setReceiptsObject(null); 
                fetchReceipts(page * limit, limit); }
                }
            />
        )} 
    </div>
);
}   
export default Receipts;

            