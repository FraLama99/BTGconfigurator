import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../utlis/api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const navigate = useNavigate();

  // Prendiamo il token dall'URL
  const { token } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tokenFromQuery = queryParams.get("token");

  // Utilizziamo il token dall'URL o dai query params
  const resetToken = token || tokenFromQuery;

  useEffect(() => {
    if (!resetToken) {
      setTokenValid(false);
      setError("Token di reset non valido o mancante.");
    }
  }, [resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validazione password lato client
    if (password !== confirmPassword) {
      setError("Le password non corrispondono.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri.");
      setLoading(false);
      return;
    }

    try {
      await api.confirmResetPassword(resetToken, password);
      setSuccess(true);

      // Reindirizza alla pagina di login dopo 3 secondi
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password reimpostata con successo! Ora puoi accedere con la tua nuova password.",
          },
        });
      }, 3000);
    } catch (err) {
      console.error("Errore nel reset della password:", err);
      setError(
        err.response?.data?.message ||
          "Impossibile reimpostare la password. Il token potrebbe essere scaduto o non valido."
      );
      setTokenValid(false);
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
              <h2 className="mb-0">Reimposta Password</h2>
            </Card.Header>
            <Card.Body>
              {!tokenValid ? (
                <Alert variant="danger">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error || "Link non valido o scaduto."}
                  <div className="mt-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate("/login")}
                    >
                      Torna al login
                    </Button>
                  </div>
                </Alert>
              ) : success ? (
                <Alert variant="success">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Password reimpostata con successo!
                  <p className="mt-2 mb-0">
                    Stai per essere reindirizzato alla pagina di login...
                  </p>
                </Alert>
              ) : (
                <>
                  <p className="text-muted mb-4">
                    Inserisci la tua nuova password per completare il processo
                    di reset.
                  </p>

                  {error && (
                    <Alert variant="danger">
                      <i className="bi bi-exclamation-circle-fill me-2"></i>
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nuova Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Inserisci la nuova password"
                        autoComplete="new-password"
                      />
                      <Form.Text className="text-muted">
                        La password deve contenere almeno 8 caratteri.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Conferma Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Conferma la nuova password"
                        autoComplete="new-password"
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
                            Elaborazione...
                          </>
                        ) : (
                          "Reimposta Password"
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

export default ResetPassword;
