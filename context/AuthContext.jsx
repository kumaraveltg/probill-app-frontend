  import { createContext, useEffect, useState } from "react";
  import { API_URL } from "../components/Config";

  export const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    // Tonen Genereation
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);
    //global params
    const [username,setUsername] = useState(localStorage.getItem("username")||null);
    const [companyno,setCompanyno] = useState(localStorage.getItem("companyno")||null);
    const [companyid,setCompanyid]= useState(localStorage.getItem("companyid")||null);
    const [companycode,setCompanycode] = useState(localStorage.getItem("companycode")||null)
    
    
    const saveAccessToken = (token) => {
      setAccessToken(token);
      if (token) localStorage.setItem("accessToken", token);
      else localStorage.removeItem("accessToken");
    };

    const saveRefreshToken = (token) => {
      setRefreshToken(token);
      if (token) localStorage.setItem("refreshToken", token);
      else localStorage.removeItem("refreshToken");
    };

    const jwttoken = async (project, companyno, username, password) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, companyno, username, password }),
    });

    const data = await res.json();
    console.log("Login API response:", data);

    if (!res.ok) throw new Error(data.detail || "Login failed");

    saveAccessToken(data.access_token);
    saveRefreshToken(data.refresh_token);
   

  } catch (err) {
    console.error("Login error:", err.message);
  }
};

  const logout = () => {
      setAccessToken(null);
      setRefreshToken(null);
      setUsername(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/login";
    };

    const authFetch = async (url, options = {}) => {
    const finalOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    };

    let res = await fetch(url, finalOptions);

    // if 401 (token expired) and refreshToken exists
    if (res.status === 401 && refreshToken) {
      console.log("Access token expired. Trying refresh token...");

      const refreshRes = await fetch(`${API_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();

        // 1️⃣ Update state and localStorage
        setAccessToken(refreshData.access_token);
        localStorage.setItem("accessToken", refreshData.access_token);

        // 2️⃣ Retry original request with new token
        finalOptions.headers.Authorization = `Bearer ${refreshData.access_token}`;
        res = await fetch(url, finalOptions);
      } else {
        console.log("Refresh token invalid. Logging out.");
        logout();
        throw new Error("Session expired. Please login again.");
      }
    }

      return res;
    };
  // this portion is available in login page
  // const global_params = async (usernameInput,companynoInput) => {
  //  try {
  //      const res = await fetch(`${API_URL}/set_globalparams`,{
  //        method: "POST",
  //        headers: {"Content-Type": "application/json"},
  //        body: JSON.stringify({ username: usernameInput, companyno: companynoInput})
  //      }   );
  //      const data = await res.json();
  //      const params = data.params || {};
      
  //      if(!res.ok) throw new Error( data.detail||"globalparams failed");
  //       setUsername(params.username);
  //       setCompanycode(params.companycode);
  //       setCompanyid(params.companyid);
  //       setCompanyno(params.companyno);

  //        // also save in localStorage (optional persistence)
  //       localStorage.setItem("username", params.username);
  //       localStorage.setItem("companyid", params.companyid);
  //       localStorage.setItem("companyno", params.companyno);
  //       localStorage.setItem("companycode", params.companycode);
        
  //        console.log("globalparams Data:",params);

  //      return params;
  //  }
  //  catch (err){
  //   console.error("Error Globalparams",err.message);

  //  }}
     
  useEffect(() => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (username) localStorage.setItem("username", username);
    if (companyid) localStorage.setItem("companyid", companyid);
    if (companyno) localStorage.setItem("companyno", companyno);
    if (companycode) localStorage.setItem("companycode", companycode);
  }, [accessToken, refreshToken, username, companyid, companyno, companycode]);

    return (
      <AuthContext.Provider
        value={{           
          jwttoken,
          logout,
          authFetch, 
          accessToken, 
          refreshToken, 
          setAccessToken, 
          setRefreshToken,  
          username, setUsername,
          companyno, setCompanyno,
          companyid, setCompanyid,
          companycode, setCompanycode, 
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
