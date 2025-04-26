import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <Card bg="dark" border="secondary" text="white">
      <Card.Body className="text-center py-5">
        <i className="bi bi-cart-x display-1 text-secondary mb-3"></i>
        <h3>Il tuo carrello è vuoto</h3>
        <p className="mb-4">
          Aggiungi alcuni prodotti al carrello per procedere al checkout.
        </p>
        <Button
          variant="warning"
          onClick={() => navigate("/")}
          className="px-4"
        >
          Continua lo shopping
        </Button>
      </Card.Body>
    </Card>
  );
};

export default EmptyCart;
