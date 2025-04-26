import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const PowerFormFields = ({ data, handleChange }) => {
  // Opzioni per i campi select
  const efficiencyOptions = [
    "80+ White",
    "80+ Bronze",
    "80+ Silver",
    "80+ Gold",
    "80+ Platinum",
    "80+ Titanium",
  ];
  const modularOptions = ["No", "Semi", "Full"];
  const formFactorOptions = ["ATX", "SFX", "SFX-L", "TFX", "FlexATX"];

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
              placeholder="ES: Corsair RM850x"
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
              placeholder="ES: Corsair"
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
              placeholder="ES: RM850x"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Potenza (W)*</Form.Label>
            <Form.Control
              type="number"
              name="wattage"
              value={data.wattage}
              onChange={handleChange}
              required
              placeholder="ES: 850"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Efficienza*</Form.Label>
            <Form.Select
              name="efficiency"
              value={data.efficiency}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona efficienza</option>
              {efficiencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Modularità*</Form.Label>
            <Form.Select
              name="modular"
              value={data.modular}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona tipo</option>
              {modularOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Formato*</Form.Label>
            <Form.Select
              name="formFactor"
              value={data.formFactor}
              onChange={handleChange}
              required
            >
              <option value="">Seleziona formato</option>
              {formFactorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Form.Select>
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
              placeholder="Descrizione dettagliata del prodotto..."
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
};

export default PowerFormFields;
