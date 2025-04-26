import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const RAMFormFields = ({ data, handleChange }) => {
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
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>SKU</Form.Label>
            <Form.Control
              type="text"
              name="sku"
              value={data.sku || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo*</Form.Label>
            <Form.Select
              name="memoryType"
              value={data.memoryType}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona tipo</option>
              <option value="DDR4">DDR4</option>
              <option value="DDR5">DDR5</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Capacità (GB)*</Form.Label>
            <Form.Control
              type="number"
              name="capacity"
              value={data.capacity}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Quantità Moduli*</Form.Label>
            <Form.Control
              type="number"
              name="kitSize"
              value={data.kitSize}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              Numero di moduli nel kit
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Velocità (MHz)*</Form.Label>
            <Form.Control
              type="number"
              name="speed"
              value={data.speed}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>CAS Latency</Form.Label>
            <Form.Control
              type="number"
              name="casLatency"
              value={data.casLatency || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Voltaggio</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="voltage"
              value={data.voltage || ""}
              onChange={handleChange}
              placeholder="Es: 1.35"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3 mt-4">
            <Form.Check
              type="checkbox"
              label="Illuminazione RGB"
              name="hasRGB"
              checked={data.hasRGB || false}
              onChange={handleChange}
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
    </>
  );
};

export default RAMFormFields;
