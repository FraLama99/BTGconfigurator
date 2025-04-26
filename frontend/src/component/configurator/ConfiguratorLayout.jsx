import React, { useMemo } from "react";
import { Container, Alert, Button, Row, Col, Badge } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import ProgressTracker from "./ProgressTracker";
import {
  calculateDeliveryTime,
  formatDeliveryDate,
} from "./utils/deliveryTimeCalculator";

import amdLogo from "../../assets/amd-seeklogo.png";
import intelLogo from "../../assets/intel-logo.png";

const ConfiguratorLayout = ({
  title,
  error,
  success,
  activeStep,
  setActiveStep,
  steps,
  configuration,
  components,
  loading,
  children,
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
      buttonVariant: "primary",
      headerColor: "#0d6efd",
      headerTextColor: "white",
    },
    amd: {
      primary: "danger",
      secondary: "warning",
      buttonVariant: "danger",
      headerColor: "#dc3545",
      headerTextColor: "white",
    },
  };

  const theme = themes[brand] || themes.intel;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Calcola informazioni sulla consegna
  const deliveryInfo = calculateDeliveryTime(configuration, components);

  return (
    <Container className="configurator-container py-5">
      <Row>
        <Col>
          <div
            className="p-3 mb-4 rounded text-center"
            style={{
              backgroundColor: theme.headerColor,
              color: theme.headerTextColor,
            }}
          >
            <h1 className="mb-0 d-flex align-items-center justify-content-center gap-2">
              <span style={{ color: "black" }}>{title}</span>
              {brand === "amd" && (
                <img
                  src={amdLogo}
                  height="30"
                  className="me-2"
                  style={{ verticalAlign: "middle" }}
                />
              )}
              {brand === "intel" && (
                <img
                  src={intelLogo}
                  height="30"
                  className="me-2"
                  style={{ verticalAlign: "middle" }}
                />
              )}
            </h1>
          </div>

          <p className="text-center mb-4">
            Seleziona i componenti per creare il PC dei tuoi sogni
          </p>

          {/* Mostro il tempo di consegna estimato */}
          {Object.keys(configuration).some((key) => configuration[key]) && (
            <div className="text-center mb-4">
              <Badge
                bg={deliveryInfo.allAvailable ? "success" : "warning"}
                className="px-3 py-2"
                style={{ fontSize: "0.9rem" }}
              >
                <i
                  className={`bi ${
                    deliveryInfo.allAvailable
                      ? "bi-clock"
                      : "bi-exclamation-triangle"
                  } me-2`}
                ></i>
                {deliveryInfo.message}
              </Badge>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <ProgressTracker
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            steps={steps}
            configuration={configuration}
            components={components}
            brand={brand}
          />

          <div className="my-4">{children}</div>

          <div className="d-flex justify-content-between mt-4">
            <Button
              variant={`outline-${theme.buttonVariant}`}
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
            >
              <i className="bi bi-arrow-left me-1"></i> Indietro
            </Button>

            {activeStep < steps.length - 1 && (
              <Button
                variant={theme.buttonVariant}
                onClick={handleNext}
                disabled={
                  loading ||
                  (activeStep === 0 && !configuration.cpu) ||
                  (activeStep === 1 && !configuration.motherboard) ||
                  (activeStep === 2 && !configuration.ram) ||
                  (activeStep === 3 && !configuration.gpu) ||
                  (activeStep === 4 && !configuration.storage) ||
                  (activeStep === 5 && !configuration.powerSupply) ||
                  (activeStep === 6 && !configuration.case) ||
                  (activeStep === 7 && !configuration.cooling)
                }
              >
                Avanti <i className="bi bi-arrow-right ms-1"></i>
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ConfiguratorLayout;
