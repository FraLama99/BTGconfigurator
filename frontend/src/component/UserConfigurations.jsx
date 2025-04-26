import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Alert,
  Row,
  Col,
  Spinner,
  ListGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../utlis/api";
import axios from "axios";
import "./UserConfigurations.css"; // Importa il file CSS per gli stili personalizzati

const UserConfigurations = ({ userId, onUpdate, onCardClick }) => {
  const navigate = useNavigate();
  const [userConfigurations, setUserConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUserConfigurations();
  }, [userId]);

  const fetchUserConfigurations = async () => {
    try {
      console.log("🔄 Recupero configurazioni personalizzate...");
      setLoading(true);
      const response = await api.getUserMachines();
      console.log("📦 Risposta completa:", response);

      if (response && response.data) {
        if (response.data.machines) {
          console.log(
            `📦 Configurazioni ricevute: ${response.data.machines.length}`
          );
          setUserConfigurations(response.data.machines);
        } else if (Array.isArray(response.data)) {
          console.log(`📦 Configurazioni ricevute: ${response.data.length}`);
          setUserConfigurations(response.data);
        } else {
          console.warn(
            "📦 Formato dati configurazioni non riconosciuto:",
            response.data
          );
          setUserConfigurations([]);
        }
      } else {
        console.warn("📦 Nessun dato ricevuto per le configurazioni");
        setUserConfigurations([]);
      }
    } catch (err) {
      console.error("❌ Errore nel recupero delle configurazioni:", err);
      setError("Impossibile recuperare le configurazioni");
      setUserConfigurations([]);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per gestire componenti che possono essere array o singoli oggetti
  const getComponentInfo = (components, componentType) => {
    if (!components) return null;

    // Se il componente è un array
    if (Array.isArray(components[componentType])) {
      if (components[componentType].length > 0) {
        return components[componentType][0]; // Restituisci il primo elemento dell'array
      }
      return null;
    }
    // Se il componente è un oggetto singolo
    return components[componentType];
  };

  // Funzione per ottenere l'URL dell'immagine del case
  const getCaseImageUrl = (config) => {
    if (!config.components || !config.components.case) return null;

    const caseComponent = config.components.case;

    // Prima cerca imageUrl, poi image, poi fallback su un'immagine predefinita
    return (
      caseComponent.imageUrl ||
      caseComponent.image ||
      "https://via.placeholder.com/150?text=PC+Case"
    );
  };

  // Funzione per formattare il prezzo in modo sicuro
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/D";
    return typeof price === "number" ? price.toFixed(2) : price;
  };

  const handleAddToCart = async (id, source) => {
    setLoading(true);
    try {
      // Determina il tipo di item in base alla source
      const itemType = source === "customMachine" ? "customMachine" : "machine";

      await api.addToCart({
        itemId: id,
        itemType: itemType,
        quantity: 1,
      });

      setSuccess("Configurazione aggiunta al carrello!");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("❌ Errore nell'aggiunta al carrello:", err);
      setError(
        "Impossibile aggiungere la configurazione al carrello. " +
          (err.response?.data?.message || err.message)
      );
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (id, source) => {
    if (
      !window.confirm(
        "Sei sicuro di voler eliminare questa configurazione? L'operazione non può essere annullata."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      if (source === "customMachine") {
        await axios.delete(`/custom-machines/${id}`);
      } else {
        await axios.delete(`/machines/${id}`);
      }

      setSuccess("Configurazione eliminata con successo!");
      await fetchUserConfigurations();

      // Notifica il componente genitore che c'è stato un aggiornamento
      if (onUpdate) onUpdate();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("❌ Errore nell'eliminazione della configurazione:", err);
      setError(
        "Impossibile eliminare la configurazione. " +
          (err.response?.data?.message || err.message)
      );
      setTimeout(() => {
        setError("");
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (loading && userConfigurations.length === 0) {
    return (
      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-dark text-light d-flex justify-content-between align-items-center">
          <h3>Le Mie Configurazioni</h3>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate("/configintamd")}
          >
            <i className="bi bi-plus-lg me-1"></i> Nuova configurazione
          </Button>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Caricamento delle configurazioni...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card
      className="mt-4 shadow-sm h-100  config-card"
      style={{
        transition: "transform 0.2s ease-in-out",
      }}
    >
      <Card.Header className="bg-dark text-light d-flex justify-content-between align-items-center">
        <h3>Le Mie Configurazioni</h3>
        <Button
          variant="outline-light"
          size="sm"
          onClick={() => navigate("/configintamd")}
        >
          <i className="bi bi-plus-lg me-1"></i> Nuova configurazione
        </Button>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {userConfigurations.length > 0 ? (
          <Row xs={1} md={2} className="g-4">
            {userConfigurations.map((config) => {
              // Ottieni i componenti corretti gestendo gli array
              const cpu = getComponentInfo(config.components, "cpu");
              const motherboard = getComponentInfo(
                config.components,
                "motherboard"
              );
              const gpu = getComponentInfo(config.components, "gpu");
              const ram = getComponentInfo(config.components, "ram");
              const storage = getComponentInfo(config.components, "storage");
              const powerSupply = getComponentInfo(
                config.components,
                "powerSupply"
              );
              const caseComponent = getComponentInfo(config.components, "case");
              const cooling = getComponentInfo(config.components, "cooling");

              // Ottieni l'URL dell'immagine corretta
              const imageUrl = getCaseImageUrl(config);

              return (
                <Col key={config._id}>
                  <Card className="h-100 shadow-sm config-card">
                    <div
                      className="text-center pt-3"
                      style={{ height: "150px", overflow: "hidden" }}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={caseComponent?.name || "Case del PC"}
                          className="img-fluid"
                          style={{
                            maxHeight: "140px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <i
                          className="bi bi-pc-display"
                          style={{ fontSize: "5rem", opacity: "0.5" }}
                        />
                      )}
                    </div>
                    <Card.Body>
                      <Card.Title className="border-bottom pb-2">
                        {config.name}
                      </Card.Title>

                      <div className="component-list small mt-2">
                        {cpu && (
                          <div className="d-flex justify-content-between mb-1">
                            <span>
                              <i className="bi bi-cpu me-1"></i>{" "}
                              {cpu.name?.substring(0, 30)}
                              {cpu.name?.length > 30 ? "..." : ""}
                            </span>
                            <span className="text-primary">
                              {formatPrice(cpu.price)} €
                            </span>
                          </div>
                        )}
                        {motherboard && (
                          <div className="d-flex justify-content-between mb-1">
                            <span>
                              <i className="bi bi-motherboard me-1"></i>{" "}
                              {motherboard.name?.substring(0, 30)}
                              {motherboard.name?.length > 30 ? "..." : ""}
                            </span>
                            <span className="text-primary">
                              {formatPrice(motherboard.price)} €
                            </span>
                          </div>
                        )}

                        {gpu && (
                          <div className="d-flex justify-content-between mb-1">
                            <span>
                              <i className="bi bi-gpu-card me-1"></i>{" "}
                              {gpu.name?.substring(0, 30)}
                              {gpu.name?.length > 30 ? "..." : ""}
                            </span>
                            <span className="text-primary">
                              {formatPrice(gpu.price)} €
                            </span>
                          </div>
                        )}

                        {ram && (
                          <div className="d-flex justify-content-between mb-1">
                            <span>
                              <i className="bi bi-memory me-1"></i>{" "}
                              {ram.name?.substring(0, 30)}
                              {ram.name?.length > 30 ? "..." : ""}
                            </span>
                            <span className="text-primary">
                              {formatPrice(ram.price)} €
                            </span>
                          </div>
                        )}

                        {storage && (
                          <div className="d-flex justify-content-between mb-1">
                            <span>
                              <i className="bi bi-device-hdd me-1"></i>{" "}
                              {storage.name?.substring(0, 30)}
                              {storage.name?.length > 30 ? "..." : ""}
                            </span>
                            <span className="text-primary">
                              {formatPrice(storage.price)} €
                            </span>
                          </div>
                        )}
                        {powerSupply && (
                          <div className="d-flex justify-content-between mb-1">
                            <span>
                              <i className="bi bi-device-hdd me-1"></i>{" "}
                              {powerSupply.name?.substring(0, 30)}
                              {powerSupply.name?.length > 30 ? "..." : ""}
                            </span>
                            <span className="text-primary">
                              {formatPrice(powerSupply.price)} €
                            </span>
                          </div>
                        )}

                        {cooling && (
                          <div className="d-flex justify-content-between mb-1">
                            <span>
                              <i className="bi bi-fan me-1"></i>{" "}
                              {cooling.name?.substring(0, 30)}
                              {cooling.name?.length > 30 ? "..." : ""}
                            </span>
                            <span className="text-primary">
                              {formatPrice(cooling.price)} €
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                        <span className="fw-bold text-primary fs-5">
                          €{" "}
                          {formatPrice(
                            config.finalPrice ||
                              config.basePrice ||
                              config.totalPrice
                          )}
                        </span>

                        <div className="config-actions">
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              handleAddToCart(config._id, config.source)
                            }
                          >
                            <i className="bi bi-cart-plus me-1"></i> Aggiungi
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteConfig(config._id, config.source)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Alert variant="info">
            Non hai ancora creato configurazioni personalizzate.
            <Button
              variant="link"
              className="p-0 ms-2"
              onClick={() => navigate("/configintamd")}
            >
              Vai al configuratore
            </Button>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default UserConfigurations;
