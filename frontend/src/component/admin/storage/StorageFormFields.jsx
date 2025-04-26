import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const StorageFormFields = ({ data, handleChange }) => {
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
              <option value="">Seleziona tipo</option>
              <option value="SSD">SSD</option>
              <option value="HDD">HDD</option>
              <option value="NVMe">NVMe</option>
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
            <Form.Label>Form Factor*</Form.Label>
            <Form.Select
              name="formFactor"
              value={data.formFactor}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona form factor</option>
              <option value='2.5"'>2.5"</option>
              <option value='3.5"'>3.5"</option>
              <option value="M.2">M.2</option>
              <option value="PCIe">PCIe</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Interfaccia*</Form.Label>
            <Form.Select
              name="interface"
              value={data.interface}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona interfaccia</option>
              <option value="SATA">SATA</option>
              <option value="PCIe">PCIe</option>
              <option value="NVMe">NVMe</option>
              <option value="SATA III">SATA III</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Velocità Lettura (MB/s)</Form.Label>
            <Form.Control
              type="number"
              name="readSpeed"
              value={data.readSpeed || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Velocità Scrittura (MB/s)</Form.Label>
            <Form.Control
              type="number"
              name="writeSpeed"
              value={data.writeSpeed || ""}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label>Cache (MB)</Form.Label>
            <Form.Control
              type="number"
              name="cache"
              value={data.cache || ""}
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

export default StorageFormFields;
