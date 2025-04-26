import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const GPUFormFields = ({ data, handleChange }) => {
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
            <Form.Label>Chipset*</Form.Label>
            <Form.Control
              type="text"
              name="chipset"
              value={data.chipset}
              onChange={handleChange}
              required
              placeholder="Es: NVIDIA RTX 4060"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>VRAM (GB)*</Form.Label>
            <Form.Control
              type="number"
              name="vram"
              value={data.vram}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo VRAM</Form.Label>
            <Form.Control
              type="text"
              name="vramType"
              value={data.vramType}
              onChange={handleChange}
              placeholder="Es: GDDR6, GDDR6X"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Frequenza Core (MHz)</Form.Label>
            <Form.Control
              type="number"
              name="coreClock"
              value={data.coreClock}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Frequenza Boost (MHz)</Form.Label>
            <Form.Control
              type="number"
              name="boostClock"
              value={data.boostClock}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Lunghezza (mm)</Form.Label>
            <Form.Control
              type="number"
              name="length"
              value={data.length}
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
              value={data.tdp}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Connettori Alimentazione</Form.Label>
            <Form.Control
              type="text"
              name="powerConnectors"
              value={data.powerConnectors}
              onChange={handleChange}
              placeholder="Es: 1x 8-pin"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Porte DisplayPort</Form.Label>
            <Form.Control
              type="number"
              name="displayPorts"
              value={data.displayPorts}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Porte HDMI</Form.Label>
            <Form.Control
              type="number"
              name="hdmiPorts"
              value={data.hdmiPorts}
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
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={data.description}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default GPUFormFields;
