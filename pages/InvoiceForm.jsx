import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { FaSave, FaTimes } from "react-icons/fa"; 
import Select from "react-select";
import { NumericFormat } from 'react-number-format';
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";
import DataContext, { useData } from "../context/DataContext";


function InvoiceForm({ onClose, onSaved, invoiceObject, setInvoiceObject, navigateToList, handleDelete }) {
  const { invoice, companyname, companyno, companyid } = useContext(DataContext);
  const { acessToken, authFetch, username: ctxUsername, companyid: defaultcompanyid, companyno: defaultCompanyno } = useContext(AuthContext);
  const {  customer,fetchCustomer,items,fetchItems, companies,fetchCompanies,taxmaster,fetchTaxMaster,uoms,fetchUoms} = useData();
  
  const [activeTab, setActiveTab] = useState("invdetail");
  const [invdetail, setInvdetail] = useState([
    { key: 1, itemname: "", itemcode: "", uoms: "", invoiceqty:0.000,invoicerate:0.00,taxname: "",taxrate:0.00,discounttype:"",afterdiscountamount:0.00,discount_amt_per:0.00,
        dicountamount:0.00,afterDiscAmt:0.00,sgstper:0.00,cgstper:0.00,igstper:0.00,sgstamount:0.00,cgstamount:0.00,igstamount:0.00,taxamount:0.00,netamount:0.00, selected: false, rowno: 1 }
  ]);
  const [invfooter, setInvfooter] = useState({ totalqty:0.000,grossamount: 0.00,totsgstamt:0.00,totcgstamt:0.00,totigstamt:0.00,
    discountamt:0.00,add_othercharges:0.00,ded_othercharges:0.00,roundedoff:0.00, netamount:0.00 
  });
 
  const [formData, setFormData] = useState({
    id: null,
    companyid: defaultcompanyid,
    companyname:  companyname??"",
    companyno:  "",
    invoiceno: "",
    invoicedate:"",
    referenceno:"",
    referencedate:"",
    customername: "",
    currencycode: "",
    currencyid: null,
    exrate: 1.0000, 
    placeof_supply:"",
    supplytype:"",
    remarks:"",
    createdby: "",
    modifiedby: ""
  });

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const uname = ctxUsername || fallbackParams.username || "admin";
  const cid = defaultcompanyid || fallbackParams.companyid || companyid;
  const cno = defaultCompanyno || fallbackParams.companyno || companyno;

   
  
  const customerOptions = useMemo(() => customer.map(tm => ({ value: tm.id, label: tm.customername, currencycode: tm.currencycode, currencyid: tm.currencyid,placeof_supply: tm.placeof_supply,gstin: tm.gstin })), [customer]);
  const itemOptions = useMemo(() => items.map(tm => ({ value  : tm.id, label: tm.productname, productcode: tm.productcode, selling_uom: tm.selling_uom,suom: tm.suom,taxmasterid: tm.taxmasterid,taxname:tm.taxname,taxrate:tm.taxrate ,selling_price:tm.selling_price})), [items]);
  const uomOptions = useMemo(() => uoms.map(tm => ({ value: tm.id, label: tm.uomcode})), [uoms]);
  const taxOptions = useMemo(() => (taxmaster || []).map(tm => ({ value: tm.id, label: tm.taxname,taxrate :tm.taxrate})), [taxmaster]);
  
 // Fetch companies, items, uoms, taxmaster only once when companies are empty
useEffect(() => {
    if (!companies.length) {
      fetchCompanies();
      fetchItems?.();
      fetchUoms?.();
      fetchCustomer();
      fetchTaxMaster();
    }
}, [companies.length]); // no need to include functions if they are stable

useEffect(() => {
  console.log("📋 Updated formData:", formData);
}, [formData]);

  

    useEffect(() => {
      console.log("🧾 itemOptions after mapping:", itemOptions);
    }, [itemOptions]);

useEffect(() => {
  console.log("🧾 TaxOptions after mapping:", taxOptions);
}, [taxOptions]);

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

 
  // Reset form for new entry
  const resetForm = () => {
    const defaultCompany = companies.find(c => c.companyid === defaultcompanyid) || { companyname: "", companyno: "" };
    console.log("defafult companyname",defaultCompany);
    setFormData({
      id: null, 
      companyid: cid,
      companyname:defaultCompany.companyname || "",
      companyno: defaultCompany.companyno || "",
      invoiceno: "",
      invoicedate:"",
      referenceno:"",
      referencedate:"",
      customername: "",
      currencycode: "",
      currencyid: null,
      exrate: 1.0000, 
      placeof_supply:"",
      supplytype:"",
      remarks:"",
      createdby: uname || "",
      modifiedby: uname || ""
    });

    setInvfooter({
       totalqty:0.000,grossamount: 0.00,totsgstamt:0.00,totcgstamt:0.00,totigstamt:0.00,
    discountamt:0.00,add_othercharges:0.00,ded_othercharges:0.00,roundedoff:0.00, netamount:0.00  });

    setInvdetail([{ key: 1, itemname: "", itemcode: "", uom: "", invoiceqty:0.000,invoicerate:0.00,taxname: "",taxrate:0.00,disctype:"",
        dicamt:0.00,sgstper:0.00,cgstper:0.00,igstper:0.00,sgstamount:0.00,cgstamount:0.00,igstamount:0.00,taxamount:0.00,netamount:0.00, selected: false, rowno: 1 }
   ]);
    setIsEdit(false);
    setMessage("");
  };

  // Populate form for edit or new
  useEffect(() => {
    if (invoiceObject && invoiceObject.id) {
      setFormData({
        ...invoiceObject,
        customerid: customerObject.cityid || null,
        currencyid: customerObject.currencyid || null, 
      });
      setIsEdit(true);
       
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceObject]);

  

  // Generic change handler (handles checkboxes and text/select)
  const handleChange = (e) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? e.target.checked : e.target.value;  
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  
  const fetchInvoiceDetails = useCallback(async (invoice_headerid) => {
    try {
      const url = `${API_URL}/getinvoicedtl/${invoice_headerid}`;
      const res = await authFetch(url, { headers: { Authorization: `Bearer ${acessToken}` } });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const invdtl = data.invdtl || [];
      const invhdr = data.invhdr || {};

      const newInvDetails = invdtl.length > 0
        ? custdtl.map((p, idx) => ({
            ...p,
            key: idx + 1,
            invoice_headerid: p.invoice_headerid || invhdr?.id,
            selected: false,
            rowno: idx + 1
          }))
        : [{
            key: 1,
            itemid:null,
            uomid:null,
            invoiceqty:0.000,
            invoicerate:0.00,
            invoiceamount:0.00,
            discounttype:"",
            discount_amt_per:0.00,
            taxheaderid:null,
            taxrate:0.00,
            cgstper:0.00,
            sgstper:0.00,
            igstper:0.00,
            cgstamount:0.00,
            sgstamount:0.00,
            igstamount:0.00,
            taxamount:0.00,
            netamount:0.00,
            selected: false,
            rowno: 1,
            invoice_headerid: invoice_headerid
          }];

      setInvdetail(newInvDetails);
      // reset selectAll
      setSelectAll(false);
    } catch (err) {
      console.error("❌ Error in fetchContacts:", err);
      setInvdetail([{
        key: 1,
        itemid:null,
        uomid:null,
        invoiceqty:0.000,
        invoicerate:0.00,
        invoiceamount:0.00,
        discounttype:"",
        discount_amt_per:0.00,
        taxheaderid:null,
        taxrate:0.00,
        cgstper:0.00,
        sgstper:0.00,
        igstper:0.00,
        cgstamount:0.00,
        sgstamount:0.00,
        igstamount:0.00,
        taxamount:0.00,
        netamount:0.00,
        selected: false,
        rowno: 1,
        invoice_headerid: null
      }]);
    }
  }, [acessToken, authFetch, API_URL]);

  // Contacts helpers
  const addInvdetailRow = () => {
    setInvdetail(prev => [
      ...prev,
      {
        key: prev.length + 1,        
        itemid:null,
        uomid:null,
        invoiceqty:0.000,
        invoicerate:0.00,
        invoiceamount:0.00,
        discounttype:"",
        discount_amt_per:0.00,
        taxheaderid:null,
        taxrate:0.00,
        cgstper:0.00,
        sgstper:0.00,
        igstper:0.00,
        cgstamount:0.00,
        sgstamount:0.00,
        igstamount:0.00,
        taxamount:0.00,
        netamount:0.00,             
        selected: false,
        rowno: prev.length + 1
      }
    ]);
  };

const handleInvDetailsChange = (index, field, value) => {
  setInvdetail(prev => {
    const updated = [...prev];
    const row = { ...updated[index] };

    // ✅ Convert numeric fields to numbers
    const numericFields = ["invoiceqty", "invoicerate", "taxrate", "discount_amt_per"];
    if (numericFields.includes(field)) {
      row[field] = parseFloat(value) || 0;
    } else {
      row[field] = value;
    }

    // 🧮 Auto-calculate invoice amount
    
    const qty = parseFloat(row.invoiceqty) || 0;
    const rate = parseFloat(row.selling_price) || 0;
      row.invoiceamount = qty*rate;
 
    console.log(`Row ${index} invoiceqty: ${row.invoiceqty}, invoicerate: ${row.selling_price}, invoiceamount: ${row.invoiceamount}`);
    // 🧮 Discount calculation
    const amount = row.invoiceamount || 0;
    const disc = row.discount_amt_per || 0;

    if (row.discounttype === "Percentage") {
      row.afterdiscountamount = amount - (amount * disc) / 100;
    } else if (row.discounttype === "Lumpsum") {
      row.afterdiscountamount = amount - disc;
    } else {
      row.afterdiscountamount = amount;
    }

    // 🧾 Apply tax breakup based on supply type
    const taxRate = row.taxrate || 0;
    const afterDiscAmt = row.afterdiscountamount || 0;

    row.taxamount = (afterDiscAmt * taxRate) / 100;

    if (formData.supplytype === "Inter") {
      row.igstper = taxRate;
      row.sgstper = 0;
      row.cgstper = 0;
      row.igstamount = (afterDiscAmt * row.igstper) / 100;
      row.sgstamount = 0;
      row.cgstamount = 0;
    } else {
      row.sgstper = taxRate / 2;
      row.cgstper = taxRate / 2;
      row.igstper = 0;
      row.sgstamount = (afterDiscAmt * row.sgstper) / 100;
      row.cgstamount = (afterDiscAmt * row.cgstper) / 100;
      row.igstamount = 0;
    }

    // 🧾 Calculate net amount
    row.netamount =
      afterDiscAmt +
      (row.sgstamount || 0) +
      (row.cgstamount || 0) +
      (row.igstamount || 0);

    // ✅ Format numeric fields to 2 decimals for display
    row.invoiceamount = Number(row.invoiceamount).toFixed(2);
    row.afterdiscountamount = Number(row.afterdiscountamount).toFixed(2);
    row.taxamount = Number(row.taxamount).toFixed(2);
    row.sgstamount = Number(row.sgstamount).toFixed(2);
    row.cgstamount = Number(row.cgstamount).toFixed(2);
    row.igstamount = Number(row.igstamount).toFixed(2);
    row.netamount = Number(row.netamount).toFixed(2);

    updated[index] = row;
    return updated;
  });
};

  // grid Total 
const totals = (Array.isArray(invdetail) ? invdetail : []).reduce(
  (acc, row) => {
    acc.totalQty += parseFloat(row.invoiceqty || 0);
    acc.totalInvoiceAmt += parseFloat(row.invoiceamount || 0);
    acc.totalDiscount += parseFloat(row.invoiceamount || 0) - parseFloat(row.afterdiscountamount || 0);
    acc.totalafterDiscAmt += parseFloat(row.afterdiscountamount||0)
    acc.totalTax +=
      parseFloat(row.sgstamount || 0) +
      parseFloat(row.cgstamount || 0) +
      parseFloat(row.igstamount || 0);
    acc.totalNet += parseFloat(row.netamount || 0);
    return acc;
  },
  { totalQty: 0, totalInvoiceAmt: 0, totalDiscount: 0,totalafterDiscAmt:0, totalTax: 0, totalNet: 0 }
);

//calculate Footer 

const calculateFooter = () => {
  const totals = invdetail.reduce((acc, row) => {
    acc.totalqty += parseFloat(row.invoiceqty || 0);
    acc.grossamount += parseFloat(row.invoiceamount || 0);
    acc.discountamt += parseFloat(row.discountamount || 0);
    acc.totsgstamt += parseFloat(row.sgstamount || 0);
    acc.totcgstamt += parseFloat(row.cgstamount || 0);
    acc.totigstamt += parseFloat(row.igstamount || 0);
    return acc;
  }, {
    totalqty: 0,
    grossamount: 0,
    discountamt: 0,
    totsgstamt: 0,
    totcgstamt: 0,
    totigstamt: 0
  });

  // Calculate net amount before rounding
  let net = totals.grossamount 
            - totals.discountamt 
            + totals.totsgstamt 
            + totals.totcgstamt 
            + totals.totigstamt 
            + parseFloat(invfooter.add_othercharges || 0)
            - parseFloat(invfooter.ded_othercharges || 0);

  // Rounded off to nearest integer
  const roundedNet = Math.round(net);
  const roundedOff = parseFloat((roundedNet - net).toFixed(2));

  setInvfooter(prev => ({
    ...prev,
    ...totals,
    roundedoff: roundedOff,
    netamount: roundedNet
  }));
};

 // Recalculate footer when invdetail or charges change
  useEffect(() => {
    calculateFooter();
  }, [invdetail, invfooter.add_othercharges, invfooter.ded_othercharges]);

   // Recalculate all rows when supplytype changes

  useEffect(() => { 
  setInvdetail(prev => prev.map((r, i) => {
    handleInvDetailsChange(i, "taxrate", r.taxrate);
    return { ...r }; // keep row
  }));
}, [formData.supplytype]);


  const toggleSelect = (idx) => {
    setInvdetail(prev => {
      const updated = prev.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c));
      setSelectAll(updated.every(c => c.selected));
      return updated;
    });
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setInvdetail(prev => prev.map(p => ({ ...p, selected: checked })));
  };

  const handleDeleteInvDetails = () => {
    const remaining = invdetail.filter(p => !p.selected);
    if (remaining.length === 0) {
      alert("At least 1 contact must remain!");
      return;
    }
    setInvdetail(remaining);
    setSelectAll(false);
  };

  // Handle submit
  const handleSubmit = async (e) => {
  e?.preventDefault();
  setLoading(true);
  setMessage("");

  if (!formData.customername) {
    setMessage("Please fill in the Customer Name.");
    setLoading(false);
    return;
  }

  try {
    // Build payload
    const payload = {
      companyid: cid,
      companyno: cno || "",
      companyname: formData.companyname || companyname || "",
      invoiceno: formData.invoiceno,
      invoicedate: formData.invoicedate,
      customerid: formData.customerid,
      referenceno: formData.referenceno || null,
      referencedate: formData.referencedate || null,
      currencyid: formData.currencyid,
      exrate: 1.0,
      supplytype: formData.supplytype,
      remarks: formData.remarks || null,
      grossamount: formData.grossamount || 0,
      sgstamount: formData.sgstamount || 0,
      cgstamount: formData.cgstamount || 0,
      igstamount: formData.igstamount || 0,
      discountamount: formData.discountamount || 0,
      add_othercharges: formData.add_othercharges || 0,
      ded_othercharges: formData.ded_othercharges || 0,
      roundedoff: formData.roundedoff || 0,
      netamount: formData.netamount || 0,
      createdby: formData.createdby || uname,
      modifiedby: formData.modifiedby || uname,

      // ✅ Build invoice details properly using 'c' from invdetail array
      invdetails: invdetail.map(c => ({
        id: c.id || null,
        invoice_headerid: c.invoice_headerid || formData.id || null,
        rowno: c.rowno || 1,
        itemid: c.itemid,                   // required
        uomid: c.uomid,                     // required
        invoiceqty: c.invoiceqty || 0,
        invoicerate: c.invoicerate || 0,
        invoiceamount: c.invoiceamount || 0,
        discounttype: c.discounttype || null,
        discount_amt_per: c.discount_amt_per || 0,
        taxheaderid: c.taxheaderid || null,
        taxrate: c.taxrate,                 // required
        cgstper: c.cgstper || 0,
        sgstper: c.sgstper || 0,
        igstper: c.igstper || 0,
        cgstamount: c.cgstamount || 0,
        sgstamount: c.sgstamount || 0,
        igstamount: c.igstamount || 0,
        taxamount: c.taxamount || 0,
        netamount: c.netamount || 0
      }))
    };

    console.log("Final Payload to send:", payload);

    const endpoint = isEdit 
      ? `${API_URL}/updateinvoice/${formData.id}` 
      : `${API_URL}/addinvoice/`;

    const res = await authFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${acessToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      let errData;
      try { errData = JSON.parse(text); } catch { errData = null; }
      throw errData?.detail || new Error(`HTTP error ${res.status}`);
    }

    // Get saved invoice header including ID
    const savedinvheader = await res.json();
    console.log("Saved Invoice Header:", savedinvheader);

    // Update formData with new invoice ID
    if (savedinvheader?.id) {
      setFormData(prev => ({ ...prev, id: savedinvheader.id }));

      // Fetch invoice details using returned ID
      await fetchInvoiceDetails(savedinvheader.id);
    }

    setMessage("Invoice Header and Details saved successfully!");
    if (typeof onSaved === "function") onSaved();
    onClose?.();

  } catch (err) {
    console.error("Error saving Invoice:", err);
    setMessage(err?.message || "Failed to save Invoice.");
  } finally {
    setLoading(false);
  }
};


  const handleDeleteClick = () => {
    if (formData?.id) {
      handleDelete(formData.id);
      resetForm();
    } else {
      alert("No Customer selected");
    }
  };

  return (
    <div className="card w-100">
      {message && <div className="alert alert-danger mt-2">{message}</div>}
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit Invoice" : "New Invoice"}</h4>
        <div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-secondary" onClick={resetForm}><i className="bi bi-plus-lg"></i></button>
          <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}><i className="bi bi-dash-lg"></i></button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)}><i className="bi bi-search"></i></button>
          <button type="button" className="btn btn-secondary" onClick={() => navigateToList?.()}><i className="bi bi-list"></i></button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <header className="card p-3 border border-secondary w-100 mt-2" style={{ backgroundColor: "#ebe6e6ff" }}>
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-control" name="companyname" readOnly value={formData.companyname || "Loading..."} onChange={handleChange} style={{ width: "200px" }} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Company No</label>
              <input type="text" className="form-control" name="companyno" readOnly value={formData.companyno || "Loading..."} onChange={handleChange} style={{ width: "100px" }} />
            </div>  
          </div> 
          <div className="row mb-3">
             <div className="col-md-3">
              <label className="form-label">Invoice Date</label>
              <input type="date" className="form-control" name="invoicedate" value={formData.invoicedate}  onChange={handleChange} style={{ width: "150px" }} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Invoice No</label>
              <input type="text" className="form-control" name="invoiceno" value={formData.invoiceno||"Auto Generated"} readOnly onChange={handleChange} style={{ width: "250px" }} />
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
                    placeof_supply: selected?.placeof_supply || "",
                    gstin: selected?.gstin || "",
                }))
                }
                placeholder="-- Select Customer --"
                isClearable
                isSearchable
            />
              
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-3">
              <label className="form-label">Reference No</label>
              <input type="text" className="form-control" name="refrenceno" value={formData.referenceno}   onChange={handleChange} style={{ width: "150px" }} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Ref.Date </label>
              <input type="date" className="form-control" name="referencedate" value={formData.referencedate}   onChange={handleChange} style={{ width: "150px" }} />
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
                 handleInvDetailsChange(idx, "exrate", floatValue||0)}}                  
                  required/>
            </div>
          </div>

          <div className="row mb-3"> 
            <div className="col-md-3">
            <label className="form-label">GSTIN</label>
            <input
                type="text"
                className="form-control"
                value={formData.gstin || ""}
                onChange={(e) =>
                setFormData((prev) => ({ ...prev, gstin: e.target.value }))
                }
                readOnly
            />
            </div>

            <div className="col-md-3">
            <label className="form-label">Place of Supply</label>
            <input
                type="text"
                className="form-control"
                value={formData.placeof_supply || ""} 
                onChange={(e) =>
                   setFormData((prev) => ({ ...prev, placeof_supply: e.target.value }))
                    }
                readOnly
            />
            </div>
             <div className="col-md-3">
                 <label className="form-label">Supply Type</label>
          <select
            className="form-select"
            value={formData.supplytype}            
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                supplytype: e.target.value,
              }))
            }
            // disabled={formData.gstin && formData.gstin !== "NA"} // ✅ editable only if GSTIN is NA
          >
            <option value="">-- Select Supply Type --</option>
            <option value="Intra">Intra</option>
            <option value="Inter">Inter</option>
          </select>
           </div>       
          </div> 
        <div className="row mb-3">
           <div className="mb-9">
            <label className="form-label">Remarks*</label>
            <textarea className="form-control" name="remarks"
                   value={formData.remarks} onChange={handleChange} rows={4} style={{ width: "775px" }} />
          </div>
            </div>
        </header>

    {/* ===== Invoice Details Tabs ===== */}
    <ul className="nav nav-tabs mt-3" role="tablist">
      <li className="nav-item" role="presentation">
        <button className={`nav-link ${activeTab === "invdetail" ? "active" : ""}`} type="button" style={{ backgroundColor: "#ebe6e6ff" }} onClick={() => setActiveTab("invdetail")}>Item Details</button>
      </li>
      <li className="nav-item" role="presentation">
        <button className={`nav-link ${activeTab === "invfooter" ? "active" : ""}`} type="button" onClick={() => setActiveTab("invfooter")}>Footer</button>
      </li>
    </ul>

    <div className="tab-content mt-3"> 

    {activeTab === "invdetail" && (
    <div className="tab-pane fade show active p-2" style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "1px" }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex gap-2">
            <button type="button" className="btn btn-secondary" onClick={addInvdetailRow}><i className="bi bi-plus-lg"></i></button>
            <button type="button" className="btn btn-danger" onClick={handleDeleteInvDetails}><i className="bi bi-trash3"></i></button>
        </div>
        </div>

    <div style={{ maxHeight: "300px", overflowY: "auto", overflowX: "auto", border: "1px solid #ced4da", position: "relative" }}>
    <table className="table table-bordered mb-0" style={{ minWidth: "800px" }}>
        <thead className="table-light">
        <tr>
        <th><input type="checkbox" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} /></th>
        <th>Sl.No.</th>
        <th >Item Name</th>
        <th>Item Code</th>
        <th>UOM</th>
        <th>Invoice Qty</th>
        <th>Invoice Rate</th>
        <th>Invoice Amount</th>
        <th>Discount Type</th>
        <th>Amount or %</th>
        <th>After Discount</th>
        <th>Tax Name</th>
        <th>Tax Rate%</th>
        <th>Tax Amount</th>
        <th hidden>sgstper</th>
        <th hidden>cgstper</th>
        <th hidden>igstper</th>
        <th hidden>sgstamt</th>
        <th hidden>cgstamt</th>
        <th hidden>igstamt</th>
        <th>Net Amount</th>            
        </tr>
        </thead>
        <tbody>
        {Array.isArray(invdetail) && invdetail.map((p, idx) => (
            <tr key={p.key}>
            <td><input type="checkbox" checked={p.selected || false} onChange={() => toggleSelect(idx)} /></td>
            <td>{p.rowno ?? idx + 1}</td>
            <td>
                <Select
            options={itemOptions}
            value={itemOptions.find(opt => opt.value === p.itemid) || null}
            onChange={(selected) => {
              if (!selected) return;

              // Required fields
              handleInvDetailsChange(idx, "itemid", selected.value);   // maps to backend itemid
              handleInvDetailsChange(idx, "uomid", selected.selling_uom); // required
              handleInvDetailsChange(idx, "selling_price", selected.selling_price);
              handleInvDetailsChange(idx, "invoiceqty", p.invoiceqty || 0); // keep current qty

              // Optional fields
              handleInvDetailsChange(idx, "productname", selected.label);
              handleInvDetailsChange(idx, "productcode", selected.productcode);
              handleInvDetailsChange(idx, "uomcode", selected.suom);

              // Tax fields from item
              handleInvDetailsChange(idx, "taxheaderid", selected.taxmasterid);
              handleInvDetailsChange(idx, "taxname", selected.taxname);
              handleInvDetailsChange(idx, "taxrate", selected.taxrate || 0);

              // Recalculate amounts if needed
              const invoiceamount = (p.invoiceqty || 0) * (selected.selling_price || 0);
              handleInvDetailsChange(idx, "invoiceamount", invoiceamount);
              handleInvDetailsChange(idx, "cgstamount", 0);
              handleInvDetailsChange(idx, "sgstamount", 0);
              handleInvDetailsChange(idx, "igstamount", 0);
              handleInvDetailsChange(idx, "taxamount", 0);
              handleInvDetailsChange(idx, "netamount", invoiceamount);
            }}
            placeholder="Select Item"
            isClearable
            isSearchable
            className="w-400"
          />

            </td>
            <td>
            <input type="text" className="form-control"  value={p.productcode} onChange={(e) => handleInvDetailsChange(idx, "productcode", e.target.value)} style={{width:"200px"}} disabled />
            </td>             
            <td>
            <Select
              options={uomOptions}
              value={uomOptions.find(opt => opt.value === p.uomid) || null} // p.uom stores ID
              // onChange={(selected) => handleInvDetailsChange(idx, "suom", selected?.value)}
              onChange={(selected) => {
              handleInvDetailsChange(idx, "uomid", selected?.value || null);
              handleInvDetailsChange(idx, "uomcode", selected?.label || "");
            }}
              placeholder="Select UOM"
              isClearable
              className="w-150"
            />          
            </td>
            <td>
                <NumericFormat  value={ p.invoiceqty||"" } 
                displayType="input"
                thousandSeparator={true}
                decimalScale={3}
                fixedDecimalScale={true}
                onValueChange={(values) => { const {floatValue} = values;
                 handleInvDetailsChange(idx, "invoiceqty", floatValue||0)}}                  
                style={{width:"125px"}} required/>
            </td>
            <td>
              <NumericFormat  value={ p.selling_price||"" } 
                displayType="input"
                thousandSeparator={true}
                decimalScale={2}
                fixedDecimalScale={true}
                onValueChange={(values) => { const {floatValue} = values;
                 handleInvDetailsChange(idx, "selling_price", floatValue||0)}}                  
                style={{width:"125px"}} required/>
            </td>
            <td>
              <NumericFormat
              value={p.invoiceamount}
              displayType="input"    // "input" for editable, "text" for read-only
              thousandSeparator={true}
              decimalScale={2}       // 2 decimal places
              fixedDecimalScale={true}
              onValueChange={(values) => {
                const { floatValue } = values;
                handleInvDetailsChange(idx, 'invoiceamount', floatValue || 0);
              }}
              style={{width:"125px"}}
            />
            </td>          
            <td>
            <select
              className="form-select"
              value={p.discounttype}
              onChange={(e) => handleInvDetailsChange(idx, "discounttype", e.target.value)}
              style={{width:"150px"}}
            >
              <option value="">--Select--</option>
              <option value="Percentage">Percentage</option>
              <option value="Lumpsum">Lumpsum</option>
              
            </select>
          </td> 
            <td>
                <NumericFormat
              value={p.discount_amt_per}
              displayType="input"    // "input" for editable, "text" for read-only
              thousandSeparator={true}
              decimalScale={2}       // 2 decimal places
              fixedDecimalScale={true}
              onValueChange={(values) => {
                const { floatValue } = values;
                handleInvDetailsChange(idx, 'discount_amt_per', floatValue || 0);
              }}
              style={{width:"110px"}}
            />
            </td>
            <td>
                <NumericFormat
              value={p.afterdiscountamount}
              displayType="input"    // "input" for editable, "text" for read-only
              thousandSeparator={true}
              decimalScale={2}       // 2 decimal places
              fixedDecimalScale={true}
              onValueChange={(values) => {
                const { floatValue } = values;
                handleInvDetailsChange(idx, 'afterdiscountamount', floatValue || 0);
              }}
              readOnly                  // prevents editing but allows focus
              style={{
                width: "150px",
                backgroundColor: "#f0f0f0",  // greyed out like disabled
                cursor: "not-allowed",       // optional visual cue
              }} 
            />
            </td>
            <td>
              <div style={{ width: "175px" }}>
              <Select
                options={taxOptions}
                value={taxOptions.find(opt => opt.value === p.taxheaderid) || null}
                onChange={(selected) => {
                  handleInvDetailsChange(idx, "taxheaderid", selected?.value);
                  handleInvDetailsChange(idx, "taxname", selected?.label);
                  handleInvDetailsChange(idx, "taxrate", selected?.taxrate||0); 
                }}
                placeholder="Select Tax"
                isClearable
                
              />
            </div>
            </td>
            <td>
            <input
              type="number"
              className="form-control"
              value={p.taxrate || 0.00}
              onChange={(e) => handleInvDetailsChange(idx, "taxrate", e.target.value)}
              style={{width:"100px"}}
              step="0.01"
              disabled
            />            
          </td>
          <td>
            <input type="text" className="form-control" value={p.taxamount} style={{width:"125px"}} disabled/>
          </td>
          <td hidden><input type="text" value={p.sgstper} readOnly   /></td>
          <td hidden><input type="text" value={p.cgstper} readOnly /></td>
          <td hidden><input type="text" value={p.igstper} readOnly /></td>
          <td hidden><input type="text" value={p.sgstamount} readOnly /></td>
          <td hidden><input type="text" value={p.cgstamount} readOnly /></td>
          <td hidden><input type="text" value={p.igstamount} readOnly /></td>
          <td><input type="number" value={p.netamount}  style={{width:"125px"}} disabled /></td>
        </tr>
        ))}
        </tbody>
                <tfoot className="table-secondary fw-bold">
          <tr>
            <td colSpan="5" style={{ textAlign: "right" }}>Totals:</td>
            <td>{totals.totalQty.toFixed(2)}</td>
            <td></td>
            <td>{totals.totalInvoiceAmt.toFixed(2)}</td>
            <td></td>
            <td>{totals.totalDiscount.toFixed(2)}</td>
            <td>{totals.totalafterDiscAmt.toFixed(2)}</td>
            <td></td>
            <td></td>
            <td>{totals.totalTax.toFixed(2)}</td>    
            <td>{totals.totalNet.toFixed(2)}</td>
          </tr>
        </tfoot>
    </table>
    </div>
    </div>
        )}
    </div>

        {activeTab === "invfooter" && (
    <div
      className="tab-pane fade show active p-3"
      style={{
        backgroundColor: "#f7f7f7",
        border: "1px solid #ced4da",
        borderRadius: "4px",
      }}
    >
       <div className="row mb-3 g-3">
        {/* Total Quantity */}
        <div className="col-md-2">
          <label className="form-label">Total Qty</label>
          <input
            type="number"
            className="form-control"
            name="totalqty"
            value={invfooter.totalqty}
            readOnly
            style={{ width: "120px" }}
          />
        </div>

        {/* Gross Amount */}
        <div className="col-md-2">
          <label className="form-label">Gross Amount</label>
          <input
            type="number"
            className="form-control"
            name="grossamount"
            value={invfooter.grossamount}
            readOnly
            style={{ width: "140px" }}
          />
        </div>

        {/* Discount Amount */}
        <div className="col-md-2">
          <label className="form-label">Discount Amount</label>
          <input
            type="number"
            className="form-control"
            name="discountamt"
            value={invfooter.discountamt}
            readOnly
            style={{ width: "140px" }}
          />
        </div>

        {/* SGST Amount */}
        <div className="col-md-2">
          <label className="form-label">Total SGST</label>
          <input
            type="number"
            className="form-control"
            name="totsgstamt"
            value={invfooter.totsgstamt}
            readOnly
            style={{ width: "140px" }}
          />
        </div>

        {/* CGST Amount */}
        <div className="col-md-2">
          <label className="form-label">Total CGST</label>
          <input
            type="number"
            className="form-control"
            name="totcgstamt"
            value={invfooter.totcgstamt}
            readOnly
            style={{ width: "140px" }}
          />
        </div>

        {/* IGST Amount */}
        <div className="col-md-2">
          <label className="form-label">Total IGST</label>
          <input
            type="number"
            className="form-control"
            name="totigstamt"
            value={invfooter.totigstamt}
            readOnly
            style={{ width: "140px" }}
          />
        </div>

        {/* Additional Charges */}
        <div className="col-md-2">
          <label className="form-label">Add Other Charges</label>
          <input
            type="number"
            className="form-control"
            name="add_othercharges"
            value={invfooter.add_othercharges}
            onChange={(e) =>
              setInvfooter(prev => ({ ...prev, add_othercharges: parseFloat(e.target.value) || 0 }))
            }
            style={{ width: "140px" }}
          />
        </div>

        {/* Deduction Charges */}
        <div className="col-md-2">
          <label className="form-label">Deduction Charges</label>
          <input
            type="number"
            className="form-control"
            name="ded_othercharges"
            value={invfooter.ded_othercharges}
            onChange={(e) =>
              setInvfooter(prev => ({ ...prev, ded_othercharges: parseFloat(e.target.value) || 0 }))
            }
            style={{ width: "140px" }}
          />
        </div>

        {/* Rounded Off */}
        <div className="col-md-2">
          <label className="form-label">Rounded Off</label>
          <input
            type="number"
            className="form-control"
            name="roundedoff"
            value={invfooter.roundedoff}
            readOnly
            style={{ width: "140px" }}
          />
        </div>

        {/* Net Amount */}
        <div className="col-md-2">
          <label className="form-label">Net Amount</label>
          <input
            type="number"
            className="form-control"
            name="netamount"
            value={invfooter.netamount}
            readOnly
            style={{ width: "140px" }}
          />
        </div>
      </div>

 
    </div>
         )}

        <div className="mt-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}><FaSave className="me-1" /> {loading ? "Saving.." : isEdit ? "Update" : "Save"}</button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}><FaTimes className="me-1" /> Cancel</button>
        </div>
      </form>

      <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl={`${API_URL}/invoice/search/${defaultcompanyid}`}
        columns={[
          { field: "invoiceno", label: "Invoice No." },
          { field: "customername", label: "Customer Name" },
          { field: "productname", label: "Product Name"},
        ]}
        searchFields={[
          { value: "invoiceno", label: "Invoice No." },
          { value: "customername", label: "Customer Name" },
          { value: "productname", label: "Product Name"},
        ]}
        onSelect={(fin) => {
          setFormData({ ...fin });
          setInvoiceObject(fin);
          setIsEdit(true);
          setShowModal(false);
        }}
      />
    </div>
  );
}

export default InvoiceForm;
