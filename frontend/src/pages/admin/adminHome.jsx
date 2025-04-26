import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Button,
  Row,
  Col,
  Card,
  Badge,
  Tabs,
  Tab,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import SideAdmin from "../../component/side/sideAdmin";
import OrderModal from "../../component/modals/OrderModal";
import api from "../../utlis/api";
import OrderSummaryBox from "../../component/dashboard/OrderSummaryBox";
import InventoryAlertBox from "../../component/dashboard/InventoryAlertBox";

const AdminHome = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDataMap, setUserDataMap] = useState({});
  const [activeTab, setActiveTab] = useState("activeOrders");

  // Funzione per ottenere gli ordini dalle API
  // Funzione per ottenere gli ordini dalle API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Sostituito getUserOrders con getAdminOrders per accedere a tutti gli ordini come amministratore
      const response = await api.getAdminOrders();
      const ordersData = response.data || [];

      // Dividiamo gli ordini in attivi e completati/annullati
      const active = [];
      const completed = [];

      ordersData.forEach((order) => {
        if (order.status === "delivered" || order.status === "cancelled") {
          completed.push(order);
        } else {
          active.push(order);
        }
      });

      setOrders(active);
      setCompletedOrders(completed);

      // Estrai gli ID utenti unici da tutti gli ordini
      const userIds = new Set(
        ordersData
          .map((order) =>
            typeof order.userId === "object" ? order.userId._id : order.userId
          )
          .filter(Boolean)
      );

      // Carica i dati degli utenti
      await loadUserData(Array.from(userIds));

      setError(null);
    } catch (error) {
      console.error("Errore durante il recupero degli ordini:", error);
      setError("Impossibile caricare gli ordini. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Funzione per caricare i dati utenti
  const loadUserData = async (userIds) => {
    try {
      // Creo una mappa temporanea per salvare i dati utente
      const tempUserDataMap = {};

      // Per ogni userId, carico i dati se non sono già oggetti completi
      for (const userId of userIds) {
        if (!userId) continue;

        // Carico i dati dell'utente
        const response = await api.getUserById(userId);
        if (response.data) {
          tempUserDataMap[userId] = response.data;
        }
      }

      setUserDataMap(tempUserDataMap);
    } catch (error) {
      console.error("Errore nel caricamento dei dati utente:", error);
    }
  };

  // Funzione di utilità per ottenere i dati dell'utente da un ordine
  const getUserDataFromOrder = (order) => {
    // Se userId è un oggetto completo, usiamo quello
    if (order.userId && typeof order.userId === "object" && order.userId.name) {
      return order.userId;
    }

    // Altrimenti cerchiamo nella nostra mappa di dati utente
    const userId = order.userId;
    return userId ? userDataMap[userId] : null;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Funzione per aprire il modale dell'ordine
  const handleOpenOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Aggiorna lo stato dell'ordine e sposta tra le liste appropriate
  const handleOrderUpdate = (updatedOrder) => {
    // Verifica che updatedOrder sia definito e abbia una proprietà status
    if (!updatedOrder || typeof updatedOrder !== "object") {
      console.error("Errore: oggetto ordine non valido ricevuto", updatedOrder);
      return;
    }

    // Copia l'ordine per evitare mutazioni indesiderate
    const orderToUpdate = { ...updatedOrder };

    if (
      orderToUpdate.status === "delivered" ||
      orderToUpdate.status === "cancelled"
    ) {
      // Rimuovi dall'elenco degli ordini attivi
      setOrders(orders.filter((order) => order._id !== orderToUpdate._id));

      // Aggiungi all'elenco degli ordini evasi
      setCompletedOrders([orderToUpdate, ...completedOrders]);
    } else {
      // Aggiorna l'ordine nella lista degli ordini attivi
      setOrders(
        orders.map((order) =>
          order._id === orderToUpdate._id ? orderToUpdate : order
        )
      );

      // Rimuovi dagli ordini evasi se presente
      setCompletedOrders(
        completedOrders.filter((order) => order._id !== orderToUpdate._id)
      );
    }
  };
  // Prodotti da gestire e relativi percorsi
  const productCategories = [
    {
      name: "CPU",
      addPath: "/admin/add-cpu",
      managePath: "/admin/manage-cpus",
      addIcon: "bi bi-cpu",
      manageIcon: "bi bi-gear",
    },
    {
      name: "CASE",
      addPath: "/admin/add-case",
      managePath: "/admin/manage-cases",
      addIcon: "bi bi-box",
      manageIcon: "bi bi-gear",
    },
    {
      name: "COOLER",
      addPath: "/admin/add-cooler",
      managePath: "/admin/manage-coolers",
      addIcon: "bi bi-wind",
      manageIcon: "bi bi-gear",
    },
    {
      name: "GPU",
      addPath: "/admin/add-gpu",
      managePath: "/admin/manage-gpus",
      addIcon: "bi bi-gpu-card",
      manageIcon: "bi bi-gear",
    },
    {
      name: "SCHEDA MADRE",
      addPath: "/admin/add-motherboard",
      managePath: "/admin/manage-motherboards",
      addIcon: "bi bi-motherboard",
      manageIcon: "bi bi-gear",
    },
    {
      name: "ALIMENTAZIONE",
      addPath: "/admin/add-power",
      managePath: "/admin/manage-powers",
      addIcon: "bi bi-battery-charging",
      manageIcon: "bi bi-gear",
    },
    {
      name: "RAM",
      addPath: "/admin/add-ram",
      managePath: "/admin/manage-rams",
      addIcon: "bi bi-memory",
      manageIcon: "bi bi-gear",
    },
    {
      name: "STORAGE",
      addPath: "/admin/add-storage",
      managePath: "/admin/manage-storages",
      addIcon: "bi bi-device-hdd",
      manageIcon: "bi bi-gear",
    },
  ];

  // Configurazioni predefinite
  const presetConfigs = [
    {
      name: "GAMING PRECONFIGURATO",
      addPath: "/admin/add-gaming-preset",
      managePath: "/admin/manage-gaming-presets",
      addIcon: "bi bi-joystick",
      manageIcon: "bi bi-gear",
    },
    {
      name: "WORKSTATION",
      addPath: "/admin/add-workstation",
      managePath: "/admin/manage-workstations",
      addIcon: "bi bi-pc-display",
      manageIcon: "bi bi-gear",
    },
  ];

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
        return status;
    }
  };

  // Componente OrderCard riutilizzabile
  const OrderCard = ({ order, onClick, index }) => {
    const userData = getUserDataFromOrder(order);

    return (
      <Card
        className="mb-3 order-card"
        onClick={() => onClick(order)}
        style={{ cursor: "pointer" }}
      >
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              {order.orderNumber || order._id || `Ordine #${index + 1}`}
            </h5>
            <Badge bg={getStatusBadgeColor(order.status || "pending")}>
              {getStatusText(order.status || "pending")}
            </Badge>
          </div>
          <Row>
            <Col md={4}>
              <p className="mb-1">
                <strong>Cliente:</strong>{" "}
                {userData?.name
                  ? `${userData.name} ${userData.surname || ""}`
                  : `Cliente #${order.userId || "N/D"}`}
              </p>
              <p className="mb-1">
                <strong>Email:</strong>{" "}
                {userData?.email || "Email non disponibile"}
              </p>
              <p className="mb-1">
                <strong>Data:</strong>{" "}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString("it-IT")
                  : "Data non disponibile"}
              </p>
            </Col>
            <Col md={4}>
              <p className="mb-1">
                <strong>Totale:</strong>{" "}
                {order.totalPrice !== undefined && order.totalPrice !== null
                  ? Number(order.totalPrice).toFixed(2)
                  : "N/D"}{" "}
                €
              </p>
              <p className="mb-1">
                <strong>Pagamento:</strong>{" "}
                {order.paymentStatus === "completed" ? (
                  <Badge bg="success">Pagato</Badge>
                ) : (
                  <Badge bg="danger">In attesa</Badge>
                )}
              </p>
            </Col>
            <Col md={4}>
              <p className="mb-1">
                <strong>Spedizione:</strong>{" "}
                {order.shippingInfo?.method || "Standard"}
              </p>
              {order.status === "shipped" && order.shippingDate ? (
                <p className="mb-1">
                  <strong>Spedito il:</strong>{" "}
                  {new Date(order.shippingDate).toLocaleDateString("it-IT")}
                </p>
              ) : order.estimatedDeliveryDate ? (
                <p className="mb-1">
                  <strong>Consegna prevista:</strong>{" "}
                  {new Date(order.estimatedDeliveryDate).toLocaleDateString(
                    "it-IT"
                  )}
                </p>
              ) : (
                <p className="mb-1">
                  <strong>Spedizione:</strong> Da definire
                </p>
              )}

              {/* Mostra causale per ordini cancellati */}
              {order.status === "cancelled" && order.cancellationReason && (
                <p className="mb-1 text-danger">
                  <strong>Causale:</strong> {order.cancellationReason}
                </p>
              )}
            </Col>
          </Row>
          <div className="text-end mt-2">
            <Button variant="primary" size="sm">
              <i className="bi bi-pencil-square me-1"></i> Gestisci ordine
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="d-flex">
      {/* Sidebar Admin */}
      <SideAdmin />

      {/* Contenuto principale con margin-left per compensare la sidebar */}
      <div style={{ marginLeft: "250px", width: "calc(100% - 250px)" }}>
        <Container fluid className="py-4">
          <h1 className="text-center mb-4">Pannello di Amministrazione</h1>

          {/* Dashboard Analytics */}
          {!loading && !error && (
            <>
              <Row className="mb-4">
                <Col md={12}>
                  <OrderSummaryBox orders={[...orders, ...completedOrders]} />
                </Col>
              </Row>
              <Row className="mb-4">
                <Col md={12}>
                  <InventoryAlertBox />
                </Col>
              </Row>
            </>
          )}

          {/* Tabs per separare ordini attivi da evasi */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab
              eventKey="activeOrders"
              title={
                <span>
                  <i className="bi bi-hourglass me-1"></i>
                  Ordini in corso <Badge bg="primary">{orders.length}</Badge>
                </span>
              }
            >
              <Row>
                <Col md={12}>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                      </div>
                      <p className="mt-2">Caricamento ordini in corso...</p>
                    </div>
                  ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox fs-1"></i>
                      <p className="mt-2">Nessun ordine attivo</p>
                    </div>
                  ) : (
                    orders.map((order, index) => (
                      <OrderCard
                        key={`active-order-${order._id}`}
                        order={order}
                        onClick={handleOpenOrderModal}
                        index={index}
                      />
                    ))
                  )}
                </Col>
              </Row>
            </Tab>

            <Tab
              eventKey="completedOrders"
              title={
                <span>
                  <i className="bi bi-check-circle me-1"></i>
                  Ordini evasi{" "}
                  <Badge bg="success">{completedOrders.length}</Badge>
                </span>
              }
            >
              <Row>
                <Col md={12}>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Caricamento...</span>
                      </div>
                      <p className="mt-2">Caricamento ordini evasi...</p>
                    </div>
                  ) : completedOrders.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-archive fs-1"></i>
                      <p className="mt-2">Nessun ordine evaso</p>
                    </div>
                  ) : (
                    completedOrders.map((order, index) => (
                      <OrderCard
                        key={`completed-order-${order._id}`}
                        order={order}
                        onClick={handleOpenOrderModal}
                        index={index}
                      />
                    ))
                  )}
                </Col>
              </Row>
            </Tab>
          </Tabs>

          {/* Modal per la gestione dell'ordine */}
          {selectedOrder && (
            <OrderModal
              show={showOrderModal}
              onHide={() => setShowOrderModal(false)}
              order={selectedOrder}
              onUpdate={(updatedOrder) => {
                handleOrderUpdate(updatedOrder);
                fetchOrders(); // opzionale: recupera anche tutti gli ordini per sicurezza
              }}
            />
          )}
        </Container>
      </div>
    </div>
  );
};

export default AdminHome;
