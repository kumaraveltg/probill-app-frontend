import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import Select from "react-select";
import { NumericFormat } from 'react-number-format';
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";
import DataContext, { useData } from "../context/DataContext";

// Receipts form with tabbed layout
 function ReceiptsForm({
  receipt,
  onClose,
  onSaved,
  handleDelete,
  handleNew,
  fetchReceipts,
  navigateToList,
  receiptno, 
}) {
 
 
  
  const { companies,fetchCompany,customer, fetchCustomer,invoices,fetchInvoices,currencies,fetchCurrencies} = useData();
  const { invoice, companyname, companyno, companyid } = useContext(DataContext);
  const { acessToken, authFetch, username: ctxUsername, companyid: defaultcompanyid, companyno: defaultCompanyno } = useContext(AuthContext);
  const [receiptsObject, setReceiptsObject] = useState(null);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("gridData");
  const [gridData, setGridData] = useState([{ 
    key: 1,
    invoiceno: null,  // This stores invoice_headerid
    invoicedate: "",
    invoiceamount: 0.00,
    gcurrency: null,
    gexrate: 1,
    greceiptamount: 0,
    commissionamount: 0.00,  // Consistent naming
    tdsamount: 0.00,         // Consistent naming
    netreceiptamount: 0.00,
    selected: false,
    rowno: 1
  }]);
  const [totals, setTotals] = useState({ totalAmount: 0, balanceAmount: 0 });

  const [formData, setFormData] = useState({
    id: null,
    companyid: defaultcompanyid || null,
    companyno: companyno || "",
    receiptno: "",
    receiptdate: "",
    receipttype: "",
    customerid: null,
    customername: "",
    currencycode: "",
    currencyid: null,
    exrate: 1.0,
    receiptamount: 0.0,
    paymentmode: "",
    transactionno: "",
    transactiondate:"",
    chequeno: "",
    cheqedate: "",     
    totalreceiptamount: 0.0,
    remarks: "",
    createdby: "",
    modifiedby: "",
  });
 
  const [selectAll, setSelectAll] = useState(false);
  const [pdfHeader,setPdfHeader]= useState(null);
  const [pdfDetails,setPdfDetails]= useState([])
  const [pdfFooter,setPdfFooter]= useState([])
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false); 
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [isLinkedInReceipt, setIsLinkedInReceipt] = useState(false);
  const customerOptions = useMemo(() => (customer || []).map(c => ({ value: c.id, label: c.customername, currencycode: c.currencycode, currencyid: c.currencyid })), [customer]);
  const invoiceOptions = useMemo(() => (invoice || []).map(i => ({ value: i.id, label: i.invoiceno, invoicedate: i.invoicedate, totnetamount: i.totnetamount,customerid: i.customerid,receiptamount:i.receiptamount })), [invoice]);    
  const currencyOptions = useMemo(() => (currencies || []).map(c => ({ value: c.id, label: c.currencycode })), [currencies]);
  
  const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const uname = ctxUsername || fallbackParams.username || "admin";
  const cid = defaultcompanyid || fallbackParams.companyid || companyid;
  const cno = defaultCompanyno || fallbackParams.companyno || companyno;

  // Convert date to YYYY-MM-DD
    const convertDate = (dateStr) => {
      if (!dateStr) return "";
      if (dateStr.includes("-")) return dateStr;
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    };
 

 useEffect(() => {
  if (  Array.isArray(companies) && companies.length > 0) {
    const defaultCompany = companies.find(c => c.companyid === defaultcompanyid);
    if (defaultCompany) {
      setFormData(prev => ({
        ...prev,
        companyname: defaultCompany.companyname,
        companyno: defaultCompany.companyno,
        companyid: defaultCompany.companyid
      }));
     
      console.log("Default company set:", defaultCompany.companyname);
    }
  }
}, [companies, defaultcompanyid ]);


  useEffect(() => {
    if(!companies.length){
    fetchCustomer?.();
    fetchCurrencies?.();
    fetchInvoices?.(); 
    fetchCompany?.();
    }
  }, [companies]);

  useEffect(() => {
     if (!formData.customerid) {
    setFilteredInvoices([]);
    return;
  }
    const filteredInvoices = invoiceOptions?.filter(it => {
    const pending = (Number(it.totnetamount) || 0) - (Number(it.receiptamount) || 0);
    const isLinkedInReceipt = gridData.some(d => Number(d.invoiceno) === Number(it.value)); // is it recordid concepts
    return Number(it.customerid) === Number(formData.customerid) && (pending > 0 || isLinkedInReceipt);
  }) || [];
  setFilteredInvoices(filteredInvoices);
  console.log("Invoice Options:", invoiceOptions);
  console.log("CustomerID:", formData.customerid);
  console.log("Grid Data:", gridData);
  console.log("Filtered Invoices:",  filteredInvoices);
}, [formData.customerid, invoiceOptions, gridData]);

const fetchReceiptDetails = useCallback(async (receiptheaderid) => {
    try {
      const url = `${API_URL}/receiptdetails/${receiptheaderid}`;
      const res = await authFetch(url, { headers: { Authorization: `Bearer ${acessToken}` } });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const recdtl = data.recdtl || [];
      const rechdr = data.rechdr || {};
      console.log("Receipt Details",data.recdtl); 

      const newRecDetails = recdtl.length > 0
        ? recdtl.map((p, idx) => { 
            const matchedInvoice = filteredInvoices?.find(it => Number(it.value) === Number(p.invoice_headerid));
            return {
              ...p,
              key: idx + 1,
              rowno: idx + 1,
              receiptheaderid: p.receiptheaderid || rechdr?.id,
              invoiceno: p.invoiceno || matchedInvoice?.value || null, // always ID
              invoicedate: p.invoicedate ? convertDate(p.invoicedate): convertDate(matchedInvoice?.invoicedate) || "",
              invoiceamount: p.invoiceamount ?? matchedInvoice?.invoiceamount ?? matchedInvoice?.totnetamount ?? 0,
              gcurrency:   p.gcurrency ||  null,
              gexrate: p.exrate || 1,
              greceiptamount: p.greceiptamount || 0,
              commissionamount: p.commissionamount || 0,
              tdsamount: p.tdsamount || 0,
              netreceiptamount: p.netreceiptamount || 0,
              selected: false,
            };
        }) 
  : [
      {
        key: 1, 
        invoiceno: null,
        invoicedate: "",
        invoiceamount: 0.00,  
        gcurrency:null,
        gexrate: 0,
        greceiptamount: 0.00,
        commissionamount:0,
        tdsamount: 0,
        totalreceiptamount: 0.00, 
        selected: false,
        rowno: 1,
        receiptheaderid: receiptheaderid
      }
    ];

      setGridData(newRecDetails);
      // reset selectAll
      setSelectAll(false);
      console.log("Filtered Invoices:", filteredInvoices);
      console.log("Backend records:", recdtl);
    } catch (err) {
      console.error("❌ Error in fetchgridData:", err);
      setGridData([{
        key: 1,
        invoice_headerid: null, 
        invoiceno: "",
        invoicedate: "",
        invoiceamount: 0.00,  
        gcurrency:null,
        gexrate: 0,
        greceiptamount: 0.00,
        commissionamount:0,
        tdsamount: 0,
        totalreceiptamount: 0.00, 
        selected: false,
        rowno: 1,
        receiptheaderid: null
      }]);
    }
  }, [acessToken, authFetch,invoiceOptions, API_URL]);


 // Reset form for new entry
  const resetForm = () => {
    const defaultCompany = companies.find(c => c.companyid === defaultcompanyid) || { companyname: "", companyno: "" };
    console.log("defafult companyname",defaultCompany);
    setFormData({
        id: null, 
        companyid: cid,
        companyname:defaultCompany.companyname || "",
        companyno: defaultCompany.companyno || "",
        receiptno: "",
        receiptdate: "",
        receipttype: "",
        customerid: null,
        customername: "",
        currencycode: "",
        currencyid: null,
        exrate: 1.0,
        receiptamount: 0.0, 
        paymentmode: "",
        transactionno: "",
        transactiondate:"",
        chequeno: "",
        cheqedate: "",    
        totalreceiptamount: 0.0,
        remarks: "",
        createdby: uname || "",
        modifiedby: uname || ""
    });

    setGridData([{ 
      key: 1, 
      invoiceno: "", 
      invoicedate: "",  
      invoiceamount: 0.00,
      gcurrency: "",
      gexrate: 0,
      greceiptamount: 0,
      commissionamount: 0.00, 
      tdsamount: 0.00,
      netreceiptamount: 0.00, 
      selected: false, 
      rowno: 1 
    }]);

    setTotals({ totalAmount: 0, balanceAmount: 0 });

    setIsEdit(false);
    setMessage("");
  }; 

  // Load provided receipt for edit
 useEffect(() => {
  const loadEditData = async () => {
    if (!receiptsObject?.id) {
      resetForm();
      return;
    }

    setIsEdit(true); 
    // Set form data
    setFormData(prev => ({
      ...prev,
      ...receiptsObject,
      receiptdate: convertDate(receiptsObject.receiptdate),
      transactiondate: convertDate(receiptsObject.transactiondate),
      cheqedate: convertDate(receiptsObject.cheqedate),
    }));

    // Fetch grid details
    if (receiptsObject?.id) {
      console.log("Fetching receipt details for edit ID:", gridData);
      fetchReceiptDetails(receiptsObject.id); 
    }
  };

  loadEditData();
}, [receiptsObject, fetchReceiptDetails]);


 
  // When receiptamount/tds/commission change, recalc netamount
  useEffect(() => {
    const ra = parseFloat(formData.greceiptamount || 0);
    const tds = parseFloat(formData.tdsamount || 0);
    const comm = parseFloat(formData.commissionamount || 0);
    const net = ra + tds + comm;
    setFormData(prev => ({ ...prev, netamount: parseFloat(net.toFixed(2)) }));
  }, [formData.greceiptamount, formData.tdsamount, formData.commissionamount]);

  const handleChange = (e) => {
    const { name, type, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value || 0) : value }));
  };

  // const handleSelectCustomer = (opt) => {
  //   setFormData(prev => ({ ...prev, customerid: opt?.value || null, customername: opt?.label || "", currencycode: opt?.currencycode || "", currencyid: opt?.currencyid || null }));
  // };

   

  const handleGridChange = (index, field, value, extraFields = {}) => {
  setGridData(prev => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [field]: value, ...extraFields };

    // Recalculate net amount for the row
    updated[index].netreceiptamount = (
      parseFloat(updated[index].greceiptamount || 0) +
      parseFloat(updated[index].tdsamount || 0) +
      parseFloat(updated[index].commissionamount || 0)
    ).toFixed(2);

    updateTotals(updated);
    return updated;
  });
};


  const handleAddReceipts = (receipts = {}) => { // default empty object
  setGridData(prev => {
    const nextRowNo = prev.length > 0 ? Math.max(...prev.map(r => r.rowno || 0)) + 1 : 1;
    return [...prev, {
      key: prev.length + 1,
      rowno: nextRowNo,
      invoiceno: receipts.id || null,
      invoicedate: receipts.invoicedate || "",
      invoiceamount: receipts.totnetamount || 0,
      gcurrency: receipts.currencyid || null,
      gexrate: 1,
      greceiptamount: 0,
      tdsamount: 0,
      commissionamount: 0,
      netreceiptamount: 0
    }];
  });
};


  const updateTotals = (grid) => {
  if (!Array.isArray(grid)) return;

  let totalAmount = 0;
  let balanceAmount = 0;

  grid.forEach((row) => {
    const receipt = parseFloat(row?.greceiptamount || 0);
    const invoiceAmt = parseFloat(row?.invoiceamount || 0);

    totalAmount += isNaN(receipt) ? 0 : receipt;
    balanceAmount += isNaN(invoiceAmt) || isNaN(receipt) ? 0 : invoiceAmt - receipt;
  });

  setTotals({
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    balanceAmount: parseFloat(balanceAmount.toFixed(2)),
  });

  // Validation: total receipt must match sum of grid greceiptamount
  if (grid.length > 0) {
    const totalDetails = grid.reduce((sum, r) => {
      const amt = parseFloat(r?.greceiptamount || 0);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
    const receiptAmt = parseFloat(formData?.receiptamount || 0);
    console.log("Validating totals:", receiptAmt, totalDetails);
    if (Math.abs(totalAmount - receiptAmt) > 0.01) {
      setError("Receipt total must match sum of details.");
    } else {
      setError(null);
    }
  } else {
    setError(null); // No rows → clear error
  }
};

// select toggle select for delete grid row
  const toggleSelect = (idx) => {
    setGridData(prev => {
      const updated = prev.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c));
      setSelectAll(updated.every(c => c.selected));
      return updated;
    });
   };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setGridData(prev => prev.map(p => ({ ...p, selected: checked })));
   };

  const handleDeleteRecDetails = () => {
    const remaining = gridData.filter(p => !p.selected);
    if (remaining.length === 0) {
      alert("At least 1 contact must remain!");
      return;
    }
    setGridData(remaining);
    setSelectAll(false);
  };


  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage("");

    // Basic validation
    if (!formData.customerid) {
      setMessage("Please select a customer");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        companyid: formData.companyid,
        companyno:  cno || "",
        receiptno: formData.receiptno,
        receiptdate: convertDate(formData.receiptdate), 
        receipttype: formData.receipttype, 
        customerid: formData.customerid,
        currencyid: formData.currencyid,
        currencycode: formData.currencycode,
        exrate: formData.exrate,
        receiptamount: formData.receiptamount, 
        paymentmode: formData.paymentmode,
        transactionno: formData.transactionno,
        transactiondate: convertDate(formData.transactiondate)||null,
        chequeno: formData.chequeno,
        cheqedate: convertDate(formData.cheqedate)||null,        
        remarks: formData.remarks,
        totalreceiptamount: totals.totalAmount,
        createdby: formData.createdby,
        modifiedby: formData.modifiedby,

        receipt_details: gridData.map(row => ({  
          invoiceno: row.invoiceno,
          invoicedate: convertDate(row.invoicedate),
          invoiceamount: row.invoiceamount,
          gcurrency: row.gcurrency,
          exrate: row.gexrate,
          greceiptamount: row.greceiptamount,
          tdsamount: row.tdsamount,
          commissionamount: row.commissionamount,
          netreceiptamount: row.netreceiptamount
        }))
      };
       console.log("Final Payload to send:", payload);

      const endpoint = formData.id ? `${API_URL}/updatereceipts/${formData.id}` : `${API_URL}/addreceipts`;
      const res = await authFetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
       if (!res.ok) {
      const text = await res.text().catch(() => null);
      let errData;
      try { errData = JSON.parse(text); } catch { errData = null; }
      throw errData?.detail || new Error(`HTTP error ${res.status}`);
    }
      const savedReceiptid = await res.json(); 
      console.log("Save receipt response", savedReceiptid);
      if (savedReceiptid?.id) {
        setFormData(prev => ({ ...prev, id: savedReceiptid.id }));
        await fetchReceiptDetails(savedReceiptid.id);
      }
      setMessage('Saved');
      if (typeof onSaved === 'function') onSaved();
      onClose?.();
      // refresh list
      fetchReceipts?.();
    } catch (err) {
      console.error('Save receipt error', err);
      setMessage(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (formData.id) {
      handleDelete?.(formData.id);
      resetForm();
    } else {
      alert("No receipt selected to delete");
    }
  };

  return (
    <div className="card w-100">
      {message && <div className="alert alert-danger mt-2">{message}</div>}
      <div className="d-flex justify-content-between align-items-center w-100" style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{formData.id ? 'Edit Receipt' : 'New Receipt'}</h4>
        <div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-secondary" onClick={resetForm}><i className="bi bi-plus-lg"></i></button>
          <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}><i className="bi bi-dash-lg"></i></button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)} ><i className="bi bi-search"></i></button>
          <button type="button" className="btn btn-secondary" onClick={() => navigateToList?.()}><i className="bi bi-list"></i></button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-3">
         <header className="card p-3 border border-secondary w-100 mt-2" style={{ backgroundColor: "#ebe6e6ff" }}>
           {/*<div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-control" name="companyname" readOnly value={formData.companyname || "Loading..."} onChange={handleChange} style={{ width: "200px" }} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Company No</label>
              <input type="text" className="form-control" name="companyno" readOnly value={formData.companyno || "Loading..."} onChange={handleChange} style={{ width: "100px" }} />
            </div>  
          </div>  */}
          <div className="row mb-3">
             <div className="col-md-3">
              <label className="form-label">Receipt Date</label>
              <input type="date" className="form-control" name="receiptdate" value={convertDate(formData.receiptdate)}  onChange={handleChange} style={{ width: "150px" }} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Receipt No</label>
              <input type="text" className="form-control" name="receiptno" value={formData.receiptno||"Auto Generated"} readOnly onChange={handleChange} style={{ width: "250px" }}  disabled/>
            </div>
            <div className="col-md-3">
              <label className="form-label">Receipt Type</label>
              <select
                className="form-select"
                name="receipttype"
                value={formData.receipttype}
                onChange={handleChange}
                style={{ width: "200px" }}  
              > 
                <option value="">-- Select Receipt Type --</option>
                <option value="Against Receipt">Against Receipt</option>
                <option value="Advance Receipt">Advance Receipt</option> 
              </select>
            </div>
            <div className="col-md-3">
            <label className="form-label">Customer Name</label>
            <Select
                options={customerOptions}
                value={customerOptions.find((opt) => opt.value === formData?.customerid) || null}
                onChange={(selected) =>
                setFormData((prev) => ({
                    ...prev,
                    customerid: selected?.value || null,
                    customername: selected?.label || "",
                    currencycode: selected?.currencycode || "",
                    currencyid: selected?.currencyid || null, 
                }))
                }
                placeholder="-- Select Customer --"
                isClearable
                isSearchable
                styles={{ container: (base) => ({ ...base, width: "250px" }) }}
            /> 
            </div> 
          </div>
            <div className="row mb-3">
            <div className="col-md-3" >
              <label className="form-label">Receipt Amount</label>               
              <NumericFormat  value={ formData.receiptamount||"" }
                displayType="input"
                thousandSeparator={true}
                decimalScale={2}
                fixedDecimalScale={true}
                onValueChange={(values) => { const {floatValue} = values;
                 setFormData((prev) => ({ ...prev, receiptamount: floatValue||0}))}}                  
                  required/>              
            </div>                      
          <div className="col-md-3">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                name="paymentmode"
                value={formData.paymentmode}
                onChange={handleChange}
                style={{ width: "200px" }}  
              > 
                <option value="">-- Select Payment Mode --</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div className="col-md-3">
            <label className="form-label">Currency Code</label>
            <input
                type="text"
                className="form-control"
                value={formData.currencycode || ""}
                onChange={(e) =>
                setFormData((prev) => ({ ...prev, currencycode: e.target.value }))
                }
                style={{width:"200px"}}
                readOnly // optional if you don't want it editable
            />
            </div>
            <div className="col-md-3">
            <label className="form-label">Exchange Rate</label>
             <br />
            <NumericFormat  value={ formData.exrate||"" } 
                displayType="input"
                thousandSeparator={false}
                decimalScale={4}
                fixedDecimalScale={true}
                onValueChange={(values) => { const {floatValue} = values;
                  setFormData((prev) => ({ ...prev, exrate: floatValue||0}))}}             
                  required/>
            </div>
          </div> 
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Transaction No</label>
              <input type="text" className="form-control" name="transactionno" value={formData.transactionno}   onChange={handleChange} style={{ width: "150px" }} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Transaction.Date </label>
              <input type="date" className="form-control" name="transactiondate" value={convertDate(formData.transactiondate)}   onChange={handleChange} style={{ width: "150px" }} />
            </div> 
            <div className="col-md-3">
            <label className="form-label">Chequeno</label>
              <input type="text" className="form-control" name="chequeno" value={formData.chequeno}   onChange={handleChange} style={{ width: "150px" }} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Cheque.Date </label>
              <input type="date" className="form-control" name="cheqedate" value={convertDate(formData.cheqedate)}   onChange={handleChange} style={{ width: "150px" }} />
            </div>    
          </div> 
        <div className="row mb-3">
          <div className="mb-9">
            <label className="form-label">Remarks</label>
            <textarea className="form-control" name="remarks"
                  value={formData.remarks} onChange={handleChange} rows={4} style={{ width: "775px" }} />
          </div>
          </div>
        </header> 
        <ul className="nav nav-tabs mt-3" role="tablist">
       <li className="nav-item">
            <button 
              type="button"
              className={`nav-link ${activeTab === "gridData" ? "active" : ""}`}
              onClick={() => setActiveTab("gridData")}
            >
              Invoice Details
            </button>
          </li>
          <li className="nav-item">
            <button 
              type="button"
              className={`nav-link ${activeTab === "totals" ? "active" : ""}`}
              onClick={() => setActiveTab("totals")}
            > Footer
            </button>
          </li> 
          </ul>
        {activeTab === "gridData" && (
          <div className="tab-pane fade show active p-2" style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "1px" }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={handleAddReceipts}><i className="bi bi-plus-lg"></i></button>
            <button type="button" className="btn btn-danger" onClick={handleDeleteRecDetails}><i className="bi bi-trash3"></i></button>
        </div>
        </div>

    <div style={{ maxHeight: "300px", overflowY: "auto", overflowX: "auto", border: "1px solid #ced4da", position: "relative" }}>
    <table className="table table-bordered mb-0" style={{ minWidth: "800px" }}>
        <thead className="table-light">
        <tr> 
        <th><input type="checkbox" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} /></th>
        <th>Sl.No.</th>
        <th>Invoice No</th>
        <th>Invoice Date</th>
        <th>Invoice Amount</th>
        <th>Currency</th>
        <th>Exchange Rate</th>
        <th>Receipt Amount</th>
        <th>Commission</th> 
        <th>TDS</th>
        <th>Net Amount</th> 
        </tr>
        </thead>
        <tbody>
          {Array.isArray(gridData)&& gridData.map((row, idx) => (
            <tr key={idx}>
              <td><input type="checkbox" checked={row.selected || false} onChange={() => toggleSelect(idx)} /></td>
              <td>{row.rowno ?? idx + 1}</td>
              <td>
                <Select
                options={filteredInvoices}
                value={filteredInvoices.find(opt => opt.value === row.invoiceno) || null}  // FIXED: Direct comparison
                onChange={(selected) => {
                  if (!selected) {
                    handleGridChange(idx, 'invoiceno', null);
                    handleGridChange(idx, 'invoicedate', "");
                    handleGridChange(idx, 'invoiceamount', 0);
                    return;
                  }
                  handleGridChange(idx, 'invoiceno', selected.value);  // Store invoice ID
                  handleGridChange(idx, 'invoicedate', selected.invoicedate);
                  handleGridChange(idx, 'invoiceamount', selected.totnetamount);
                }}
                placeholder="Select Invoice"
                isClearable
                isSearchable
                className="w-200"
              />
              </td>
              <td> 
                <input type="date" className="form-control" value={convertDate(row.invoicedate)} readOnly />
              </td>
              <td>
                <NumericFormat 
                  value={row.invoiceamount} 
                  thousandSeparator
                  decimalScale={2} 
                  fixedDecimalScale
                  className="form-control"
                  readOnly
                  style={{width:"150px"}}
                /> 
              </td>
              <td>
                <Select
                options={currencyOptions}
                value={currencyOptions.find(opt => Number(opt.value) === Number(row.gcurrency) || null)}
                onChange={(selected) => {
                  handleGridChange(idx, 'gcurrency', selected?.value || null );
                  }}
                placeholder="Select Currency"
                isClearable
                isSearchable
                className="w-200"
              />
                </td>
              <td>
                <NumericFormat 
                  value={row.gexrate||1} 
                  thousandSeparator 
                  decimalScale={4} 
                  fixedDecimalScale
                  className="form-control"
                  readOnly
                />  
                </td>
              <td>
                <NumericFormat 
                  value={row.greceiptamount} 
                  onValueChange={(v) => handleGridChange(idx, 'greceiptamount', v.floatValue || 0)}
                  thousandSeparator 
                  decimalScale={2} 
                  fixedDecimalScale
                  className="form-control"
                  style={{width:"125px"}}
                />
              </td>
              <td>
                <NumericFormat 
                  value={row.tdsamount} 
                  onValueChange={(v) => handleGridChange(idx, 'tdsamount', v.floatValue || 0)}
                  thousandSeparator 
                  decimalScale={2} 
                  fixedDecimalScale
                  className="form-control"
                  style={{width:"125px"}}
                />
              </td>
              <td>
                <NumericFormat 
                  value={row.commissionamount} 
                  onValueChange={(v) => handleGridChange(idx, 'commissionamount', v.floatValue || 0)}
                  thousandSeparator 
                  decimalScale={2} 
                  fixedDecimalScale
                  className="form-control"
                   style={{width:"125px"}}
                />
              </td>
              <td>
                <NumericFormat 
                  value={row.netreceiptamount}  
                  thousandSeparator={true}
                  decimalScale={2}
                  fixedDecimalScale={true} 
                  className="form-control"
                  onValueChange={(v) => handleGridChange (idx,'netreceiptamount',v.floatValue||0)}
                  readOnly
                  style={{width:"125px"}}
                />
              </td> 
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
        )} 
        {activeTab === "totals" && (
          <div className="receipt-footer">
            <div className="row mb-3">
              <div className="col-md-3">
                <label className="form-label">Total Amount</label>
                <input type="number" className="form-control" value={totals.totalAmount} readOnly />
              </div> 
              <div className="col-md-3">
                <label className="form-label">Balance Amount</label>
                <input type="number" className="form-control" value={totals.balanceAmount} readOnly />
              </div>
            </div>
            {error && (<div className="alert alert-danger">{error}</div>)}
          </div> 
        )}
        

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary" disabled={loading||!!error}>
          <FaSave className="me-1" /> {loading ? 'Saving..' : formData.id ? 'Update' : 'Save'}
        </button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            <FaTimes className="me-1" /> Cancel
           </button>
          {/*<button type="button" className="btn btn-secondary" onClick={handlePreview}>Preview</button> */}
        </div>
      </form>

     <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl={`${API_URL}/receiptssearch/${defaultcompanyid}`} 
          columns={[
          { field: "receiptno", label: "Receipt No." },
          { field: "customername", label: "Customer Name" },
          { field: "invoiceno", label: "Invoice No"},
        ]}
        searchFields={[
          { value: "receiptno", label: "Receipt No." },
          { value: "customername", label: "Customer Name" },
          { value: "invoiceno", label: "Invoice No"},
        ]}
        onSelect={(fin) => {
          setFormData({ ...fin });
          setReceiptsObject(fin);
          setIsEdit(true);
          setShowModal(false); 
        }}
      />
      
    </div>
  );
}

export default ReceiptsForm;