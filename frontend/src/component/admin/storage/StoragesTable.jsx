import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const StoragesTable = ({ storageDevices, loading, onEdit, onDelete }) => {
  if (loading && !storageDevices.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (storageDevices.length === 0) {
    return (
      <Alert variant="info">
        Nessun dispositivo di archiviazione disponibile. Aggiungi il tuo primo
        dispositivo utilizzando il form sopra.
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
          {storageDevices.map((device) => (
            <tr key={device._id}>
              <td>
                {device.imageUrl ? (
                  <img
                    src={device.imageUrl}
                    alt={device.name}
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
                <strong>{device.name}</strong>
                <div>
                  <small className="text-muted">
                    {device.brand} {device.model}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  <Badge
                    bg={
                      device.type === "SSD"
                        ? "primary"
                        : device.type === "NVMe"
                        ? "success"
                        : "secondary"
                    }
                    className="me-2"
                  >
                    {device.type}
                  </Badge>
                  <strong>{device.capacity} GB</strong>
                </div>
                <div>
                  <strong>Form Factor:</strong> {device.formFactor}
                </div>
                <div>
                  <strong>Interfaccia:</strong> {device.interface}
                </div>
                {(device.readSpeed || device.writeSpeed) && (
                  <div>
                    <strong>Velocità:</strong>
                    {device.readSpeed > 0 && (
                      <span> R:{device.readSpeed} MB/s</span>
                    )}
                    {device.writeSpeed > 0 && (
                      <span> W:{device.writeSpeed} MB/s</span>
                    )}
                  </div>
                )}
              </td>
              <td className="text-end">
                <strong>€ {device.price.toFixed(2)}</strong>
              </td>
              <td className="text-center">
                <Badge bg={device.stock > 0 ? "success" : "danger"}>
                  {device.stock}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(device)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(device)}
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

export default StoragesTable;
