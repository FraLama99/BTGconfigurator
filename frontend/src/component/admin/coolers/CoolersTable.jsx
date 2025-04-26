import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const CoolersTable = ({ coolers, loading, onEdit, onDelete }) => {
  if (loading && !coolers.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (coolers.length === 0) {
    return (
      <Alert variant="info">
        Nessun dissipatore disponibile. Aggiungi il tuo primo dissipatore
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
            <th style={{ width: "100px" }}>Compatibilità</th>
            <th style={{ width: "100px" }}>Prezzo</th>
            <th style={{ width: "80px" }}>Stock</th>
            <th style={{ width: "150px" }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {coolers.map((cooler) => (
            <tr key={cooler._id}>
              <td>
                {cooler.imageUrl ? (
                  <img
                    src={cooler.imageUrl}
                    alt={cooler.name}
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
                <strong>{cooler.name}</strong>
                <div>
                  <small className="text-muted">
                    {cooler.brand} {cooler.model}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  <strong>Tipo:</strong>{" "}
                  <Badge
                    bg={
                      cooler.type === "Air"
                        ? "secondary"
                        : cooler.type.includes("AIO")
                        ? "info"
                        : "primary"
                    }
                  >
                    {cooler.type === "Air"
                      ? "Aria"
                      : cooler.type.includes("AIO")
                      ? "AIO"
                      : cooler.type}
                  </Badge>
                </div>
                {cooler.tdpRating && (
                  <div>
                    <strong>TDP:</strong> {cooler.tdpRating}W
                  </div>
                )}
                {cooler.height && (
                  <div>
                    <strong>Altezza:</strong> {cooler.height}mm
                  </div>
                )}
                {cooler.fanCount > 1 && (
                  <div>
                    <strong>Ventole:</strong> {cooler.fanCount}x{" "}
                    {cooler.fanSize}
                    mm
                  </div>
                )}
                {cooler.type.includes("AIO") && cooler.radiatorSize && (
                  <div>
                    <strong>Radiatore:</strong> {cooler.radiatorSize}mm
                  </div>
                )}
                {cooler.rgb && (
                  <Badge bg="info" className="mt-1">
                    RGB
                  </Badge>
                )}
              </td>
              <td>
                {cooler.supportedSockets &&
                cooler.supportedSockets.length > 0 ? (
                  <div className="small">
                    {cooler.supportedSockets.join(", ")}
                  </div>
                ) : (
                  <span className="text-muted">Non specificata</span>
                )}
              </td>
              <td className="text-end">
                <strong>€ {cooler.price.toFixed(2)}</strong>
              </td>
              <td className="text-center">
                <Badge bg={cooler.stock > 0 ? "success" : "danger"}>
                  {cooler.stock}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(cooler)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(cooler)}
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

export default CoolersTable;
