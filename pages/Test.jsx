import React, { useContext, useEffect,useState } from "react";
import DataContext, { useData } from "../context/DataContext"; 

function Test() {
  const { uoms, fetchUoms } =useData(); // useContext, not UseContext
 const [selectedUom, setSelectedUom] = useState('');

 useEffect(() => {
    fetchUoms();
  }, [fetchUoms]);
  
  console.log("UOMs in form:", uoms);
   console.log("Selected UOM:", selectedUom);

 return (
    <select 
      name="uom" 
      value={selectedUom} 
      onChange={(e) => setSelectedUom(e.target.value)}
    >
      <option value="">Select UOM</option>
      {uoms.map((uom) => (
        <option key={uom.id} value={uom.id}>
          {uom.uomcode}
        </option>
      ))}
    </select>
  );
}
 

export default Test;