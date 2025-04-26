import React from "react";
import { Card, ProgressBar, Button, Badge } from "react-bootstrap";

const ProgressTracker = ({
  activeStep,
  setActiveStep,
  steps,
  configuration,
  components,
  brand = "intel", // Default è intel
}) => {
  const { cpus, motherboards, rams, gpus, storages, psus, cases, coolers } =
    components;

  // Definisci i temi colore in base al brand
  const themes = {
    intel: {
      primary: "primary", // Blu per Intel
      progressBar: "primary",
      completed: "info",
      highlight: "info",
      currentText: "white",
      arrow: "#0d6efd", // Blu Bootstrap
    },
    amd: {
      primary: "danger", // Rosso per AMD
      progressBar: "danger",
      completed: "warning",
      highlight: "danger",
      currentText: "white",
      arrow: "#dc3545", // Rosso Bootstrap
    },
  };

  // Seleziona il tema corretto
  const theme = themes[brand.toLowerCase()] || themes.intel;

  return (
    <Card
      className="mb-4"
      style={{
        borderColor: brand.toLowerCase() === "amd" ? "#dc3545" : "#0d6efd",
        borderWidth: "2px",
      }}
    >
      <Card.Body>
        <ProgressBar
          now={(activeStep / (steps.length - 1)) * 100}
          className="mb-2"
          variant={theme.progressBar}
          style={{ height: "8px" }}
        />

        <div
          className="d-flex flex-nowrap overflow-auto px-2 py-2"
          style={{ gap: "14px" }}
        >
          {steps.map((label, index) => {
            // Determina il componente selezionato
            let component = null;
            switch (index) {
              case 0:
                component = cpus.find((c) => c._id === configuration.cpu);
                break;
              case 1:
                component = motherboards.find(
                  (m) => m._id === configuration.motherboard
                );
                break;
              case 2:
                component = rams.find((r) => r._id === configuration.ram);
                break;
              case 3:
                component = gpus.find((g) => g._id === configuration.gpu);
                break;
              case 4:
                component = storages.find(
                  (s) => s._id === configuration.storage
                );
                break;
              case 5:
                component = psus.find(
                  (p) => p._id === configuration.powerSupply
                );
                break;
              case 6:
                component = cases.find((c) => c._id === configuration.case);
                break;
              case 7:
                component = coolers.find(
                  (c) => c._id === configuration.cooling
                );
                break;
              default:
                break;
            }

            // Stabilisci lo stile e comportamento
            const isCompleted = index < activeStep;
            const isCurrent = index === activeStep;
            const isSelectable = isCompleted && component;

            return (
              <div
                key={index}
                className={`position-relative  ${
                  isCurrent ? "transform-scale-105" : ""
                }`}
                style={{
                  minWidth: "140px",
                  maxWidth: "140px",
                  transition: "transform 0.2s, box-shadow 0.3s",
                  transform: isCurrent ? "scale(1.05)" : "scale(1)",
                }}
              >
                <Button
                  variant={
                    isSelectable
                      ? `outline-${theme.completed}`
                      : isCurrent
                      ? theme.primary
                      : "outline-secondary"
                  }
                  className={`w-100 h-100 d-flex flex-column align-items-center py-2 
                             ${
                               !isSelectable && !isCurrent ? "text-muted" : ""
                             }`}
                  onClick={() => (isSelectable ? setActiveStep(index) : null)}
                  disabled={!isSelectable && !isCurrent}
                  style={{
                    cursor: isSelectable ? "pointer" : "default",
                    boxShadow: isCurrent
                      ? `0 0 0 2px ${
                          brand.toLowerCase() === "amd" ? "#dc3545" : "#0d6efd"
                        }`
                      : "none",
                  }}
                >
                  <div className="d-flex align-items-center justify-content-center mb-1">
                    <Badge
                      bg={
                        isCurrent
                          ? theme.primary
                          : isCompleted
                          ? theme.completed
                          : "light"
                      }
                      text={
                        !isCompleted && !isCurrent ? "dark" : theme.currentText
                      }
                      className="me-1"
                    >
                      {index + 1}
                    </Badge>
                    <span className="small">{label}</span>
                  </div>

                  {component && (
                    <div
                      className={`small text-truncate w-100 text-center mt-1 ${
                        isCurrent ? `text-${theme.highlight}` : ""
                      }`}
                      title={component.name}
                      style={{ maxWidth: "130px" }}
                    >
                      {component.name.length > 15
                        ? component.name.substring(0, 12) + "..."
                        : component.name}
                    </div>
                  )}

                  {!component && index < activeStep && (
                    <div className="small text-danger">
                      <i className="bi bi-exclamation-triangle"></i> Non
                      selezionato
                    </div>
                  )}
                </Button>

                {index < steps.length - 1 && (
                  <div
                    className="position-absolute"
                    style={{
                      right: "-12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 5,
                      color: theme.arrow,
                    }}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProgressTracker;
