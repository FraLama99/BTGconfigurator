import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Button,
  Alert,
  Badge,
  Spinner,
} from "react-bootstrap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { formatDeliveryDate } from "../../component/configurator/utils/deliveryTimeCalculator";
import api from "../../utlis/api";

const OrderConfirmation = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Funzione per estrarre correttamente i dati dell'ordine
    const processOrderData = (data) => {
      // Controlla se i dati sono nidificati sotto una proprietà 'order'
      const orderData = data.order || data;
      console.log("Dati ordine ricevuti:", orderData);
      return orderData;
    };

    // Se abbiamo i dettagli dell'ordine dalla navigazione, li usiamo
    if (location.state?.orderDetails) {
      const processedData = processOrderData(location.state.orderDetails);
      setOrderDetails(processedData);
      setLoading(false);
      return;
    }

    // Altrimenti li recuperiamo dall'API
    const fetchOrderDetails = async () => {
      try {
        console.log("Recupero dettagli ordine con ID:", id);
        const response = await api.getOrderById(id);
        console.log("Risposta API ordini:", response);

        if (response && response.data) {
          // Elabora i dati per estrarre correttamente l'ordine
          const processedData = processOrderData(response.data);
          setOrderDetails(processedData);
        } else {
          throw new Error("Dettagli ordine non disponibili");
        }
      } catch (err) {
        console.error("Errore nel recupero dei dettagli dell'ordine:", err);
        setError(
          "Impossibile recuperare i dettagli dell'ordine. Riprova più tardi."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, location.state]);

  // Log di debug per vedere i dati dell'ordine
  useEffect(() => {
    if (orderDetails) {
      console.log("OrderDetails disponibili:", orderDetails);
    }
  }, [orderDetails]);

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3 text-white">Caricamento dettagli dell'ordine...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate("/")}>
          Vai alla Home
        </Button>
      </Container>
    );
  }

  if (!orderDetails) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Nessun dettaglio ordine disponibile. È possibile che l'ordine non
          esista o che tu non abbia i permessi per visualizzarlo.
        </Alert>
        <Button variant="primary" onClick={() => navigate("/")}>
          Vai alla Home
        </Button>
      </Container>
    );
  }

  // Crea un ID ordine sicuro per la visualizzazione (numero ordine o ID)
  const displayOrderId = orderDetails.orderNumber || id;

  // Formattazione dei dati per la visualizzazione
  const orderDate = orderDetails?.orderDate
    ? new Date(orderDetails.orderDate).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const estimatedDeliveryDate = orderDetails?.estimatedDeliveryDate
    ? formatDeliveryDate(new Date(orderDetails.estimatedDeliveryDate))
    : orderDetails?.estimatedDelivery?.estimatedDate
    ? formatDeliveryDate(new Date(orderDetails.estimatedDelivery.estimatedDate))
    : "Non disponibile";

  // Determinare lo stato di disponibilità dei componenti
  const allComponentsAvailable =
    orderDetails?.componentsAvailability?.allAvailable ||
    orderDetails?.estimatedDelivery?.allAvailable ||
    true;

  // Formatta il prezzo totale
  const formattedTotal = orderDetails?.totalPrice
    ? new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format(orderDetails.totalPrice)
    : "N/A";

  // Stato ordine
  const orderStatus = orderDetails?.status || "processing";
  const orderStatusText =
    orderStatus === "completed" ? "Completato" : "In elaborazione";

  // Metodo di pagamento
  const paymentMethodText =
    orderDetails?.paymentMethod === "creditCard"
      ? "Carta di credito"
      : orderDetails?.paymentMethod === "paypal"
      ? "PayPal"
      : orderDetails?.paymentMethod === "bankTransfer"
      ? "Bonifico bancario"
      : "Non specificato";

  return (
    <div className="order-confirmation-page bg-dark text-white py-5">
      <Container>
        {/* Messaggio di successo */}
        <Card bg="success" text="white" className="mb-4 text-center">
          <Card.Body className="py-5">
            <i className="bi bi-check-circle-fill display-1 mb-3"></i>
            <h1 className="mb-3">Grazie per il tuo ordine!</h1>
            <p className="lead mb-0">
              Il tuo ordine #{displayOrderId} è stato registrato con successo.
            </p>
          </Card.Body>
        </Card>

        {/* Riepilogo dell'ordine */}
        <Card bg="dark" border="warning" text="white" className="mb-4">
          <Card.Header className="bg-warning text-dark">
            <h4 className="mb-0">
              <i className="bi bi-receipt me-2"></i>
              Riepilogo dell'ordine #{displayOrderId}
            </h4>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h5 className="mb-3 text-warning">Dettagli dell'ordine</h5>
                <p>
                  <strong>Data ordine:</strong> {orderDate}
                </p>
                <p>
                  <strong>Stato:</strong>{" "}
                  <Badge
                    bg={orderStatus === "completed" ? "success" : "warning"}
                  >
                    {orderStatusText}
                  </Badge>
                </p>
                <p>
                  <strong>Metodo di pagamento:</strong> {paymentMethodText}
                </p>
                <p>
                  <strong>Totale ordine:</strong>{" "}
                  <span className="text-warning fw-bold">{formattedTotal}</span>
                </p>
              </Col>

              <Col md={6}>
                <h5 className="mb-3 text-warning">Spedizione</h5>
                <p>
                  <strong>Destinatario:</strong>{" "}
                  {orderDetails?.shippingInfo?.fullName || "N/A"}
                </p>
                <p>
                  <strong>Indirizzo:</strong>{" "}
                  {orderDetails?.shippingInfo?.address || "N/A"}
                </p>
                <p>
                  <strong>Città:</strong>{" "}
                  {orderDetails?.shippingInfo?.city || "N/A"},{" "}
                  {orderDetails?.shippingInfo?.zipCode ||
                    orderDetails?.shippingInfo?.postalCode ||
                    "N/A"}
                </p>
                <p>
                  <strong>Paese:</strong>{" "}
                  {orderDetails?.shippingInfo?.country || "Italia"}
                </p>
                <div className="delivery-info mt-3 p-2 border border-secondary rounded">
                  <div className="d-flex justify-content-between">
                    <span>
                      <strong>Data di consegna stimata:</strong>
                    </span>
                    <span>{estimatedDeliveryDate}</span>
                  </div>

                  {!allComponentsAvailable && (
                    <Alert variant="warning" className="mt-2 py-1 px-2 small">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Alcuni componenti non sono disponibili in magazzino e
                      verranno ordinati. Questo potrebbe ritardare la
                      spedizione.
                    </Alert>
                  )}
                </div>
              </Col>
            </Row>

            {/* Prodotti acquistati */}
            <div className="mt-4">
              <h5 className="mb-3 text-warning">Prodotti acquistati</h5>
              {orderDetails.machines && orderDetails.machines.length > 0 ? (
                orderDetails.machines.map((machine, index) => (
                  <Card
                    key={index}
                    bg="dark"
                    border="secondary"
                    className={
                      index < orderDetails.machines.length - 1 ? "mb-3" : "mb-0"
                    }
                  >
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="text-light">
                            {machine.name || "Configurazione PC"}
                          </h5>
                          <Badge bg="warning" text="dark" className="mb-2">
                            {machine.machineType === "Machine"
                              ? "Standard"
                              : "Custom"}
                          </Badge>

                          {machine.quantity > 1 && (
                            <Badge bg="info" className="ms-2 mb-2">
                              Quantità: {machine.quantity}
                            </Badge>
                          )}

                          {machine.components &&
                            Object.keys(machine.components).length > 0 && (
                              <div className="mt-3">
                                <h6 className="text-secondary mb-2">
                                  Componenti principali:
                                </h6>
                                <ul
                                  className="component-list ps-0"
                                  style={{ listStyleType: "none" }}
                                >
                                  {machine.components.cpu && (
                                    <li>
                                      <i className="bi bi-cpu me-2 text-secondary"></i>
                                      {machine.components.cpu.name}
                                    </li>
                                  )}
                                  {machine.components.gpu && (
                                    <li>
                                      <i className="bi bi-gpu-card me-2 text-secondary"></i>
                                      {machine.components.gpu.name}
                                    </li>
                                  )}
                                  {machine.components.ram && (
                                    <li>
                                      <i className="bi bi-memory me-2 text-secondary"></i>
                                      {machine.components.ram.name}
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>

                        <div className="text-end">
                          <div className="fs-5 text-warning fw-bold">
                            {(machine.price * machine.quantity).toFixed(2)} €
                          </div>
                          <small className="text-muted">IVA inclusa</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                // Fallback per vecchi ordini o se machines è vuoto
                <Card bg="dark" border="secondary" className="mb-0">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h5 className="text-light">
                          {orderDetails.machineType === "Machine" ||
                          orderDetails.machineType === "standard"
                            ? "PC Preconfigurato"
                            : "Configurazione Personalizzata"}
                        </h5>
                        <Badge bg="warning" text="dark" className="mb-2">
                          {orderDetails.machineType === "Machine" ||
                          orderDetails.machineType === "standard"
                            ? "Standard"
                            : "Custom"}
                        </Badge>

                        {orderDetails.components &&
                          Object.keys(orderDetails.components).length > 0 && (
                            <div className="mt-3">
                              <h6 className="text-secondary mb-2">
                                Componenti principali:
                              </h6>
                              <ul
                                className="component-list ps-0"
                                style={{ listStyleType: "none" }}
                              >
                                {orderDetails.components.cpu && (
                                  <li>
                                    <i className="bi bi-cpu me-2 text-secondary"></i>
                                    {orderDetails.components.cpu.name}
                                  </li>
                                )}
                                {orderDetails.components.gpu && (
                                  <li>
                                    <i className="bi bi-gpu-card me-2 text-secondary"></i>
                                    {orderDetails.components.gpu.name}
                                  </li>
                                )}
                                {orderDetails.components.ram && (
                                  <li>
                                    <i className="bi bi-memory me-2 text-secondary"></i>
                                    {orderDetails.components.ram.name}
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                      </div>

                      <div className="text-end">
                        <div className="fs-5 text-warning fw-bold">
                          {formattedTotal}
                        </div>
                        <small className="text-muted">IVA inclusa</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Prossimi passaggi e assistenza */}
        <Card bg="dark" border="secondary" text="white" className="mb-4">
          <Card.Body>
            <h5 className="mb-3 text-warning">Prossimi passaggi</h5>
            <ul className="steps-list ps-0">
              <li className="mb-2">
                <i className="bi bi-envelope me-2 text-success"></i>
                <span>
                  Abbiamo inviato una conferma dell'ordine all'indirizzo email
                  associato al tuo account.
                </span>
              </li>
              <li className="mb-2">
                <i className="bi bi-box-seam me-2 text-warning"></i>
                <span>
                  Il tuo ordine è in fase di elaborazione. Riceverai un
                  aggiornamento quando verrà spedito.
                </span>
              </li>
              <li>
                <i className="bi bi-truck me-2 text-info"></i>
                <span>
                  La consegna è prevista entro{" "}
                  <strong>{estimatedDeliveryDate}</strong>.
                </span>
              </li>
            </ul>

            <div className="mt-4">
              <h6>Hai domande sul tuo ordine?</h6>
              <p className="mb-0">
                Contatta il nostro servizio clienti al numero{" "}
                <span className="text-warning">800 123 456</span> o via email
                all'indirizzo{" "}
                <span className="text-warning">supporto@btgsys.it</span>
              </p>
            </div>
          </Card.Body>
        </Card>

        {/* Bottoni azione */}
        <div className="d-flex flex-column flex-md-row gap-3 mt-4 justify-content-center">
          <Button
            variant="warning"
            size="lg"
            className="px-5 py-3"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-house-fill me-2"></i>
            Torna alla Home
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default OrderConfirmation;
