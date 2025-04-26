import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const GPUsTable = ({ gpus, loading, onEdit, onDelete }) => {
  if (loading && !gpus.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (gpus.length === 0) {
    return (
      <Alert variant="info">
        Nessuna GPU disponibile. Aggiungi la tua prima GPU utilizzando il form
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
          {gpus.map((gpu) => (
            <tr key={gpu._id}>
              <td>
                {gpu.imageUrl ? (
                  <img
                    src={gpu.imageUrl}
                    alt={gpu.name}
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
                <strong>{gpu.name}</strong>
                <div>
                  <small className="text-muted">
                    {gpu.brand} {gpu.model}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  <strong>Chipset:</strong> {gpu.chipset}
                </div>
                <div>
                  <strong>VRAM:</strong> {gpu.vram} GB{" "}
                  {gpu.vramType && `(${gpu.vramType})`}
                </div>
                <div>
                  <strong>Frequenza:</strong> {gpu.coreClock} MHz
                  {gpu.boostClock && ` (${gpu.boostClock} MHz boost)`}
                </div>
                {gpu.powerConnectors && (
                  <div>
                    <strong>Alimentazione:</strong> {gpu.powerConnectors}
                  </div>
                )}
              </td>
              <td className="text-end">
                <strong>€ {gpu.price.toFixed(2)}</strong>
              </td>
              <td className="text-center">
                <Badge bg={gpu.stock > 0 ? "success" : "danger"}>
                  {gpu.stock}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(gpu)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(gpu)}
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

export default GPUsTable;
