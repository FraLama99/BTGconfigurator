import React from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";

const DeleteCpuModal = ({ show, onHide, cpu, onConfirm, loading }) => {
  if (!cpu) return null;

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Conferma Eliminazione</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sei sicuro di voler eliminare la seguente CPU?</p>
        <div className="d-flex align-items-center mb-3">
          {cpu.imageUrl && (
            <img
              src={cpu.imageUrl}
              alt={cpu.name}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "contain",
                marginRight: "15px",
              }}
            />
          )}
          <div>
            <h5>{cpu.name}</h5>
            <p className="mb-0 text-muted">
              {cpu.brand} {cpu.model} - Socket {cpu.socket}
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
              Elimina CPU
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCpuModal;
