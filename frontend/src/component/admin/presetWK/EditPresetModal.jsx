import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";

const EditPresetModal = ({
  show,
  onHide,
  preset,
  components,
  filteredComponents,
  selectedComponents,
  updateSelectedComponents,
  onSubmit,
  loading,
  incompatibilityWarnings,
  calculateBasePrice,
}) => {
  const [formData, setFormData] = useState(null);

  // Inizializza il form quando viene aperto il modale
  useEffect(() => {
    if (preset) {
      setFormData({ ...preset });
    }
  }, [preset]);

  if (!formData) return null;

  // Gestisce i cambiamenti nei campi generali del form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Gestisce i cambiamenti nei componenti selezionati
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

    updateSelectedComponents(componentType, value);
  };

  // Invia il form di modifica
  const handleSubmit = (e) => {
    e.preventDefault();

    // Verifica che tutti i componenti siano selezionati
    const missingComponents = Object.entries(formData.components)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingComponents.length > 0) {
      return; // Blocca l'invio se mancano componenti
    }

    onSubmit(formData);
  };

  // Formatta il prezzo
  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Modifica Configurazione Workstation</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={7}>
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
                      <option value="workstation">Workstation</option>
                      <option value="office">Office</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Prezzo di Vendita (€)*</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Il prezzo di vendita finale (componenti + assemblaggio di
                      €150)
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
                  value={formData.description || ""}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Configurazione Attiva"
                  name="isActive"
                  checked={
                    formData.isActive === true || formData.isActive === "true"
                  }
                  onChange={handleChange}
                />
              </Form.Group>

              <h5 className="mt-4 mb-3">Componenti</h5>

              {incompatibilityWarnings.length > 0 && (
                <Alert variant="warning" className="mb-3">
                  <h6>Avvisi di Compatibilità:</h6>
                  <ul className="mb-0">
                    {incompatibilityWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </Alert>
              )}

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CPU*</Form.Label>
                    <Form.Control
                      as="select"
                      name="components.cpu"
                      value={formData.components.cpu}
                      onChange={handleComponentChange}
                      required
                    >
                      <option value="">Seleziona CPU</option>
                      {components.cpus.map((cpu) => (
                        <option key={cpu._id} value={cpu._id}>
                          {cpu.brand} {cpu.model} - {cpu.cores}C/{cpu.threads}T
                          - €{formatPrice(cpu.price)}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Scheda Madre*</Form.Label>
                    <Form.Control
                      as="select"
                      name="components.motherboard"
                      value={formData.components.motherboard}
                      onChange={handleComponentChange}
                      required
                    >
                      <option value="">Seleziona Scheda Madre</option>
                      {filteredComponents.motherboards.map((mb) => (
                        <option key={mb._id} value={mb._id}>
                          {mb.brand} {mb.model} - {mb.socket} - €
                          {formatPrice(mb.price)}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>RAM*</Form.Label>
                    <Form.Control
                      as="select"
                      name="components.ram"
                      value={formData.components.ram}
                      onChange={handleComponentChange}
                      required
                    >
                      <option value="">Seleziona RAM</option>
                      {filteredComponents.rams.map((ram) => (
                        <option key={ram._id} value={ram._id}>
                          {ram.brand} {ram.model} {ram.capacity}GB {ram.type} -
                          €{formatPrice(ram.price)}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Scheda Video*</Form.Label>
                    <Form.Control
                      as="select"
                      name="components.gpu"
                      value={formData.components.gpu}
                      onChange={handleComponentChange}
                      required
                    >
                      <option value="">Seleziona GPU</option>
                      {filteredComponents.gpus.map((gpu) => (
                        <option key={gpu._id} value={gpu._id}>
                          {gpu.brand} {gpu.model} - {gpu.vram}GB - €
                          {formatPrice(gpu.price)}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Storage*</Form.Label>
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
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Alimentatore*</Form.Label>
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
                          {psu.brand} {psu.model} {psu.wattage}W - €
                          {formatPrice(psu.price)}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Case*</Form.Label>
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
                          {caseItem.brand} {caseItem.model} - €
                          {formatPrice(caseItem.price)}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Raffreddamento*</Form.Label>
                    <Form.Control
                      as="select"
                      name="components.cooling"
                      value={formData.components.cooling}
                      onChange={handleComponentChange}
                      required
                    >
                      <option value="">Seleziona Raffreddamento</option>
                      {filteredComponents.coolings.map((cooling) => (
                        <option key={cooling._id} value={cooling._id}>
                          {cooling.brand} {cooling.model} - €
                          {formatPrice(cooling.price)}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" onClick={onHide} className="me-2">
                  Annulla
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
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-save me-2"></i>
                      Salva Modifiche
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Annulla
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading || incompatibilityWarnings.length > 0}
        >
          {loading ? "Salvataggio..." : "Salva Modifiche"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPresetModal;
