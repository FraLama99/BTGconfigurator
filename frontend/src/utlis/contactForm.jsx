import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const ContactPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    messaggio: "",
    richiamami: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/send-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      setSuccess(
        "Il tuo messaggio è stato inviato! Ti risponderemo il prima possibile."
      );

      setFormData({
        nome: "",
        cognome: "",
        email: "",
        telefono: "",
        messaggio: "",
        richiamami: false,
      });

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      console.error("Errore durante l'invio del messaggio:", err);
      setError(
        "Si è verificato un errore durante l'invio del messaggio. Riprova più tardi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-0">
      <div
        className="position-relative bg-dark text-white"
        style={{
          height: "350px",
          backgroundImage:
            "linear-gradient(rgba(13, 110, 253, 0.7), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?ixlib=rb-4.0.3')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="position-absolute top-50 start-50 translate-middle text-center"
          style={{ width: "80%" }}
        >
          <h1 className="display-3 fw-bold mb-4">Contattaci</h1>
          <div
            className="mx-auto"
            style={{
              height: "4px",
              width: "100px",
              background: "#fd7e14",
              marginBottom: "30px",
            }}
          ></div>
          <p className="lead mb-0">
            Hai domande sui nostri servizi o hai bisogno di assistenza?
            <br />
            Siamo qui per aiutarti!
          </p>
        </div>
      </div>

      <Container className="py-5">
        <Row className="g-4">
          <Col lg={7}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h2
                  className="mb-4 fw-bold"
                  style={{
                    color: "#0d6efd",
                    borderLeft: "5px solid #fd7e14",
                    paddingLeft: "15px",
                  }}
                >
                  Inviaci un messaggio
                </h2>

                {success && <Alert variant="success">{success}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome*</Form.Label>
                        <Form.Control
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          required
                          placeholder="Inserisci il tuo nome"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cognome*</Form.Label>
                        <Form.Control
                          type="text"
                          name="cognome"
                          value={formData.cognome}
                          onChange={handleInputChange}
                          required
                          placeholder="Inserisci il tuo cognome"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email*</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="nome@esempio.com"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Telefono</Form.Label>
                        <Form.Control
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          placeholder="Il tuo numero di telefono"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Messaggio*</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="messaggio"
                      value={formData.messaggio}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Scrivi qui il tuo messaggio..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Desidero essere richiamato"
                      name="richiamami"
                      checked={formData.richiamami}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Button
                      type="submit"
                      style={{
                        backgroundColor: "#fd7e14",
                        borderColor: "#fd7e14",
                      }}
                      size="lg"
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
                        <>Invia messaggio</>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <div className="h-100 d-flex flex-column">
              <Card
                className="border-0 shadow-sm mb-4"
                style={{ backgroundColor: "#0d6efd" }}
              >
                <Card.Body className="p-4 text-white">
                  <h4 className="mb-4 fw-bold">Informazioni di contatto</h4>

                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                        backgroundColor: "rgba(255,255,255,0.2)",
                      }}
                    >
                      <FaEnvelope />
                    </div>
                    <div>
                      <small>Email</small>
                      <p className="mb-0">info@3dlama.it</p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                        backgroundColor: "rgba(255,255,255,0.2)",
                      }}
                    >
                      <FaPhone />
                    </div>
                    <div>
                      <small>Telefono</small>
                      <p className="mb-0">
                        <a
                          href="tel:+393282232301"
                          className="text-white text-decoration-none"
                          style={{ transition: "all 0.3s ease" }}
                          onMouseOver={(e) =>
                            (e.target.style.textDecoration = "underline")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.textDecoration = "none")
                          }
                        >
                          +39 3282232301
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle me-3"
                      style={{
                        width: "42px",
                        height: "42px",
                        backgroundColor: "rgba(255,255,255,0.2)",
                      }}
                    >
                      <FaMapMarkerAlt />
                    </div>
                    <div>
                      <small>Indirizzo</small>
                      <p className="mb-0">
                        Via Grange Palmero, 47
                        <br />
                        10091 Alpignano (TO)
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm flex-grow-1">
                <Card.Body className="p-4">
                  <h4 className="mb-4 fw-bold">Orari di apertura</h4>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Lunedì - Venerdì:</span>
                    <span className="fw-bold">9:00 - 18:00</span>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Sabato:</span>
                    <span className="fw-bold">10:00 - 16:00</span>
                  </div>

                  <div className="d-flex justify-content-between mb-4">
                    <span>Domenica:</span>
                    <span className="fw-bold">Chiuso</span>
                  </div>

                  <hr />
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Mappa */}
      <div className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4 fw-bold" style={{ color: "#0d6efd" }}>
            La nostra sede
          </h2>
          <div className="ratio ratio-21x9 shadow-sm rounded overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5631.478467384488!2d7.504651576615059!3d45.11135385691138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x478841951fbba5bd%3A0x6ff41baa4b057e58!2sVia%20Grange%20Palmero%2C%2047%2C%2010091%20Alpignano%20TO!5e0!3m2!1sit!2sit!4v1744745993521!5m2!1sit!2sit"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </Container>
      </div>

      {/* Call to Action */}
      <div
        className="py-5"
        style={{
          background:
            "linear-gradient(rgba(13, 110, 253, 0.9), rgba(13, 110, 253, 0.9)), url('https://images.unsplash.com/photo-1587614380862-0294308ae58b?ixlib=rb-4.0.3')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container className="text-center text-white py-4">
          <h2 className="display-5 fw-bold mb-4">
            Pronto a configurare il tuo PC ideale?
          </h2>
          <p className="lead mb-4">
            Inizia subito o esplora le nostre configurazioni predefinite
          </p>
          <Button
            variant="light"
            size="lg"
            className="me-3 px-4"
            onClick={() => navigate("/about")}
          >
            Chi siamo
          </Button>
          <Button
            style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
            size="lg"
            className="px-4"
            onClick={() => navigate("/", { replace: true })}
          >
            Configura Ora
          </Button>
        </Container>
      </div>
    </Container>
  );
};

export default ContactPage;
