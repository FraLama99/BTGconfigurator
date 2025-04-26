import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const CpusTable = ({ cpus, loading, onEdit, onDelete }) => {
  if (loading && !cpus.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (cpus.length === 0) {
    return (
      <Alert variant="info">
        Nessuna CPU disponibile. Aggiungi la tua prima CPU utilizzando il form
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
          {cpus.map((cpu) => (
            <tr key={cpu._id}>
              <td>
                {cpu.imageUrl ? (
                  <img
                    src={cpu.imageUrl}
                    alt={cpu.name}
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
                <strong>{cpu.name}</strong>
                <div>
                  <small className="text-muted">
                    {cpu.brand} {cpu.model}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  <strong>Socket:</strong> {cpu.socket}
                </div>
                <div>
                  <strong>Core/Thread:</strong> {cpu.cores}C/{cpu.threads}T
                </div>
                <div>
                  <strong>Frequenza:</strong> {cpu.baseFrequency} GHz
                  {cpu.boostFrequency && ` (${cpu.boostFrequency} GHz boost)`}
                </div>
                {cpu.integratedGraphics && (
                  <Badge bg="info" className="mt-1">
                    Grafica Integrata
                  </Badge>
                )}
              </td>
              <td className="text-end">
                <strong>€ {cpu.price.toFixed(2)}</strong>
              </td>
              <td className="text-center">
                <Badge bg={cpu.stock > 0 ? "success" : "danger"}>
                  {cpu.stock}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(cpu)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(cpu)}
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

export default CpusTable;
