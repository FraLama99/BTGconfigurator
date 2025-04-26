import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Tabs,
  Tab,
  Table,
} from "react-bootstrap";
import {
  calculateDeliveryTime,
  formatDeliveryDate,
} from "./utils/deliveryTimeCalculator";
import Alert from "react-bootstrap/Alert";

const ConfigurationSummary = ({
  configuration,
  components,
  totalPrice,
  onSave,
  loading,
  configName,
  setConfigName,
  configDesc,
  setConfigDesc,
}) => {
  const location = useLocation();

  const brand = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes("amd")) return "amd";
    return "intel";
  }, [location]);

  const themes = {
    intel: {
      primary: "primary",
      secondary: "info",
      saveButton: "success",
      priceColor: "#0d6efd",
    },
    amd: {
      primary: "danger",
      secondary: "warning",
      saveButton: "success",
      priceColor: "#dc3545",
    },
  };

  const theme = themes[brand] || themes.intel;

  const { cpus, motherboards, rams, gpus, storages, psus, cases, coolers } =
    components;

  const selectedCpu = cpus.find((c) => c._id === configuration.cpu);
  const selectedMotherboard = motherboards.find(
    (m) => m._id === configuration.motherboard
  );
  const selectedRam = rams.find((r) => r._id === configuration.ram);
  const selectedGpu = gpus.find((g) => g._id === configuration.gpu);
  const selectedStorage = storages.find((s) => s._id === configuration.storage);
  const selectedPsu = psus.find((p) => p._id === configuration.powerSupply);
  const selectedCase = cases.find((c) => c._id === configuration.case);
  const selectedCooler = coolers.find((c) => c._id === configuration.cooling);

  const componentList = [
    { name: "Processore", component: selectedCpu },
    { name: "Scheda Madre", component: selectedMotherboard },
    { name: "RAM", component: selectedRam },
    { name: "Scheda Video", component: selectedGpu },
    { name: "Storage", component: selectedStorage },
    { name: "Alimentatore", component: selectedPsu },
    { name: "Case", component: selectedCase },
    { name: "Sistema di Raffreddamento", component: selectedCooler },
  ];

  const handleSave = () => {
    onSave();
  };

  // Calcola tempi di consegna
  const deliveryInfo = calculateDeliveryTime(configuration, components);

  // Funzione per ottenere il componente selezionato da un elenco
  const getSelectedComponent = (type, componentList) => {
    if (!configuration[type]) return null;
    return componentList.find((item) => item._id === configuration[type]);
  };

  return (
    <div className="configuration-summary">
      <h2 className="mb-4" style={{ color: theme.priceColor }}>
        Riepilogo della tua configurazione {brand.toUpperCase()}
      </h2>

      <Form className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Nome della configurazione</Form.Label>
          <Form.Control
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="Dai un nome alla tua configurazione"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Descrizione</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={configDesc}
            onChange={(e) => setConfigDesc(e.target.value)}
            placeholder="Descrivi la tua configurazione (opzionale)"
          />
        </Form.Group>
      </Form>

      <Row className="mb-4">
        <Col>
          <Card className="summary-card">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Dettagli Consegna</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Data di consegna stimata:</h5>
                <h5 className="text-primary mb-0">
                  {formatDeliveryDate(deliveryInfo.deliveryDate)}
                </h5>
              </div>

              {!deliveryInfo.allAvailable && (
                <Alert variant="warning">
                  <Alert.Heading>
                    Alcuni componenti non sono disponibili in magazzino
                  </Alert.Heading>
                  <p>
                    I seguenti componenti dovranno essere ordinati, causando un
                    ritardo nella consegna:
                  </p>
                  <ul>
                    {deliveryInfo.unavailableComponents.map((comp, index) => (
                      <li key={index}>
                        <strong>{comp.label}:</strong> {comp.name}
                      </li>
                    ))}
                  </ul>
                </Alert>
              )}

              {deliveryInfo.allAvailable && (
                <Alert variant="success">
                  <p className="mb-0">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Tutti i componenti sono disponibili per la spedizione
                    rapida!
                  </p>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="cards" className="mb-4">
        <Tab eventKey="cards" title="Vista a schede">
          <Row className="mt-4">
            {componentList.map((item, index) => (
              <Col key={index} xs={12} sm={6} md={3} className="mb-4">
                <Card className="h-100">
                  <Card.Img
                    variant="top"
                    src={item.component?.imageUrl}
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                  <Card.Body>
                    <div className="text-muted small">{item.name}</div>
                    <Card.Title className="h6">
                      {item.component?.name || "Non selezionato"}
                    </Card.Title>
                    {item.component?.price && (
                      <div className="text-primary fw-bold">
                        {item.component.price.toFixed(2)} €
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>
        <Tab eventKey="table" title="Vista tabellare">
          <Table striped hover responsive className="mt-4">
            <thead>
              <tr>
                <th>Componente</th>
                <th>Prodotto</th>
                <th>Specifiche</th>
                <th className="text-end">Prezzo</th>
              </tr>
            </thead>
            <tbody>
              {componentList.map((item, index) => (
                <tr key={index}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{item.component?.name || "Non selezionato"}</td>
                  <td>
                    {item.component && (
                      <div>
                        <div>
                          {item.component.brand} {item.component.model}
                        </div>
                        {item.component.socket && (
                          <div>Socket: {item.component.socket}</div>
                        )}
                        {item.component.formFactor && (
                          <div>Form Factor: {item.component.formFactor}</div>
                        )}
                        {item.component.ramType && (
                          <div>RAM: {item.component.ramType}</div>
                        )}
                        {item.component.tdp && (
                          <div>TDP: {item.component.tdp}W</div>
                        )}
                        {item.component.wattage && (
                          <div>{item.component.wattage}W</div>
                        )}
                      </div>
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
                  <strong>Costo assemblaggio e test</strong>
                </td>
                <td className="text-end">250.00 €</td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <h4>Prezzo Totale</h4>
                </td>
                <td className="text-end">
                  <h4 className="text-primary">{totalPrice.toFixed(2)} €</h4>
                </td>
              </tr>
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      <div className="d-flex justify-content-center mt-4">
        <Button
          variant={theme.saveButton}
          size="lg"
          onClick={handleSave}
          disabled={loading}
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
              <i className="bi bi-check-circle-fill me-2"></i>
              Salva Configurazione {brand.toUpperCase()}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationSummary;
