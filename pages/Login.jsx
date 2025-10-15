import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { API_URL } from "../components/Config";

function Login() {
  const { 
    setAccessToken, 
    setRefreshToken, 
    setUsername, 
    setCompanyid, 
    setCompanyno, 
    setCompanycode ,
    setCompanyname
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const [usernameInput, setUsernameInput] = useState("");
  const [companynoInput, setCompanynoInput] = useState("111111");
  const [password, setPassword] = useState("");
  const [project, setProject] = useState("probill");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login API
  const jwttoken = async (project, companyno, username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, companyno, username, password }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Login failed");
    }
    return await res.json();
  };

  // Global params API
  const fetchGlobalParams = async (username, companyno) => {
    const res = await fetch(`${API_URL}/set_globalparams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, companyno }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Global params failed");
    }

    return await res.json();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Login
      const data = await jwttoken(project, companynoInput, usernameInput, password);

      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      console.log("JWT token set:", data.access_token);

      // 2️⃣ Fetch global params
      const response = await fetchGlobalParams(usernameInput, companynoInput);
      console.log("Global params response:", response);
      
      // ✅ FIX: Extract params from the response object
      const global = response.params || response;
      
      if (!global || !global.companyid) {
        throw new Error("Global params not returned from server or missing companyid");
      }

      console.log("Extracted params:", global);
      console.log("CompanyID from params:", global.companyid);

      // ✅ Set all the values in AuthContext
      setUsername(global.username);
      setCompanyid(global.companyid);
      setCompanyno(global.companyno);
      setCompanycode(global.companycode);

      // ✅ Save to localStorage
      localStorage.setItem("username", global.username);
      localStorage.setItem("companyid", global.companyid);
      localStorage.setItem("companyno", global.companyno);
      localStorage.setItem("companycode", global.companycode);
      if (global.companyname) setCompanyname(global.companyname);

      console.log("Global params set in state and localStorage");
      console.log("CompanyID in localStorage:", localStorage.getItem("companyid"));

      // 3️⃣ Navigate to home/dashboard
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form onSubmit={handleLogin} style={{ padding: "2rem", border: "1px solid #ccc", borderRadius: "10px", width: "300px", backgroundColor: "#f9f9f9" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Login</h2>

        {error && <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}

        <div style={{ marginBottom: "1rem" }}>
          <label>Company No</label>
          <input type="text" value={companynoInput} onChange={(e) => setCompanynoInput(e.target.value)} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Username</label>
          <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }} />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.7rem", backgroundColor: loading ? "#aaa" : "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;