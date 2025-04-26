import React from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import StorageFormFields from "./StorageFormFields";

const EditStorageModal = ({
  show,
  onHide,
  device,
  onChange,
  onImageChange,
  onSubmit,
  loading,
}) => {
  if (!device) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Modifica Dispositivo di Archiviazione</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <StorageFormFields data={device} handleChange={onChange} />

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={device.description || ""}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Immagine</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                />
                <Form.Text className="text-muted">
                  Lascia vuoto per mantenere l'immagine attuale
                </Form.Text>
              </Form.Group>
              {(device.imagePreview || device.imageUrl) && (
                <div className="mt-2">
                  <img
                    src={device.imagePreview || device.imageUrl}
                    alt="Anteprima"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "150px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Annulla
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
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
                  Salvataggio...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>
                  Salva Modifiche
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditStorageModal;
