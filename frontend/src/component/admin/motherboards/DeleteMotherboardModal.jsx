import React from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";

const DeleteMotherboardModal = ({
  show,
  onHide,
  motherboard,
  onConfirm,
  loading,
}) => {
  if (!motherboard) return null;

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Conferma Eliminazione</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sei sicuro di voler eliminare la seguente scheda madre?</p>
        <div className="d-flex align-items-center mb-3">
          {motherboard.imageUrl && (
            <img
              src={motherboard.imageUrl}
              alt={motherboard.name}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "contain",
                marginRight: "15px",
              }}
            />
          )}
          <div>
            <h5>{motherboard.name}</h5>
            <p className="mb-0 text-muted">
              {motherboard.brand} {motherboard.model} - {motherboard.chipset}
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
              Elimina Scheda Madre
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteMotherboardModal;
