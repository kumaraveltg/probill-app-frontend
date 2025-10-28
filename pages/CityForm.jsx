  
 import { useState,useEffect,useContext } from 'react';
 import  DataContext   from '../context/DataContext';
 import { API_URL } from '../components/Config';
 import Select from 'react-select';
 import SearchModal from '../components/SearchModal';
 import { useMemo } from 'react';
 import ModalOpen from '../components/ModalOpen';
 import StateForm from '../pages/State'; 
 import StateModalForm from '../pages/StateModalForm';

// City Form Component
function CityForm({ cityValueEdit, onClose, onSaved, navigateToList, handleDelete }) {
  const { states  } = useContext(DataContext);
  const [loading, setLoading] = useState(false);
  const [addedStates,setAddedStates]= useState([]); // to refresh state list after adding new state
  const [isStateModalOpen, setIsStateModalOpen] = useState(false); // State Modal
  const [formData, setFormData] = useState({
      id: cityValueEdit?.id ?? null,
    citycode: cityValueEdit?.citycode ?? "",
    cityname: cityValueEdit?.cityname ?? "",
    stateid: cityValueEdit?.stateid ?? "",
    countryid: cityValueEdit?.countryid ?? "",
    statename: cityValueEdit?.statename ?? "",
    countrycode: cityValueEdit?.countrycode ?? "",
    statecode: cityValueEdit?.statecode ?? "",
    countryname: cityValueEdit?.countryname ?? "",
    active: cityValueEdit?.active ?? true,
    createdby: cityValueEdit?.createdby ?? "Admin",  });
    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState("");
    
    
   const stateOptions = useMemo(() => 
  [...states, ... addedStates  ].map(s => ({
    value: s.id,
    label: s.statename,
    code: s.statecode,
    countryid: s.countryid,
    countryname: s.countryname,
    countrycode: s.countrycode
  }))
, [states,addedStates ]); // Recompute when states or addedStates change
    
   
    
    const handleStateSave= (newState)=>{     
      if (!newState) return;  
      setFormData((prev)=>({
        ...prev,
      stateid: newState.id ||null,
      statename: newState.statename||"",
      statecode: newState.statecode||"",
      countryid: newState.countryid||null,
      countryname: newState.countryname||"",
      countrycode: newState.countrycode||"",
      }));
      setAddedStates((prev)=>[...prev,newState]); // to refresh state dropdown
       
      
      if (typeof fetchStates === "function") {
        fetchStates();
        }
    
      setIsStateModalOpen(false);
   
    };

     useEffect(() => {
       console.log("StateForm Modal Open Status:", isStateModalOpen);
      }, [isStateModalOpen]);   
 
  

    // For Edit the City form data
    useEffect(() => {       
      if (cityValueEdit ) {
        const selectedState = stateOptions.find(s => s.value === Number(cityValueEdit.stateid));
         formData &&( setFormData({
          id: cityValueEdit.id, 
          citycode: cityValueEdit.citycode,
          cityname: cityValueEdit.cityname,
          stateid: selectedState?.value||null,
          countryid: selectedState?.countryid ||null,
          statecode: selectedState?.code||"",
          statename: selectedState?.label||"",  
          countryname: selectedState?.countryname||"",
          countrycode: selectedState?.countrycode||"",
          active: cityValueEdit.active,
          createdby: cityValueEdit.createdby || "Admin",
        }));
        return;
      } else {
        setFormData({
          id: null, 
          citycode: "",
          cityname: "",
          stateid: "",  
          countryid: "",
          statename: "",  
          statecode: "",
          countrycode: "",
          countryname: "",
          active: true,
          createdby: "admin",
          modifiedby: "admin",
        });
      } 
    }, [cityValueEdit, stateOptions]);

    


//  dropdown handlers
  const handleStateChange = (selectedOption) => {
  if (!selectedOption) {
    // if the user clears the selection
    setFormData({
      ...formData,
      stateid: "",
      statename: "",
      statecode: "",
      countryid: "",
      countryname: "",
      countrycode: "",
          });
    return;
  }   
  setFormData({
    ...formData,
    stateid: selectedOption.value,
    statename: selectedOption.label,
    statecode: selectedOption.code, // assuming you stored code in option
    countryid: selectedOption.countryid ,
    countryname: selectedOption.countryname ,
    countrycode: selectedOption.countrycode,
  });
};

       
    // Form input change handler
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;  
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    };
    // Form submission handler
    const handleSubmit = async (e) => {
      e.preventDefault(); 
      if (!formData.citycode || !formData.cityname || !formData.stateid) {
        setMessage("Please fill in all required fields.");
        return;
      }
      try {
        setLoading(true);
        const method = "POST"; 
        const url = formData.id ? `${API_URL}/cityupdate/${formData.id}` : `${API_URL}/city/`;
        const res = await fetch(url, {
          method,
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify( 
              {
              citycode: formData.citycode,
              cityname: formData.cityname,  
              stateid: formData.stateid,
              countryid: formData.countryid,
              active: formData.active,
              createdby: "admin",
              modifiedby: "Admin"
            }          
          ),
        }); 
        if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || `Http error! Status: ${res.status}`);
          }
          await res.json();
          onSaved();
          onClose();
        } catch (err) {
          console.error("Error while Saving State:", err);
          setMessage(err.message || "Failed to Save State");
        } finally {
          setLoading(false);
        }
      };
 const handleDeleteClick = () => {
    if (cityValueEdit?.id) {
      handleDelete(cityValueEdit.id);
      setFormData({
        id: null,
      citycode: "",
      cityname: "",
      stateid: "",
      countryid: "",
      statename: "",
      statecode: "",
      countrycode: "",
      countryname: "",
      active: true,
      createdby: "Admin",
      modifiedby: "Admin",
    });
    } else {
      alert("No City selected to delete!");
    }
  };  
     
  // reuseable modal component
    const columns = [
    { field: "citycode", label: "City Code" },
    { field: "cityname", label: "City Name" },
    { field: "statename", label: "State Name" },
    { field: "active", label: "Active", render: (val) => (val ? "Yes" : "No") },
    { field: "countryname", label: "Country Name" },
    ];
   const searchFields =[
    { value: "citycode", label: "City Code" },
    { value: "cityname", label: "City Name" },
    { value: "statename", label: "State Name" },  
    { value: "countryname", label: "Country Name" },
    {value:"active", label:"Active"}
    ];
  return (
    <div className="card w-100">
      {/* Header Toolbar */}
      <div
        className="d-flex justify-content-between align-items-center w-100"
        style={{ backgroundColor: "#ebe6e6ff", border: "1px solid #ced4da", borderRadius: "5px" }}
      >
        <h4 className="mb-0">{cityValueEdit ? "Edit City" : "New City"}</h4>
        <div className="btn-toolbar gap-2" role="toolbar">
          <button type="button" className="btn btn-secondary" onClick={setFormData}>
                      <i className="bi bi-plus-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleDeleteClick}>
            <i className="bi bi-dash-lg"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)}>
            <i className="bi bi-search"></i>
          </button>
          <button type="button" className="btn btn-secondary" onClick={navigateToList}>
            <i className="bi bi-list"></i>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="card p-3 border border-secondary w-100" style={{ backgroundColor: "#ebe6e6ff" }}>
        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="required" htmlFor="citycode">City Code</label>
            <input
              type="text"
              name="citycode"
              className="form-control"
              value={formData?.citycode ||""}
              onChange={handleChange}
              required
              style={{ width: "150px" }}
               
            />
          </div>

          <div className="mb-3">
            <label className="required" htmlFor="cityName">City Name</label>
            <input
              type="text"
              name="cityname"
              className="form-control"
              value={formData?.cityname ||""}
              onChange={handleChange}
              required
              style={{ width: "350px" }}
            />
          </div>
            <div className="mb-3">
              <label className='required' htmlFor='statename'  >State Name</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "300px" }}>
                <Select
                  options={stateOptions}
                  value={stateOptions.find(opt => opt.value === formData?.stateid) || null}
                  onChange={handleStateChange}
                  placeholder="-- Select State --"
                  isClearable
                  isSearchable
                  required
                  filterOption={(option, inputValue) =>
                  option.label.toLowerCase().startsWith(inputValue.toLowerCase())
                  }                  
                />
              </div>
              <button
                onClick={ () => setIsStateModalOpen(true)}
                style={{
                  padding: "4px 12px",
                  fontSize: "16px",
                  cursor: "pointer",
                  height: "38px", // matches typical react-select height
                }}
              >
                +
              </button> 
              <label >State  Code</label>
             <input
              type="text"
              className="form-control"
              value={formData?.statecode||""}
              readOnly
              style={{ marginRight:"10px", width: "150px", backgroundColor: "#D3D3D3" }}
            /> 
            </div>
          </div>
 
          <div className="mb-3">
            <label >Country Name</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}> 
             <input
              type="text"
              className="form-control"
              value={formData?.countryname ||""}
              readOnly
              style={{ width: "350px", backgroundColor: "#D3D3D3" }}
            />  
            <label  >Country Code</label> 
               <input
                type="text"
                className="form-control"
                value={formData?.countrycode || ""}
                readOnly
                style={{ marginRight:"10px",width: "150px", backgroundColor: "#D3D3D3" }}
              />
          </div>
          {/* <div className="mb-3">
            
          </div>  */}

          </div>
          <div className="form-check mb-3">
            <input
              type="checkbox"
              name="active"
              className="form-check-input"
              checked={formData?.active}
              onChange={handleChange}
            />
            <label className="form-check-label">Active</label>
          </div>

          <button type="submit" className="btn btn-success me-2" disabled={loading}>
            {loading ? "Saving..." : cityValueEdit ? "Update" : "Save"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
             
      {/* Search Modal */}
      <SearchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        apiUrl={`${API_URL}/city/search/`}
        columns={columns}
        searchFields={searchFields}
        onSelect={(selectedCity) => {
           const selectedState = stateOptions.find(
              s => s.value === Number(selectedCity.stateid));
          setFormData((prevData) => ({
            ...prevData,
            id: selectedCity.id,
            citycode: selectedCity.citycode,
            cityname: selectedCity.cityname,
            stateid: selectedState?.value || null,
            statename: selectedState?.label || selectedCity.statename || "",
            statecode: selectedState?.code || selectedCity.statecode || "",
            countryid: selectedState?.countryid || selectedCity.countryid || "",
            countryname: selectedState?.countryname || selectedCity.countryname || "",
            countrycode: selectedState?.countrycode || selectedCity.countrycode || "",
            active: !!selectedCity.active,
            createdby: selectedCity.createdby || "Admin",
            modifiedby: selectedCity.modifiedby || "Admin",
          }));
        }}
      />
      {/* State Modal for adding new state */}
      <ModalOpen
        isOpen={isStateModalOpen}
        onClose={() => {
          console.log("Closing State Modal");
          setIsStateModalOpen(false)}}
        title="Add New State"
      >
        <div>
          <p> Modla is Open:{isStateModalOpen? "Yes":"No"} </p>
        <StateModalForm
           
          stateValueEdit={null} // new state
          onClose={() => {
            console.log("StateForm onClose called");
            setIsStateModalOpen(false)}}
          onSaved = {handleStateSave}
        />
        </div>
      </ModalOpen>
   
      
    </div>
  );  
}
export default CityForm;