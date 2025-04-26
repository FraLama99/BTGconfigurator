import React from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import CoolerFormFields from "./CoolerFormFields";

const EditCoolerModal = ({
  show,
  onHide,
  cooler,
  onChange,
  onImageChange,
  onSubmit,
  loading,
}) => {
  if (!cooler) return null;

  console.log("Rendering EditCoolerModal with:", {
    supportedSockets: cooler.supportedSockets,
    rgb: cooler.rgb,
  });

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Modifica Dissipatore</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <CoolerFormFields data={cooler} handleChange={onChange} />

          <Row>
            <Col md={12}>
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
              {(cooler.imagePreview || cooler.imageUrl) && (
                <div className="mt-2 mb-3">
                  <img
                    src={cooler.imagePreview || cooler.imageUrl}
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

export default EditCoolerModal;
