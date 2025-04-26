import React from "react";
import { Row, Col, Form } from "react-bootstrap";

const CreditCardForm = ({ creditCardInfo, handleCreditCardChange }) => {
  return (
    <div className="credit-card-section mt-3 mb-4 ps-4 border-start border-warning ms-1">
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Numero carta</Form.Label>
            <Form.Control
              type="text"
              name="cardNumber"
              value={creditCardInfo.cardNumber}
              onChange={handleCreditCardChange}
              placeholder="1234 5678 9012 3456"
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Titolare</Form.Label>
            <Form.Control
              type="text"
              name="cardHolder"
              value={creditCardInfo.cardHolder}
              onChange={handleCreditCardChange}
              placeholder="Nome Cognome"
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Data scadenza</Form.Label>
            <Form.Control
              type="text"
              name="expiryDate"
              value={creditCardInfo.expiryDate}
              onChange={handleCreditCardChange}
              placeholder="MM/AA"
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>CVV</Form.Label>
            <Form.Control
              type="text"
              name="cvv"
              value={creditCardInfo.cvv}
              onChange={handleCreditCardChange}
              placeholder="123"
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};

export default CreditCardForm;
