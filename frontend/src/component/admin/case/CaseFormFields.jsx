import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const CaseFormFields = ({ data, handleChange }) => {
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
        {/* <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Form Factor*</Form.Label>
            <Form.Select
              name="formFactor"
              value={data.formFactor}
              onChange={handleChange}
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
              value={data.panelType || ""}
              onChange={handleChange}
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
              value={data.includedFans || ""}
              onChange={handleChange}
            />
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
        <Col md={4}>
          <Form.Label>Dimensioni (mm)</Form.Label>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  placeholder="Altezza"
                  name="height"
                  value={data.height || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  placeholder="Larghezza"
                  name="width"
                  value={data.width || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="number"
                  placeholder="Profondità"
                  name="depth"
                  value={data.depth || ""}
                  onChange={handleChange}
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
              value={data.maxGpuLength || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Altezza Max CPU Cooler (mm)</Form.Label>
            <Form.Control
              type="number"
              name="maxCpuCoolerHeight"
              value={data.maxCpuCoolerHeight || ""}
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

export default CaseFormFields;
