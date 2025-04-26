import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const PowersTable = ({ powers, loading, onEdit, onDelete }) => {
  if (loading && !powers.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (powers.length === 0) {
    return (
      <Alert variant="info">
        Nessun alimentatore disponibile. Aggiungi il tuo primo alimentatore
        utilizzando il form sopra.
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
          {powers.map((power) => (
            <tr key={power._id}>
              <td>
                {power.imageUrl ? (
                  <img
                    src={power.imageUrl}
                    alt={power.name}
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
                <strong>{power.name}</strong>
                <div>
                  <small className="text-muted">
                    {power.brand} {power.model}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  <strong>Potenza:</strong> {power.wattage}W
                </div>
                <div>
                  <strong>Efficienza:</strong> {power.efficiency}
                </div>
                <div>
                  <strong>Modularità:</strong> {power.modular}
                </div>
                <div>
                  <strong>Formato:</strong> {power.formFactor}
                </div>
              </td>
              <td className="text-end">
                <strong>€ {power.price.toFixed(2)}</strong>
              </td>
              <td className="text-center">
                <Badge bg={power.stock > 0 ? "success" : "danger"}>
                  {power.stock}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(power)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(power)}
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

export default PowersTable;
