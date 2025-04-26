import React from "react";
import { Alert, Badge } from "react-bootstrap";
import { formatDeliveryDate } from "../../../../component/configurator/utils/deliveryTimeCalculator";

const DeliveryInfo = ({ deliveryInfo }) => {
  return (
    <div className="delivery-info mt-3 mb-4 p-3 border border-secondary rounded">
      <h6 className="mb-2 text-warning">
        <i className="bi bi-truck me-2"></i>
        Informazioni di consegna
      </h6>

      <div className="d-flex justify-content-between mb-2">
        <span>Data di consegna stimata:</span>
        <span className="fw-bold">
          {formatDeliveryDate(deliveryInfo.deliveryDate)}
        </span>
      </div>

      {!deliveryInfo.allAvailable && (
        <Alert variant="warning" className="py-2 mt-2 mb-0 small">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            <div>
              <strong>Nota:</strong> {deliveryInfo.message}
              {deliveryInfo.unavailableComponents.length > 0 && (
                <div className="mt-1">
                  Componenti non immediatamente disponibili:
                  {deliveryInfo.unavailableComponents.map((comp, idx) => (
                    <Badge bg="secondary" className="ms-1 me-1" key={idx}>
                      {comp}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default DeliveryInfo;
