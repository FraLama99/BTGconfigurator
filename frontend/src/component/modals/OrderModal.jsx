import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  ListGroup,
  Badge,
  Card,
  Table,
  Spinner,
} from "react-bootstrap";
import api from "../../utlis/api";

const OrderModal = ({ show, onHide, order, onUpdate }) => {
  // Inizializzazione sicura degli stati
  const [currentStatus, setCurrentStatus] = useState(
    order?.status || "pending"
  );
  const [paymentStatus, setPaymentStatus] = useState(
    order?.paymentStatus || "pending"
  );
  const [trackingNumber, setTrackingNumber] = useState(
    order?.trackingNumber || ""
  );
  const [notes, setNotes] = useState(order?.notes || "");
  const [cancellationReason, setCancellationReason] = useState(
    order?.cancellationReason || ""
  );
  const [updating, setUpdating] = useState(false);

  // Stato per la gestione delle macchine/configurazioni
  const [processedMachines, setProcessedMachines] = useState([]);
  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);
  const [inventoryData, setInventoryData] = useState({});
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Nuovi stati per i dati dell'utente
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);

  // Reset degli stati quando l'ordine cambia
  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status || "pending");
      setPaymentStatus(order.paymentStatus || "pending");
      setTrackingNumber(order.trackingNumber || "");
      setNotes(order.notes || "");
      setCancellationReason(order.cancellationReason || "");

      // Carica i dati completi dell'utente
      fetchUserData();
    }
  }, [order]);

  // Funzione per recuperare i dati completi dell'utente
  const fetchUserData = async () => {
    if (!order || !order.userId) return;

    // Estrai l'ID utente dall'ordine
    const userId =
      typeof order.userId === "object" ? order.userId._id : order.userId;

    if (!userId) return;

    setLoadingUserData(true);
    try {
      console.log("Recupero dati utente con ID:", userId);
      const response = await api.getUserById(userId);

      if (response && response.data) {
        console.log("Dati utente recuperati:", response.data);
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Errore nel recupero dei dati utente:", error);
    } finally {
      setLoadingUserData(false);
    }
  };

  // Funzione sicura per visualizzare i dati dell'utente
  const displayUserInfo = () => {
    if (loadingUserData) return "Caricamento...";

    if (userData) {
      return (
        `${userData.name || ""} ${userData.surname || ""}`.trim() ||
        userData.email ||
        "N/D"
      );
    }

    // Fallback ai dati parziali dell'ordine
    const orderUserData = order.userId || {};
    if (typeof orderUserData === "object") {
      return (
        `${orderUserData.name || ""} ${orderUserData.surname || ""}`.trim() ||
        orderUserData.email ||
        "N/D"
      );
    }

    return "Cliente non disponibile";
  };

  // Funzione sicura per ottenere l'email dell'utente
  const getUserEmail = () => {
    if (loadingUserData) return "Caricamento...";

    if (userData) {
      return userData.email || "Email non disponibile";
    }

    // Fallback ai dati parziali dell'ordine
    const orderUserData = order.userId || {};
    if (typeof orderUserData === "object") {
      return orderUserData.email || "Email non disponibile";
    }

    return "Email non disponibile";
  };

  // Funzione sicura per ottenere il telefono dell'utente
  const getUserPhone = () => {
    if (loadingUserData) return "Caricamento...";

    if (userData) {
      return userData.phone || "Telefono non disponibile";
    }

    return "Telefono non disponibile";
  };

  // Reset degli stati quando l'ordine cambia
  useEffect(() => {
    if (order) {
      console.log("Ordine ricevuto:", order);

      let machines = [];

      // Prova diversi percorsi possibili per i dati delle macchine
      if (order.items && Array.isArray(order.items)) {
        machines = order.items.map((item) => {
          return {
            ...item,
            components: item.components || {},
            quantity: item.quantity || 1,
            isPreset: item.isPreset || false,
          };
        });
      } else if (order.machines && Array.isArray(order.machines)) {
        machines = order.machines.map((machine) => {
          return {
            ...machine,
            components: machine.components || {},
            quantity: machine.quantity || 1,
            isPreset: machine.isPreset || false,
          };
        });
      }
      // Supporto per ordini legacy con un singolo item
      else if (order.machineId || order.components) {
        machines = [
          {
            name: order.machineName || "Configurazione PC",
            price: order.totalPrice,
            quantity: 1,
            components: order.components || {},
            isPreset: !!order.isPreset,
          },
        ];
      }

      console.log("Macchine elaborate:", machines);
      setProcessedMachines(machines);
      setCurrentMachineIndex(0);

      // Raccoglie gli ID dei componenti per il controllo inventario
      if (machines.length > 0) {
        loadInventoryData(machines);
      }
    }
  }, [order]); // 'order' è l'unica dipendenza

  // Carica i dati dell'inventario per i componenti
  const loadInventoryData = async (machines) => {
    // Usa l'oggetto order dallo scope esterno
    if (!order || !order._id) {
      console.warn("ID ordine non disponibile per recuperare l'inventario");
      return;
    }

    setIsLoadingInventory(true);
    try {
      console.log("Caricamento inventario per ordine:", order._id);

      // Utilizza la funzione getOrderInventory con l'ID dell'ordine
      const inventoryResponse = await api.getOrderInventory(order._id);
      console.log("Risposta inventario:", inventoryResponse);

      console.log(
        "Tipo di inventoryResponse.data:",
        Array.isArray(inventoryResponse.data)
          ? "Array"
          : typeof inventoryResponse.data
      );
      console.log(
        "inventoryResponse.data:",
        JSON.stringify(inventoryResponse.data).substring(0, 200) + "..."
      );

      const inventory = {};

      // Controlla la struttura effettiva dei dati ricevuti
      if (inventoryResponse && inventoryResponse.data) {
        // Verifica se la risposta.data.components è un array (struttura corretta)
        if (
          inventoryResponse.data.components &&
          Array.isArray(inventoryResponse.data.components)
        ) {
          // Mappa l'array dei componenti per ID
          inventoryResponse.data.components.forEach((item) => {
            if (item && item._id) {
              inventory[item._id] = {
                stock: item.stock,
                name: item.name,
                price: item.price,
              };
            }
          });
        }
      }

      console.log("Mappa inventario elaborata:", inventory);
      setInventoryData(inventory);
    } catch (error) {
      console.error("Errore nel caricamento dei dati di inventario:", error);
      setInventoryData({});
    } finally {
      setIsLoadingInventory(false);
    }
  };

  // Funzioni per navigare tra le macchine
  const goToPrevMachine = () => {
    if (currentMachineIndex > 0) {
      setCurrentMachineIndex(currentMachineIndex - 1);
    }
  };

  const goToNextMachine = () => {
    if (currentMachineIndex < processedMachines.length - 1) {
      setCurrentMachineIndex(currentMachineIndex + 1);
    }
  };

  // Funzione per formattare il prezzo
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/D";
    return Number(price).toFixed(2) + " €";
  };

  // Funzione per ottenere il testo dello stato in italiano
  const getStatusText = (status) => {
    switch (status) {
      case "processing":
        return "In Lavorazione";
      case "assembled":
        return "Assemblato";
      case "shipped":
        return "Spedito";
      case "delivered":
        return "Consegnato";
      case "pending":
        return "In Attesa";
      case "cancelled":
        return "Annullato";
      default:
        return status || "N/D";
    }
  };

  // Funzione per ottenere il colore della badge in base allo stato
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "processing":
        return "warning";
      case "assembled":
        return "info";
      case "shipped":
        return "success";
      case "delivered":
        return "primary";
      case "pending":
        return "secondary";
      case "cancelled":
        return "danger";
      default:
        return "light";
    }
  };

  // Funzione per ottenere il testo dello stato di pagamento in italiano
  const getPaymentStatusText = (status) => {
    switch (status) {
      case "pending":
        return "In Attesa";
      case "completed": // Cambiato da 'paid' a 'completed'
        return "Pagato";
      case "failed":
        return "Fallito";
      case "refunded":
        return "Rimborsato";
      default:
        return status || "N/D";
    }
  };

  // Funzione per ottenere il colore della badge per lo stato di pagamento
  const getPaymentStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "completed": // Cambiato da 'paid' a 'completed'
        return "success";
      case "failed":
        return "danger";
      case "refunded":
        return "info";
      default:
        return "secondary";
    }
  };

  const handleStatusChange = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      // Crea l'oggetto di aggiornamento
      const updateData = {
        status: currentStatus,
        paymentStatus: paymentStatus, // Assicurati che questo campo sia incluso
        trackingNumber:
          currentStatus === "shipped" ? trackingNumber : order.trackingNumber,
        notes: notes,
      };

      // Aggiungi la motivazione di cancellazione se lo stato è 'cancelled'
      if (currentStatus === "cancelled") {
        updateData.cancellationReason = cancellationReason;
      }

      console.log("Dati di aggiornamento:", updateData);

      // Usa esplicitamente la funzione updateOrderStatus che è sicuramente disponibile
      const response = await api.updateOrderStatus(order._id, updateData);

      // Verifica nella console se la risposta include i dati di pagamento aggiornati
      console.log("Risposta dopo aggiornamento:", response.data);

      if (response && response.data) {
        // Verifica se lo stato di pagamento è stato effettivamente aggiornato
        if (
          response.data.order &&
          response.data.order.paymentStatus !== paymentStatus
        ) {
          console.warn(
            "Lo stato di pagamento non è stato aggiornato correttamente!"
          );
        } else {
          console.log("Ordine aggiornato con successo:", response.data);
        }

        // Aggiorna l'ordine nel componente genitore (Admin Home)
        onUpdate(response.data.order || response.data);
        onHide();
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'ordine:", error);
      alert(
        "Si è verificato un errore durante l'aggiornamento dell'ordine. " +
          "Controlla la console per i dettagli."
      );
    } finally {
      setUpdating(false);
    }
  };

  // Se non c'è un ordine selezionato, non mostrare il modale
  if (!order) return null;

  // Ottieni la macchina corrente
  const currentMachine = processedMachines[currentMachineIndex] || {};
  const currentComponents = currentMachine.components || {};
  const isPreset = !!currentMachine.isPreset;
  const assemblyCost = Number(currentMachine.assemblyCost || 0);

  // Traduci i tipi di componenti in italiano
  const componentTypeMap = {
    cpu: "Processore",
    motherboard: "Scheda Madre",
    ram: "RAM",
    gpu: "Scheda Video",
    storage: "Storage",
    powerSupply: "Alimentatore",
    case: "Case",
    cooling: "Raffreddamento",
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Gestione Ordine {order.orderNumber || order._id}
          <Badge bg={getStatusBadgeColor(order.status)} className="ms-2">
            {getStatusText(order.status)}
          </Badge>
          <Badge
            bg={getPaymentStatusBadgeColor(order.paymentStatus)}
            className="ms-2"
          >
            {getPaymentStatusText(order.paymentStatus || "pending")}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="mb-3">Informazioni Cliente</h5>
        <Row className="mb-4">
          <Col md={6}>
            <p>
              <strong>Nome:</strong> {displayUserInfo()}
            </p>
            <p>
              <strong>Email:</strong> {getUserEmail()}
            </p>
            <p>
              <strong>Data Ordine:</strong>{" "}
              {order.orderDate
                ? new Date(order.orderDate).toLocaleDateString("it-IT")
                : "N/D"}
            </p>
          </Col>
          <Col md={6}>
            <p>
              <strong>Indirizzo:</strong>{" "}
              {order.shippingInfo
                ? `${order.shippingInfo.address || ""}, 
              ${order.shippingInfo.city || ""} 
              ${order.shippingInfo.postalCode || ""}`
                : "Non disponibile"}
            </p>
            <p>
              <strong>Telefono:</strong> {getUserPhone()}
              {loadingUserData && (
                <Spinner animation="border" size="sm" className="ms-2" />
              )}
            </p>
          </Col>
        </Row>

        <h5 className="mb-3">Dettagli Configurazioni</h5>

        {/* Navigazione tra le macchine */}
        {processedMachines.length > 0 && (
          <Card className="mb-4 border-info">
            <Card.Header className="bg-info text-white d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  {currentMachine.name || "Configurazione PC"}
                </h5>
                <small>
                  {isPreset ? "PC Preconfigurato" : "PC Personalizzato"}
                  {currentMachine.quantity > 1
                    ? ` (${currentMachine.quantity} unità)`
                    : ""}
                </small>
              </div>
              <div className="d-flex align-items-center">
                <Button
                  variant="light"
                  size="sm"
                  onClick={goToPrevMachine}
                  disabled={currentMachineIndex === 0}
                  className="me-2"
                >
                  <i className="bi bi-chevron-left"></i>
                </Button>
                <span>
                  {currentMachineIndex + 1} di {processedMachines.length}
                </span>
                <Button
                  variant="light"
                  size="sm"
                  onClick={goToNextMachine}
                  disabled={
                    currentMachineIndex === processedMachines.length - 1
                  }
                  className="ms-2"
                >
                  <i className="bi bi-chevron-right"></i>
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Componente</th>
                    <th>Nome</th>
                    <th className="text-center">Magazzino</th>
                    <th className="text-end">Prezzo</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(currentComponents || {})
                    .filter(
                      ([_, component]) =>
                        component !== null && component !== undefined
                    )
                    .map(([type, component], idx) => {
                      // Gestione sicura degli ID e dello stock
                      const componentId = component?.id || component?._id || "";
                      const stock = inventoryData[componentId]?.stock;

                      return (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{componentTypeMap[type] || type}</td>
                          <td>{component?.name || "N/D"}</td>
                          <td className="text-center">
                            {isLoadingInventory ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              <Badge
                                bg={
                                  stock === undefined
                                    ? "secondary"
                                    : stock === 0
                                    ? "danger"
                                    : stock <= 2
                                    ? "warning"
                                    : "success"
                                }
                              >
                                {stock !== undefined ? stock : "N/D"}
                              </Badge>
                            )}
                          </td>
                          <td className="text-end">
                            {component?.price
                              ? Number(component.price).toFixed(2) + " €"
                              : "N/D"}
                          </td>
                        </tr>
                      );
                    })}
                  {assemblyCost > 0 && (
                    <tr>
                      <td colSpan="4" className="text-end">
                        <strong>Costo Assemblaggio</strong>
                      </td>
                      <td className="text-end">{assemblyCost.toFixed(2)} €</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="4" className="text-end">
                      <strong>Prezzo Unitario</strong>
                    </td>
                    <td className="text-end">
                      <strong>
                        {currentMachine?.price
                          ? Number(currentMachine.price).toFixed(2) + " €"
                          : "N/D"}
                      </strong>
                    </td>
                  </tr>
                  {currentMachine.quantity > 1 && (
                    <tr>
                      <td colSpan="4" className="text-end">
                        <strong>
                          Totale ({currentMachine.quantity} unità)
                        </strong>
                      </td>
                      <td className="text-end">
                        <strong>
                          {currentMachine?.price && currentMachine.quantity
                            ? (
                                Number(currentMachine.price) *
                                currentMachine.quantity
                              ).toFixed(2) + " €"
                            : "N/D"}
                        </strong>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        <h5 className="mb-3">Riepilogo Ordine</h5>
        <ListGroup className="mb-4">
          {order.items &&
            order.items.map((item, index) => (
              <ListGroup.Item
                key={index}
                className="d-flex justify-content-between align-items-center"
                action
                onClick={() => setCurrentMachineIndex(index)}
                active={currentMachineIndex === index}
              >
                <div>
                  <strong>{item?.name || "Configurazione PC"}</strong>
                  <div className="text-muted">
                    {item?.isPreset ? "PC Preconfigurato" : "PC Personalizzato"}
                    {item?.quantity > 1 ? ` (${item.quantity} unità)` : ""}
                  </div>
                </div>
                <div>
                  <Badge bg="info">
                    {formatPrice(
                      item?.price ? item.price * (item.quantity || 1) : null
                    )}
                  </Badge>
                </div>
              </ListGroup.Item>
            ))}
          <ListGroup.Item className="d-flex justify-content-between">
            <strong>Totale Ordine</strong>
            <strong>{formatPrice(order.totalPrice)}</strong>
          </ListGroup.Item>
        </ListGroup>

        <h5 className="mb-3">Gestisci Stato</h5>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Stato Ordine</Form.Label>
            <Form.Select
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value)}
            >
              <option value="pending">In Attesa</option>
              <option value="processing">In Lavorazione</option>
              <option value="assembled">Assemblato</option>
              <option value="shipped">Spedito</option>
              <option value="delivered">Consegnato</option>
              <option value="cancelled">Annullato</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Stato Pagamento</Form.Label>
            <Form.Select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="pending">In Attesa</option>
              <option value="completed">Pagato</option>
              <option value="failed">Fallito</option>
              <option value="refunded">Rimborsato</option>
            </Form.Select>
          </Form.Group>

          {currentStatus === "shipped" && (
            <Form.Group className="mb-3">
              <Form.Label>Numero di Tracciamento</Form.Label>
              <Form.Control
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Inserisci numero di tracciamento"
              />
            </Form.Group>
          )}

          {currentStatus === "cancelled" && (
            <Form.Group className="mb-3">
              <Form.Label>Motivo Cancellazione</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Specifica il motivo della cancellazione"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Note</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note sull'ordine"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Chiudi
        </Button>
        <Button
          variant="primary"
          onClick={handleStatusChange}
          disabled={updating}
        >
          {updating ? "Aggiornamento..." : "Aggiorna Stato"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default OrderModal;
