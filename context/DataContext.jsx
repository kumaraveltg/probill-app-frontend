import React, { createContext, useState, useEffect } from "react";
import { API_URL } from "../components/Config";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;
  const [total, setTotal] = useState(0);
  // fetch countries
  const fetchCountries = async (skip=0,limit=10) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/country/?skip=${skip}&limit=${limit}`);
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
  const fetchStates = async (skip = 0,limit=10) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/states/?skip=${skip}&limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      console.log("API response for states:", data);
      console.log("total:",data.total);
       setStates(data.state_list||[]); // adjust if your API returns {states: [...], total: ...}
       setTotal(data.total || 0 );
      // setStates(data.sort((a, b) => a.statename.localeCompare(b.statename)));
      // setTotal(data.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // load once
  useEffect(() => {
    fetchCountries();
    fetchStates();
  }, []);

  return (
    <DataContext.Provider
      value={{
        countries,
        states,
        fetchCountries,
        fetchStates,
        loading,
        error,total
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
