import { createContext, useEffect, useState } from "react";
import { API_URL } from "../components/Config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Tokens
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);

  // Global params
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const [companyno, setCompanyno] = useState(localStorage.getItem("companyno") || null);
  const [companyid, setCompanyid] = useState(localStorage.getItem("companyid") || null);
  const [companycode, setCompanycode] = useState(localStorage.getItem("companycode") || null);
  const [companyname, setCompanyname] = useState(localStorage.getItem("companyname") || null);

  // --- TOKEN HELPERS ---
  const saveAccessToken = (token) => {
    setAccessToken(token);
    token ? localStorage.setItem("accessToken", token) : localStorage.removeItem("accessToken");
  };

  const saveRefreshToken = (token) => {
    setRefreshToken(token);
    token ? localStorage.setItem("refreshToken", token) : localStorage.removeItem("refreshToken");
  };

  // --- LOGIN TOKEN GENERATION ---
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

  // --- FETCH GLOBAL PARAMS (after login) ---
  const globalParams = async (usernameInput, companynoInput) => {
    try {
      const res = await fetch(`${API_URL}/set_globalparams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, companyno: companynoInput }),
      });

      const data = await res.json();
      const params = data.params || {};

      if (!res.ok) throw new Error(data.detail || "Global params fetch failed");

      // Set all
      setUsername(params.username);
      setCompanycode(params.companycode);
      setCompanyid(params.companyid);
      setCompanyno(params.companyno);
      setCompanyname(params.companyname);

      // Persist
      localStorage.setItem("username", params.username);
      localStorage.setItem("companycode", params.companycode);
      localStorage.setItem("companyid", params.companyid);
      localStorage.setItem("companyno", params.companyno);
      localStorage.setItem("companyname", params.companyname);

      console.log("Global params loaded:", params);
      return params;
    } catch (err) {
      console.error("Error fetching global params:", err.message);
    }
  };

  // --- LOGOUT ---
  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUsername(null);
    setCompanyno(null);
    setCompanyid(null);
    setCompanycode(null);
    setCompanyname(null);

    localStorage.clear();
    window.location.href = "/login";
  };

  // --- AUTH FETCH (auto refresh) ---
  const authFetch = async (url, options = {}) => {
    const finalOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    };

    let res = await fetch(url, finalOptions);

    if (res.status === 401 && refreshToken) {
      console.log("Access token expired. Trying refresh token...");
      const refreshRes = await fetch(`${API_URL}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.access_token);
        localStorage.setItem("accessToken", refreshData.access_token);
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

  // --- AUTO SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (username) localStorage.setItem("username", username);
    if (companyid) localStorage.setItem("companyid", companyid);
    if (companyno) localStorage.setItem("companyno", companyno);
    if (companycode) localStorage.setItem("companycode", companycode);
    if (companyname) localStorage.setItem("companyname", companyname);
  }, [accessToken, refreshToken, username, companyid, companyno, companycode, companyname]);

  
  return (
    <AuthContext.Provider
      value={{
        jwttoken,
        globalParams,
        logout,
        authFetch,
        accessToken,
        refreshToken,
        username,
        companyno,
        companyid,
        companycode,
        companyname,
        setAccessToken,
        setRefreshToken,
        setUsername,
        setCompanyno,
        setCompanyid,
        setCompanycode,
        setCompanyname,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
