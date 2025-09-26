import React, { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../components/Config";

const GlobalContext = createContext();

export function GlobalProvider({ children }) {
  const [globals, setGlobals] = useState({
    user: null,
    userid:null,
    companyid:null,
    company: null,
    finYear: null,
    roles: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchGlobals() {
    setLoading(true);
    try {
      // Fetch all APIs in parallel
      const [userRes, companyRes, finYrRes, roleRes] = await Promise.all([
        fetch(`${API_URL}/user/userlist/`, { credentials: "include" }),
        fetch(`${API_URL}/company/companylist/`, { credentials: "include" }),
        fetch(`${API_URL}/getuserroles?companyid=${companyid}`, { credentials: "include" }),
        fetch(`${API_URL}/getuserroles?companyid=${companyid}`, { credentials: "include" }),
      ]);

      if (!userRes.ok || !companyRes.ok || !finYrRes.ok || !roleRes.ok) {
        throw new Error("One of the API calls failed");
      }

      const [user, company, finYear, roles] = await Promise.all([
        userRes.json(),
        companyRes.json(),
        finYrRes.json(),
        roleRes.json(),
      ]);

      setGlobals({ user, company, finYear, roles });
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load globals");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGlobals();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ globals, loading, error, refreshGlobals: fetchGlobals }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobals() {
  return useContext(GlobalContext);
}
