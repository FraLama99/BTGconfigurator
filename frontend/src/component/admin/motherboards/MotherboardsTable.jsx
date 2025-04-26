import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const MotherboardsTable = ({ motherboards, loading, onEdit, onDelete }) => {
  if (loading && !motherboards.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (motherboards.length === 0) {
    return (
      <Alert variant="info">
        Nessuna scheda madre disponibile. Aggiungi la tua prima scheda madre
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
            <th>Connettività</th>
            <th style={{ width: "100px" }}>Prezzo</th>
            <th style={{ width: "100px" }}>Stock</th>
            <th style={{ width: "150px" }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {motherboards.map((mb) => (
            <tr key={mb._id}>
              <td>
                {mb.imageUrl ? (
                  <img
                    src={mb.imageUrl}
                    alt={mb.name}
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
                <strong>{mb.name}</strong>
                <div>
                  <small className="text-muted">
                    {mb.brand} {mb.model}
                  </small>
                </div>
              </td>
              <td>
                <div>
                  <strong>Socket:</strong> {mb.socket}
                </div>
                <div>
                  <strong>Chipset:</strong> {mb.chipset}
                </div>
                <div>
                  <strong>Form Factor:</strong> {mb.formFactor}
                </div>
                <div>
                  <strong>Memoria:</strong> {mb.memoryType}, {mb.memorySlots}{" "}
                  slot, {mb.maxMemory} GB max
                </div>
                <div>
                  <strong>PCI-E:</strong> {mb.pciSlots?.pcie_x16 || 0} x16,{" "}
                  {mb.pciSlots?.pcie_x8 || 0} x8, {mb.pciSlots?.pcie_x4 || 0}{" "}
                  x4, {mb.pciSlots?.pcie_x1 || 0} x1
                </div>
              </td>
              <td>
                <div>
                  <strong>USB:</strong> {mb.usbPorts?.usb2 || 0} x USB2.0,{" "}
                  {mb.usbPorts?.usb3 || 0} x USB3.x, {mb.usbPorts?.typeC || 0} x
                  TypeC
                </div>
                <div>
                  <strong>Storage:</strong> {mb.sataConnectors || 0} SATA,{" "}
                  {mb.m2Slots || 0} M.2
                </div>
                {(mb.wifiIncluded || mb.bluetoothIncluded) && (
                  <div>
                    {mb.wifiIncluded && (
                      <Badge bg="info" className="me-1">
                        Wi-Fi
                      </Badge>
                    )}
                    {mb.bluetoothIncluded && <Badge bg="info">Bluetooth</Badge>}
                  </div>
                )}
              </td>
              <td className="text-end">
                <strong>€ {mb.price.toFixed(2)}</strong>
              </td>
              <td className="text-center">
                <Badge bg={mb.stock > 0 ? "success" : "danger"}>
                  {mb.stock}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(mb)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(mb)}>
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

export default MotherboardsTable;
