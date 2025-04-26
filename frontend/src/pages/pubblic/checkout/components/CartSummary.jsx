import React from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";

const CartSummary = ({
  cartItems,
  loading,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
}) => {
  return (
    <Card bg="dark" border="secondary" text="white" className="mb-4">
      <Card.Header className="bg-dark border-secondary">
        <h5 className="mb-0">
          <i className="bi bi-cart-check me-2"></i>Riepilogo Ordine
        </h5>
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive variant="dark" className="mb-0 checkout-table">
          <thead>
            <tr>
              <th className="ps-3">Prodotto</th>
              <th>Prezzo</th>
              <th>Quantità</th>
              <th>Totale</th>
              <th className="text-end pe-3">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={index}>
                <td className="align-middle ps-3">
                  <div className="d-flex align-items-center">
                    <div>
                      <div className="fw-bold text-white">{item.item.name}</div>
                      <Badge bg="warning" text="dark">
                        {item.type === "machine"
                          ? "PC Configurabile"
                          : item.type === "preset"
                          ? "PC Preconfigurato"
                          : item.type === "customMachine"
                          ? "Configurazione Personalizzata"
                          : "Prodotto"}
                      </Badge>
                    </div>
                  </div>
                </td>
                <td className="align-middle">
                  {(
                    item.price ||
                    item.item.totalPrice ||
                    item.item.price
                  ).toFixed(2)}{" "}
                  €
                </td>
                <td className="align-middle">
                  <div className="d-flex align-items-center quantity-controls">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => decreaseQuantity(index)}
                      className="quantity-btn"
                      disabled={loading || item.quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </Button>
                    <span className="mx-3">{item.quantity}</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => increaseQuantity(index)}
                      className="quantity-btn"
                      disabled={loading}
                    >
                      <i className="bi bi-plus"></i>
                    </Button>
                  </div>
                </td>
                <td className="align-middle fw-bold text-warning">
                  {(
                    (item.price || item.item.totalPrice || item.item.price) *
                    item.quantity
                  ).toFixed(2)}{" "}
                  €
                </td>
                <td className="align-middle text-end pe-3">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="remove-btn"
                    disabled={loading}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default CartSummary;
