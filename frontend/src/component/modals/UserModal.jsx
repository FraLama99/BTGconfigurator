import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Table,
  Tabs,
  Tab,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import api from "../../utlis/api";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaShoppingCart,
  FaUserShield,
  FaUser,
  FaBug,
} from "react-icons/fa";

const UserModal = ({ show, onHide, user, onUpdate }) => {
  const [userData, setUserData] = useState({ ...user });
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [originalData, setOriginalData] = useState({ ...user });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  // Carica i dati degli ordini dell'utente
  useEffect(() => {
    if (show && user?._id && activeTab === "orders") {
      fetchUserOrders();
    }
  }, [show, user, activeTab]);

  // Reset dello stato quando l'utente cambia
  useEffect(() => {
    if (user) {
      // Garantisci che tutti i campi abbiano almeno un valore vuoto
      const safeUser = {
        ...user,
        name: user.name || "",
        surname: user.surname || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "Italia",
        },
      };

      setUserData(safeUser);
      setOriginalData(safeUser);
      setAvatarPreview(user?.avatar || null);
      setEditing(false);
      setAvatarFile(null);
    }
  }, [user]);

  // Recupera gli ordini dell'utente - VERSIONE MIGLIORATA
  const fetchUserOrders = async () => {
    if (!user?._id) return;

    setLoadingOrders(true);
    try {
      // Ottieni i dati aggiornati dell'utente per avere l'array orders completo
      const response = await api.getUserById(user._id);
      console.log("Dati utente completi:", response.data);

      const userData = response.data;
      const orderIds = userData.orders || [];

      console.log(
        `Trovati ${orderIds.length} ID ordini per l'utente:`,
        orderIds
      );

      if (orderIds.length > 0) {
        // Array per raccogliere tutti gli ordini recuperati
        const ordersData = [];

        // Recupera ogni ordine uno per uno
        for (const orderId of orderIds) {
          try {
            console.log(`Tentativo di recupero ordine con ID: ${orderId}`);

            let orderData = null;

            // Prima prova con l'endpoint admin - dovrebbe funzionare per admin
            try {
              console.log(
                `Provo con getAdminOrderById per l'ordine: ${orderId}`
              );
              const adminOrderResponse = await api.getAdminOrderById(orderId);

              if (adminOrderResponse && adminOrderResponse.data) {
                console.log(`Ordine ${orderId} recuperato con endpoint admin`);
                orderData = normalizeOrderData(adminOrderResponse.data);
              }
            } catch (adminError) {
              console.log(
                `Endpoint admin fallito, errore:`,
                adminError.message
              );

              // Se l'endpoint admin fallisce, prova con l'endpoint utente standard
              try {
                console.log(
                  `Provo con getOrderById standard per l'ordine: ${orderId}`
                );
                const userOrderResponse = await api.getOrderById(orderId);

                if (userOrderResponse && userOrderResponse.data) {
                  console.log(
                    `Ordine ${orderId} recuperato con endpoint standard`
                  );
                  orderData = normalizeOrderData(userOrderResponse.data);
                }
              } catch (userError) {
                console.error(
                  `Anche getOrderById è fallito, errore:`,
                  userError.message
                );
                // Entrambi gli endpoint hanno fallito, non possiamo recuperare questo ordine
              }
            }

            if (orderData) {
              ordersData.push(orderData);
            } else {
              console.warn(
                `Non è stato possibile recuperare l'ordine ${orderId}`
              );
            }
          } catch (error) {
            console.error(
              `Errore nel tentativo di recuperare l'ordine ${orderId}:`,
              error
            );
          }
        }

        console.log(
          `Recuperati ${ordersData.length} ordini su ${orderIds.length} totali`
        );
        setUserOrders(ordersData);
      } else {
        console.log("L'utente non ha ordini");
        setUserOrders([]);
      }
    } catch (error) {
      console.error("Errore nel recupero degli ordini:", error);
      console.error("Dettaglio errore:", error.response?.data || error.message);
      toast.error("Errore nel caricamento degli ordini");
    } finally {
      setLoadingOrders(false);
    }
  };

  // Funzione di normalizzazione dei dati dell'ordine
  const normalizeOrderData = (orderData) => {
    if (!orderData) return null;

    // Alcuni endpoint potrebbero restituire l'ordine come nested object
    const order = orderData.order || orderData;

    // Assicurati che tutti i campi necessari esistano
    return {
      _id: order._id,
      orderNumber: order.orderNumber || order._id.substring(0, 8),
      orderDate: order.orderDate || order.createdAt || new Date(),
      status: order.status || "pending",
      paymentStatus: order.paymentStatus || "pending",
      totalPrice: order.totalPrice || 0,
      machines: Array.isArray(order.machines)
        ? order.machines.map((machine) => ({
            name: machine.name || "Configurazione PC",
            quantity: machine.quantity || 1,
            price: machine.price || 0,
          }))
        : [],
    };
  };

  // Gestisce il cambio dei dati del form
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Gestione speciale per i campi dell'indirizzo
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setUserData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}), // Assicurati che l'oggetto esista
          [child]: value,
        },
      }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Gestisce il cambio dell'avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);

    // Crea una preview dell'immagine
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Salva le modifiche all'utente
  const handleSave = async () => {
    setLoading(true);
    try {
      // Prepara i dati da inviare, assicurandosi che non ci siano valori undefined
      const dataToSend = {
        name: userData.name || "",
        surname: userData.surname || "",
        email: userData.email,
        phone: userData.phone || "",
        role: userData.role,
        address: {
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          zipCode: userData.address?.zipCode || "",
          country: userData.address?.country || "Italia",
        },
      };

      console.log("Dati che verranno inviati:", dataToSend);

      // Chiamata API per aggiornare l'utente
      const response = await api.updateUser(user._id, dataToSend);
      console.log("Risposta dal server:", response.data);

      // Estrai l'utente aggiornato dalla risposta
      const updatedUser = response.data.user || response.data;

      // Verifica che i dati siano stati ricevuti correttamente
      console.log("Utente aggiornato ricevuto:", updatedUser);

      // Unisci i dati originali con i dati aggiornati per mantenere eventuali campi
      const mergedUser = {
        ...userData, // Mantieni i dati modificati
        ...updatedUser, // Aggiorna con la risposta del server
        address: {
          ...userData.address, // Mantieni l'indirizzo modificato
          ...(updatedUser.address || {}), // Aggiorna con l'indirizzo dal server
        },
      };

      // Se è stato caricato un nuovo avatar, aggiornalo
      if (avatarFile) {
        console.log("Caricamento avatar...");
        try {
          const avatarResponse = await api.updateAvatar(user._id, avatarFile);
          console.log("Risposta aggiornamento avatar:", avatarResponse.data);

          // Aggiorna l'avatar nell'oggetto utente
          if (avatarResponse.data && avatarResponse.data.avatar) {
            mergedUser.avatar = avatarResponse.data.avatar;
          } else if (
            avatarResponse.data &&
            avatarResponse.data.user &&
            avatarResponse.data.user.avatar
          ) {
            mergedUser.avatar = avatarResponse.data.user.avatar;
          }
        } catch (avatarError) {
          console.error("Errore nell'aggiornamento dell'avatar:", avatarError);
          toast.warning(
            "Profilo aggiornato ma si è verificato un problema con l'avatar"
          );
        }
      }

      // Aggiorna lo stato locale con i dati completi
      console.log("Dati utente finali dopo l'aggiornamento:", mergedUser);
      setOriginalData({ ...mergedUser });
      setUserData({ ...mergedUser });
      setEditing(false);
      setAvatarFile(null);

      // Callback per aggiornare la lista degli utenti nel componente parent
      if (onUpdate) {
        onUpdate(mergedUser);
      }

      toast.success("Utente aggiornato con successo");
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'utente:", error);
      console.error("Dettagli errore:", {
        url: error.config?.url,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(
        `Errore: ${
          error.response?.data?.message || "Impossibile aggiornare l'utente"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Annulla le modifiche
  const handleCancel = () => {
    setUserData({ ...originalData });
    setAvatarPreview(originalData?.avatar || null);
    setAvatarFile(null);
    setEditing(false);
  };

  // Cambia il ruolo dell'utente
  const handleRoleChange = async (role) => {
    setLoading(true);
    try {
      // Aggiorna l'utente con il nuovo ruolo
      const updatedUserData = { ...userData, role };
      const response = await api.updateUser(user._id, updatedUserData);

      const updatedUser = response.data.user || response.data;
      setUserData(updatedUser);
      setOriginalData(updatedUser);

      // Callback per aggiornare la lista degli utenti nel componente parent
      if (onUpdate) onUpdate(updatedUser);

      toast.success(
        `Ruolo aggiornato a ${role === "admin" ? "Amministratore" : "Utente"}`
      );
    } catch (error) {
      console.error("Errore nell'aggiornamento del ruolo:", error);
      toast.error("Errore durante il cambio di ruolo");
    } finally {
      setLoading(false);
    }
  };

  // Formatta lo stato dell'ordine
  const formatOrderStatus = (status) => {
    switch (status) {
      case "pending":
        return { text: "In attesa", color: "warning" };
      case "processing":
        return { text: "In lavorazione", color: "info" };
      case "assembled":
        return { text: "Assemblato", color: "primary" };
      case "shipped":
        return { text: "Spedito", color: "secondary" };
      case "delivered":
        return { text: "Consegnato", color: "success" };
      case "cancelled":
        return { text: "Annullato", color: "danger" };
      default:
        return { text: status || "N/D", color: "light" };
    }
  };

  // Formatta lo stato del pagamento
  const formatPaymentStatus = (status) => {
    switch (status) {
      case "pending":
        return { text: "In attesa", color: "warning" };
      case "completed":
        return { text: "Completato", color: "success" };
      case "failed":
        return { text: "Fallito", color: "danger" };
      case "refunded":
        return { text: "Rimborsato", color: "info" };
      default:
        return { text: status || "N/D", color: "light" };
    }
  };

  // Formatta il prezzo
  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("it-IT", {
      style: "currency",
      currency: "EUR",
    });
  };

  // Formatta la data in modo sicuro
  const formatDate = (dateString) => {
    if (!dateString) return "N/D";

    try {
      return new Date(dateString).toLocaleDateString("it-IT");
    } catch (error) {
      console.error("Errore nella formattazione della data:", error);
      return "Data non valida";
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {user.name && user.surname
            ? `${user.name} ${user.surname}`
            : user.name || user.email.split("@")[0]}
          <Badge
            bg={user.role === "admin" ? "danger" : "primary"}
            className="ms-2"
          >
            {user.role === "admin" ? "Amministratore" : "Utente"}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-3"
        >
          <Tab eventKey="profile" title="Profilo">
            <Row>
              <Col md={4} className="text-center mb-4">
                <div className="position-relative d-inline-block">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="img-fluid rounded-circle mb-2"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "150px",
                        height: "150px",
                        fontSize: "4rem",
                        color: "white",
                      }}
                    >
                      {(
                        userData.name?.charAt(0) ||
                        userData.email?.charAt(0) ||
                        "?"
                      ).toUpperCase()}
                    </div>
                  )}
                  {editing && (
                    <div className="mt-2">
                      <Form.Group>
                        <Form.Label
                          htmlFor="avatar-upload"
                          className="btn btn-sm btn-outline-primary"
                        >
                          Cambia avatar
                        </Form.Label>
                        <Form.Control
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="d-none"
                        />
                      </Form.Group>
                    </div>
                  )}
                </div>
                {!editing && (
                  <div className="mt-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      <FaEdit className="me-1" /> Modifica profilo
                    </Button>
                  </div>
                )}
                {userData.role !== "admin" ? (
                  <div className="mt-3">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRoleChange("admin")}
                      disabled={loading}
                    >
                      <FaUserShield className="me-1" /> Rendi amministratore
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleRoleChange("user")}
                      disabled={loading}
                    >
                      <FaUser className="me-1" /> Rimuovi privilegi admin
                    </Button>
                  </div>
                )}
              </Col>

              <Col md={8}>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={userData.email || ""}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={userData.name || ""}
                          onChange={handleChange}
                          disabled={!editing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cognome</Form.Label>
                        <Form.Control
                          type="text"
                          name="surname"
                          value={userData.surname || ""}
                          onChange={handleChange}
                          disabled={!editing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Telefono</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={userData.phone || ""}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Form.Group>

                  <h6 className="mb-3">Indirizzo</h6>
                  <Form.Group className="mb-3">
                    <Form.Label>Via</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.street"
                      value={userData.address?.street || ""}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Città</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.city"
                          value={userData.address?.city || ""}
                          onChange={handleChange}
                          disabled={!editing}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>CAP</Form.Label>
                        <Form.Control
                          type="text"
                          name="address.zipCode"
                          value={userData.address?.zipCode || ""}
                          onChange={handleChange}
                          disabled={!editing}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Nazione</Form.Label>
                    <Form.Control
                      type="text"
                      name="address.country"
                      value={userData.address?.country || ""}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    {editing && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          <FaTimes className="me-1" /> Annulla
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" /> Salvataggio...
                            </>
                          ) : (
                            <>
                              <FaSave className="me-1" /> Salva modifiche
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </Form>
              </Col>
            </Row>
            <Row className="mt-4">
              <Col>
                <h5>Informazioni account</h5>
                <Table striped bordered>
                  <tbody>
                    <tr>
                      <td>
                        <strong>ID Utente</strong>
                      </td>
                      <td>{user._id}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Data registrazione</strong>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Ultimo aggiornamento</strong>
                      </td>
                      <td>{formatDate(user.updatedAt)}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Metodo di registrazione</strong>
                      </td>
                      <td>{user.googleId ? "Google" : "Email e password"}</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>Ordini effettuati</strong>
                      </td>
                      <td>{user.orders ? user.orders.length : 0}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          </Tab>

          <Tab
            eventKey="orders"
            title={
              <>
                <FaShoppingCart /> Ordini{" "}
                {user.orders && user.orders.length > 0 && (
                  <Badge pill bg="secondary">
                    {user.orders.length}
                  </Badge>
                )}
              </>
            }
          >
            {loadingOrders ? (
              <div className="text-center p-5">
                <Spinner animation="border" />
                <p>Caricamento ordini in corso...</p>
              </div>
            ) : userOrders.length === 0 ? (
              <Alert variant="info">
                L'utente non ha ancora effettuato ordini.
              </Alert>
            ) : (
              <>
                {/* Bottone debug (solo durante lo sviluppo) */}
                <div className="mb-3 text-end">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => console.log("Dati ordini:", userOrders)}
                  >
                    <FaBug className="me-1" /> Debug
                  </Button>
                </div>

                <Table responsive striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Data</th>
                      <th>Prodotti</th>
                      <th>Totale</th>
                      <th>Stato</th>
                      <th>Pagamento</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => {
                      // Skip ordini con dati incompleti
                      if (!order || !order._id) return null;

                      // Valori predefiniti sicuri
                      const status = formatOrderStatus(order.status);
                      const payment = formatPaymentStatus(order.paymentStatus);

                      return (
                        <tr key={order._id}>
                          <td>
                            {order.orderNumber || order._id.substring(0, 8)}
                          </td>
                          <td>{formatDate(order.orderDate)}</td>
                          <td>
                            {Array.isArray(order.machines) &&
                            order.machines.length > 0 ? (
                              <>
                                {order.machines.length} prodotti
                                <ul className="small mt-1 mb-0">
                                  {order.machines.map((machine, index) => (
                                    <li key={index}>
                                      {machine.name || "Configurazione PC"} x
                                      {machine.quantity || 1}
                                    </li>
                                  ))}
                                </ul>
                              </>
                            ) : (
                              "N/D"
                            )}
                          </td>
                          <td>{formatPrice(order.totalPrice)}</td>
                          <td>
                            <Badge bg={status.color}>{status.text}</Badge>
                          </td>
                          <td>
                            <Badge bg={payment.color}>{payment.text}</Badge>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => {
                                window.open(
                                  `/print/order/${order._id}`,
                                  "_blank"
                                );
                              }}
                            >
                              Visualizza e stampa
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Chiudi
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserModal;
