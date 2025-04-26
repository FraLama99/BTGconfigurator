import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utlis/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Se abbiamo ricevuto l'email dalla pagina di login, la preriempiamo
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error("Errore nell'invio email di reset:", err);
      setError(
        err.response?.data?.message ||
          "Impossibile inviare l'email di reset. Verifica che l'email sia corretta."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-dark text-light text-center">
              <h2 className="mb-0">Password Dimenticata</h2>
            </Card.Header>
            <Card.Body>
              {success ? (
                <Alert variant="success">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <strong>Email inviata con successo!</strong>
                  <p className="mb-0 mt-2">
                    Se l'indirizzo email è associato a un account, riceverai
                    istruzioni per reimpostare la tua password.
                  </p>
                  <div className="mt-3 text-center">
                    <Button
                      variant="primary"
                      onClick={() => navigate("/login")}
                    >
                      Torna al login
                    </Button>
                  </div>
                </Alert>
              ) : (
                <>
                  <p className="text-muted">
                    Inserisci l'indirizzo email associato al tuo account per
                    ricevere un link per reimpostare la password.
                  </p>

                  {error && (
                    <Alert variant="danger">
                      <i className="bi bi-exclamation-circle-fill me-2"></i>
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Inserisci la tua email"
                      />
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
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
                            Invio in corso...
                          </>
                        ) : (
                          "Invia email di reset"
                        )}
                      </Button>
                    </div>
                  </Form>
                </>
              )}
            </Card.Body>
            <Card.Footer className="bg-light text-center">
              <Button
                variant="link"
                className="p-0"
                onClick={() => navigate("/login")}
              >
                Torna alla pagina di login
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;
