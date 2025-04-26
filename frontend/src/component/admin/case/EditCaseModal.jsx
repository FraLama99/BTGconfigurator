import React from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";

const EditCaseModal = ({
  show,
  onHide,
  pcCase,
  onChange,
  onImageChange,
  onSubmit,
  loading,
}) => {
  if (!pcCase) return null;

  console.log("Rendering EditCaseModal with:", {
    height: pcCase.height,
    width: pcCase.width,
    depth: pcCase.depth,
    rgb: pcCase.rgb,
  });

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Modifica Case</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nome*</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={pcCase.name || ""}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Brand*</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  value={pcCase.brand || ""}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Modello*</Form.Label>
                <Form.Control
                  type="text"
                  name="model"
                  value={pcCase.model || ""}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {/*  <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Form Factor*</Form.Label>
                <Form.Select
                  name="formFactor"
                  value={pcCase.formFactor || ""}
                  onChange={onChange}
                  required
                >
                  <option value="">Seleziona...</option>
                  <option value="ATX">ATX</option>
                  <option value="Micro ATX">Micro ATX</option>
                  <option value="Mini ITX">Mini ITX</option>
                  <option value="E-ATX">E-ATX</option>
                </Form.Select>
              </Form.Group>
            </Col> */}
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Tipo Pannello</Form.Label>
                <Form.Select
                  name="panelType"
                  value={pcCase.panelType || ""}
                  onChange={onChange}
                >
                  <option value="">Seleziona...</option>
                  <option value="Vetro Temperato">Vetro Temperato</option>
                  <option value="Acrilico">Acrilico</option>
                  <option value="Mesh">Mesh</option>
                  <option value="Metallo">Metallo</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Ventole Incluse</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="includedFans"
                  value={pcCase.includedFans || ""}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3 mt-4">
                <Form.Check
                  type="checkbox"
                  label="Illuminazione RGB"
                  name="rgb"
                  checked={Boolean(pcCase.rgb)}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Label>Dimensioni (mm)</Form.Label>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="number"
                      placeholder="Altezza"
                      name="height"
                      value={pcCase.height || ""}
                      onChange={onChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="number"
                      placeholder="Larghezza"
                      name="width"
                      value={pcCase.width || ""}
                      onChange={onChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="number"
                      placeholder="Profondità"
                      name="depth"
                      value={pcCase.depth || ""}
                      onChange={onChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Lunghezza Max GPU (mm)</Form.Label>
                <Form.Control
                  type="number"
                  name="maxGpuLength"
                  value={pcCase.maxGpuLength || ""}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Altezza Max CPU Cooler (mm)</Form.Label>
                <Form.Control
                  type="number"
                  name="maxCpuCoolerHeight"
                  value={pcCase.maxCpuCoolerHeight || ""}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Prezzo (€)*</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="price"
                  value={pcCase.price || ""}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Quantità Disponibile*</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={pcCase.stock || ""}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={pcCase.description || ""}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>
          </Row>

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
              {(pcCase.imagePreview || pcCase.imageUrl) && (
                <div className="mt-2 mb-3">
                  <img
                    src={pcCase.imagePreview || pcCase.imageUrl}
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

          <Form.Group className="mb-3">
            <Form.Label>Formati Supportati *</Form.Label>
            <Form.Control
              type="text"
              name="formFactor"
              value={pcCase.formFactor || ""}
              onChange={onChange}
              placeholder="Formati separati da virgola (es. ATX, Micro-ATX, Mini-ITX)"
              required
            />
            <Form.Text className="text-muted">
              Inserisci i formati separati da virgola. Es: "ATX, Micro-ATX,
              Mini-ITX"
            </Form.Text>
          </Form.Group>

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

export default EditCaseModal;
