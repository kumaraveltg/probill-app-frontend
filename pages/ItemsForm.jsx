import { useState, useEffect, useContext ,useMemo} from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import DataContext, { useData } from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../components/Config";
import SearchModal from "../components/SearchModal";
import Select from "react-select";
import { NumericFormat } from 'react-number-format';

function ItemsForm({ onClose,onSaved, itemsObject,setItemsObject,navigateToList,handleDelete }) {
  const { fetchItems, items,companyname, companyid  } = useContext(DataContext);
  const { acessToken, authFetch,username: ctxUsername,companyid: defaultcompanyid,companyno:defaultCompanyno} = useContext(AuthContext);
  const [formData, setFormData] = useState({
    id: null,
    companyid:  defaultcompanyid,
    companyname: companyname ?? "" ,
    companyno: defaultCompanyno,
    productcode: "",
    productname: "",
    productspec:"",
    selling_uom:0,
    purchase_uom:0,
    suom:"",
    puom:"",
    hsncode:"",
    taxmasterid:0, 
    taxname:0,
    taxrate:0,
    selling_price:0,
    cost_price:0,
    active: true,
    createdby: "",
    modifiedby: ""
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");  
  const{uoms,fetchUoms,taxmaster,fetchTaxMaster,hsn,fetchHsn} = useData();
  const [selectedTax, setSelectedTax] = useState('');
  const [selectedUom, setSelectedUom] = useState('');

  const fallbackParams = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const uname = ctxUsername || fallbackParams.username || "admin";
  const cid = defaultcompanyid || fallbackParams.companyid || null;
  const cno = defaultCompanyno || fallbackParams.companyno || "";  
 
  const uomOptions = useMemo(() => {
    return uoms.map((uom) => ({
      value: uom.id,           // or uom.unit_code if that's what you need
      label: uom.uomcode     // This is what displays in the dropdown
    }));
  }, [uoms]); 
 
   const taxOptions = useMemo(() => {
    return taxmaster.map((tm) => ({
      value: tm.id,           // or uom.unit_code if that's what you need
      label: tm.taxname,
      ttaxrate:tm.taxrate,   // This is what displays in the dropdown
    }));
  }, [taxmaster]);

  const hsnOptions = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = hsn.filter((h) => {
    const fromDate = new Date(h.from_date);
    const toDate = new Date(h.to_date || today);

    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999); // include end date fully

    const isValid = fromDate <= today && today <= toDate;

    // ✅ Debug line for each record
    console.log(
      `HSN ${h.hsncode}: from=${h.from_date}, to=${h.to_date}, include=${isValid}`
    );

    return isValid;
  });

  // ✅ Debug final filtered list
  console.log("Filtered HSN records:", filtered);

  const options = filtered.map((h) => ({
    value: h.id,
    label: h.hsncode,
  }));

  // ✅ Debug final dropdown options
  console.log("HSN dropdown options:", options);

  return options;
}, [hsn]);
   

  useEffect(() => {
      fetchUoms();
      fetchTaxMaster(); 
      fetchHsn();
    }, [fetchUoms,fetchTaxMaster,fetchHsn]); 
 
  

  const resetForm = () => {
  let defaultCompanyName = "Default Company";

  if (Array.isArray(items)) {
    const match = items.find(
      (c) => c.companyid === (companyid ?? defaultcompanyid)
    );
    console.log("Matched company:", match);
    if (match) {
      defaultCompanyName = match.companyname; 
    }
  }

  setFormData({
    id: null,
    companyid: cid,
    companyname: companyname ?? defaultCompanyName,
    companyno: cno,
    productcode: "",
    productname: "",
    productspec: "", // ✅ fixed typo
    selling_uom: null,
    purchase_uom: null,
    suom: "",
    puom: "",
    hsncode: "",
    taxmasterid:0,
    taxname: null,
    taxrate: 0,
    selling_price: 0,
    cost_price: 0,
    active: true,
    createdby: uname,
    modifiedby: uname,
  });

  setIsEdit(false);
  setMessage("");
};

useEffect(() => {
  if (itemsObject && itemsObject.id) {
    setFormData({
      ...itemsObject,
      selling_uom:  itemsObject.selling_uom  || null,
      purchase_uom:  itemsObject.purchase_uom  || null,
      taxname: itemsObject.taxmasterid ??  null, 
      hsncode: itemsObject.hsncode ??"",
    });
    console.log("taxname",itemsObject.taxmasterid);
    setIsEdit(true);
  } else if (itemsObject === null || itemsObject === undefined) {
    resetForm();
  }
}, [itemsObject, uomOptions, taxOptions ]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!formData.productcode || !formData.productname) {
      setMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        companyid: Number(formData.companyid),
        companyname: formData.companyname || "",
        companyno: formData.companyno||"",
        productcode: formData.productcode,
        productname: formData.productname,
        productspec:formData.productspec,
        selling_uom:Number(formData.selling_uom),
        purchase_uom:Number(formData.purchase_uom),
        suom:formData.suom,
        puom:formData.puom,
        hsncode:formData.hsncode,
        taxname:Number(formData.taxname),
        taxrate:formData.taxrate,
        selling_price:formData.selling_price,
        cost_price:formData.cost_price,
        active: formData.active,
        createdby:  uname,
        modifiedby: uname
      };

      const method = "POST"
      const endpoint = isEdit ? `${API_URL}/productupdate/${formData.id}` : `${API_URL}/productcreate/`;

      console.log("Sending payload:", payload);

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Handle array of validation errors or detail
        if (Array.isArray(errorData)) {
          throw errorData;
        } else if (errorData?.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
      }
      await res.json();
      onSaved();
      onClose();
    } catch (err) {
      console.error("Error While Saving UOM:", err); 

      if (Array.isArray(err)) {
        // Backend returned multiple errors
        const messages = err.map(e => e?.msg || JSON.stringify(e)).join(", ");
        setMessage(messages);
      } else if (err?.message) {
        setMessage(err.message);
      } else {
        setMessage("Failed to save UOM.");
      }

    } finally {
      setLoading(false);
    }
  };

 const handleDeleteClick= ()=>{
    if(itemsObject?.id){
        handleDelete(itemsObject.id);
        resetForm();
        setItemsObject(null);     
    }
    else
    {
        alert("No Items Selected")
    }
 }
  
 const columns = [
    { field: "productcode", label: "Product Code" },
    { field: "productname", label: "Product Name" },
    { field:"productspec",label:"Product Specification"},
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    
  ];

  const searchFields = [
    { value: "productcode", label: "Product Code" },
    { value: "productname", label: "Product Name" },
    { value: "productspec", label: "Product Specification" },
    { value: "active", label: "Active" }, 
  ];


  return (
    <div className="card w-100">
      <div className="d-flex justify-content-between align-items-center w-100"
           style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}>
        <h4 className="mb-0">{isEdit ? "Edit Product" : "New Product"}</h4>
        {navigateToList && (<div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            <i className="bi bi-plus-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}>
            <i className="bi bi-dash-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)}>
            <i className="bi bi-search"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={()=>{
            console.log("Navigating to List");
            if(navigateToList) {navigateToList();
            }}} >
            <i className="bi bi-list"></i>
          </button>
        </div>)}
      </div>

      <div className="card p-3 border border-secondary w-100" style={{ backgroundColor: "#ebe6e6ff" }}>
        {message && <div className="alert alert-danger">{message}</div>}
        <form onSubmit={handleSubmit}>
          {/* <div className="row mb-3">
         <div className="col-md-4">
          <label className="form-label">Company Name</label>
          <input type="text" className="form-control" name="companyname"
          readOnly
                 value={formData.companyname} onChange={handleChange}  />
        </div>
        <div className="col-md-7">
          <label className="form-label">Company No</label>
          <input type="text" className="form-control" name="companyno"
          readOnly
                 value={formData.companyno} onChange={handleChange} style={{ width: "200px" }}  />
        </div>
        </div> */}
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">Item Code *</label>
            <input type="text" className="form-control" name="productcode"
                   value={formData.productcode} onChange={handleChange} style={{ width: "200px" }} />
          </div>

          <div className="col-md-4">
            <label className="form-label">Item Name *</label>
            <input type="text" className="form-control" name="productname"
                   value={formData.productname} onChange={handleChange} style={{ width: "400px" }} />
          </div>  
          <div className="col-md-3">
            <label className="form-label">Item Specification </label>
            <textarea className="form-control" name="productspec"
                   value={formData.productspec} onChange={handleChange} rows={5} style={{ width: "500px" ,resize:"none"}} />
          </div>        
         </div>
         
          <div className="row mb-3">
        <div className="col-md-2">
            <label className="form-label">Selling UOM</label>
                <Select
                options={uomOptions}
                value={uomOptions.find(opt => opt.value === formData?.selling_uom) || null}
                onChange={(selectedUom) =>
                    setFormData({ ...formData, selling_uom: selectedUom?.value||null })
                }
                placeholder="Select UOM Code"
                isClearable
                isSearchable 
            />
        </div>

        <div className="col-md-2">
            <label className="form-label">Purchase UOM</label>
            <Select
            options={uomOptions}
            value={uomOptions.find(opt => opt.value === formData?.purchase_uom) || null}
            onChange={(selectedUom) =>
                setFormData({ ...formData, purchase_uom: selectedUom?.value ||null })
            }
            placeholder="Select UOM"
            isClearable
            isSearchable 
            styles={{width:"125px"}}
            />
        </div>
        <div className="col-md-2">
            <label className="form-label">Selling Price </label>
          <NumericFormat
          name="selling_price"
          value={formData.selling_price}
          thousandSeparator={true}
          decimalScale={2}
          fixedDecimalScale={true}
          className="form-control"
          style={{ width: "125px" }}
          onValueChange={(values) => {
            const { floatValue } = values;
            setFormData({ ...formData, selling_price: floatValue || 0 });
          }}
          />
          </div> 
          <div className="col-md-2">
            <label className="form-label">Cost Price </label> 
          <NumericFormat
          name="cost_price"
          value={formData.cost_price}
          thousandSeparator={true}
          decimalScale={2}
          fixedDecimalScale={true}
          className="form-control"
          style={{ width: "125px" }}
          onValueChange={(values) => {
            const { floatValue } = values;
            setFormData({ ...formData, cost_price: floatValue || 0 });
          }}
          />
          </div>
          <div className="col-md-3">
            <label className="form-label">Hsn Code</label>
            <Select options={hsnOptions}   
                   value={hsnOptions.find(opt=> opt.label === formData?.hsncode)|| ""} 
                   onChange={(selectedHsn) => setFormData({...formData,hsncode:selectedHsn?.label})}   />
          </div> 
        </div>
         <div className="row mb-3"> 
          
            
         </div>
         <div className="row mb-3">
            <div className="col-md-2">
            <label className="form-label">Tax Name</label>
            <Select
            options={taxOptions}
            value={taxOptions.find(opt => opt.value === formData?.taxname) || null}
            onChange={(selectedTax) =>
                setFormData({ ...formData, taxname: selectedTax?.value,
                    taxrate: selectedTax?.ttaxrate
                 })
            }
            placeholder="Select Tax Name"
            isClearable
            isSearchable           
            />  
          </div> 
          <div className="col-md-2">
            <label className="form-label">TaxRate</label>
            <input type="number" className="form-control" name="taxrate"
                   value={formData.taxrate} onChange={selectedTax} 
                   readOnly
                   />
          </div> 
           <div className="col-md-8">
            <br />
            <br />
            <input type="checkbox" className="form-check-input" name="active"
                   checked={formData.active} onChange={handleChange} />
            <label className="form-check-label">Active</label>
          </div>
         </div>

         

          <div>
            <button type="submit" className="btn btn-primary me-2" disabled={loading}>
              <FaSave className="me-1" /> {loading ? "Saving.." :isEdit? "Update" : "Save" }
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              <FaTimes className="me-1" /> Cancel
            </button>
          </div>
        </form>
      </div>
      <SearchModal
      show={showModal}
      onClose={()=>setShowModal(false)}
      apiUrl={`${API_URL}/product/search/${defaultcompanyid}`}
      columns={columns}
      searchFields={searchFields}
        onSelect={(i) => {
        const formated= { ...i,   taxmasterid: i.taxmasterid }
        console.log("taxname",formated.taxmasterid);
        setFormData(formated); // update form
        setItemsObject(i);      
        setIsEdit(true);
        setShowModal(false);
        }}
    />
        </div>
  );
}

export default ItemsForm;
