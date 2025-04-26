import React, { useState, useEffect } from "react";
import {
  Container,
  Modal,
  Button,
  Form,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
  Tabs,
  Tab,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utlis/AuthContext";
import api from "../../utlis/api";

const MyConfiguration = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [ramOptions, setRamOptions] = useState([]);
  const [gpuOptions, setGpuOptions] = useState([]);
  const [storageOptions, setStorageOptions] = useState([]);
  const [coolingOptions, setCoolingOptions] = useState([]);
  const [activeTab, setActiveTab] = useState("ram");

  const [configName, setConfigName] = useState("");
  const [selectedRam, setSelectedRam] = useState("");
  const [selectedGpu, setSelectedGpu] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [selectedCooling, setSelectedCooling] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);

  const [userConfigurations, setUserConfigurations] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("⚠️ Utente non autenticato, reindirizzamento al login");
      navigate("/login", { state: { from: "/my-configurations" } });
    } else if (isAuthenticated) {
      fetchUserConfigurations();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleOpenModal = async (config) => {
    console.log("🔍 handleOpenModal chiamato con:", config);
    setSelectedConfig(config);
    setConfigName(config.name || "");

    if (config.components) {
      if (config.components.ram) {
        const ramComponent = Array.isArray(config.components.ram)
          ? config.components.ram[0]
          : config.components.ram;
        setSelectedRam(ramComponent._id || "");
      }

      if (config.components.gpu) {
        const gpuComponent = Array.isArray(config.components.gpu)
          ? config.components.gpu[0]
          : config.components.gpu;
        setSelectedGpu(gpuComponent._id || "");
      }

      if (config.components.storage) {
        const storageComponent = Array.isArray(config.components.storage)
          ? config.components.storage[0]
          : config.components.storage;
        setSelectedStorage(storageComponent._id || "");
      }

      if (config.components.cooling) {
        const coolingComponent = Array.isArray(config.components.cooling)
          ? config.components.cooling[0]
          : config.components.cooling;
        setSelectedCooling(coolingComponent._id || "");
      }
    }

    const currentConfigPrice =
      config.source === "customMachine"
        ? config.finalPrice
        : config.totalPrice || config.basePrice || 0;

    console.log(
      `Impostazione prezzo: ${currentConfigPrice} per configurazione tipo ${
        config.source || "standard"
      }`
    );
    setCurrentPrice(currentConfigPrice);

    fetchComponentOptions(config);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedConfig(null);
    setError("");
    setSuccess("");
  };

  const fetchComponentOptions = async (config) => {
    setLoading(true);
    try {
      const motherboardId = config.components?.motherboard?._id;

      let ramResponse;
      if (motherboardId) {
        ramResponse = await api.getRAMs({ motherboardId });
      } else {
        ramResponse = await api.getRAMs();
      }
      setRamOptions(ramResponse.data);

      const gpuResponse = await api.getGPUs();
      setGpuOptions(gpuResponse.data);

      const storageResponse = await api.getStorages();
      setStorageOptions(storageResponse.data);

      const coolingResponse = await api.getCoolers();
      setCoolingOptions(coolingResponse.data);
    } catch (err) {
      console.error(
        "Errore nel caricamento delle opzioni dei componenti:",
        err
      );
      setError("Impossibile caricare le opzioni dei componenti");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConfigurations = async () => {
    try {
      setLoadingConfigs(true);
      const response = await api.getUserMachines();

      if (response && response.data) {
        if (response.data.machines) {
          setUserConfigurations(response.data.machines);
        } else if (Array.isArray(response.data)) {
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
    } finally {
      setLoadingConfigs(false);
    }
  };

  const calculateTotalPrice = (componentPrices) => {
    const basePrice =
      selectedConfig?.finalPrice ||
      selectedConfig?.totalPrice ||
      selectedConfig?.basePrice ||
      0;

    const originalRamPrice = selectedConfig?.components?.ram
      ? Array.isArray(selectedConfig.components.ram)
        ? selectedConfig.components.ram[0]?.price || 0
        : selectedConfig.components.ram.price || 0
      : 0;

    const originalGpuPrice = selectedConfig?.components?.gpu
      ? Array.isArray(selectedConfig.components.gpu)
        ? selectedConfig.components.gpu[0]?.price || 0
        : selectedConfig.components.gpu.price || 0
      : 0;

    const originalStoragePrice = selectedConfig?.components?.storage
      ? Array.isArray(selectedConfig.components.storage)
        ? selectedConfig.components.storage[0]?.price || 0
        : selectedConfig.components.storage.price || 0
      : 0;

    const originalCoolingPrice = selectedConfig?.components?.cooling
      ? Array.isArray(selectedConfig.components.cooling)
        ? selectedConfig.components.cooling[0]?.price || 0
        : selectedConfig.components.cooling.price || 0
      : 0;

    const ramDiff = (componentPrices.ram || 0) - originalRamPrice;
    const gpuDiff = (componentPrices.gpu || 0) - originalGpuPrice;
    const storageDiff = (componentPrices.storage || 0) - originalStoragePrice;
    const coolingDiff = (componentPrices.cooling || 0) - originalCoolingPrice;

    console.log(
      `Prezzo base: ${basePrice}, ramDiff: ${ramDiff}, gpuDiff: ${gpuDiff}, storageDiff: ${storageDiff}, coolingDiff: ${coolingDiff}`
    );

    return basePrice + ramDiff + gpuDiff + storageDiff + coolingDiff;
  };

  const handleComponentChange = (type, id, price) => {
    switch (type) {
      case "ram":
        setSelectedRam(id);
        break;
      case "gpu":
        setSelectedGpu(id);
        break;
      case "storage":
        setSelectedStorage(id);
        break;
      case "cooling":
        setSelectedCooling(id);
        break;
      default:
        return;
    }

    const componentPrices = {
      ram:
        type === "ram"
          ? price
          : ramOptions.find((r) => r._id === selectedRam)?.price || 0,
      gpu:
        type === "gpu"
          ? price
          : gpuOptions.find((g) => g._id === selectedGpu)?.price || 0,
      storage:
        type === "storage"
          ? price
          : storageOptions.find((s) => s._id === selectedStorage)?.price || 0,
      cooling:
        type === "cooling"
          ? price
          : coolingOptions.find((c) => c._id === selectedCooling)?.price || 0,
    };

    const newPrice = calculateTotalPrice(componentPrices);
    setCurrentPrice(newPrice);
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    setError("");

    try {
      if (!selectedConfig)
        throw new Error("Nessuna configurazione selezionata");

      const updatedConfig = {
        name: configName,
        components: {
          ...selectedConfig.components,
        },
      };

      if (selectedRam && selectedRam !== selectedConfig.components?.ram?._id) {
        updatedConfig.components.ram = selectedRam;
      }

      if (selectedGpu && selectedGpu !== selectedConfig.components?.gpu?._id) {
        updatedConfig.components.gpu = selectedGpu;
      }

      if (
        selectedStorage &&
        selectedStorage !== selectedConfig.components?.storage?._id
      ) {
        updatedConfig.components.storage = selectedStorage;
      }

      if (
        selectedCooling &&
        selectedCooling !== selectedConfig.components?.cooling?._id
      ) {
        updatedConfig.components.cooling = selectedCooling;
      }

      if (selectedConfig.source === "customMachine") {
        updatedConfig.finalPrice = currentPrice;
      } else {
        updatedConfig.totalPrice = currentPrice;
      }

      console.log("Aggiornamento configurazione:", updatedConfig);

      if (selectedConfig.source === "customMachine") {
        await api.updateCustomMachine(selectedConfig._id, updatedConfig);
      } else {
        await api.updateMachine(selectedConfig._id, updatedConfig);
      }

      setSuccess("Configurazione aggiornata con successo!");

      setTimeout(() => {
        handleCloseModal();
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error("❌ Errore nell'aggiornamento della configurazione:", err);
      setError(
        "Impossibile aggiornare la configurazione: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const getSelectedComponentName = (options, selectedId) => {
    const component = options.find((item) => item._id === selectedId);
    return component ? component.name : "Non selezionato";
  };

  const getComponentInfo = (components, componentType) => {
    if (!components) return null;
    if (Array.isArray(components[componentType])) {
      if (components[componentType].length > 0) {
        return components[componentType][0];
      }
      return null;
    }
    return components[componentType];
  };

  const getCaseImageUrl = (config) => {
    if (!config.components || !config.components.case) return null;
    const caseComponent = getComponentInfo(config.components, "case");
    return caseComponent.imageUrl || caseComponent.image;
  };

  const addConfigurationToCart = async (config) => {
    setLoading(true);
    setError("");

    try {
      // Prepara i dati per l'aggiunta al carrello - prova una struttura diversa
      // rispetto a quella che ha causato l'errore 400
      const cartItem = {
        itemId: config._id, // invece di productId
        itemType: "machine", // il tipo specifico richiesto
        quantity: 1,
      };

      console.log("Tentativo di aggiungere al carrello:", cartItem);

      // Chiamata API corretta per aggiungere al carrello
      const response = await api.addToCart(cartItem);

      setSuccess("Configurazione aggiunta al carrello!");

      setTimeout(() => {
        navigate("/checkout", {
          state: {
            configuration: config,
          },
        });
      }, 1000);

      return response;
    } catch (error) {
      console.error("❌ Errore nell'aggiungere al carrello:", error);
      setError(
        "Impossibile aggiungere al carrello: " +
          (error.response?.data?.message || error.message)
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
    <Container className="py-5">
      <h1 className="text-center mb-4">Le Mie Configurazioni</h1>
      <p className="text-center text-muted mb-5">
        Qui puoi visualizzare, modificare o eliminare le tue configurazioni
        personalizzate. Fai clic su una configurazione per modificarla.
      </p>

      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-dark text-light d-flex justify-content-between align-items-center">
          <h3>Le Mie Configurazioni</h3>
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => navigate("/")}
          >
            <i className="bi bi-plus-lg me-1"></i> Nuova configurazione
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {loadingConfigs ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Caricamento delle configurazioni...</p>
            </div>
          ) : userConfigurations.length > 0 ? (
            <Row xs={1} md={2} className="g-4">
              {userConfigurations.map((config) => {
                const cpu = getComponentInfo(config.components, "cpu");
                const gpu = getComponentInfo(config.components, "gpu");
                const ram = getComponentInfo(config.components, "ram");
                const storage = getComponentInfo(config.components, "storage");
                const imageUrl = getCaseImageUrl(config);

                return (
                  <Col key={config._id || config.id}>
                    <Card
                      className="h-100 shadow-sm"
                      style={{
                        cursor: "pointer",
                        transition: "transform 0.2s",
                      }}
                      onClick={() => handleOpenModal(config)}
                    >
                      <div
                        className="text-center pt-3"
                        style={{ height: "150px", overflow: "hidden" }}
                      >
                        <img
                          src={
                            imageUrl ||
                            "https://via.placeholder.com/150?text=PC+Case"
                          }
                          alt={`${config.name || "PC"} case`}
                          style={{ maxHeight: "140px", maxWidth: "80%" }}
                        />
                      </div>
                      <Card.Body>
                        <Card.Title>
                          {config.name || "PC Configurato"}
                        </Card.Title>
                        <Card.Text className="text-primary fw-bold">
                          {(
                            config.finalPrice ||
                            config.totalPrice ||
                            0
                          ).toFixed(2)}{" "}
                          €
                        </Card.Text>
                        <div className="small mb-3">
                          {cpu && (
                            <div>
                              <strong>CPU:</strong> {cpu.name}
                            </div>
                          )}
                          {gpu && (
                            <div>
                              <strong>GPU:</strong> {gpu.name}
                            </div>
                          )}
                          {ram && (
                            <div>
                              <strong>RAM:</strong> {ram.name}
                            </div>
                          )}
                          {storage && (
                            <div>
                              <strong>Storage:</strong> {storage.name}
                            </div>
                          )}
                        </div>
                      </Card.Body>
                      <Card.Footer className="text-muted text-center">
                        <small>
                          <Button
                            variant="success"
                            size="sm"
                            className="w-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              addConfigurationToCart(config).catch((err) => {
                                // Gli errori sono già gestiti nella funzione
                              });
                            }}
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-1"
                                />
                                Aggiunta...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-cart-plus me-1"></i>
                                Aggiungi al carrello
                              </>
                            )}
                          </Button>
                        </small>
                      </Card.Footer>
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

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifica Configurazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Caricamento in corso...</p>
            </div>
          ) : selectedConfig ? (
            <>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nome configurazione</Form.Label>
                  <Form.Control
                    type="text"
                    value={configName}
                    onChange={(e) => setConfigName(e.target.value)}
                  />
                </Form.Group>

                <Card className="mb-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Prezzo Totale</h5>
                      <h4 className="text-primary mb-0">
                        {currentPrice.toFixed(2)} €
                      </h4>
                    </div>

                    <p className="text-muted">
                      Seleziona i componenti che desideri modificare. Il prezzo
                      verrà aggiornato automaticamente.
                    </p>
                  </Card.Body>
                </Card>

                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-3"
                >
                  <Tab eventKey="ram" title="RAM">
                    <Card>
                      <Card.Header>
                        <div className="d-flex justify-content-between">
                          <span>Seleziona RAM</span>
                          <span>
                            Attuale:{" "}
                            {getSelectedComponentName(ramOptions, selectedRam)}
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Body
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        {ramOptions.length > 0 ? (
                          <Form.Group>
                            {ramOptions.map((ram) => (
                              <div
                                key={ram._id}
                                className="mb-3 border-bottom pb-2"
                              >
                                <Form.Check
                                  type="radio"
                                  id={`ram-${ram._id}`}
                                  name="ram"
                                  label={`${ram.name} - ${
                                    ram.price ? ram.price.toFixed(2) : "N/D"
                                  } €`}
                                  checked={selectedRam === ram._id}
                                  onChange={() =>
                                    handleComponentChange(
                                      "ram",
                                      ram._id,
                                      ram.price
                                    )
                                  }
                                />
                                <div className="ms-4 small text-muted">
                                  {ram.brand && <div>Marca: {ram.brand}</div>}
                                  {ram.speed && (
                                    <div>Velocità: {ram.speed}</div>
                                  )}
                                  {ram.capacity && (
                                    <div>Capacità: {ram.capacity}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </Form.Group>
                        ) : (
                          <p>Nessuna opzione RAM disponibile</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="gpu" title="Scheda Video">
                    <Card>
                      <Card.Header>
                        <div className="d-flex justify-content-between">
                          <span>Seleziona GPU</span>
                          <span>
                            Attuale:{" "}
                            {getSelectedComponentName(gpuOptions, selectedGpu)}
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Body
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        {gpuOptions.length > 0 ? (
                          <Form.Group>
                            {gpuOptions.map((gpu) => (
                              <div
                                key={gpu._id}
                                className="mb-3 border-bottom pb-2"
                              >
                                <Form.Check
                                  type="radio"
                                  id={`gpu-${gpu._id}`}
                                  name="gpu"
                                  label={`${gpu.name} - ${
                                    gpu.price ? gpu.price.toFixed(2) : "N/D"
                                  } €`}
                                  checked={selectedGpu === gpu._id}
                                  onChange={() =>
                                    handleComponentChange(
                                      "gpu",
                                      gpu._id,
                                      gpu.price
                                    )
                                  }
                                />
                                <div className="ms-4 small text-muted">
                                  {gpu.brand && <div>Marca: {gpu.brand}</div>}
                                  {gpu.memory && (
                                    <div>Memoria: {gpu.memory}</div>
                                  )}
                                  {gpu.tdp && <div>TDP: {gpu.tdp}W</div>}
                                </div>
                              </div>
                            ))}
                          </Form.Group>
                        ) : (
                          <p>Nessuna opzione GPU disponibile</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="storage" title="Storage">
                    <Card>
                      <Card.Header>
                        <div className="d-flex justify-content-between">
                          <span>Seleziona Storage</span>
                          <span>
                            Attuale:{" "}
                            {getSelectedComponentName(
                              storageOptions,
                              selectedStorage
                            )}
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Body
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        {storageOptions.length > 0 ? (
                          <Form.Group>
                            {storageOptions.map((storage) => (
                              <div
                                key={storage._id}
                                className="mb-3 border-bottom pb-2"
                              >
                                <Form.Check
                                  type="radio"
                                  id={`storage-${storage._id}`}
                                  name="storage"
                                  label={`${storage.name} - ${
                                    storage.price
                                      ? storage.price.toFixed(2)
                                      : "N/D"
                                  } €`}
                                  checked={selectedStorage === storage._id}
                                  onChange={() =>
                                    handleComponentChange(
                                      "storage",
                                      storage._id,
                                      storage.price
                                    )
                                  }
                                />
                                <div className="ms-4 small text-muted">
                                  {storage.brand && (
                                    <div>Marca: {storage.brand}</div>
                                  )}
                                  {storage.capacity && (
                                    <div>Capacità: {storage.capacity}</div>
                                  )}
                                  {storage.type && (
                                    <div>Tipo: {storage.type}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </Form.Group>
                        ) : (
                          <p>Nessuna opzione Storage disponibile</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>

                  <Tab eventKey="cooling" title="Raffreddamento">
                    <Card>
                      <Card.Header>
                        <div className="d-flex justify-content-between">
                          <span>Seleziona Sistema di Raffreddamento</span>
                          <span>
                            Attuale:{" "}
                            {getSelectedComponentName(
                              coolingOptions,
                              selectedCooling
                            )}
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Body
                        style={{ maxHeight: "300px", overflowY: "auto" }}
                      >
                        {coolingOptions.length > 0 ? (
                          <Form.Group>
                            {coolingOptions.map((cooling) => (
                              <div
                                key={cooling._id}
                                className="mb-3 border-bottom pb-2"
                              >
                                <Form.Check
                                  type="radio"
                                  id={`cooling-${cooling._id}`}
                                  name="cooling"
                                  label={`${cooling.name} - ${
                                    cooling.price
                                      ? cooling.price.toFixed(2)
                                      : "N/D"
                                  } €`}
                                  checked={selectedCooling === cooling._id}
                                  onChange={() =>
                                    handleComponentChange(
                                      "cooling",
                                      cooling._id,
                                      cooling.price
                                    )
                                  }
                                />
                                <div className="ms-4 small text-muted">
                                  {cooling.brand && (
                                    <div>Marca: {cooling.brand}</div>
                                  )}
                                  {cooling.type && (
                                    <div>Tipo: {cooling.type}</div>
                                  )}
                                  {cooling.tdp && (
                                    <div>TDP supportato: {cooling.tdp}W</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </Form.Group>
                        ) : (
                          <p>Nessuna opzione Raffreddamento disponibile</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab>
                </Tabs>
              </Form>
            </>
          ) : (
            <p>Nessuna configurazione selezionata</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Annulla
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveConfig}
            disabled={loading || !selectedConfig}
          >
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
              "Salva Modifiche"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyConfiguration;
