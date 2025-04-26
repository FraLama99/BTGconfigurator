import React from "react";
import { Card, Form, Row, Col } from "react-bootstrap";

const ShippingForm = ({ shippingAddress, handleAddressChange }) => {
  return (
    <Card bg="dark" border="secondary" text="white" className="mb-4">
      <Card.Header className="bg-dark border-secondary">
        <h5 className="mb-0">
          <i className="bi bi-geo-alt me-2"></i>Indirizzo di Spedizione
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Nome completo</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleAddressChange}
                  required
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Indirizzo</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleAddressChange}
                  placeholder="Via, numero civico"
                  required
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>Città</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  required
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>CAP</Form.Label>
                <Form.Control
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  required
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Paese</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  required
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ShippingForm;
