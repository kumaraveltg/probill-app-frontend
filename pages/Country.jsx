import React, { useEffect, useState } from 'react';

function Country() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("http://localhost:8080/country/?skip=0&limit=100");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        console.log("Fetched countries:", data); // check API response
        setCountries(data);
      } catch (err) {
        console.error("Error fetching countries:", err);
      }
    };
    fetchCountries();
  }, []);

  const handleEdit = (id) => {
    console.log("Edit country", id);
    // Navigate to edit page or open modal
  };

  const handleView = (id) => {
    console.log("View country", id);
    // Navigate to view page or open modal
  };

  const handleNew = () => {
    console.log("Add new country");
    // Open new country form
  };

  return (
    <div>
      <h4>Country List</h4>
      <button className="btn btn-success mb-3" onClick={handleNew}>
        New Country
      </button>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Country Code</th>
            <th>Country Name</th>
            <th>Active</th>
            <th>Created by</th>
            <th>Created On</th>
            <th>Modified by</th>
            <th>Modified On</th>
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
          {countries.map((c, id) => (
            <tr key={id}>
              <td>{c.countrycode}</td>
              <td>{c.countryname}</td>
              <td>{c.active ? "Yes" : "No"}</td>
              <td>{c.createdby}</td>
              <td>{c.createdon}</td>
              <td>{c.modifiedby}</td>
              <td>{c.modifiedon}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => handleEdit(c.id)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => handleView(c.id)}
                >
                  View
                </button>
              </td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Country;