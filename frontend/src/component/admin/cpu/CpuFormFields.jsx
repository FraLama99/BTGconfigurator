import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const CpuFormFields = ({
  data,
  handleChange,
  imagePreview,
  handleImageChange,
  editing = false,
}) => {
  return (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nome*</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
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
              value={data.brand}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Serie</Form.Label>
            <Form.Control
              type="text"
              name="series"
              value={data.series || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Modello*</Form.Label>
            <Form.Control
              type="text"
              name="model"
              value={data.model}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Socket*</Form.Label>
            <Form.Control
              type="text"
              name="socket"
              value={data.socket}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Cores*</Form.Label>
            <Form.Control
              type="number"
              name="cores"
              value={data.cores}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Threads*</Form.Label>
            <Form.Control
              type="number"
              name="threads"
              value={data.threads}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Frequenza Base (GHz)*</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              name="baseFrequency"
              value={data.baseFrequency}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Frequenza Boost (GHz)</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              name="boostFrequency"
              value={data.boostFrequency || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>TDP (W)</Form.Label>
            <Form.Control
              type="number"
              name="tdp"
              value={data.tdp || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Architettura</Form.Label>
            <Form.Control
              type="text"
              name="architecture"
              value={data.architecture || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Cache</Form.Label>
            <Form.Control
              type="text"
              name="cache"
              value={data.cache || ""}
              onChange={handleChange}
              placeholder="Es: 32 MB"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3 mt-4">
            <Form.Check
              type="checkbox"
              label="Grafica Integrata"
              name="integratedGraphics"
              checked={data.integratedGraphics}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Prezzo (€)*</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="price"
              value={data.price}
              onChange={handleChange}
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
              value={data.stock}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={data.description || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Immagine</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {editing && (
              <Form.Text className="text-muted">
                Lascia vuoto per mantenere l'immagine attuale
              </Form.Text>
            )}
          </Form.Group>
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
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
    </>
  );
};

export default CpuFormFields;
