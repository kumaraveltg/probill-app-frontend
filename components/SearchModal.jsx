import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
 

function SearchModal({ show, onClose, apiUrl, columns, searchFields, onSelect }) {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [field, setField] = useState(searchFields[0].value);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (search.trim() === "") {
      setData([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      setLoading(true);

      // Build API query
      const url = `${apiUrl}?field=${field}&value=${encodeURIComponent(search)}`;
       console.log("SearchModal API URL:", url);
      fetch(url)
        .then((res) => res.json())
        .then((resData) => {
          setData(resData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search, field, apiUrl]);

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Search</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex mb-2">
          <Form.Select
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="me-2"
            style={{ maxWidth: "200px" }}
          >
            {searchFields.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Form.Select>

          <input
            type="text"
            className="form-control"
            placeholder={`Search by ${field}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && (
          <div className="text-center my-2">
            <Spinner animation="border" size="sm" /> Loading...
          </div>
        )}

        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.field}>{col.label}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item,rowIndex) => (
              <tr key={item.id||rowIndex}>
                {columns.map((col) => (
                  <td key={`${item.id||rowIndex}-${col.field}`}>
                    {col.render ? col.render(item[col.field], item) : item[col.field]}
                  </td>
                ))}
                <td>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    Select
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && data.length === 0 && search.trim() !== "" && (
              <tr>
                <td colSpan={columns.length + 1} className="text-center">
                  No matching results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Modal.Body>
    </Modal>
  );
}

export default SearchModal;
