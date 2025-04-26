import React, { useEffect, useState } from "react";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import DeliveryInfo from "./DeliveryInfo";
import { calculatePrices, calculateTotalPrice } from "../utils/checkoutHelpers";

const OrderSummary = ({
  totalPrice,
  subtotalWithoutVAT,
  vatAmount,
  totalWithVAT,
  deliveryInfo,
  processPayment,
  paymentStatus,
  loading,
  navigate,
  cartItems,
  handlePlaceOrder,
}) => {
  // Stato locale per i prezzi calcolati
  const [calculatedPrices, setCalculatedPrices] = useState({
    totalPrice: totalPrice || 0,
    subtotalWithoutVAT: subtotalWithoutVAT || 0,
    vatAmount: vatAmount || 0,
    totalWithVAT: totalWithVAT || 0,
  });

  // Calcola i prezzi usando la funzione importata
  useEffect(() => {
    console.log("cartItems ricevuti:", cartItems);

    if (cartItems && cartItems.length > 0) {
      console.log("Calcolando prezzi per:", cartItems);
      try {
        const prices = calculatePrices(cartItems);
        console.log("Prezzi calcolati:", prices);
        setCalculatedPrices(prices);
      } catch (error) {
        console.error("Errore nel calcolo dei prezzi:", error);
      }
    } else {
      console.log("Nessun item nel carrello o array vuoto");
    }
  }, [cartItems]);

  // Debug nel getPrices
  const getPrices = () => {
    console.log("Props ricevute:", {
      totalPrice,
      subtotalWithoutVAT,
      vatAmount,
      totalWithVAT,
    });
    console.log("Prezzi calcolati:", calculatedPrices);

    // Se i prezzi sono già stati forniti come props, usali
    if (totalPrice !== undefined && totalWithVAT !== undefined) {
      console.log("Usando prezzi dalle props");
      return { totalPrice, subtotalWithoutVAT, vatAmount, totalWithVAT };
    }
    // Altrimenti usa i prezzi calcolati
    console.log("Usando prezzi calcolati");
    return calculatedPrices;
  };

  const prices = getPrices();

  return (
    <div className="sticky-top" style={{ top: "20px", zIndex: 10 }}>
      {/* Riepilogo prezzi */}
      <Card bg="dark" border="warning" text="white" className="order-summary">
        <Card.Header className="bg-warning text-dark">
          <h5 className="mb-0">
            <i className="bi bi-receipt me-2"></i>Riepilogo Ordine
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between mb-2">
            <span>Subtotale</span>
            <span>{prices.totalPrice.toFixed(2)} €</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>Subtotale (IVA esclusa)</span>
            <span>{prices.subtotalWithoutVAT.toFixed(2)} €</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>Spedizione</span>
            <span className="text-success">Gratuita</span>
          </div>
          <div className="d-flex justify-content-between mb-2">
            <span>IVA (22%)</span>
            <span>{prices.vatAmount.toFixed(2)} €</span>
          </div>
          <hr className="border-secondary" />
          <div className="d-flex justify-content-between mb-3">
            <strong>Totale</strong>
            <div className="text-end">
              <div className="text-warning fs-4 fw-bold">
                {prices.totalWithVAT.toFixed(2)} €
              </div>
              <small className="text-muted">IVA inclusa</small>
            </div>
          </div>

          <DeliveryInfo deliveryInfo={deliveryInfo} />

          {/* Stato del pagamento */}
          {processPayment && (
            <div className="payment-status mb-4">
              {paymentStatus.processing && (
                <div className="text-center py-3">
                  <Spinner
                    animation="border"
                    variant="warning"
                    size="sm"
                    className="me-2"
                  />
                  <span>{paymentStatus.message}</span>
                </div>
              )}
              {paymentStatus.success && (
                <Alert variant="success" className="py-2">
                  <i className="bi bi-check-circle me-2"></i>
                  {paymentStatus.message}
                </Alert>
              )}
              {paymentStatus.error && (
                <Alert variant="danger" className="py-2">
                  <i className="bi bi-x-circle me-2"></i>
                  {paymentStatus.message}
                </Alert>
              )}
            </div>
          )}

          {/* Pulsanti: Aggiungi al carrello e torna alla home + Completa l'ordine */}
          <div className="d-flex flex-column flex-md-row gap-2 mt-2">
            <Button
              variant="warning"
              size="lg"
              className="w-100 mb-2 mb-md-0"
              onClick={() => {
                // Salva il prodotto corrente nel localStorage
                const currentItems = JSON.parse(
                  localStorage.getItem("cart") || "[]"
                );

                // Determina il nome e il prezzo del prodotto in base al tipo
                let productName = "Prodotto";
                let productPrice = 0;
                let productType = "product";
                let components = null;

                if (cartItems && cartItems.length > 0) {
                  const item = cartItems[0];

                  // Log per debug
                  console.log("Aggiungendo al carrello:", item);
                  console.log("Prezzi calcolati:", prices);

                  // Gestione dei prodotti preconfigurati
                  if (item?.item?.name) {
                    productName = item.item.name;
                    productPrice = item.item.finalPrice || item.item.price || 0;
                    productType = item.type || "preset";
                  }
                  // Gestione delle configurazioni personalizzate
                  else if (item?.components) {
                    // Per le configurazioni machine personalizzate
                    productName = item.name || "Configurazione personalizzata";
                    productPrice = prices.totalWithVAT; // Usa il prezzo calcolato
                    productType = "custom-pc";
                    components = item.components;
                  }
                  // Fallback generico
                  else {
                    productName = item.name || "Prodotto";
                    productPrice =
                      item.price || item.finalPrice || prices.totalWithVAT || 0;
                    productType = item.type || "product";
                  }
                }

                const itemToAdd = {
                  id: cartItems[0]?.id || Date.now().toString(),
                  name: productName,
                  price: productPrice,
                  quantity: 1,
                  type: productType,
                  components: components,
                };

                // Log per debug
                console.log("Aggiungendo al carrello:", itemToAdd);

                currentItems.push(itemToAdd);
                localStorage.setItem("cart", JSON.stringify(currentItems));

                // Reindirizzare alla home
                navigate("/");
              }}
              disabled={loading || processPayment}
            >
              <i className="bi bi-cart-plus me-2"></i>
              Aggiungi al carrello e continua
            </Button>

            <Button
              variant="success"
              size="lg"
              className="w-100"
              onClick={handlePlaceOrder}
              disabled={loading || cartItems.length === 0 || processPayment}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    className="me-2"
                  />
                  Elaborazione...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Completa l'ordine
                </>
              )}
            </Button>
          </div>

          {/* Badge sicurezza */}
          <div className="security-badges text-center mt-4">
            <div className="d-flex justify-content-center">
              <i className="bi bi-shield-lock fs-3 me-3 text-success"></i>
              <i className="bi bi-patch-check fs-3 text-info"></i>
            </div>
            <small className="text-muted mt-2 d-block">
              Pagamenti sicuri e criptati
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Assistenza */}
      <CustomerSupport />
    </div>
  );
};

// Componente per il supporto clienti
const CustomerSupport = () => (
  <Card bg="dark" border="secondary" text="white" className="mt-3">
    <Card.Body>
      <h6 className="mb-3">Hai domande sul tuo ordine?</h6>
      <p className="mb-0 small">
        Contatta il nostro servizio clienti al numero{" "}
        <span className="text-warning">800 123 456</span> o via email
        all'indirizzo <span className="text-warning">supporto@btgsys.it</span>
      </p>
    </Card.Body>
  </Card>
);

export default OrderSummary;
