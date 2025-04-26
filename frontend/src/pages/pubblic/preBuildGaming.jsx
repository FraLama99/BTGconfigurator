import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  Spinner,
} from "react-bootstrap";
import api from "../../utlis/api";
import "./amd.css";

const PreBuildGaming = () => {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    fetchPrebuiltMachines();
  }, []);

  const fetchPrebuiltMachines = async () => {
    setLoading(true);
    try {
      const response = await api.getPresets();
      console.log("Risposta API:", response.data);

      // Normalizza le categorie per il confronto case-insensitive
      const categorieDaCercare = ["gaming", "entry level", "high-end"];
      const filteredMachines = response.data.filter((machine) =>
        categorieDaCercare.includes((machine.category || "").toLowerCase())
      );

      console.log("Macchine filtrate:", filteredMachines);
      setMachines(filteredMachines);
    } catch (err) {
      setError("Errore nel caricamento delle macchine preconfigurate");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const filteredMachines = machines.filter((machine) => {
    if (filters.category !== "all" && machine.category !== filters.category) {
      return false;
    }

    if (
      filters.minPrice &&
      machine.price &&
      machine.price < parseFloat(filters.minPrice)
    ) {
      return false;
    }

    if (
      filters.maxPrice &&
      machine.price &&
      machine.price > parseFloat(filters.maxPrice)
    ) {
      return false;
    }

    return true;
  });

  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case "Gaming":
        return "danger";
      case "Entry level":
        return "success";
      case "High-End":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <div className="bg-dark text-light py-5">
      <Container>
        <h1 className="text-center mb-5">PC Gaming Preconfigurati</h1>

        <Row className="mb-4">
          <Col lg={4} md={6} sm={12} className="mb-3">
            <Form.Group>
              <Form.Label>Categoria</Form.Label>
              <Form.Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="bg-dark text-light border-secondary"
              >
                <option value="all">Tutte le categorie</option>
                <option value="Gaming">Gaming</option>
                <option value="Entry level">Entry level</option>
                <option value="High-End">High-End</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col lg={4} md={6} sm={12} className="mb-3">
            <Form.Group>
              <Form.Label>Prezzo minimo (€)</Form.Label>
              <Form.Control
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
          </Col>

          <Col lg={4} md={6} sm={12} className="mb-3">
            <Form.Group>
              <Form.Label>Prezzo massimo (€)</Form.Label>
              <Form.Control
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="bg-dark text-light border-secondary"
              />
            </Form.Group>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="warning" />
            <p className="mt-3">Caricamento PC preconfigurati...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            <p className="text-muted mb-4">
              {filteredMachines.length} configurazioni trovate
            </p>

            <Row>
              {filteredMachines.map((machine) => (
                <Col key={machine._id} lg={4} md={6} sm={12} className="mb-4">
                  <Card className="h-100 bg-dark border-secondary machine-card">
                    <Card.Img
                      variant="top"
                      src={
                        (machine.components &&
                          machine.components.case &&
                          machine.components.case.imageUrl) ||
                        machine.image
                      }
                      alt={machine.name}
                      className="machine-img p-3"
                    />
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Badge bg={getCategoryBadgeVariant(machine.category)}>
                          {machine.category}
                        </Badge>
                        <h5 className="text-warning mb-0">
                          {machine.basePrice
                            ? machine.basePrice.toFixed(2)
                            : "N/D"}{" "}
                          €
                        </h5>
                      </div>

                      <Card.Title className="text-light">
                        {machine.name}
                      </Card.Title>
                      <Card.Text className="text-muted mb-3 flex-grow-1">
                        {machine.description.substring(0, 100)}
                        {machine.description.length > 100 ? "..." : ""}
                      </Card.Text>

                      <div className="specs-preview mb-3">
                        <div className="spec-item d-flex justify-content-start gap-2">
                          <span className="text-light">CPU:</span>
                          <span className="text-muted">
                            {machine.components.cpu?.name || "Non specificato"}
                          </span>
                        </div>
                        <div className="spec-item d-flex justify-content-start gap-2">
                          <span className="text-light">GPU:</span>
                          <span className="text-muted">
                            {machine.components.gpu?.name || "Non specificato"}
                          </span>
                        </div>
                        <div className="spec-item d-flex justify-content-start gap-2">
                          <span className="text-light">RAM:</span>
                          <span className="text-muted">
                            {machine.components.ram?.name || "Non specificato"}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="outline-warning"
                        className="w-100"
                        onClick={() => navigate(`/prebuilt/${machine._id}`)}
                      >
                        Visualizza e personalizza
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}

              {filteredMachines.length === 0 && (
                <Col xs={12}>
                  <div className="text-center py-5">
                    <i className="bi bi-exclamation-circle fs-1 text-warning mb-3"></i>
                    <h4>Nessuna configurazione trovata</h4>
                    <p className="text-muted">
                      Prova a modificare i filtri di ricerca
                    </p>
                  </div>
                </Col>
              )}
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default PreBuildGaming;
