import React, { createContext, useState, useEffect } from "react";
import { API_URL } from "../components/Config";

const DataCurrency = createContext();

export const DataCurrencyProvider = ({ children }) => {  
  const [currencies, setCurrencies] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const limit = 10;
  const [total, setTotal] = useState(0);
  
  // fetch countries
  const fetchCurrencies = async (skip=0,limit=10) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/currency/getcurrency?skip=${skip}&limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      setCurrencies(data.currency_list);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 


  // load once
 useEffect(() => {
  const fetchData = async () => {
    await fetchCurrencies(); 
  };
  fetchData();
}, []);

  return (
    <DataCurrency.Provider
      value={{
        currencies,
        fetchCurrencies,
        loading,
        error,
        total,
      }}
    >
      {children}
    </DataCurrency.Provider>
  );
};

export default DataCurrency;
