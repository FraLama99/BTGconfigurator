import React from "react";
import { Row, Col, Form, Card } from "react-bootstrap";

const MotherboardFormFields = ({ data, handleChange, isEditing = false }) => {
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
            <Form.Label>Chipset*</Form.Label>
            <Form.Control
              type="text"
              name="chipset"
              value={data.chipset}
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
              <option value="">Seleziona...</option>
              <option value="ATX">ATX</option>
              <option value="Micro-ATX">Micro-ATX</option>
              <option value="Mini-ITX">Mini-ITX</option>
              <option value="CEB">CEB</option>
              <option value="E-ATX">E-ATX</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Tipo Memoria*</Form.Label>
            <Form.Select
              name="memoryType"
              value={data.memoryType}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona...</option>
              <option value="DDR3">DDR3</option>
              <option value="DDR4">DDR4</option>
              <option value="DDR5">DDR5</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Slot Memoria*</Form.Label>
            <Form.Control
              type="number"
              name="memorySlots"
              value={data.memorySlots}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Memoria Massima (GB)*</Form.Label>
            <Form.Control
              type="number"
              name="maxMemory"
              value={data.maxMemory}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Connettori SATA</Form.Label>
            <Form.Control
              type="number"
              name="sataConnectors"
              value={data.sataConnectors || 0}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Slot M.2</Form.Label>
            <Form.Control
              type="number"
              name="m2Slots"
              value={data.m2Slots || 0}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Sezione PCI Slots */}
      <Card className="mb-3">
        <Card.Header>Slot PCI</Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>PCIe x16</Form.Label>
                <Form.Control
                  type="number"
                  name="pciSlots.pcie_x16"
                  value={data.pciSlots?.pcie_x16 || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>PCIe x8</Form.Label>
                <Form.Control
                  type="number"
                  name="pciSlots.pcie_x8"
                  value={data.pciSlots?.pcie_x8 || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>PCIe x4</Form.Label>
                <Form.Control
                  type="number"
                  name="pciSlots.pcie_x4"
                  value={data.pciSlots?.pcie_x4 || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>PCIe x1</Form.Label>
                <Form.Control
                  type="number"
                  name="pciSlots.pcie_x1"
                  value={data.pciSlots?.pcie_x1 || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Sezione Porte USB */}
      <Card className="mb-3">
        <Card.Header>Porte USB</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>USB 2.0</Form.Label>
                <Form.Control
                  type="number"
                  name="usbPorts.usb2"
                  value={data.usbPorts?.usb2 || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>USB 3.0/3.1/3.2</Form.Label>
                <Form.Control
                  type="number"
                  name="usbPorts.usb3"
                  value={data.usbPorts?.usb3 || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>USB Type-C</Form.Label>
                <Form.Control
                  type="number"
                  name="usbPorts.typeC"
                  value={data.usbPorts?.typeC || 0}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3 mt-2">
            <Form.Check
              type="checkbox"
              label="Wi-Fi Incluso"
              name="wifiIncluded"
              checked={data.wifiIncluded || false}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3 mt-2">
            <Form.Check
              type="checkbox"
              label="Bluetooth Incluso"
              name="bluetoothIncluded"
              checked={data.bluetoothIncluded || false}
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
    </>
  );
};

export default MotherboardFormFields;
