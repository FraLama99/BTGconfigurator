import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  Badge,
  Table,
  Tabs,
  Tab,
  ListGroup,
  Image,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../utlis/AuthContext";
import axios from "axios";
import api from "../../utlis/api";
import "./machineDetail.css";

const MachineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [machine, setMachine] = useState(null);
  const [components, setComponents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchMachine = async () => {
      setLoading(true);
      setError("");

      try {
        console.log(`🔍 Recupero dettagli per la macchina ID: ${id}`);

        // Bypass api.getMachineById che sta dando errori
        const response = await axios.get(`/machines/${id}`);

        if (!response || !response.data) {
          throw new Error("Risposta API non valida");
        }

        // Salva i dati della macchina direttamente dalla response
        const machineData = response.data;
        console.log("📦 Dati macchina ricevuti:", machineData);
        setMachine(machineData);

        // Estrai i componenti già presenti nei dati ricevuti
        if (machineData.components) {
          const extractedComponents = {};

          Object.entries(machineData.components).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              extractedComponents[key] = value[0];
            } else if (typeof value === "object" && value !== null) {
              extractedComponents[key] = value;
            } else if (value) {
              extractedComponents[key] = { _id: value };
            }
          });

          setComponents(extractedComponents);
        }
      } catch (err) {
        console.error("Errore nel caricamento della macchina:", err);
        setError(
          "Impossibile caricare i dettagli della configurazione: " +
            (err.message || "Errore sconosciuto")
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMachine();
    } else {
      setError("ID macchina non specificato");
      setLoading(false);
    }
  }, [id]);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      // Verifica che machine e machine._id esistano
      if (!machine || !machine._id) {
        throw new Error("Dati macchina non validi o incompleti");
      }

      // Debug - log dei dati che stiamo per inviare
      console.log("Dati carrello da inviare:", {
        itemId: machine._id, // Importante: usa itemId invece di machineId
        itemType: "machine", // Importante: usa itemType invece di type
        quantity: 1,
      });

      // Usa i nomi di campi richiesti dal backend
      const response = await api.addToCart({
        itemId: machine._id, // Usa itemId come richiesto dal backend
        itemType: "machine", // Usa itemType come richiesto dal backend
        quantity: 1,
      });

      console.log("Risposta aggiunta al carrello:", response);
      setSuccess("Configurazione aggiunta al carrello!");
      setTimeout(() => {
        navigate("/checkout");
      }, 1000);
    } catch (err) {
      console.error("Errore nell'aggiunta al carrello:", err);

      // Log dettagliato dell'errore per aiutare nel debug
      if (err.response) {
        console.error("Dettagli risposta errore:", {
          status: err.response.status,
          data: err.response.data,
        });
      }

      setError(
        `Impossibile aggiungere la configurazione al carrello: ${
          err.message || "Errore sconosciuto"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setLoading(true);
    try {
      // Verifica che machine e machine._id esistano
      if (!machine || !machine._id) {
        throw new Error("Dati macchina non validi o incompleti");
      }

      // Usa i nomi di campi richiesti dal backend
      await api.addToCart({
        itemId: machine._id, // Usa itemId come richiesto dal backend
        itemType: "machine", // Usa itemType come richiesto dal backend
        quantity: 1,
      });

      navigate("/checkout", { state: { fromBuyNow: true, machineId: id } });
    } catch (err) {
      console.error("Errore nell'acquisto immediato:", err);

      // Log dettagliato dell'errore
      if (err.response) {
        console.error("Dettagli risposta errore:", {
          status: err.response.status,
          data: err.response.data,
        });
      }

      setError(
        `Impossibile procedere all'acquisto immediato: ${
          err.message || "Errore sconosciuto"
        }`
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center bg-dark text-white">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3">Caricamento dei dettagli della configurazione...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 bg-dark text-white">
        <Alert variant="danger">{error}</Alert>
        <Button variant="warning" onClick={() => navigate("/intel")}>
          Torna al configuratore
        </Button>
      </Container>
    );
  }

  if (!machine) {
    return (
      <Container className="py-5 bg-dark text-white">
        <Alert variant="danger">Configurazione non trovata</Alert>
        <Button variant="warning" onClick={() => navigate("/intel")}>
          Torna al configuratore
        </Button>
      </Container>
    );
  }

  const componentMapping = [
    { id: "cpu", name: "Processore", component: components.cpu },
    {
      id: "motherboard",
      name: "Scheda Madre",
      component: components.motherboard,
    },
    { id: "ram", name: "RAM", component: components.ram },
    { id: "gpu", name: "Scheda Video", component: components.gpu },
    { id: "storage", name: "Storage", component: components.storage },
    {
      id: "powerSupply",
      name: "Alimentatore",
      component: components.powerSupply,
    },
    { id: "case", name: "Case", component: components.case },
    {
      id: "cooling",
      name: "Sistema di Raffreddamento",
      component: components.cooling,
    },
  ];

  const filteredComponentMapping = componentMapping.filter(
    (item) => item.component
  );

  return (
    <div className="machine-detail-page bg-dark text-white">
      <Container className="py-5">
        {success && <Alert variant="success">{success}</Alert>}

        <div className="mb-4 d-flex justify-content-between align-items-center">
          <h1 className="text-warning">{machine.name}</h1>
          <Badge bg="warning" text="dark" className="fs-5 px-3 py-2">
            {machine.totalPrice
              ? `${machine.totalPrice.toFixed(2)} €`
              : "Prezzo non disponibile"}
          </Badge>
        </div>

        <Row className="mb-4">
          <Col md={8}>
            <Card bg="dark" text="white" border="secondary" className="h-100">
              <Card.Body>
                <Row>
                  <Col md={5}>
                    <div className="machine-image-container mb-3 mb-md-0">
                      <Image
                        src={
                          components.case && components.case.imageUrl
                            ? components.case.imageUrl
                            : "https://via.placeholder.com/300x200.png?text=Immagine+non+disponibile"
                        }
                        alt={machine.name}
                        fluid
                        className="machine-image"
                      />
                    </div>
                  </Col>
                  <Col md={7}>
                    <h4 className="text-warning">Descrizione</h4>
                    <p>
                      {machine.description ||
                        "Nessuna descrizione disponibile."}
                    </p>

                    <h4 className="text-warning mt-4">Specifiche principali</h4>
                    <ListGroup variant="flush" className="specs-list">
                      {components.cpu && (
                        <ListGroup.Item className="bg-dark text-white border-secondary">
                          <i className="bi bi-cpu me-2"></i>
                          <strong>CPU:</strong> {components.cpu.brand || ""}{" "}
                          {components.cpu.name || "CPU selezionata"}
                        </ListGroup.Item>
                      )}
                      {components.gpu && (
                        <ListGroup.Item className="bg-dark text-white border-secondary">
                          <i className="bi bi-gpu-card me-2"></i>
                          <strong>GPU:</strong> {components.gpu.brand || ""}{" "}
                          {components.gpu.name || "GPU selezionata"}
                        </ListGroup.Item>
                      )}
                      {components.ram && (
                        <ListGroup.Item className="bg-dark text-white border-secondary">
                          <i className="bi bi-memory me-2"></i>
                          <strong>RAM:</strong> {components.ram.brand || ""}{" "}
                          {components.ram.name || "RAM selezionata"}
                        </ListGroup.Item>
                      )}
                      {components.storage && (
                        <ListGroup.Item className="bg-dark text-white border-secondary">
                          <i className="bi bi-device-hdd me-2"></i>
                          <strong>Storage:</strong>{" "}
                          {components.storage.brand || ""}{" "}
                          {components.storage.name || "Storage selezionato"}
                        </ListGroup.Item>
                      )}
                    </ListGroup>

                    <div className="action-buttons mt-4">
                      <Button
                        variant="warning"
                        size="lg"
                        onClick={handleAddToCart}
                        disabled={loading}
                        className="mb-2"
                      >
                        <i className="bi bi-cart-plus me-2"></i>
                        Completa l'Ordine
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card bg="dark" text="white" border="secondary">
              <Card.Header className="bg-warning text-dark">
                <h4 className="mb-0">Vantaggi</h4>
              </Card.Header>
              <Card.Body>
                <ListGroup variant="flush" className="mb-0">
                  <ListGroup.Item className="bg-dark text-white border-secondary">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Garanzia di 2 anni
                  </ListGroup.Item>
                  <ListGroup.Item className="bg-dark text-white border-secondary">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Assemblaggio professionale incluso
                  </ListGroup.Item>
                  <ListGroup.Item className="bg-dark text-white border-secondary">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Test di stabilità completi
                  </ListGroup.Item>
                  <ListGroup.Item className="bg-dark text-white border-secondary">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Spedizione gratuita
                  </ListGroup.Item>
                  <ListGroup.Item className="bg-dark text-white border-secondary">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    Supporto tecnico dedicato
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            <Card bg="dark" text="white" border="secondary" className="mt-3">
              <Card.Header className="bg-warning text-dark">
                <h4 className="mb-0">Riepilogo Prezzo</h4>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Componenti:</span>
                  <span>{(machine.totalPrice - 250).toFixed(2)} €</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Assemblaggio e Test:</span>
                  <span>250.00 €</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Spedizione:</span>
                  <span>Gratuita</span>
                </div>
                <hr className="border-secondary" />
                <div className="d-flex justify-content-between">
                  <strong className="text-warning">Totale:</strong>
                  <strong className="text-warning fs-4">
                    {machine.totalPrice.toFixed(2)} €
                  </strong>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card bg="dark" text="white" border="secondary" className="mb-4">
          <Card.Header>
            <Tabs
              defaultActiveKey="components"
              id="machine-tabs"
              className="custom-tabs"
            >
              <Tab eventKey="components" title="Componenti">
                <Card.Body>
                  <Table
                    striped
                    hover
                    variant="dark"
                    responsive
                    className="component-table"
                  >
                    <thead>
                      <tr>
                        <th style={{ width: "20%" }}>Componente</th>
                        <th style={{ width: "30%" }}>Prodotto</th>
                        <th style={{ width: "30%" }}>Specifiche</th>
                        <th style={{ width: "20%" }} className="text-end">
                          Prezzo
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComponentMapping.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>{item.component?.name || "Non disponibile"}</td>
                          <td>
                            {item.component && (
                              <>
                                {item.component.brand && (
                                  <div>
                                    <strong>Marca:</strong>{" "}
                                    {item.component.brand}
                                  </div>
                                )}
                                {item.component.model && (
                                  <div>
                                    <strong>Modello:</strong>{" "}
                                    {item.component.model}
                                  </div>
                                )}
                                {item.component.socket && (
                                  <div>
                                    <strong>Socket:</strong>{" "}
                                    {item.component.socket}
                                  </div>
                                )}
                                {item.component.formFactor && (
                                  <div>
                                    <strong>Form Factor:</strong>{" "}
                                    {item.component.formFactor}
                                  </div>
                                )}
                                {item.component.ramType && (
                                  <div>
                                    <strong>Tipo RAM:</strong>{" "}
                                    {item.component.ramType}
                                  </div>
                                )}
                                {item.component.tdp && (
                                  <div>
                                    <strong>TDP:</strong> {item.component.tdp}W
                                  </div>
                                )}
                                {item.component.wattage && (
                                  <div>
                                    <strong>Potenza:</strong>{" "}
                                    {item.component.wattage}W
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                          <td className="text-end">
                            {item.component?.price
                              ? `${item.component.price.toFixed(2)} €`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3}>
                          <strong>Assemblaggio e Test</strong>
                        </td>
                        <td className="text-end">250.00 €</td>
                      </tr>
                      <tr className="table-warning text-dark">
                        <td colSpan={3}>
                          <h5>Prezzo Totale</h5>
                        </td>
                        <td className="text-end">
                          <h5>{machine.totalPrice.toFixed(2)} €</h5>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Tab>
              <Tab eventKey="performance" title="Prestazioni">
                <Card.Body>
                  <h4 className="text-warning mb-4">Prestazioni stimate</h4>

                  <Row>
                    <Col md={6}>
                      <h5>Giochi</h5>
                      <div className="game-performance mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Cyberpunk 2077</span>
                          <span>
                            {components.gpu?.name?.includes("RTX")
                              ? "80 FPS"
                              : "45 FPS"}
                          </span>
                        </div>
                        <div className="progress bg-secondary">
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: components.gpu?.name?.includes("RTX")
                                ? "80%"
                                : "45%",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="game-performance mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Fortnite</span>
                          <span>
                            {components.gpu?.name?.includes("RTX")
                              ? "180 FPS"
                              : "120 FPS"}
                          </span>
                        </div>
                        <div className="progress bg-secondary">
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: components.gpu?.name?.includes("RTX")
                                ? "90%"
                                : "75%",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="game-performance mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Call of Duty: Warzone</span>
                          <span>
                            {components.gpu?.name?.includes("RTX")
                              ? "140 FPS"
                              : "90 FPS"}
                          </span>
                        </div>
                        <div className="progress bg-secondary">
                          <div
                            className="progress-bar bg-success"
                            style={{
                              width: components.gpu?.name?.includes("RTX")
                                ? "85%"
                                : "65%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </Col>

                    <Col md={6}>
                      <h5>Produttività</h5>
                      <div className="game-performance mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Adobe Premiere Pro</span>
                          <span>
                            {components.cpu?.name?.includes("i9") ||
                            components.cpu?.name?.includes("i7")
                              ? "Eccellente"
                              : "Buono"}
                          </span>
                        </div>
                        <div className="progress bg-secondary">
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: components.cpu?.name?.includes("i9")
                                ? "95%"
                                : components.cpu?.name?.includes("i7")
                                ? "80%"
                                : "60%",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="game-performance mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Blender</span>
                          <span>
                            {components.gpu?.name?.includes("RTX")
                              ? "Eccellente"
                              : "Buono"}
                          </span>
                        </div>
                        <div className="progress bg-secondary">
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: components.gpu?.name?.includes("RTX")
                                ? "90%"
                                : "70%",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="game-performance mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Multitasking</span>
                          <span>
                            {components.ram?.name?.includes("32GB") ||
                            components.ram?.name?.includes("64GB")
                              ? "Eccellente"
                              : "Buono"}
                          </span>
                        </div>
                        <div className="progress bg-secondary">
                          <div
                            className="progress-bar bg-warning"
                            style={{
                              width: components.ram?.name?.includes("64GB")
                                ? "100%"
                                : components.ram?.name?.includes("32GB")
                                ? "85%"
                                : "65%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Tab>
              <Tab eventKey="reviews" title="Recensioni">
                <Card.Body>
                  <h4 className="text-warning mb-4">Recensioni degli utenti</h4>
                  <Alert variant="info">
                    Questa configurazione non ha ancora ricevuto recensioni.
                  </Alert>
                </Card.Body>
              </Tab>
            </Tabs>
          </Card.Header>
        </Card>

        <div className="text-center mt-4 mb-2">
          <Button
            variant="warning"
            size="lg"
            onClick={handleAddToCart}
            disabled={loading}
            className="px-5"
          >
            <i className="bi bi-cart-plus me-2"></i>
            Aggiungi al Carrello
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default MachineDetailPage;
