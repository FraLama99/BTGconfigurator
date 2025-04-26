import React from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import RAMFormFields from "./RAMFromFields";

const EditRAMModal = ({
  show,
  onHide,
  ram,
  onChange,
  onImageChange,
  onSubmit,
  loading,
}) => {
  if (!ram) return null;

  console.log("Rendering EditRAMModal with:", {
    hasRGB: ram.hasRGB,
  });

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Modifica RAM</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <RAMFormFields data={ram} handleChange={onChange} />

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={ram.description || ""}
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
              {(ram.imagePreview || ram.imageUrl) && (
                <div className="mt-2">
                  <img
                    src={ram.imagePreview || ram.imageUrl}
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

export default EditRAMModal;
