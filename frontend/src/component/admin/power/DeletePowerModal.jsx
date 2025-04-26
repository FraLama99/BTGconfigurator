import React from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";

const DeletePowerModal = ({ show, onHide, power, onConfirm, loading }) => {
  if (!power) return null;

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Conferma Eliminazione</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sei sicuro di voler eliminare il seguente alimentatore?</p>
        <div className="d-flex align-items-center mb-3">
          {power.imageUrl && (
            <img
              src={power.imageUrl}
              alt={power.name}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "contain",
                marginRight: "15px",
              }}
            />
          )}
          <div>
            <h5>{power.name}</h5>
            <p className="mb-0 text-muted">
              {power.brand} {power.model} - {power.wattage}W {power.efficiency}
            </p>
          </div>
        </div>
        <Alert variant="danger">
          <strong>Attenzione:</strong> Questa operazione non può essere
          annullata.
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annulla
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Eliminazione...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-2"></i>
              Elimina Alimentatore
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeletePowerModal;
