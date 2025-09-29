  import { createContext, useState } from "react";
  import { API_URL } from "../components/Config";

  export const AuthContext = createContext();

  export const AuthProvider = ({ children }) => {
    // Tonen Genereation
    const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);
    
    //Global Parameters
    const [username, setUsername] = useState(null);
    const [companyno, setCompanyno] = useState(null);
    const [companyid, setCompanyid] = useState(localStorage.getItem("companyid") || null);
    const [companycode, setCompanycode] = useState(null);

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

    const login = async (project, companyno, username, password) => {
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
    saveUsername(username);
    saveCompanyno(companyno);
    saveCompanyid(data.companyid);
    saveCompanycode(data.companycode);

    console.log("AuthContext values after login:", {
      username,
      companyno,
      companyid: data.companyid,
      companycode: data.companycode,
    });
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

    return (
      <AuthContext.Provider
        value={{           
          login,
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
