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
    const [collapsed,setCollapsed]= useState("");
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
}, [page, limit,total]);
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
    <div className="container-fluid px-0 py-0"> 
         {!showForm ? (
                <>
    <div className="d-flex justify-content-between align-items-center mt-0 mb-0">
            <div className="row mb-3 align-items-center">
                <div className="col-md-5">
                <h2>Receipts</h2>
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
                New Receipts
                </button>
            </div>
            </div>
<div style={{ maxHeight: "500px", overflowY: "auto" }}>    
    <table className="table table-bordered table-hover"  style={{ width: "100%", tableLayout: "fixed", minWidth: "1600px" }}>
        <thead>
            <tr> 
                <th style={{width:"50px"}}></th>
                <th style={{width:"150px"}}>Receipt No</th>
                <th style={{width:"150px"}}>Receipt Date</th>
                <th style={{width:"350px"}}>Customer Name</th>
                <th style={{width:"150px"}}>Currency</th>
                <th style={{width:"150px"}}>Exchange Rate</th>
                <th style={{width:"150px"}}>Paymentmode</th>
                <th style={{width:"175px"}}>Total Receipt Amt.</th>  
                <th style={{width:"150px"}} >Createdby</th>
                <th style={{width:"200px"}}>createdon</th>
                <th style={{width:"200px"}}>modifiedby</th>
                <th style={{width:"200px"}}>modifiedon</th>
                <th style={{width:"50px"}}> </th>
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
                <td>  <button
                    className="btn btn-sm btn-primary me-2" 
                    onClick={() => {
                        setReceiptsObject(receipt);
                    }}
                >  <i className="bi bi-pencil"></i>      
                </button></td> 
                <td>{receipt.receiptno}</td>
                <td>{receipt.receiptdate}</td>  
                <td>{receipt.customername}</td>
                <td>{receipt.currencycode}</td>
                <td>{Number(receipt.exrate).toFixed(4)}</td>
                <td>{receipt.paymentmode}</td>       
                <td>{Number(receipt.totalreceiptamount).toFixed(2)}</td>
                <td style={{textAlign:"center"}}>{receipt.createdby}</td>
                <td>{receipt.createdon}</td>
                <td>{receipt.modifiedby}</td>
                <td>{receipt.modifiedon}</td>
                <td> 
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
    Total Receipts: {total}
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

            