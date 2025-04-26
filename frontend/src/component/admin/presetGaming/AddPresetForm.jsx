import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Accordion,
} from "react-bootstrap";

const AddPresetForm = ({
  onSubmit,
  loading,
  components,
  filteredComponents,
  selectedComponents,
  updateSelectedComponents,
  calculateBasePrice,
  incompatibilityWarnings,
}) => {
  // Funzione per formattare il prezzo
  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  // Stato locale per i componenti selezionati
  const [localSelectedComponents, setLocalSelectedComponents] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    powerSupply: null,
    case: null,
    cooling: null,
  });

  // Sincronizza lo stato locale con quello del parent
  useEffect(() => {
    setLocalSelectedComponents(selectedComponents);
  }, [selectedComponents]);

  const initialFormState = {
    name: "",
    description: "",
    category: "gaming",
    components: {
      cpu: "",
      motherboard: "",
      ram: "",
      gpu: "",
      storage: "",
      powerSupply: "",
      case: "",
      cooling: "",
    },
    basePrice: "250.00",
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [activeKey, setActiveKey] = useState("");
  const isResetting = useRef(false);

  // Modifica la funzione calculateLocalBasePrice
  const calculateLocalBasePrice = () => {
    // Verifica se ci sono componenti selezionati
    const hasAnyComponent = Object.values(localSelectedComponents).some(
      (comp) => comp !== null
    );

    // Se non ci sono componenti, restituisci solo l'assemblaggio
    if (!hasAnyComponent) {
      return "250.00"; // Prezzo base di assemblaggio
    }

    // Inizia con l'assemblaggio base di 250€
    let totalPrice = 250.0;

    // Aggiungi il prezzo dei componenti selezionati
    Object.values(localSelectedComponents).forEach((component) => {
      if (component && typeof component.price === "number") {
        totalPrice += component.price;
      }
    });

    // Restituisci il prezzo totale (assemblaggio + componenti)
    return totalPrice.toFixed(2);
  };

  // Aggiorna il prezzo basandosi sui componenti locali
  useEffect(() => {
    if (!isResetting.current) {
      setFormData((prev) => ({
        ...prev,
        basePrice: calculateLocalBasePrice(),
      }));
    }
  }, [localSelectedComponents]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleComponentChange = (e) => {
    const { name, value } = e.target;
    const componentType = name.replace("components.", "");

    setFormData({
      ...formData,
      components: {
        ...formData.components,
        [componentType]: value,
      },
    });

    // Aggiorna sia lo stato locale che quello del parent
    updateSelectedComponents(componentType, value);
  };

  // Funzione per resettare completamente tutto lo stato
  const resetForm = () => {
    isResetting.current = true;

    // Reset dello stato locale
    setLocalSelectedComponents({
      cpu: null,
      motherboard: null,
      ram: null,
      gpu: null,
      storage: null,
      powerSupply: null,
      case: null,
      cooling: null,
    });

    // Reset dei componenti nel parent
    Object.keys(initialFormState.components).forEach((componentType) => {
      updateSelectedComponents(componentType, "");
    });

    // Reset del form
    setFormData({
      ...initialFormState,
      basePrice: "250.00", // Imposta sempre a 250€ il prezzo base
    });

    setActiveKey("");

    setTimeout(() => {
      isResetting.current = false;
    }, 300);
  };

  // Modifica handleSubmit per usare il reset completo
  const handleSubmit = (e) => {
    e.preventDefault();

    // Verifica che tutti i componenti siano stati selezionati
    const missingComponents = Object.entries(formData.components)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingComponents.length > 0) {
      return;
    }

    onSubmit(formData)
      .then(() => {
        // Reset completo dopo il salvataggio
        resetForm();
      })
      .catch((error) => {
        console.error("Errore durante il salvataggio:", error);
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Nome Configurazione*</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Es: Gaming Pro Ultra"
              required
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Categoria*</Form.Label>
            <Form.Control
              as="select"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="gaming">Gaming</option>
              <option value="entry-level">Entry Level</option>
              <option value="high-end">High-End</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Prezzo Base (€)*</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              Il prezzo di vendita finale (componenti + assemblaggio di €250)
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label>Descrizione</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descrivi questa configurazione gaming..."
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Configurazione Attiva"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <Form.Text className="text-muted">
          Le configurazioni attive saranno visibili agli utenti.
        </Form.Text>
      </Form.Group>

      <h5 className="mt-4 mb-3">Seleziona Componenti</h5>

      <Accordion>
        {/* CPU */}
        <Accordion.Item eventKey="cpu">
          <Accordion.Header
            onClick={() => setActiveKey(activeKey === "cpu" ? "" : "cpu")}
            className={selectedComponents.cpu ? "bg-light" : ""}
          >
            CPU (Processore)*
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Control
                as="select"
                name="components.cpu"
                value={formData.components.cpu}
                onChange={handleComponentChange}
                required
              >
                <option value="">Seleziona CPU</option>
                {filteredComponents.cpus.map((cpu) => (
                  <option key={cpu._id} value={cpu._id}>
                    {cpu.brand} {cpu.model} - {cpu.cores}C/{cpu.threads}T{" "}
                    {cpu.baseFrequency}GHz - €{formatPrice(cpu.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        {/* Motherboard */}
        <Accordion.Item eventKey="motherboard">
          <Accordion.Header
            onClick={() =>
              setActiveKey(activeKey === "motherboard" ? "" : "motherboard")
            }
            className={selectedComponents.motherboard ? "bg-light" : ""}
          >
            Scheda Madre*
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Control
                as="select"
                name="components.motherboard"
                value={formData.components.motherboard}
                onChange={handleComponentChange}
                required
                disabled={!selectedComponents.cpu}
              >
                <option value="">Seleziona Scheda Madre</option>
                {filteredComponents.motherboards.map((mb) => (
                  <option key={mb._id} value={mb._id}>
                    {mb.brand} {mb.model} - {mb.socket} - {mb.format} - €
                    {formatPrice(mb.price)}
                  </option>
                ))}
              </Form.Control>
              {!selectedComponents.cpu && (
                <Form.Text className="text-muted">
                  Seleziona prima una CPU per vedere le schede madri compatibili
                </Form.Text>
              )}
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        {/* RAM */}
        <Accordion.Item eventKey="ram">
          <Accordion.Header
            onClick={() => setActiveKey(activeKey === "ram" ? "" : "ram")}
            className={selectedComponents.ram ? "bg-light" : ""}
          >
            Memoria RAM*
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Control
                as="select"
                name="components.ram"
                value={formData.components.ram}
                onChange={handleComponentChange}
                required
                disabled={!selectedComponents.motherboard}
              >
                <option value="">Seleziona RAM</option>
                {filteredComponents.rams.map((ram) => (
                  <option key={ram._id} value={ram._id}>
                    {ram.brand} {ram.model} {ram.capacity}GB {ram.type}{" "}
                    {ram.speed}MHz - €{formatPrice(ram.price)}
                  </option>
                ))}
              </Form.Control>
              {!selectedComponents.motherboard && (
                <Form.Text className="text-muted">
                  Seleziona prima una scheda madre per vedere le RAM compatibili
                </Form.Text>
              )}
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        {/* GPU */}
        <Accordion.Item eventKey="gpu">
          <Accordion.Header
            onClick={() => setActiveKey(activeKey === "gpu" ? "" : "gpu")}
            className={selectedComponents.gpu ? "bg-light" : ""}
          >
            Scheda Video (GPU)*
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Control
                as="select"
                name="components.gpu"
                value={formData.components.gpu}
                onChange={handleComponentChange}
                required
              >
                <option value="">Seleziona Scheda Video</option>
                {filteredComponents.gpus.map((gpu) => (
                  <option key={gpu._id} value={gpu._id}>
                    {gpu.brand} {gpu.model} - {gpu.vram}GB - {gpu.tdp}W - €
                    {formatPrice(gpu.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        {/* Storage */}
        <Accordion.Item eventKey="storage">
          <Accordion.Header
            onClick={() =>
              setActiveKey(activeKey === "storage" ? "" : "storage")
            }
            className={selectedComponents.storage ? "bg-light" : ""}
          >
            Storage*
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Control
                as="select"
                name="components.storage"
                value={formData.components.storage}
                onChange={handleComponentChange}
                required
              >
                <option value="">Seleziona Storage</option>
                {filteredComponents.storages.map((storage) => (
                  <option key={storage._id} value={storage._id}>
                    {storage.brand} {storage.model} {storage.type}{" "}
                    {storage.capacity}GB - €{formatPrice(storage.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        {/* Power Supply */}
        <Accordion.Item eventKey="powerSupply">
          <Accordion.Header
            onClick={() =>
              setActiveKey(activeKey === "powerSupply" ? "" : "powerSupply")
            }
            className={selectedComponents.powerSupply ? "bg-light" : ""}
          >
            Alimentatore*
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Control
                as="select"
                name="components.powerSupply"
                value={formData.components.powerSupply}
                onChange={handleComponentChange}
                required
              >
                <option value="">Seleziona Alimentatore</option>
                {filteredComponents.powerSupplies.map((psu) => (
                  <option key={psu._id} value={psu._id}>
                    {psu.brand} {psu.model} {psu.wattage}W {psu.certification} -
                    €{formatPrice(psu.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        {/* Case */}
        <Accordion.Item eventKey="case">
          <Accordion.Header
            onClick={() => setActiveKey(activeKey === "case" ? "" : "case")}
            className={selectedComponents.case ? "bg-light" : ""}
          >
            Case*
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Control
                as="select"
                name="components.case"
                value={formData.components.case}
                onChange={handleComponentChange}
                required
              >
                <option value="">Seleziona Case</option>
                {filteredComponents.cases.map((caseItem) => (
                  <option key={caseItem._id} value={caseItem._id}>
                    {caseItem.brand} {caseItem.model} {caseItem.formFactor} - €
                    {formatPrice(caseItem.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>

        {/* Cooling */}
        <Accordion.Item eventKey="cooling">
          <Accordion.Header
            onClick={() =>
              setActiveKey(activeKey === "cooling" ? "" : "cooling")
            }
            className={selectedComponents.cooling ? "bg-light" : ""}
          >
            Raffreddamento*
          </Accordion.Header>
          <Accordion.Body>
            <Form.Group>
              <Form.Control
                as="select"
                name="components.cooling"
                value={formData.components.cooling}
                onChange={handleComponentChange}
                required
              >
                <option value="">Seleziona Sistema di Raffreddamento</option>
                {filteredComponents.coolings.map((cooling) => (
                  <option key={cooling._id} value={cooling._id}>
                    {cooling.brand} {cooling.model} {cooling.type} - €
                    {formatPrice(cooling.price)}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <div className="d-flex justify-content-between mt-4">
        <Button variant="outline-secondary" type="button" onClick={resetForm}>
          <i className="bi bi-arrow-counterclockwise me-2"></i>
          Azzera Form
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={
            loading ||
            incompatibilityWarnings.length > 0 ||
            Object.values(formData.components).some((v) => !v)
          }
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
              Caricamento...
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle me-2"></i>
              Crea Configurazione Gaming
            </>
          )}
        </Button>
      </div>

      {incompatibilityWarnings.length > 0 && (
        <Alert variant="warning" className="mt-3">
          <strong>Risolvi i problemi di compatibilità prima di salvare:</strong>
          <ul className="mb-0 mt-2">
            {incompatibilityWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </Alert>
      )}
    </Form>
  );
};

export default AddPresetForm;
