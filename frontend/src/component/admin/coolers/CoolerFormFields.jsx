import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const CoolerFormFields = ({ data, handleChange }) => {
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
            <Form.Label>Tipo*</Form.Label>
            <Form.Select
              name="type"
              value={data.type}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona...</option>
              <option value="Air">Aria</option>
              <option value="AIO Liquid">AIO Liquid</option>
              <option value="Custom Liquid">Custom Liquid</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Socket Compatibili*</Form.Label>
            <Form.Control
              type="text"
              name="supportedSockets"
              value={data.supportedSockets}
              onChange={handleChange}
              placeholder="Es: LGA1700, AM5 (separati da virgola)"
              required
            />
            <Form.Text className="text-muted">
              Inserisci i socket separati da virgola
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>TDP Massimo (W)</Form.Label>
            <Form.Control
              type="number"
              name="tdpRating"
              value={data.tdpRating}
              onChange={handleChange}
              placeholder="Es: 150"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Altezza (mm)</Form.Label>
            <Form.Control
              type="number"
              name="height"
              value={data.height}
              onChange={handleChange}
              placeholder="Es: 158"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Dimensione Ventola (mm)</Form.Label>
            <Form.Control
              type="number"
              name="fanSize"
              value={data.fanSize}
              onChange={handleChange}
              placeholder="Es: 120"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Numero Ventole</Form.Label>
            <Form.Control
              type="number"
              min="1"
              name="fanCount"
              value={data.fanCount}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Dimensione Radiatore (mm)</Form.Label>
            <Form.Control
              type="number"
              name="radiatorSize"
              value={data.radiatorSize}
              onChange={handleChange}
              placeholder="Es: 240, 280, 360"
            />
            <Form.Text className="text-muted">
              Solo per AIO e liquid cooling
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3 mt-4">
            <Form.Check
              type="checkbox"
              label="Illuminazione RGB"
              name="rgb"
              checked={data.rgb || false}
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
        <Col md={6}>
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

export default CoolerFormFields;
