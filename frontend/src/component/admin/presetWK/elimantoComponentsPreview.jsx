import React, { useEffect, useState, useRef } from "react";
import { Card, Row, Col, ListGroup, Badge, Alert } from "react-bootstrap";

const ComponentsPreview = ({
  selectedComponents,
  basePrice,
  warnings = [],
  resetTrigger = 0, // Prop per forzare il reset
}) => {
  // Flag per il primo rendering
  const firstRender = useRef(true);

  // Stato locale per memorizzare i componenti da mostrare
  const [displayComponents, setDisplayComponents] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    powerSupply: null,
    case: null,
    cooling: null,
  });

  // Effetto per gestire il reset forzato
  useEffect(() => {
    // Salta la prima esecuzione (mount)
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    // Se il resetTrigger è cambiato, forza il reset
    if (resetTrigger > 0) {
      setDisplayComponents({
        cpu: null,
        motherboard: null,
        ram: null,
        gpu: null,
        storage: null,
        powerSupply: null,
        case: null,
        cooling: null,
      });
      return;
    }
  }, [resetTrigger]);

  // Effetto per aggiornare i componenti visualizzati quando cambiano quelli selezionati
  useEffect(() => {
    // Verifica se tutti i componenti sono null (reset completo)
    const isFullReset = Object.values(selectedComponents).every(
      (comp) => comp === null
    );

    if (isFullReset) {
      setDisplayComponents({
        cpu: null,
        motherboard: null,
        ram: null,
        gpu: null,
        storage: null,
        powerSupply: null,
        case: null,
        cooling: null,
      });
    } else {
      setDisplayComponents(selectedComponents);
    }
  }, [selectedComponents]);

  // Formatta il prezzo
  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  // Stili personalizzati per componenti selezionati
  const selectedComponentStyle = {
    backgroundColor: "#343a40", // Grigio scuro
    color: "#0dcaf0", // Azzurro per le workstation
  };

  // Calcola il prezzo totale dei componenti
  const calculateTotalComponentsPrice = () => {
    let total = 0;

    // Verifica se ci sono componenti selezionati
    const hasComponents = Object.values(displayComponents).some(
      (component) => component !== null
    );

    if (!hasComponents) {
      return 0;
    }

    Object.values(displayComponents).forEach((component) => {
      if (component && component.price) {
        total += component.price;
      }
    });

    return total;
  };

  // Calcola il prezzo di vendita (componenti + assemblaggio)
  const calculateSalePrice = () => {
    // Se non ci sono componenti, restituisci 0
    const componentsPrice = calculateTotalComponentsPrice();
    if (componentsPrice === 0) {
      return 0;
    }

    // 150€ fissi per l'assemblaggio
    const assemblyPrice = 150;
    return componentsPrice + assemblyPrice;
  };

  const totalComponentsPrice = calculateTotalComponentsPrice();
  const salePrice = calculateSalePrice();

  return (
    <Card className="mb-4">
      <Card.Header as="h5">
        <i className="bi bi-laptop me-2"></i>
        Riepilogo Componenti Selezionati
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <h6>Componenti Principali</h6>
            <ListGroup variant="flush">
              <ListGroup.Item
                style={displayComponents.cpu ? selectedComponentStyle : {}}
              >
                <strong>CPU:</strong>{" "}
                {displayComponents.cpu
                  ? displayComponents.cpu.name
                  : "Non selezionato"}
                {displayComponents.cpu && (
                  <span className="float-end text-info">
                    €{formatPrice(displayComponents.cpu.price)}
                  </span>
                )}
              </ListGroup.Item>
              <ListGroup.Item
                style={
                  displayComponents.motherboard ? selectedComponentStyle : {}
                }
              >
                <strong>Scheda Madre:</strong>{" "}
                {displayComponents.motherboard
                  ? displayComponents.motherboard.name
                  : "Non selezionato"}
                {displayComponents.motherboard && (
                  <span className="float-end text-info">
                    €{formatPrice(displayComponents.motherboard.price)}
                  </span>
                )}
              </ListGroup.Item>
              <ListGroup.Item
                style={displayComponents.gpu ? selectedComponentStyle : {}}
              >
                <strong>Scheda Video:</strong>{" "}
                {displayComponents.gpu
                  ? displayComponents.gpu.name
                  : "Non selezionato"}
                {displayComponents.gpu && (
                  <span className="float-end text-info">
                    €{formatPrice(displayComponents.gpu.price)}
                  </span>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={4}>
            <h6>Memoria e Archiviazione</h6>
            <ListGroup variant="flush">
              <ListGroup.Item
                style={displayComponents.ram ? selectedComponentStyle : {}}
              >
                <strong>RAM:</strong>{" "}
                {displayComponents.ram
                  ? displayComponents.ram.name
                  : "Non selezionato"}
                {displayComponents.ram && (
                  <span className="float-end text-info">
                    €{formatPrice(displayComponents.ram.price)}
                  </span>
                )}
              </ListGroup.Item>
              <ListGroup.Item
                style={displayComponents.storage ? selectedComponentStyle : {}}
              >
                <strong>Storage:</strong>{" "}
                {displayComponents.storage
                  ? displayComponents.storage.name
                  : "Non selezionato"}
                {displayComponents.storage && (
                  <span className="float-end text-info">
                    €{formatPrice(displayComponents.storage.price)}
                  </span>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={4}>
            <h6>Componenti Aggiuntivi</h6>
            <ListGroup variant="flush">
              <ListGroup.Item
                style={
                  displayComponents.powerSupply ? selectedComponentStyle : {}
                }
              >
                <strong>Alimentatore:</strong>{" "}
                {displayComponents.powerSupply
                  ? displayComponents.powerSupply.name
                  : "Non selezionato"}
                {displayComponents.powerSupply && (
                  <span className="float-end text-info">
                    €{formatPrice(displayComponents.powerSupply.price)}
                  </span>
                )}
              </ListGroup.Item>
              <ListGroup.Item
                style={displayComponents.case ? selectedComponentStyle : {}}
              >
                <strong>Case:</strong>{" "}
                {displayComponents.case
                  ? displayComponents.case.name
                  : "Non selezionato"}
                {displayComponents.case && (
                  <span className="float-end text-info">
                    €{formatPrice(displayComponents.case.price)}
                  </span>
                )}
              </ListGroup.Item>
              <ListGroup.Item
                style={displayComponents.cooling ? selectedComponentStyle : {}}
              >
                <strong>Raffreddamento:</strong>{" "}
                {displayComponents.cooling
                  ? displayComponents.cooling.name
                  : "Non selezionato"}
                {displayComponents.cooling && (
                  <span className="float-end text-info">
                    €{formatPrice(displayComponents.cooling.price)}
                  </span>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>

        {totalComponentsPrice > 0 ? (
          <div className="mt-3 p-3 bg-dark rounded border">
            <Row>
              <Col md={4}>
                <h6>Prezzo componenti:</h6>
                <h5>
                  <Badge bg="secondary">
                    € {formatPrice(totalComponentsPrice)}
                  </Badge>
                </h5>
              </Col>
              <Col md={4}>
                <h6>Costo assemblaggio:</h6>
                <h5>
                  <Badge bg="secondary">€ 150,00</Badge>
                </h5>
              </Col>
              <Col md={4} className="text-end">
                <h6>Prezzo di vendita:</h6>
                <h5>
                  <Badge bg="primary">€ {formatPrice(salePrice)}</Badge>
                </h5>
              </Col>
            </Row>
          </div>
        ) : (
          <div className="mt-3 p-3 bg-dark rounded border text-center">
            <p className="mb-0 text-muted">
              Seleziona i componenti per visualizzare il prezzo
            </p>
          </div>
        )}

        {warnings.length > 0 && (
          <Alert variant="warning" className="mt-3">
            <h6>Avvisi di Compatibilità:</h6>
            <ul className="mb-0">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ComponentsPreview;
