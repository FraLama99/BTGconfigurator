import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const RAMsTable = ({ rams, loading, onEdit, onDelete }) => {
  if (loading && !rams.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (rams.length === 0) {
    return (
      <Alert variant="info">
        Nessuna RAM disponibile. Aggiungi la tua prima RAM utilizzando il form
        sopra.
      </Alert>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th style={{ width: "70px" }}>Immagine</th>
            <th>Nome</th>
            <th>Specifiche</th>
            <th style={{ width: "100px" }}>Prezzo</th>
            <th style={{ width: "100px" }}>Stock</th>
            <th style={{ width: "150px" }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {rams.map((ram) => (
            <tr key={ram._id}>
              <td>
                {ram.imageUrl ? (
                  <img
                    src={ram.imageUrl}
                    alt={ram.name}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <div className="text-center text-muted">
                    <i className="bi bi-image" style={{ fontSize: "2rem" }}></i>
                  </div>
                )}
              </td>
              <td>
                <strong>{ram.name}</strong>
                <div>
                  <small className="text-muted">
                    {ram.brand} {ram.model}
                    {ram.sku && ` - ${ram.sku}`}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  <strong>Tipo:</strong> {ram.memoryType}
                </div>
                <div>
                  <strong>Capacità:</strong> {ram.capacity}GB ({ram.kitSize}x
                  {ram.capacity / ram.kitSize}GB)
                </div>
                <div>
                  <strong>Velocità:</strong> {ram.speed} MHz
                  {ram.casLatency && ` CL${ram.casLatency}`}
                </div>
                {ram.hasRGB && (
                  <Badge bg="info" className="mt-1">
                    RGB
                  </Badge>
                )}
              </td>
              <td className="text-end">
                <strong>€ {ram.price.toFixed(2)}</strong>
              </td>
              <td className="text-center">
                <Badge bg={ram.stock > 0 ? "success" : "danger"}>
                  {ram.stock}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(ram)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(ram)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default RAMsTable;
