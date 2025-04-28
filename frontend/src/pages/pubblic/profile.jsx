import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
  Image,
  Modal,
} from "react-bootstrap";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useAuth } from "../../utlis/AuthContext";
import api from "../../utlis/api";
import { useNavigate } from "react-router-dom";
import { BsPersonCircle } from "react-icons/bs";

import MyConfiguration from "./myconfiguration";

const Profile = () => {
  const {
    isAuthenticated,
    userData,
    loading: authLoading,
    getToken,
  } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birth_date: "",
    address: {
      street: "",
      city: "",
      zipCode: "",
      country: "Italia",
    },
  });
  const [userOrders, setUserOrders] = useState([]);

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    console.log("🔐 Stato autenticazione:", {
      isAuthenticated,
      authLoading,
      userData,
      token: getToken() ? "Presente" : "Assente",
    });

    if (authLoading) return;

    if (!isAuthenticated) {
      console.log("⚠️ Utente non autenticato, reindirizzamento al login");
      navigate("/login", { state: { from: "/profile" } });
    } else {
      if (userData) {
        console.log("✅ Dati utente disponibili da AuthContext:", userData);
        setUser(userData);
        populateFormData(userData);
      }

      fetchUserData();
    }
  }, [isAuthenticated, authLoading, navigate, userData]);

  const populateFormData = (userData) => {
    if (!userData) return;

    setFormData({
      name: userData.name || "",
      email: userData.email || "",
      birth_date: userData.birth_date ? userData.birth_date.split("T")[0] : "",
      address: {
        street: userData.address?.street || "",
        city: userData.address?.city || "",
        zipCode: userData.address?.zipCode || "",
        country: userData.address?.country || "Italia",
      },
    });
  };

  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    console.log("🔄 Recupero dati profilo utente...");

    try {
      const response = await api.getCurrentUser();
      console.log("📦 Dati utente ricevuti:", response.data);

      if (response && response.data) {
        setUser(response.data);
        populateFormData(response.data);
      }

      await fetchUserOrders();
    } catch (err) {
      console.error("❌ Errore nel caricamento del profilo:", err);
      setError(
        "Impossibile caricare i dati del profilo. " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      console.log("🔄 Recupero ordini utente...");
      const ordersResponse = await api.getUserOrders();

      if (ordersResponse && ordersResponse.data) {
        console.log("📦 Ordini ricevuti:", ordersResponse.data.length);
        setUserOrders(ordersResponse.data);
      }
    } catch (err) {
      console.error("❌ Errore nel recupero degli ordini:", err);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        birth_date: formData.birth_date,
        address: formData.address,
      };

      console.log("📤 Invio dati aggiornamento profilo:", userData);

      const userId = user?._id;

      if (!userId) {
        throw new Error("ID utente non disponibile");
      }

      await api.updateUser(userId, userData);

      if (avatarFile) {
        console.log("📤 Caricamento avatar...");
        await api.updateAvatar(userId, avatarFile);
      }

      setSuccess("Profilo aggiornato con successo!");
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      await fetchUserData();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("❌ Errore nell'aggiornamento del profilo:", err);
      setError(
        "Impossibile aggiornare il profilo. " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError("L'email è obbligatoria");
      return;
    }

    setResetLoading(true);
    setResetError("");

    try {
      await api.resetPassword(resetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowResetDialog(false);
        setResetSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Errore nel reset della password:", error);
      setResetError(
        error.response?.data?.message ||
          "Impossibile inviare l'email di reset. Riprova più tardi."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: it });
    } catch (error) {
      return dateString;
    }
  };

  if (loading && !user) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-5 pt-3">
      <h1 className="text-center mb-4 fw-bold">Il Mio Profilo</h1>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Sezione informazioni personali */}
          {!editing ? (
            <Card className="shadow-sm">
              <Card.Header className="bg-dark text-light">
                <h3>Informazioni Personali</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="text-center mb-3">
                    <div className="avatar-container">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt="Avatar"
                          roundedCircle
                          className="img-fluid mb-3"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <BsPersonCircle
                          size={150}
                          className="text-secondary mb-3"
                        />
                      )}
                    </div>
                    <h4>{user?.name}</h4>
                  </Col>
                  <Col md={8}>
                    <div className="user-details">
                      <p>
                        <strong>Email:</strong> {user?.email}
                      </p>
                      <p>
                        <strong>Data di nascita:</strong>{" "}
                        {formatDate(user?.birth_date)}
                      </p>
                      <p>
                        <strong>Registrato il:</strong>{" "}
                        {formatDate(user?.createdAt)}
                      </p>
                      <h5 className="mt-4">Indirizzo di spedizione</h5>
                      <p>
                        <strong>Via:</strong>{" "}
                        {user?.address?.street || "Non specificato"}
                      </p>
                      <p>
                        <strong>Città:</strong>{" "}
                        {user?.address?.city || "Non specificata"}
                      </p>
                      <p>
                        <strong>CAP:</strong>{" "}
                        {user?.address?.zipCode || "Non specificato"}
                      </p>
                      <p>
                        <strong>Paese:</strong>{" "}
                        {user?.address?.country || "Italia"}
                      </p>

                      <Button
                        variant="outline-primary"
                        onClick={() => setEditing(true)}
                        className="mt-3"
                      >
                        <i className="bi bi-pencil-square me-1"></i> Modifica
                        Profilo
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ) : (
            <Card className="shadow-sm">
              <Card.Header className="bg-dark text-light">
                <h3>Modifica Profilo</h3>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={4} className="text-center mb-4">
                      <div className="avatar-upload-container">
                        <Image
                          src={
                            avatarPreview ||
                            user?.avatar ||
                            "https://via.placeholder.com/150"
                          }
                          alt="Avatar"
                          roundedCircle
                          className="img-fluid mb-3"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                          }}
                        />
                        <Form.Group controlId="avatar" className="mt-3">
                          <Form.Label>Cambia avatar</Form.Label>
                          <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </Form.Group>
                      </div>
                    </Col>
                    <Col md={8}>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nome completo</Form.Label>
                            <Form.Control
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Data di nascita</Form.Label>
                            <Form.Control
                              type="date"
                              name="birth_date"
                              value={formData.birth_date}
                              onChange={handleChange}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <h5 className="mt-3">Indirizzo di spedizione</h5>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Via</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.street"
                              value={formData.address.street}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Città</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.city"
                              value={formData.address.city}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>CAP</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.zipCode"
                              value={formData.address.zipCode}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Paese</Form.Label>
                            <Form.Control
                              type="text"
                              name="address.country"
                              value={formData.address.country}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2 mt-4">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Salvataggio...
                        </>
                      ) : (
                        "Salva modifiche"
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setEditing(false);
                        setAvatarFile(null);
                        setAvatarPreview(null);
                        setFormData({
                          name: user.name || "",
                          email: user.email || "",
                          birth_date: user.birth_date
                            ? user.birth_date.split("T")[0]
                            : "",
                          address: {
                            street: user.address?.street || "",
                            city: user.address?.city || "",
                            zipCode: user.address?.zipCode || "",
                            country: user.address?.country || "Italia",
                          },
                        });
                      }}
                    >
                      Annulla
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}
          {/* Sezione sicurezza account */}
          <Card className="mt-4 shadow-sm">
            <Card.Header className="bg-dark text-light">
              <h5 className="mb-0">Sicurezza Account</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Modifica password</h6>
                  <p className="text-muted small">
                    Aggiorna la password del tuo account
                  </p>
                </div>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowResetDialog(true)}
                >
                  <i className="bi bi-key me-1"></i>
                  Reset Password
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Sezione ordini */}
          <Card className="mt-4 mb-5 shadow-sm">
            <Card.Header className="bg-dark text-light">
              <h3>I Miei Ordini</h3>
            </Card.Header>
            <Card.Body>
              {userOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Numero Ordine</th>
                        <th>Data</th>
                        <th>Stato</th>
                        <th>Totale</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            #{order.orderNumber || order._id.substring(0, 8)}
                          </td>
                          <td>{formatDate(order.orderDate)}</td>
                          <td>
                            <span
                              className={`badge bg-${
                                order.status === "completed"
                                  ? "success"
                                  : order.status === "processing"
                                  ? "warning"
                                  : "info"
                              }`}
                            >
                              {order.status === "completed"
                                ? "Completato"
                                : order.status === "processing"
                                ? "In lavorazione"
                                : "In attesa"}
                            </span>
                          </td>
                          <td>€{order.totalPrice?.toFixed(2)}</td>
                          <td>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() =>
                                navigate(`/orders/${order._id}/confirmation`)
                              }
                            >
                              Dettagli
                            </Button>
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
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Alert variant="info">
                  Non hai ancora effettuato ordini.
                  <Button
                    variant="link"
                    className="p-0 ms-2"
                    onClick={() => navigate("/preconfigintamd")}
                  >
                    Esplora i PC preconfigurati
                  </Button>
                </Alert>
              )}
            </Card.Body>
          </Card>

          <MyConfiguration
            userId={user?._id}
            onUpdate={() => fetchUserData()}
          />

          {/* Modal di reset password */}
          <Modal
            show={showResetDialog}
            onHide={() => setShowResetDialog(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Reset della password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {resetSuccess ? (
                <Alert variant="success">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Email di reset inviata con successo! Controlla la tua casella
                  di posta.
                </Alert>
              ) : (
                <>
                  <p>
                    Inserisci l'indirizzo email associato al tuo account per
                    ricevere un link di reset della password.
                  </p>
                  {resetError && <Alert variant="danger">{resetError}</Alert>}
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Inserisci la tua email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </Form.Group>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowResetDialog(false)}
              >
                Annulla
              </Button>
              {!resetSuccess && (
                <Button
                  variant="primary"
                  onClick={handleResetPassword}
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Invio in corso...
                    </>
                  ) : (
                    "Invia email di reset"
                  )}
                </Button>
              )}
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
