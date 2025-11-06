import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import { FaSave, FaTimes } from "react-icons/fa"; 
import Select from "react-select";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";
import DataContext, { useData } from "../context/DataContext";
import CurrencyForm from "./CurrencyForm";
import StateForm from "./StateForm";
import CityForm from "./CityForm";

function CustomerForm({ onClose, onSaved, customerObject, setCustomerObject, navigateToList, handleDelete }) {
  const { customer, companyname, companyno, companyid } = useContext(DataContext);
  const { acessToken, authFetch, username: ctxUsername, companyid: defaultcompanyid, companyno: defaultCompanyno } = useContext(AuthContext);
  const { citys, fetchCities, fetchCurrencies, currencies, states, fetchStates, companies,fetchCompanies} = useData();
  
  const [activeTab, setActiveTab] = useState("address");
  const [address, setaddress] = useState({
    address1: "",
    address2: "",
    cityname: "",
    statename: "",
    countryname: "",
    pincode: "",
    sameas: false,
    shipping_address1: "",
    shipping_address2: "",
    shipping_cityname: "",
    shipping_statename: "",
    shipping_countryname: "",
    shipping_pincode: ""
  });

  const [contacts, setContacts] = useState([
    { key: 1, contact_type: "", contact_person: "", contact_mobile: "", contact_phone: "", contact_email: "", selected: false, rowno: 1 }
  ]);

  const [formData, setFormData] = useState({
    id: null,
    companyid: defaultcompanyid,
    companyname:  companyname??"",
    companyno:  "",
    customer_type: "",
    customername: "",
    contactperson: "",
    currencyid: "",
    customer_phone: "",
    customer_mobile: "",
    customer_email: "",
    customer_website: "",
    address1: "",
    address2: "",
    cityid: null,
    stateid: null,
    countryid: null,
    pincode: "",
    shipping_address1: "",
    shipping_address2: "",
    shipping_cityid: null,
    shipping_stateid: null,
    shipping_countryid: null,
    shipping_pincode: "",
    gsttype: "",
    gstin: "",
    placeof_supply: "",
    active: true,
    sameas: false,
    createdby: "",
    modifiedby: ""
  });

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showModalCity,setShowModalCity]= useState(false);
  const [showModalState,setShowModalState]= useState(false);
  const [showModalCurrency,setShowModalCurrency]= useState(false);

  const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const uname = ctxUsername || fallbackParams.username || "admin";
  const cid = defaultcompanyid || fallbackParams.companyid || companyid;
  const cno = defaultCompanyno || fallbackParams.companyno || companyno;

  const gstOptions = [
    { value: "B2C", label:"Business to Consumer (B2C)" },
    { value: "B2B", label: "Business to Business (B2B)" }, 
    { value: "B2CS", label: "Business to Consumer – Small (B2CS)" },
    { value: "B2CL", label: "Business to Consumer – Large (B2CL)" },
    { value: "EXP", label: "Export (EXP)" },
    { value: "SEZ", label: "Special Economic Zone (SEZ)" },
    { value: "CDNR", label: "Credit/Debit Note Registered (CDNR)" },
    { value: "CDNUR", label: "Credit/Debit Note Unregistered (CDNUR)" },
  ];

  const cityOptions = useMemo(() => citys.map(tm => ({ value: tm.id, label: tm.cityname, statename: tm.statename, countryname: tm.countryname })), [citys]);
  const currencyOptions = useMemo(() => currencies.map(c => ({ value: c.id, label: c.currencycode })), [currencies]);
  const supplyOptions = useMemo(() => states.map(s => ({ value: s.id, label: s.statename, countryid: s.countryid, countryname: s.countryname })), [states]);
 
  useEffect(() => {
    if (!companies.length) {
      fetchCompanies();
    }
  }, [companies.length, fetchCompanies]);

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

 const handleModalCity = () => {
  setShowModalCity(true);
 };

 const handleModalState = () => {
  setShowModalState(true);
 };

 const handleModalCurrency= () => {
  setShowModalCurrency(true);
 };

  // Reset form for new entry
  const resetForm = () => {
    const defaultCompany = companies.find(c => c.companyid === defaultcompanyid) || { companyname: "", companyno: "" };
    console.log("defafult companyname",defaultCompany);
    setFormData({
      id: null, 
      companyid: cid,
      companyname:defaultCompany.companyname || "",
      companyno: defaultCompany.companyno || "",
      customer_type: "",
      customername: "",
      contactperson: "",
      currencyid: "",
      customer_phone: "",
      customer_mobile: "",
      customer_email: "",
      customer_website: "",
      address1: "",
      address2: "",
      cityid: null,
      stateid: null,
      countryid: null,
      pincode: "",
      shipping_address1: "",
      shipping_address2: "",
      shipping_cityid: null,
      shipping_stateid: null,
      shipping_countryid: null,
      shipping_pincode: "",
      gsttype: "",
      gstin: "",
      placeof_supply: "",
      active: true,
      sameas: false,
      createdby: uname || "",
      modifiedby: uname || ""
    });

    setaddress({
      address1: "",
      address2: "",
      cityname: "",
      statename: "",
      countryname: "",
      pincode: "",
      sameas: false,
      shipping_address1: "",
      shipping_address2: "",
      shipping_cityname: "",
      shipping_statename: "",
      shipping_countryname: "",
      shipping_pincode: ""
    });

    setContacts([{ key: 1, contact_type: "", contact_person: "", contact_mobile: "", contact_phone: "", contact_email: "", selected: false, rowno: 1 }]);
    setIsEdit(false);
    setMessage("");
  };

  // Populate form for edit or new
  useEffect(() => {
    if (customerObject && customerObject.id) {
      setFormData({
        ...customerObject,
        cityid: customerObject.cityid || null,
        currencyid: customerObject.currencyid || null,
        sameas: customerObject.sameas ?? false,
        active: customerObject.active ?? true
      });
      setIsEdit(true);
      // if editing, fetch contacts for this customer
      if (customerObject.id) {
        fetchContacts(customerObject.id);
      }
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerObject]);

 useEffect(() => {
  if (!citys.length) fetchCities();
  if (!currencies.length) fetchCurrencies();
  if (!states.length) fetchStates(); 
}, [citys.length, currencies.length, states.length,companies.length]);


  // Generic change handler (handles checkboxes and text/select)
  const handleChange = (e) => {
    const { name, type } = e.target;
    const value = type === "checkbox" ? e.target.checked : e.target.value;

    // auto set country when state changes
    if (name === "stateid") {
      const selectedState = states.find(s => Number(s.id) === Number(value));
      const countryid = selectedState ? selectedState.countryid : "";
      setFormData(prev => ({ ...prev, stateid: value ? Number(value) : null, countryid: countryid || null }));
      return;
    }

    if (name === "shipping_stateid") {
      const selectedState = states.find(s => Number(s.id) === Number(value));
      const countryid = selectedState ? selectedState.countryid : "";
      setFormData(prev => ({ ...prev, shipping_stateid: value ? Number(value) : null, shipping_countryid: countryid || null }));
      return;
    }

    // handle radio & other inputs
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSameAsBilling = (e) => {
    const checked = e.target.checked;

    setFormData(prev => ({
      ...prev,
      sameas: checked,
      shipping_address1: checked ? prev.address1 : "",
      shipping_address2: checked ? prev.address2 : "",
      shipping_cityid: checked ? prev.cityid : null,
      shipping_stateid: checked ? prev.stateid : null,
      shipping_countryid: checked ? prev.countryid : null,
      shipping_pincode: checked ? prev.pincode : "",
    }));
  };

  const fetchContacts = useCallback(async (customerid) => {
    try {
      const url = `${API_URL}/getcustcontacts/${customerid}`;
      const res = await authFetch(url, { headers: { Authorization: `Bearer ${acessToken}` } });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const custdtl = data.custdtl || [];
      const custhdr = data.custhdr || {};

      const newContacts = custdtl.length > 0
        ? custdtl.map((p, idx) => ({
            ...p,
            key: idx + 1,
            customerid: p.customerid || custhdr?.id || customerid,
            selected: false,
            rowno: idx + 1
          }))
        : [{
            key: 1,
            contact_type: "",
            contact_person: "",
            contact_mobile: "",
            contact_phone: "",
            contact_email: "",
            selected: false,
            rowno: 1,
            customerid: customerid
          }];

      setContacts(newContacts);
      // reset selectAll
      setSelectAll(false);
    } catch (err) {
      console.error("❌ Error in fetchContacts:", err);
      setContacts([{
        key: 1,
        contact_type: "",
        contact_person: "",
        contact_mobile: "",
        contact_phone: "",
        contact_email: "",
        selected: false,
        rowno: 1,
        customerid: null
      }]);
    }
  }, [acessToken, authFetch, API_URL]);

  // Contacts helpers
  const addContactsRow = () => {
    setContacts(prev => [
      ...prev,
      {
        key: prev.length + 1,
        contact_type: "",
        contact_person: "",
        contact_mobile: "",
        contact_phone: "",
        contact_email: "",
        selected: false,
        rowno: prev.length + 1
      }
    ]);
  };

  const handleContactsChange = (index, field, value) => {
    setContacts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleSelectPeriod = (idx) => {
    setContacts(prev => {
      const updated = prev.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c));
      setSelectAll(updated.every(c => c.selected));
      return updated;
    });
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setContacts(prev => prev.map(p => ({ ...p, selected: checked })));
  };

  const handleDeletecontacts = () => {
    const remaining = contacts.filter(p => !p.selected);
    if (remaining.length === 0) {
      alert("At least 1 contact must remain!");
      return;
    }
    setContacts(remaining);
    setSelectAll(false);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.customername) {
      setMessage("Please fill in the Customer name.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        companyid: cid,
        companyno: cno || "",
        companyname: formData.companyname || companyname || "",
        customer_type: formData.customer_type,
        customername: formData.customername,
        contactperson: formData.contactperson,
        currencyid: formData.currencyid ? Number(formData.currencyid) : null,
        customer_phone: formData.customer_phone,
        customer_mobile: formData.customer_mobile,
        customer_email: formData.customer_email,
        customer_website: formData.customer_website,
        address1: formData.address1,
        address2: formData.address2,
        cityid: formData.cityid ? Number(formData.cityid) : null,
        stateid: formData.stateid ? Number(formData.stateid) : null,
        countryid: formData.countryid ? Number(formData.countryid) : null,
        pincode: formData.pincode,
        shipping_address1: formData.shipping_address1,
        shipping_address2: formData.shipping_address2,
        shipping_cityid: formData.shipping_cityid ? Number(formData.shipping_cityid) : null,
        shipping_stateid: formData.shipping_stateid ? Number(formData.shipping_stateid) : null,
        shipping_countryid: formData.shipping_countryid ? Number(formData.shipping_countryid) : null,
        shipping_pincode: formData.shipping_pincode,
        gsttype: formData.gsttype,
        gstin: formData.gstin,
        placeof_supply: formData.placeof_supply,
        sameas: formData.sameas,
        active: formData.active,
        createdby: formData.createdby || uname,
        modifiedby: formData.modifiedby || uname,
        contacts: contacts.map(c => ({
            id: c.id || null,                // important for update
            customerid: c.customerid || formData.id,
            contact_type: c.contact_type,
            contact_person: c.contact_person,
            contact_mobile: c.contact_mobile||null,
            contact_phone: c.contact_phone||null,
            contact_email: c.contact_email||null,
            active: true,
             rowno: c.rowno 
          }))
      };

      const endpoint = isEdit ? `${API_URL}/updatecustomer/${formData.id}` : `${API_URL}/addcustomer/`;

      const res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${acessToken}`},
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        let errData;
        try { errData = JSON.parse(text); } catch { errData = null; }
        throw errData?.detail || new Error(`HTTP error ${res.status}`);
      }

      const savedCustomereader = await res.json();
      setFormData(prev => ({ ...prev, id: savedCustomereader.id }));

      // refresh contacts from server
      await fetchContacts(savedCustomereader.id);
      console.log(contacts);

      setMessage("Customer Header and Contacts Details saved successfully!");
      if (typeof onSaved === "function") onSaved();
      onClose?.();
    } catch (err) {
      console.error("Error saving customer:", err);
      setMessage(err?.message || "Failed to save customer.");
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
        <h4 className="mb-0">{isEdit ? "Edit Customer" : "New Customer"}</h4>
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
            {/* <div className="col-md-3">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-control" name="companyname" readOnly value={formData.companyname || "Loading..."} onChange={handleChange} style={{ width: "200px" }} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Company No</label>
              <input type="text" className="form-control" name="companyno" readOnly value={formData.companyno || "Loading..."} onChange={handleChange} style={{ width: "100px" }} />
            </div> */}
            <div className="col-md-6">
               <br />
              <div className="d-flex gap-3">               
                <label className="d-flex align-items-center gap-2 cursor-pointer">                  
                  <input type="radio" name="customer_type" value="Customer" checked={formData.customer_type === "Customer"} onChange={handleChange} />
                  <span>Customer</span>
                </label>
                <label className="d-flex align-items-center gap-2 cursor-pointer">
                  <input type="radio" name="customer_type" value="Individual" checked={formData.customer_type === "Individual"} onChange={handleChange} />
                  <span>Individual</span>
                </label>               
            </div>
          </div>
          </div> 
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Customer Name</label>
              <input type="text" className="form-control" name="customername" value={formData.customername} onChange={handleChange}   />
            </div>
            <div className="col-md-2">
              <label className="form-label">Contact Person</label>
              <input type="text" className="form-control" name="contactperson" value={formData.contactperson} onChange={handleChange} style={{ width: "350px" }} />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-2">
              <label className="form-label">Customer Mobile</label>
              <input type="text" className="form-control" name="customer_mobile" value={formData.customer_mobile} onChange={handleChange}   />
            </div>
            <div className="col-md-2">
              <label className="form-label">Customer Phone</label>
              <input type="text" className="form-control" name="customer_phone" value={formData.customer_phone} onChange={handleChange}   />
            </div>
            <div className="col-md-4">
              <label className="form-label">Customer Email</label>
              <input type="text" className="form-control" name="customer_email" value={formData.customer_email} onChange={handleChange} style={{ width: "350px" }} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Customer WebSite</label>
              <input type="text" className="form-control" name="customer_website" value={formData.customer_website} onChange={handleChange} style={{ width: "350px" }} />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">GST Type</label>
              <Select
                options={gstOptions}
                value={gstOptions.find(opt => opt.value === formData?.gsttype) || null}
                onChange={(selectedGst) => setFormData(prev => ({ ...prev, gsttype: selectedGst?.value }))}
                placeholder="-- Select GST Type--"
                isClearable
                isSearchable
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">GST No</label>
              <input type="text" className="form-control" name="gstin" value={formData.gstin} onChange={handleChange}  />
            </div>
            <div className="col-md-3">
              <label className="form-label">Currency</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Select
                options={currencyOptions}
                value={currencyOptions.find(opt => opt.value === formData?.currencyid) || null}
                onChange={(selected) => setFormData(prev => ({ ...prev, currencyid: selected?.value }))}
                placeholder="Choose Currency"
                isClearable
                isSearchable      
              />
              <button onClick={ () => handleModalCurrency(true)}
                style={{
                  padding: "4px 12px",
                  fontSize: "16px",
                  cursor: "pointer",
                  height: "38px", // matches typical react-select height
                }}
              >
                +
              </button>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label">Place of Supply</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Select
                options={supplyOptions}
                value={supplyOptions.find(opt => opt.label === formData?.placeof_supply) || null}
                onChange={(selectedSupply) => setFormData(prev => ({ ...prev, placeof_supply: selectedSupply?.label  }))}
                placeholder="-- Select Place of Supply--"
                isClearable
                isSearchable                
              />
              <button onClick={ () => handleModalState(true)}
                style={{
                  padding: "4px 12px",
                  fontSize: "16px",
                  cursor: "pointer",
                  height: "38px", // matches typical react-select height
                }}
              >
                +
              </button>
            </div>
            </div> 
          </div> 
          <div className="row mb-3"> 
            <div className="col-md-2 d-flex align-items-center">
              <input type="checkbox" className="form-check-input me-2" name="active" checked={formData.active} onChange={handleChange} />
              <label className="form-check-label">Active</label>
            </div>
          </div>
        </header>

        {/* ===== Address, Contacts Tabs ===== */}
        <ul className="nav nav-tabs mt-3" role="tablist">
          <li className="nav-item" role="presentation">
            <button className={`nav-link ${activeTab === "address" ? "active" : ""}`} type="button" style={{ backgroundColor: "#ebe6e6ff" }} onClick={() => setActiveTab("address")}>Address</button>
          </li>
          <li className="nav-item" role="presentation">
            <button className={`nav-link ${activeTab === "contacts" ? "active" : ""}`} type="button" onClick={() => setActiveTab("contacts")}>Contacts</button>
          </li>
        </ul>

        <div className="tab-content mt-3">
           {activeTab === "address" && (
    <div
      className="tab-pane fade show active p-3"
      style={{
        backgroundColor: "#f7f7f7",
        border: "1px solid #ced4da",
        borderRadius: "4px",
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5>Billing & Shipping Address</h5>
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={formData.sameas || false}
            id="sameAs"
            onChange={handleSameAsBilling}
          />
          <label className="form-check-label ms-1" htmlFor="sameAs">
            Same as Billing
          </label>
        </div>
      </div>

      <div className="row">
        {/* ---------------- BILLING ADDRESS ---------------- */}
        <div className="col-md-6 border-end">
          <h6>Billing Address</h6>
          <div className="row">
            <div className="col-md-6 mb-2">
              <label>Address 1</label>
              <input
                type="text"
                className="form-control"
                name="address1"
                value={formData.address1 || ""}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6 mb-2">
              <label>Address 2</label>
              <input
                type="text"
                className="form-control"
                name="address2"
                value={formData.address2 || ""}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6 mb-2">
              <label>City</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                className="form-select"
                name="cityid"
                value={formData.cityid ?? ""}
                onChange={handleChange}
              >
                <option value="">-- Select City --</option>
                {citys.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.cityname}
                  </option>
                ))}
              </select>
              <button onClick={ () => handleModalCity(true)}
                style={{
                  padding: "4px 12px",
                  fontSize: "16px",
                  cursor: "pointer",
                  height: "38px", // matches typical react-select height
                }}
              >
                +
              </button> 
              </div>
            </div>

            <div className="col-md-6 mb-2">
              <label>State</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                className="form-select"
                name="stateid"
                value={formData.stateid ?? ""}
                onChange={handleChange}
              >
                <option value="">-- Select State --</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.statename}
                  </option>
                ))}
              </select>
              <button onClick={ () => handleModalState(true)}
                style={{
                  padding: "4px 12px",
                  fontSize: "16px",
                  cursor: "pointer",
                  height: "38px", // matches typical react-select height
                }}
              >
                +
              </button> 
              </div>
            </div>

            <div className="col-md-6 mb-2">
              <label>Country</label>
              <select
                className="form-select"
                name="countryid"
                value={formData.countryid ?? ""}
                onChange={handleChange}
                disabled
              >
                <option value="">-- Select Country --</option>
                {(states || []).map((c,i) => (
                  <option key={`${c.countryid}-${i}`} value={c.countryid}>
                    {c.countryname}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label>Pincode</label>
              <input
                type="text"
                className="form-control"
                name="pincode"
                value={formData.pincode || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ---------------- SHIPPING ADDRESS ---------------- */}
        <div className="col-md-6">
          <h6>Shipping Address</h6>
          <div className="row">
            <div className="col-md-6 mb-2">
              <label>Address 1</label>
              <input
                type="text"
                className="form-control"
                name="shipping_address1"
                value={formData.shipping_address1 || ""}
                onChange={handleChange}
                disabled={formData.sameas}
              />
            </div>
            <div className="col-md-6 mb-2">
              <label>Address 2</label>
              <input
                type="text"
                className="form-control"
                name="shipping_address2"
                value={formData.shipping_address2 || ""}
                onChange={handleChange}
                disabled={formData.sameas}
              />
            </div>

            <div className="col-md-6 mb-2">
              <label>City</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                className="form-select"
                name="shipping_cityid"
                value={formData.shipping_cityid ?? ""}
                onChange={handleChange}
                disabled={formData.sameas}
              >
                <option value="">-- Select City --</option>
                {citys.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.cityname}
                  </option>
                ))}
              </select>
              <button onClick={ () => handleModalCity(true)}
                style={{
                  padding: "4px 12px",
                  fontSize: "16px",
                  cursor: "pointer",
                  height: "38px", // matches typical react-select height
                }}
              >
                +
              </button> 
            </div>
            </div>

            <div className="col-md-6 mb-2">
              <label>State</label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                className="form-select"
                name="shipping_stateid"
                value={formData.shipping_stateid ?? ""}
                onChange={handleChange}
                disabled={formData.sameas}
              >
                <option value="">-- Select State --</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.statename}
                  </option>
                ))}
              </select>
              <button onClick={ () => handleModalState(true)}
                style={{
                  padding: "4px 12px",
                  fontSize: "16px",
                  cursor: "pointer",
                  height: "38px", // matches typical react-select height
                }}
              >
                +
              </button> 
            </div>
            </div>

            <div className="col-md-6 mb-2">
              <label>Country</label>
              <select
                className="form-select"
                name="shipping_countryid"
                value={formData.shipping_countryid ?? ""}
                onChange={handleChange}
                disabled
              >
                <option value="">-- Select Country --</option>
                {(states || []).map((c,i) => (
                  <option key={`${c.countryid}-${i}`} value={c.countryid}>
                    {c.countryname}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label>Pincode</label>
              <input
                type="text"
                className="form-control"
                name="shipping_pincode"
                value={formData.shipping_pincode || ""}
                onChange={handleChange}
                disabled={formData.sameas}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

          {activeTab === "contacts" && (
            <div className="tab-pane fade show active p-2" style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "1px" }}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-secondary" onClick={addContactsRow}><i className="bi bi-plus-lg"></i></button>
                  <button type="button" className="btn btn-danger" onClick={handleDeletecontacts}><i className="bi bi-trash3"></i></button>
                </div>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto", overflowX: "auto", border: "1px solid #ced4da", position: "relative" }}>
                <table className="table table-bordered mb-0" style={{ minWidth: "800px" }}>
                  <thead className="table-light">
                    <tr>
                      <th><input type="checkbox" checked={selectAll} onChange={(e) => handleSelectAll(e.target.checked)} /></th>
                      <th>Sl.No.</th>
                      <th>Contact Type</th>
                      <th>Contact Person</th>
                      <th>Contact Mobile</th>
                      <th>Contact Phone</th>
                      <th>Contact Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((p, idx) => (
                      <tr key={p.key}>
                        <td><input type="checkbox" checked={p.selected || false} onChange={() => toggleSelectPeriod(idx)} /></td>
                        <td>{p.rowno ?? idx + 1}</td>
                        <td>
                          <input type="text" className="form-control" value={p.contact_type} onChange={(e) => handleContactsChange(idx, "contact_type", e.target.value)} required />
                        </td>
                        <td>
                          <input type="text" className="form-control" value={p.contact_person} onChange={(e) => handleContactsChange(idx, "contact_person", e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control" value={p.contact_mobile} onChange={(e) => handleContactsChange(idx, "contact_mobile", e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control" value={p.contact_phone} onChange={(e) => handleContactsChange(idx, "contact_phone", e.target.value)} />
                        </td>
                        <td>
                          <input type="text" className="form-control" value={p.contact_email} onChange={(e) => handleContactsChange(idx, "contact_email", e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}><FaSave className="me-1" /> {loading ? "Saving.." : isEdit ? "Update" : "Save"}</button>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}><FaTimes className="me-1" /> Cancel</button>
        </div>
      </form>

      <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl={`${API_URL}/customer/search/${defaultcompanyid}`}
        columns={[
          { field: "customername", label: "Customer Name" },
          { field: "active", label: "active" }
        ]}
        searchFields={[
          { value: "customername", label: "Customer Name" },
          { value: "active", label: "active" }
        ]}
        onSelect={(fin) => {
          setFormData({ ...fin });
          setCustomerObject(fin);
          setIsEdit(true);
          setShowModal(false);
        }}
      />
    {/* ✅ State Modal */}
      {showModalCity && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New State</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModalCity(false)}></button>
                </div>
                <div className="modal-body">
                  <CityForm
                    onSaved={() => {
                      fetchCities();
                      setShowModalCity(false);
                    }}
                    onClose={() => setShowModalCity(false)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowModalCity(false)}></div>
        </>
      )}

      {/* ✅ State Modal */}
      {showModalState && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New State</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModalState(false)}></button>
                </div>
                <div className="modal-body">
                  <StateForm
                    onSaved={() => {
                      fetchStates();
                      setShowModalState(false);
                    }}
                    onClose={() => setShowModalState(false)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowModalState(false)}></div>
        </>
      )}

      {/* ✅ State Modal */}
      {showModalCurrency && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Currency</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModalCurrency(false)}></button>
                </div>
                <div className="modal-body">
                  <CurrencyForm
                    onSaved={() => {
                      fetchCurrencies();
                      setShowModalCurrency(false);
                    }}
                    onClose={() => setShowModalCurrency(false)}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowModalCurrency(false)}></div>
        </>
      )}

    </div>
  );
}

export default CustomerForm;
