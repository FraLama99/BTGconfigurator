import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const CasesTable = ({ cases, loading, onEdit, onDelete }) => {
  if (loading && !cases.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <Alert variant="info">
        Nessun case disponibile. Aggiungi il tuo primo case utilizzando il form
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
            <th style={{ width: "120px" }}>Dimensioni</th>
            <th style={{ width: "100px" }}>Prezzo</th>
            <th style={{ width: "80px" }}>Stock</th>
            <th style={{ width: "150px" }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((pcCase) => (
            <tr key={pcCase._id}>
              <td>
                {pcCase.imageUrl ? (
                  <img
                    src={pcCase.imageUrl}
                    alt={pcCase.name}
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
                <strong>{pcCase.name}</strong>
                <div>
                  <small className="text-muted">
                    {pcCase.brand} {pcCase.model}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  <strong>Form Factor:</strong>{" "}
                  {Array.isArray(pcCase.formFactor)
                    ? pcCase.formFactor.join(", ")
                    : pcCase.formFactor}
                </div>
                {pcCase.panelType && (
                  <div>
                    <strong>Pannello:</strong> {pcCase.panelType}
                  </div>
                )}
                <div>
                  <strong>Ventole:</strong>{" "}
                  {pcCase.includedFans
                    ? `${pcCase.includedFans} incluse`
                    : "Non specificate"}
                </div>
                {pcCase.rgb && (
                  <Badge bg="info" className="mt-1">
                    RGB
                  </Badge>
                )}
              </td>
              <td>
                {pcCase.dimensions ? (
                  <div>
                    <div>H: {pcCase.dimensions.height || "-"} mm</div>
                    <div>L: {pcCase.dimensions.width || "-"} mm</div>
                    <div>P: {pcCase.dimensions.depth || "-"} mm</div>
                  </div>
                ) : (
                  <span className="text-muted">Non specificate</span>
                )}
              </td>
              <td className="text-end">
                <strong>€ {pcCase.price.toFixed(2)}</strong>
              </td>
              <td className="text-center">
                <Badge bg={pcCase.stock > 0 ? "success" : "danger"}>
                  {pcCase.stock}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(pcCase)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(pcCase)}
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

export default CasesTable;
