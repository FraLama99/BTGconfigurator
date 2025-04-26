import React from "react";
import { Card, Row, Col, ListGroup, Badge, Alert } from "react-bootstrap";

const ComponentsPreview = ({
  selectedComponents,
  basePrice,
  warnings = [],
}) => {
  // Formatta il prezzo
  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  // Stili personalizzati per componenti selezionati
  const selectedComponentStyle = {
    backgroundColor: "#343a40", // Grigio scuro
    color: "#fd7e14", // Arancione
  };

  return (
    <Card className="mb-4">
      <Card.Header as="h5">
        <i className="bi bi-pc-display me-2"></i>
        Riepilogo Componenti Selezionati
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4}>
            <h6>Componenti Principali</h6>
            <ListGroup variant="flush">
              <ListGroup.Item
                style={selectedComponents.cpu ? selectedComponentStyle : {}}
              >
                <strong>CPU:</strong>{" "}
                {selectedComponents.cpu
                  ? selectedComponents.cpu.name
                  : "Non selezionato"}
              </ListGroup.Item>
              <ListGroup.Item
                style={
                  selectedComponents.motherboard ? selectedComponentStyle : {}
                }
              >
                <strong>Scheda Madre:</strong>{" "}
                {selectedComponents.motherboard
                  ? selectedComponents.motherboard.name
                  : "Non selezionato"}
              </ListGroup.Item>
              <ListGroup.Item
                style={selectedComponents.gpu ? selectedComponentStyle : {}}
              >
                <strong>Scheda Video:</strong>{" "}
                {selectedComponents.gpu
                  ? selectedComponents.gpu.name
                  : "Non selezionato"}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={4}>
            <h6>Memoria e Archiviazione</h6>
            <ListGroup variant="flush">
              <ListGroup.Item
                style={selectedComponents.ram ? selectedComponentStyle : {}}
              >
                <strong>RAM:</strong>{" "}
                {selectedComponents.ram
                  ? selectedComponents.ram.name
                  : "Non selezionato"}
              </ListGroup.Item>
              <ListGroup.Item
                style={selectedComponents.storage ? selectedComponentStyle : {}}
              >
                <strong>Storage:</strong>{" "}
                {selectedComponents.storage
                  ? selectedComponents.storage.name
                  : "Non selezionato"}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={4}>
            <h6>Componenti Aggiuntivi</h6>
            <ListGroup variant="flush">
              <ListGroup.Item
                style={
                  selectedComponents.powerSupply ? selectedComponentStyle : {}
                }
              >
                <strong>Alimentatore:</strong>{" "}
                {selectedComponents.powerSupply
                  ? selectedComponents.powerSupply.name
                  : "Non selezionato"}
              </ListGroup.Item>
              <ListGroup.Item
                style={selectedComponents.case ? selectedComponentStyle : {}}
              >
                <strong>Case:</strong>{" "}
                {selectedComponents.case
                  ? selectedComponents.case.name
                  : "Non selezionato"}
              </ListGroup.Item>
              <ListGroup.Item
                style={selectedComponents.cooling ? selectedComponentStyle : {}}
              >
                <strong>Raffreddamento:</strong>{" "}
                {selectedComponents.cooling
                  ? selectedComponents.cooling.name
                  : "Non selezionato"}
              </ListGroup.Item>
            </ListGroup>
          </Col>
        </Row>

        {basePrice > 0 && (
          <div className="text-end mt-3">
            <h5>
              Prezzo Base:{" "}
              <Badge bg="primary">€ {formatPrice(basePrice)}</Badge>
            </h5>
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
