import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Spinner,
  Alert,
  ListGroup,
} from "react-bootstrap";
import api from "../../utlis/api";
import ComponentDetail from "../../component/configurator/ComponentDetail";

const PrebuiltDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [ramOptions, setRamOptions] = useState([]);
  const [gpuOptions, setGpuOptions] = useState([]);
  const [selectedRam, setSelectedRam] = useState("");
  const [selectedGpu, setSelectedGpu] = useState("");
  const [customPrice, setCustomPrice] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchMachineDetails();
  }, [id]);

  const fetchMachineDetails = async () => {
    setLoading(true);
    try {
      const response = await api.getPresetById(id);
      console.log("Dati macchina ricevuti:", response.data);

      const machineData = response.data;
      setMachine(machineData);

      if (
        machineData &&
        machineData.components &&
        machineData.components.motherboard
      ) {
        // Se la motherboard ha un _id, utilizziamo quello per ottenere dettagli aggiornati
        // altrimenti possiamo usare direttamente l'oggetto motherboard
        if (machineData.components.motherboard._id) {
          fetchCompatibleRamOptions(machineData.components.motherboard._id);
        } else {
          // L'oggetto motherboard è già completo, possiamo procedere senza ID
          fetchCompatibleRamOptions();
        }
      } else {
        fetchCompatibleRamOptions();
      }

      fetchCompatibleGpuOptions();

      if (machineData && machineData.components) {
        if (machineData.components.ram) {
          setSelectedRam(machineData.components.ram._id);
        }

        if (machineData.components.gpu) {
          setSelectedGpu(machineData.components.gpu._id);
        }
      }

      if (machineData && machineData.price) {
        setCustomPrice(machineData.price);
      } else if (machineData && machineData.basePrice) {
        setCustomPrice(machineData.basePrice);
      }
    } catch (err) {
      console.error("Errore completo:", err);
      setError("Errore nel caricamento dei dettagli della configurazione");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompatibleRamOptions = async (motherboardId) => {
    try {
      let response;

      // Prima otteniamo i dettagli della scheda madre per conoscere il suo memoryType
      if (motherboardId) {
        const motherboardResponse = await api.getMotherboardById(motherboardId);
        const motherboard = motherboardResponse.data;

        console.log("Dettagli scheda madre:", motherboard);

        if (motherboard && motherboard.memoryType) {
          console.log(
            "Filtraggio RAM per tipo di memoria:",
            motherboard.memoryType
          );

          // Otteniamo tutte le RAM
          response = await api.getRAMs();

          // Filtriamo manualmente le RAM compatibili
          const allRams = response.data;
          const compatibleRams = allRams.filter(
            (ram) => ram.memoryType === motherboard.memoryType
          );

          console.log(
            `Trovate ${compatibleRams.length} RAM compatibili di tipo ${motherboard.memoryType} su ${allRams.length} totali`
          );

          // Imposta le RAM filtrate
          setRamOptions(compatibleRams);
          return;
        } else {
          console.warn(
            "Scheda madre trovata ma senza memoryType specificato:",
            motherboard
          );
        }
      } else if (
        machine &&
        machine.components &&
        machine.components.motherboard
      ) {
        // Se non abbiamo l'ID della scheda madre come parametro ma è disponibile nell'oggetto machine
        const motherboard = machine.components.motherboard;

        if (motherboard.memoryType) {
          console.log(
            "Usando memoryType dalla scheda madre già caricata:",
            motherboard.memoryType
          );

          // Otteniamo tutte le RAM
          response = await api.getRAMs();

          // Filtriamo manualmente
          const allRams = response.data;
          const compatibleRams = allRams.filter(
            (ram) => ram.type === motherboard.memoryType
          );

          console.log(
            `Trovate ${compatibleRams.length} RAM compatibili di tipo ${motherboard.memoryType}`
          );

          // Imposta le RAM filtrate
          setRamOptions(compatibleRams);
          return;
        }
      }

      // Fallback: carica tutte le RAM se non possiamo applicare filtri
      console.log(
        "Nessun filtro di compatibilità applicato, caricamento di tutte le RAM"
      );
      response = await api.getRAMs();
      setRamOptions(response.data);
    } catch (err) {
      console.error(
        "Errore nel caricamento delle opzioni RAM compatibili",
        err
      );
      // Gestione dell'errore: carica tutte le RAM disponibili
      try {
        const response = await api.getRAMs();
        setRamOptions(response.data);
      } catch (fallbackErr) {
        console.error(
          "Errore anche nel caricamento di fallback delle RAM",
          fallbackErr
        );
        setRamOptions([]);
      }
    }
  };

  const fetchCompatibleGpuOptions = async () => {
    try {
      const response = await api.getGPUs();
      setGpuOptions(response.data);
    } catch (err) {
      console.error("Errore nel caricamento delle opzioni GPU", err);
    }
  };

  const handleRamChange = (e) => {
    const ramId = e.target.value;
    setSelectedRam(ramId);

    if (ramId && machine) {
      // Calcolo incrementale del prezzo
      const selectedRamObj = ramOptions.find((r) => r._id === ramId);
      const originalRamObj = machine.components.ram;

      // Partiamo dal prezzo attualmente calcolato (custom) se esiste, altrimenti dal prezzo base
      let currentPrice = customPrice || machine.price || machine.basePrice || 0;

      // Se stiamo cambiando la RAM (non è la prima selezione), prima sottraiamo
      // l'effetto della RAM precedente (se era diversa dall'originale)
      if (
        selectedRam &&
        selectedRam !== ramId &&
        selectedRam !== machine.components.ram?._id
      ) {
        const previousRamObj = ramOptions.find((r) => r._id === selectedRam);
        if (previousRamObj && originalRamObj) {
          currentPrice =
            currentPrice - previousRamObj.price + originalRamObj.price;
        }
      }

      // Ora applichiamo l'effetto della nuova RAM selezionata
      if (selectedRamObj && originalRamObj) {
        currentPrice =
          currentPrice - originalRamObj.price + selectedRamObj.price;
      }

      setCustomPrice(currentPrice);
    }
  };

  const handleGpuChange = (e) => {
    const gpuId = e.target.value;
    setSelectedGpu(gpuId);

    if (gpuId && machine) {
      // Calcolo incrementale del prezzo
      const selectedGpuObj = gpuOptions.find((g) => g._id === gpuId);
      const originalGpuObj = machine.components.gpu;

      // Partiamo dal prezzo attualmente calcolato (custom) se esiste, altrimenti dal prezzo base
      let currentPrice = customPrice || machine.price || machine.basePrice || 0;

      // Se stiamo cambiando la GPU (non è la prima selezione), prima sottraiamo
      // l'effetto della GPU precedente (se era diversa dall'originale)
      if (
        selectedGpu &&
        selectedGpu !== gpuId &&
        selectedGpu !== machine.components.gpu?._id
      ) {
        const previousGpuObj = gpuOptions.find((g) => g._id === selectedGpu);
        if (previousGpuObj && originalGpuObj) {
          currentPrice =
            currentPrice - previousGpuObj.price + originalGpuObj.price;
        }
      }

      // Ora applichiamo l'effetto della nuova GPU selezionata
      if (selectedGpuObj && originalGpuObj) {
        currentPrice =
          currentPrice - originalGpuObj.price + selectedGpuObj.price;
      }

      setCustomPrice(currentPrice);
    }
  };
  const handleAddToCart = async () => {
    if (!machine || addingToCart) return;

    setAddingToCart(true);
    setError("");
    setSuccess("");

    try {
      // Verifica se l'utente è autenticato
      if (!window.localStorage.getItem("token")) {
        navigate("/login");
        return;
      }

      // Usa il prezzo base originale, NON quello modificato
      const originalBasePrice = machine.price || machine.basePrice || 0;

      const customConfig = {
        name: `${machine.name} (Personalizzato)`,
        // Invia il prezzo originale della macchina, non il customPrice
        basePrice: originalBasePrice,
        category: machine.category,
        description: `${machine.description} - Personalizzato con RAM: ${
          ramOptions.find((r) => r._id === selectedRam)?.name || ""
        } e GPU: ${gpuOptions.find((g) => g._id === selectedGpu)?.name || ""}`,
        components: {
          ...machine.components,
          ram: selectedRam,
          gpu: selectedGpu,
        },
        isCustomized: true,
        originalPresetId: machine._id,
        saveToUser: true,
        status: "saved",
      };

      console.log("Salvo configurazione personalizzata:", customConfig);
      const saveResponse = await api.createCustomMachine(customConfig);
      console.log("Risposta salvataggio:", saveResponse.data);

      if (!saveResponse.data || !saveResponse.data.machine) {
        throw new Error(
          "Errore nel salvataggio della configurazione personalizzata"
        );
      }

      const savedMachineId = saveResponse.data.machine._id;

      // Questo oggetto deve corrispondere alla struttura del cart nello schema User
      const cartItem = {
        itemId: savedMachineId,
        itemType: "preset", // Assicurati che questo valore sia uno di quelli definiti nell'enum
        quantity: 1,
        // addedAt verrà aggiunto automaticamente dal server
      };

      console.log("Invio al carrello:", cartItem);
      // Usa l'API che aggiunge l'elemento al carrello dell'utente
      const response = await api.addToCart(cartItem);
      console.log("Risposta dal server:", response.data);

      if (response.data && !response.data.error) {
        // Forza un trigger manuale dell'aggiornamento del carrello
        import("../../utlis/cartUtils").then((module) => {
          const { notifyCartUpdated } = module;
          notifyCartUpdated();
          console.log("🔔 Forzato aggiornamento manuale del carrello");
        });

        setSuccess(
          "PC personalizzato salvato e aggiunto al carrello con successo!"
        );
        setTimeout(() => {
          navigate("/checkout");
        }, 1500);
      } else {
        throw new Error(
          response.data.error || "Errore nell'aggiunta al carrello"
        );
      }
    } catch (err) {
      console.error("Errore completo:", err);
      setError("Errore: " + (err.response?.data?.message || err.message));
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-dark text-light py-5 min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3">Caricamento dettagli...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark text-light py-5 min-vh-100">
        <Container>
          <Alert variant="danger">{error}</Alert>
          <Button variant="outline-light" onClick={() => navigate(-1)}>
            Torna indietro
          </Button>
        </Container>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="bg-dark text-light py-5 min-vh-100">
        <Container>
          <Alert variant="warning">Configurazione non trovata</Alert>
          <Button variant="outline-light" onClick={() => navigate(-1)}>
            Torna indietro
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-dark text-light py-5">
      <Container>
        {success && <Alert variant="success">{success}</Alert>}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>{machine.name}</h1>
          <Button variant="outline-light" onClick={() => navigate(-1)}>
            Torna all'elenco
          </Button>
        </div>

        <Badge
          bg={
            machine.category === "Gaming"
              ? "danger"
              : machine.category === "Entry level"
              ? "success"
              : "warning"
          }
          className="mb-3"
        >
          {machine.category}
        </Badge>

        <Row className="mb-5">
          <Col md={6} className="mb-4">
            <img
              src={machine.components.case.imageUrl}
              alt={machine.name}
              className="img-fluid rounded"
            />
          </Col>

          <Col md={6}>
            <Card className="bg-dark border-warning">
              <Card.Body>
                <h3 className="text-warning mb-3">
                  {customPrice.toFixed(2)} €
                </h3>
                <p>{machine.description}</p>

                <div className="mb-4">
                  <h5 className="mb-3">Personalizza la tua configurazione</h5>

                  <Form.Group className="mb-3">
                    <Form.Label>Memoria RAM</Form.Label>
                    <Form.Select
                      value={selectedRam}
                      onChange={handleRamChange}
                      className="bg-dark text-light border-secondary"
                    >
                      <option value="">Seleziona RAM</option>
                      {ramOptions.map((ram) => (
                        <option key={ram._id} value={ram._id}>
                          {ram.name} - {ram.price.toFixed(2)} €
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Scheda Video</Form.Label>
                    <Form.Select
                      value={selectedGpu}
                      onChange={handleGpuChange}
                      className="bg-dark text-light border-secondary"
                    >
                      <option value="">Seleziona GPU</option>
                      {gpuOptions.map((gpu) => (
                        <option key={gpu._id} value={gpu._id}>
                          {gpu.name} - {gpu.price.toFixed(2)} €
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <Button
                  variant="warning"
                  size="lg"
                  className="w-100"
                  onClick={handleAddToCart}
                  disabled={addingToCart || !selectedRam || !selectedGpu}
                >
                  {addingToCart ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Aggiunta in corso...
                    </>
                  ) : (
                    <>Aggiungi al carrello</>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <h2 className="mb-4">Specifiche del sistema</h2>
        <Row className="mb-5">
          {machine.components.cpu && (
            <Col md={6} lg={4} className="mb-4">
              <ComponentDetail
                title="Processore"
                component={machine.components.cpu}
                icon="cpu-fill"
              />
            </Col>
          )}

          {machine.components.motherboard && (
            <Col md={6} lg={4} className="mb-4">
              <ComponentDetail
                title="Scheda Madre"
                component={machine.components.motherboard}
                icon="motherboard"
              />
            </Col>
          )}

          {machine.components.ram && (
            <Col md={6} lg={4} className="mb-4">
              <ComponentDetail
                title="Memoria RAM"
                component={
                  selectedRam !== machine.components.ram._id
                    ? ramOptions.find((r) => r._id === selectedRam) ||
                      machine.components.ram
                    : machine.components.ram
                }
                icon="memory"
                isChangeable={true}
                isChanged={selectedRam !== machine.components.ram._id}
              />
            </Col>
          )}

          {machine.components.gpu && (
            <Col md={6} lg={4} className="mb-4">
              <ComponentDetail
                title="Scheda Video"
                component={
                  selectedGpu !== machine.components.gpu._id
                    ? gpuOptions.find((g) => g._id === selectedGpu) ||
                      machine.components.gpu
                    : machine.components.gpu
                }
                icon="gpu-card"
                isChangeable={true}
                isChanged={selectedGpu !== machine.components.gpu._id}
              />
            </Col>
          )}

          {machine.components.storage && (
            <Col md={6} lg={4} className="mb-4">
              <ComponentDetail
                title="Storage"
                component={machine.components.storage}
                icon="device-hdd"
              />
            </Col>
          )}

          {machine.components.powerSupply && (
            <Col md={6} lg={4} className="mb-4">
              <ComponentDetail
                title="Alimentatore"
                component={machine.components.powerSupply}
                icon="lightning-charge-fill"
              />
            </Col>
          )}

          {machine.components.case && (
            <Col md={6} lg={4} className="mb-4">
              <ComponentDetail
                title="Case"
                component={machine.components.case}
                icon="pc-display"
              />
            </Col>
          )}

          {machine.components.cooling && (
            <Col md={6} lg={4} className="mb-4">
              <ComponentDetail
                title="Sistema di Raffreddamento"
                component={machine.components.cooling}
                icon="snow"
              />
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default PrebuiltDetail;
