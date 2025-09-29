import React, { useState, useContext,useEffect } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { API_URL } from "../components/Config"; 

function Login() {
  const { setAccessToken, setRefreshToken } = useContext(AuthContext);

  const [companyno, setCompanyno] = useState("111111");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [project, setProject] = useState("probill");
  const [showProject, setShowProject] = useState(false); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
   
 
  // ✅ call API only when user presses Login
  const login = async (project, companyno, username, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, companyno, username, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || "Login failed");
    }

    return await res.json();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(project, companyno, username, password);

      // Save to localStorage
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      // Save to Context
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setUsername({ username });

      console.log("Access token set:", data.access_token);

       
       window.location.href = "/";
       
     
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form
        onSubmit={handleLogin}
        style={{ padding: "2rem", border: "1px solid #ccc", borderRadius: "10px", width: "300px", backgroundColor: "#f9f9f9" }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Login</h2>

        {error && (
          <div style={{ color: "red", marginBottom: "1rem", textAlign: "center" }}>
            {error}
          </div>
        )}

        {/* Optional Project field */}
        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={() => setShowProject(!showProject)}
            style={{ marginBottom: "0.5rem", cursor: "pointer" }}
          >
            {showProject ? "Hide Project" : "Show Project"}
          </button>
          {showProject && (
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
            />
          )}
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Company No</label>
          <input
            type="text"
            value={companyno}
            onChange={(e) => setCompanyno(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }}
          />
        </div>  

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.7rem",
            backgroundColor: loading ? "#aaa" : "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
