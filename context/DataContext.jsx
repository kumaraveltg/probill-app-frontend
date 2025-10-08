import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { API_URL } from "../components/Config";
import { AuthContext } from "./AuthContext";

const DataContext = createContext();

export const DataProvider = ({ children }) => {  
  // ✅ Get companyid directly from AuthContext (will update reactively)
  const { accessToken, authFetch, companyid } = useContext(AuthContext); 
  
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [citys, setCitys] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [busers,setBusers]= useState([])
  const [userRole,setUserRole]= useState([]);
  const [finyr,setFinyr] = useState([]);
  const [taxmaster,setTaxMaster]= useState([]); 
  const [items,setItems]=useState([])
  const [test,setTest]= useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;
  const [total, setTotal] = useState(0);
  
  // fetch countries
  const fetchCountries = async (skip = 0, limit = 10) => {
  try {
    setLoading(true);
    const res = await authFetch(
      `${API_URL}/country/?skip=${skip}&limit=${limit}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    setCountries(data.sort((a, b) => a.countryname.localeCompare(b.countryname)));
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  // fetch states
  const fetchStates = async (skip = 0, limit = 10) => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/states/?skip=${skip}&limit=${limit}`,
        {
          headers: { "Authorization":`Bearer ${accessToken}` }
        }
      );
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      console.log("API response for states:", data);
      console.log("total:", data.total);
      setStates(data.state_list || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cities
  const fetchCities = async (skip = 0, limit = 10) => {
    try {
      setLoading(true); 
      const res = await authFetch(`${API_URL}/cities/?skip=${skip}&limit=${limit}`,
        {
          headers:{
            "Authorization": `Bearer ${accessToken}`
          }
        }
      );
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      console.log("API response for cities:", data);
      console.log("total:", data.total);
      setCitys(data.city_list || []);
      setTotal(data.total || 0);
    } catch (err) { 
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UOMs - ✅ Added authFetch to dependency array
  const fetchUoms = useCallback(async (skip = 0, limit = 10) => {
    if (!companyid) {
      console.error("Company ID is not set yet!");
      return;
    }
    console.log("Access Token:", accessToken); 
    console.log("Company ID for UOMs:", companyid);
    try { 
      setLoading(true);
      const res = await authFetch(`${API_URL}/uomlist/${companyid}/?skip=${skip}&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      console.log("API response for uoms:", data);
      console.log("total:", data.total);
      setUoms(data.uoms || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [companyid, accessToken, authFetch]);

  // CompanyList
  const fetchCompanies = useCallback(async () => {
    console.log("Access Token:", accessToken); 
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/company/companylist/${companyid}/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });     
      if (res.status === 401) {
        console.error("Unauthorized! Token may be invalid or expired");
        return;
      }
      if (!res.ok) throw new Error(`Http Error ${res.status}`);
      const data = await res.json();
      const companiesData = data.companies || [];
      const totalCount = data.total || companiesData.length;
      console.log("API response for company:", data);
      setCompanies(Array.isArray(data) ? data : [data]);
      setTotal(1);
      console.log("api response companies", companies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  });

// users List
 const fetchUsers= useCallback( async(skip = 0, limit = 10) => {
  try{
    setLoading(true);
    setError(null);
    const res= await authFetch(`${API_URL}/users/users/${companyid}/?skip=${skip}&limit=${limit}`,
      {
        headers: {"Authorization": `Bearer ${accessToken}`}
      }    );
      if(res.status== 401) {
        console.error("Unauthorized Token may be invalid or Expired");
        return;
      }
      if(!res.ok) throw new Error(`Http Error ${res.status}`);
      const data = await res.json();
       
       

      // Update state
      setBusers(data.list_users||[]);
      setTotal(data.total);
     console.log("fetch users:",data);
     
      
  }
  catch(err){
    setError(err.message)
  }
  finally{
    setLoading(false)
  }
 }, [companyid, accessToken, authFetch] )
 
 // userRole
const fetchUserRole= useCallback( async(skip = 0, limit = 10) => {
  try{
    setLoading(true);
    setError(null);
    const res= await authFetch(`${API_URL}/getuserroles/${companyid}/?skip=${skip}&limit=${limit}`,
      {
        headers: {"Authorization": `Bearer ${accessToken}`}
      }    );
      if(res.status== 401) {
        console.error("Unauthorized Token may be invalid or Expired");
        return;
      }
      if(!res.ok) throw new Error(`Http Error ${res.status}`);
      const data = await res.json(); 

      // Update state
      setUserRole(data.user_rolelist||[]);
      setTotal(data.total);
     console.log("fetch usersRole:",data); 
      
  }
  catch(err){
    setError(err.message)
  }
  finally{
    setLoading(false)
  }
 } ,[companyid, accessToken, authFetch] )

 //finyear
  const fetchFinyr = useCallback(async (skip=0,limit=10) => {
    console.log("Access Token:", accessToken); 
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/header?skip=${skip}&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });     
      if (res.status === 401) {
        console.error("Unauthorized! Token may be invalid or expired");
        return;
      }
      if (!res.ok) throw new Error(`Http Error ${res.status}`);
      const data = await res.json();
       setFinyr(data.finyrs||[]);
       setTotal(data.total);
       console.log("API Response Finyr",data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  },[accessToken,authFetch]);

// TaxMaster- header
const fetchTaxMaster= useCallback( async(skip= 0, limit = 10) => {
  console.log("Access Token",accessToken);
  try{
    setLoading(true);
    const res = await authFetch(`${API_URL}/gettax/${companyid}?skip=${skip}&limit=${limit}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      if (res.status === 401) {
        console.error("Unauthorized! Token may be invalid or expired");
        return;
      }
      if (!res.ok) throw new Error(`Http Error ${res.status}`);
      const data = await res.json();
       setTaxMaster(data.taxlist||[]);
       setTotal(data.total);
       console.log("API Response Taxmaster",data);
  } 
  catch(err){
    setError(err.message);
  }
  finally{
    setLoading(false);
  }
},[authFetch,accessToken]);


const fetchItems= useCallback( async(skip=0,limit=100) => {
  if(!companyid) {
    console.error("Company Id is not avaialble");
    return;
  }
  console.log("AccessToken",accessToken);
  try{
    setLoading(true);
    const res= await authFetch(`${API_URL}/products/${companyid}?skip=${skip}&limit=${limit}`,
      { headers: {"Authorization": `Bearer ${accessToken}`}
    } );
    if(!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    console.log("Fetch Products Data:",data);
    setItems(data.productlist||[]);
    setTotal(data.total||0);
  }
  catch(err){
    setError(err.message);

  }
  finally{
    setLoading(false);
  }
},[companyid,authFetch,accessToken])

 //✅ Initial data load - only when accessToken is available
  useEffect(() => {
    if (accessToken) {
      const fetchData = async () => {   
        await fetchItems() 
      };
      fetchData();
    }
  }, [accessToken]);



  // ✅ Fetch UOMs when companyid becomes available
  // useEffect(() => {
  //   console.log("AuthContext companyid:", companyid);
  //   if (companyid && accessToken) {
  //     console.log("Fetching UOMs with companyid:", companyid);
               
  //         fetchTaxMaster();
  //   }
  // }, [companyid, accessToken,fetchTaxMaster ]);

  return (
    <DataContext.Provider
      value={{
        countries,
        states,
        citys,
        uoms,
        companies,
        fetchCountries,
        fetchStates,
        fetchCities,
        fetchUoms,
        fetchCompanies,
        loading,
        error,
        total,
        companyid,busers,fetchUsers,userRole,fetchUserRole,finyr,fetchFinyr,taxmaster,fetchTaxMaster,
        items,fetchItems,test 
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
// ✅ ADD THIS CUSTOM HOOK
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;