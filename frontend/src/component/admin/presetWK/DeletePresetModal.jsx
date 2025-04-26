import React from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";

const DeletePresetModal = ({ show, onHide, preset, onConfirm, loading }) => {
  if (!preset) return null;

  // Formatta il prezzo
  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Conferma Eliminazione</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sei sicuro di voler eliminare la seguente configurazione?</p>
        <div className="mb-3">
          <h5>{preset.name}</h5>
          <p className="mb-0 text-muted">Categoria: {preset.category}</p>
          <p className="mb-0 text-muted">
            CPU: {preset.components.cpu?.brand} {preset.components.cpu?.model}
          </p>
          <p className="mb-0 text-muted">
            GPU: {preset.components.gpu?.brand} {preset.components.gpu?.model}
          </p>
          <p className="mb-0 text-muted">
            Prezzo Base: €{formatPrice(preset.basePrice)}
          </p>
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
              Elimina Configurazione
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeletePresetModal;
