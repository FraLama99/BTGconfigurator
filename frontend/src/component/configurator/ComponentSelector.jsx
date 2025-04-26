import React, { useState, useMemo } from "react";
import { Row, Col, Card, Form, Button, Badge, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import "./ComponentSelector.css"; // Import your CSS file for styles

const ComponentSelector = ({
  title,
  components,
  onSelect,
  selected,
  emptyMessage,
  filters = {},
}) => {
  const [sortBy, setSortBy] = useState("price");
  const [filterText, setFilterText] = useState("");
  const location = useLocation();

  const brand = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes("amd")) return "amd";
    return "intel";
  }, [location]);

  const themes = {
    intel: {
      primary: "primary",
      highlight: "info",
      priceColor: "#0d6efd",
    },
    amd: {
      primary: "danger",
      highlight: "warning",
      priceColor: "#dc3545",
    },
  };

  const theme = themes[brand] || themes.intel;

  if (components.length === 0) {
    return (
      <Alert variant={brand === "amd" ? "warning" : "info"}>
        {emptyMessage || "Nessun componente disponibile"}
      </Alert>
    );
  }

  const filteredComponents = components
    .filter(
      (component) =>
        component.name.toLowerCase().includes(filterText.toLowerCase()) ||
        component.brand.toLowerCase().includes(filterText.toLowerCase()) ||
        (component.model &&
          component.model.toLowerCase().includes(filterText.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "brand") return a.brand.localeCompare(b.brand);
      return 0;
    });

  return (
    <>
      <h2 className="mb-4 " style={{ color: theme.priceColor }}>
        {title}
      </h2>

      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Cerca per nome, marca o modello"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="price">Ordina per prezzo</option>
            <option value="name">Ordina per nome</option>
            <option value="brand">Ordina per marca</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        {filteredComponents.map((component) => (
          <Col xs={12} sm={6} lg={3} className="mb-4" key={component._id}>
            <Card
              variant="outline-primary dark"
              className={`h-100 ${
                selected === component._id ? `border-${theme.highlight}` : ""
              }`}
              style={{
                cursor: "pointer",
                transform:
                  selected === component._id ? "translateY(-5px)" : "none",
                transition: "transform 0.2s",
              }}
              onClick={() => onSelect(component)}
            >
              <div className="component-image">
                <Card.Img
                  variant="top"
                  src={component.imageUrl || "https://via.placeholder.com/300"}
                  alt={component.name}
                  height={300}
                  style={{ objectFit: "cover" }}
                />
                <div className="availability-badge">
                  {component.stock > 0 ? (
                    <Badge bg="success" className="stock-badge">
                      Disponibile ({component.stock})
                    </Badge>
                  ) : (
                    <Badge bg="warning" text="dark" className="stock-badge">
                      Ordinabile (15+ giorni)
                    </Badge>
                  )}
                </div>
              </div>
              <Card.Body>
                <Card.Title>{component.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {component.brand} - {component.model}
                </Card.Subtitle>

                <div className="mb-3">
                  {component.socket && (
                    <Badge bg="secondary" className="me-1 mb-1">
                      Socket: {component.socket}
                    </Badge>
                  )}
                  {component.formFactor && (
                    <Badge bg="secondary" className="me-1 mb-1">
                      Form Factor: {component.formFactor}
                    </Badge>
                  )}
                  {component.ramType && (
                    <Badge bg="secondary" className="me-1 mb-1">
                      RAM: {component.ramType}
                    </Badge>
                  )}
                  {component.tdp && (
                    <Badge bg="secondary" className="me-1 mb-1">
                      TDP: {component.tdp}W
                    </Badge>
                  )}
                  {component.wattage && (
                    <Badge bg="secondary" className="me-1 mb-1">
                      {component.wattage}W
                    </Badge>
                  )}
                </div>

                <Card.Text
                  className="fw-bold fs-4"
                  style={{ color: theme.priceColor }}
                >
                  {component.price
                    ? `${component.price.toFixed(2)} €`
                    : "Prezzo non disponibile"}
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-dark border-top-0">
                <Button
                  variant={
                    selected === component._id ? theme.highlight : "dark"
                  }
                  className="w-100 dark"
                >
                  {selected === component._id ? "✓ Selezionato" : "Seleziona"}
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default ComponentSelector;
