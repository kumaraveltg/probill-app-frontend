import React, { createContext, useState, useEffect } from "react";
import { API_URL } from "../components/Config";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;
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
      setStates(data.sort((a, b) => a.statename.localeCompare(b.statename)));
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
        error,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
