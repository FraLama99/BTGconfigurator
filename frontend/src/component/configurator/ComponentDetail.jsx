import React from "react";
import { Card, Badge } from "react-bootstrap";

const ComponentDetail = ({
  title,
  component,
  icon,
  isChangeable = false,
  isChanged = false,
}) => {
  return (
    <Card
      className={`h-100 bg-dark ${
        isChanged ? "border-warning" : "border-secondary"
      }`}
    >
      <Card.Header
        className={`bg-dark ${
          isChanged ? "border-warning" : "border-secondary"
        } d-flex justify-content-between align-items-center`}
      >
        <h5 className="mb-0">
          <i className={`bi bi-${icon} me-2`}></i>
          {title}
        </h5>
        {isChangeable && (
          <Badge
            bg={isChanged ? "warning" : "secondary"}
            text={isChanged ? "dark" : "light"}
          >
            {isChanged ? "Personalizzato" : "Personalizzabile"}
          </Badge>
        )}
      </Card.Header>
      <Card.Body>
        <h6 className={`mb-3 ${isChanged ? "text-warning" : ""}`}>
          {component.name}
        </h6>

        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Prezzo:</span>
          <span className={isChanged ? "text-warning" : ""}>
            {component.price?.toFixed(2)} €
          </span>
        </div>

        {component.manufacturer && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Produttore:</span>
            <span>{component.manufacturer}</span>
          </div>
        )}

        {component.speed && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Velocità:</span>
            <span>{component.speed}</span>
          </div>
        )}

        {component.capacity && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Capacità:</span>
            <span>{component.capacity}</span>
          </div>
        )}

        {component.wattage && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Potenza:</span>
            <span>{component.wattage}W</span>
          </div>
        )}

        {component.formFactor && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Form Factor:</span>
            <span>{component.formFactor}</span>
          </div>
        )}

        {isChanged && (
          <div className="mt-3 pt-2 border-top border-warning">
            <small className="text-warning">
              <i className="bi bi-info-circle me-1"></i>
              Componente modificato dall'utente
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ComponentDetail;
