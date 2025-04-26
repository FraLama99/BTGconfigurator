import React from "react";
import { Card, Form, Alert } from "react-bootstrap";
import CreditCardForm from "./CreditCardForm";

const PaymentMethodForm = ({
  paymentMethod,
  setPaymentMethod,
  creditCardInfo,
  handleCreditCardChange,
}) => {
  return (
    <Card bg="dark" border="secondary" text="white">
      <Card.Header className="bg-dark border-secondary">
        <h5 className="mb-0">
          <i className="bi bi-credit-card me-2"></i>Metodo di Pagamento
        </h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            {/* Carta di credito */}
            <div className="payment-method-option mb-3">
              <Form.Check
                type="radio"
                id="creditCard"
                name="paymentMethod"
                label="Carta di credito"
                checked={paymentMethod === "creditCard"}
                onChange={() => setPaymentMethod("creditCard")}
                className="payment-radio"
              />
              <div className="payment-icons ms-3">
                <i className="bi bi-credit-card-2-front fs-4 text-warning me-2"></i>
                <i className="bi bi-credit-card-2-back fs-4 text-secondary"></i>
              </div>
            </div>

            {/* Form carta di credito */}
            {paymentMethod === "creditCard" && (
              <CreditCardForm
                creditCardInfo={creditCardInfo}
                handleCreditCardChange={handleCreditCardChange}
              />
            )}

            {/* PayPal */}
            <div className="payment-method-option mb-3">
              <Form.Check
                type="radio"
                id="paypal"
                name="paymentMethod"
                label="PayPal"
                checked={paymentMethod === "paypal"}
                onChange={() => setPaymentMethod("paypal")}
                className="payment-radio"
              />
              <div className="payment-icons ms-3">
                <i className="bi bi-paypal fs-4 text-info"></i>
              </div>
            </div>

            {/* Bonifico bancario */}
            <div className="payment-method-option">
              <Form.Check
                type="radio"
                id="bankTransfer"
                name="paymentMethod"
                label="Bonifico bancario"
                checked={paymentMethod === "bankTransfer"}
                onChange={() => setPaymentMethod("bankTransfer")}
                className="payment-radio"
              />
              <div className="payment-icons ms-3">
                <i className="bi bi-bank fs-4 text-secondary"></i>
              </div>
            </div>
          </Form.Group>

          {paymentMethod === "bankTransfer" && (
            <Alert variant="dark" className="border-warning mt-3">
              <p className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Il tuo ordine verrà processato dopo aver ricevuto il pagamento.
                Riceverai i dettagli per il bonifico via email.
              </p>
            </Alert>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default PaymentMethodForm;
