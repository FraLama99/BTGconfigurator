import React, { useRef } from "react"; // Aggiungi useRef qui
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  FaTools,
  FaDesktop,
  FaGamepad,
  FaHeadset,
  FaUsers,
  FaStar,
  FaHandshake,
  FaLaptopCode,
} from "react-icons/fa";
import teamIMG from "../../assets/team.jpg";
import { useNavigate } from "react-router-dom";

// CSS in un oggetto separato
const customStyles = {
  hoverCard: {
    transition: "all 0.3s ease",
  },
  transitionAll: {
    transition: "all 0.3s ease",
  },
};

const AboutPage = () => {
  // Aggiungi questo ref
  const serviziSectionRef = useRef(null);
  const navigate = useNavigate();
  // Funzione per scrollare
  const scrollToServizi = () => {
    serviziSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Container fluid className="p-0">
      {/* Hero Section */}
      <div
        className="position-relative bg-dark text-white"
        style={{
          height: "500px",
          backgroundImage:
            "linear-gradient(rgba(13, 110, 253, 0.7), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1623282033815-40b05d96c903?ixlib=rb-4.0.3')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="position-absolute top-50 start-50 translate-middle text-center"
          style={{ width: "80%" }}
        >
          <h1 className="display-3 fw-bold mb-4">Chi Siamo</h1>
          <div
            className="mx-auto"
            style={{
              height: "4px",
              width: "100px",
              background: "#fd7e14",
              marginBottom: "30px",
            }}
          ></div>
          <p className="lead mb-4">
            Siamo un team di appassionati di tecnologia e computer, dedicati a
            fornire le migliori soluzioni per le tue esigenze informatiche. La
            nostra missione è aiutarti a trovare il computer perfetto per il tuo
            lavoro o per il tuo divertimento.
          </p>
          <Button
            variant="outline-light"
            size="lg"
            className="me-3"
            onClick={scrollToServizi}
          >
            Scopri i nostri servizi
          </Button>
          <Button
            style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
            size="lg"
            onClick={() => navigate("/contact", { replace: true })}
          >
            {" "}
            Contattaci
          </Button>
        </div>
      </div>

      {/* Chi Siamo Section */}
      <Container className="py-5">
        <Row className="mb-5">
          <Col md={6}>
            <div className="about-image-container position-relative mb-4 mb-md-0">
              <img
                src={teamIMG}
                alt="Il nostro team"
                className="img-fluid rounded shadow-lg"
                style={{ objectFit: "cover", height: "450px", width: "100%" }}
              />
              <div
                className="position-absolute"
                style={{
                  bottom: "30px",
                  left: "30px",
                  background: "rgba(13, 110, 253, 0.85)",
                  color: "white",
                  padding: "15px 25px",
                  borderLeft: "5px solid #fd7e14",
                }}
              >
                <h3 className="mb-0">La nostra passione</h3>
              </div>
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column justify-content-center">
            <h2
              className="fw-bold mb-4"
              style={{
                color: "#0d6efd",
                borderLeft: "5px solid #fd7e14",
                paddingLeft: "20px",
              }}
            >
              La Nostra Storia
            </h2>
            <p className="lead">
              Fondata da un gruppo di appassionati di tecnologia, BTG SYS è nata
              con l'obiettivo di offrire soluzioni informatiche personalizzate
              di alta qualità. Con anni di esperienza nel settore, abbiamo
              costruito una reputazione basata sulla conoscenza tecnica,
              sull'attenzione al cliente e sulla passione per l'innovazione.
            </p>
            <p>
              Il nostro approccio è semplice: ascoltare le esigenze del cliente,
              consigliare la soluzione più adatta e garantire un'assistenza
              continuativa. Che tu sia un gamer, un professionista o un'azienda,
              siamo qui per aiutarti a trovare la configurazione perfetta.
            </p>
            <div className="d-flex flex-wrap mt-3">
              <div className="me-4 mb-3">
                <div className="d-flex align-items-center">
                  <div style={{ color: "#fd7e14" }}>
                    <FaUsers size={24} />
                  </div>
                  <div className="ms-2">
                    <h5 className="mb-0 fw-bold">150+</h5>
                    <p className="mb-0 text-muted small">Clienti soddisfatti</p>
                  </div>
                </div>
              </div>
              <div className="me-4 mb-3">
                <div className="d-flex align-items-center">
                  <div style={{ color: "#0d6efd" }}>
                    <FaStar size={24} />
                  </div>
                  <div className="ms-2">
                    <h5 className="mb-0 fw-bold">10+</h5>
                    <p className="mb-0 text-muted small">Anni di esperienza</p>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <div style={{ color: "#fd7e14" }}>
                    <FaHandshake size={24} />
                  </div>
                  <div className="ms-2">
                    <h5 className="mb-0 fw-bold">300+</h5>
                    <p className="mb-0 text-muted small">Progetti completati</p>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* I Nostri Valori */}
        <div className="text-center my-5 pt-3">
          <h2 className="fw-bold" style={{ color: "#0d6efd" }}>
            I Nostri Valori
          </h2>
          <div
            className="mx-auto"
            style={{
              height: "4px",
              width: "70px",
              background: "#fd7e14",
              marginBottom: "20px",
            }}
          ></div>
          <p className="lead text-muted mb-5">
            Principi che guidano il nostro lavoro quotidiano
          </p>

          <Row className="g-4">
            <Col md={4}>
              <div className="p-4 bg-light rounded shadow-sm h-100">
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "70px",
                    height: "70px",
                    background: "linear-gradient(135deg, #0d6efd, #084298)",
                  }}
                >
                  <FaLaptopCode className="text-white" size={25} />
                </div>
                <h4 className="fw-bold mb-3 text-black">Eccellenza Tecnica</h4>
                <p className="text-black mb-0">
                  Ci impegniamo a restare all'avanguardia delle tecnologie
                  informatiche per offrire sempre le soluzioni più innovative e
                  performanti.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 bg-light rounded shadow-sm h-100">
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "70px",
                    height: "70px",
                    background: "linear-gradient(135deg, #fd7e14, #b35900)",
                  }}
                >
                  <FaUsers className="text-white" size={25} />
                </div>
                <h4 className="fw-bold mb-3 text-black">
                  Centralità del Cliente
                </h4>
                <p className="text-black mb-0">
                  Mettiamo sempre al centro i bisogni del cliente, offrendo
                  soluzioni personalizzate e un'assistenza dedicata in ogni
                  fase.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="p-4 bg-light rounded shadow-sm h-100">
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                  style={{
                    width: "70px",
                    height: "70px",
                    background: "linear-gradient(135deg, #0d6efd, #084298)",
                  }}
                >
                  <FaHandshake className="text-white" size={25} />
                </div>
                <h4 className="fw-bold mb-3 text-black">Affidabilità</h4>
                <p className="text-black mb-0">
                  Manteniamo le promesse fatte ai nostri clienti, garantendo
                  prodotti di qualità e un servizio di assistenza sempre
                  puntuale.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      {/* I Nostri Servizi - Background alternato */}
      <div
        ref={serviziSectionRef}
        className="py-5"
        style={{ background: "#f8f9fa" }}
      >
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold" style={{ color: "#0d6efd" }}>
              I Nostri Servizi
            </h2>
            <div
              className="mx-auto"
              style={{
                height: "4px",
                width: "70px",
                background: "#fd7e14",
                marginBottom: "20px",
              }}
            ></div>
            <p className="lead text-black">
              Soluzioni su misura per ogni esigenza tecnologica
            </p>
          </div>

          <Row className="g-4">
            <Col lg={3} md={6}>
              <Card
                className="h-100 border-0 shadow-sm hover-card transition-all"
                style={customStyles.hoverCard}
              >
                <div className="position-relative">
                  <div
                    style={{
                      height: "8px",
                      background: "#0d6efd",
                      width: "100%",
                      position: "absolute",
                      top: 0,
                    }}
                  ></div>
                </div>
                <Card.Body className="text-center p-4 pt-5">
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#0d6efd",
                    }}
                  >
                    <FaTools className="text-white" size={30} />
                  </div>
                  <Card.Title className="fw-bold" style={{ color: "#212529" }}>
                    Configurazione Personalizzata
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Realizziamo computer su misura per le tue esigenze
                    specifiche, permettendoti di scegliere ogni singolo
                    componente per ottenere prestazioni ottimali.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card
                className="h-100 border-0 shadow-sm hover-card transition-all"
                style={customStyles.hoverCard}
              >
                <div className="position-relative">
                  <div
                    style={{
                      height: "8px",
                      background: "#fd7e14",
                      width: "100%",
                      position: "absolute",
                      top: 0,
                    }}
                  ></div>
                </div>
                <Card.Body className="text-center p-4 pt-5">
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#fd7e14",
                    }}
                  >
                    <FaDesktop className="text-white" size={30} />
                  </div>
                  <Card.Title className="fw-bold" style={{ color: "#212529" }}>
                    Workstation Preassemblate
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Offriamo soluzioni pronte all'uso per professionisti, con
                    prestazioni ottimizzate per software specifici e massima
                    produttività.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card
                className="h-100 border-0 shadow-sm hover-card transition-all"
                style={customStyles.hoverCard}
              >
                <div className="position-relative">
                  <div
                    style={{
                      height: "8px",
                      background: "#0d6efd",
                      width: "100%",
                      position: "absolute",
                      top: 0,
                    }}
                  ></div>
                </div>
                <Card.Body className="text-center p-4 pt-5">
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#0d6efd",
                    }}
                  >
                    <FaGamepad className="text-white" size={30} />
                  </div>
                  <Card.Title className="fw-bold" style={{ color: "#212529" }}>
                    PC Gaming
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Vendiamo i migliori PC da gaming, progettati per garantire
                    performance elevate e un'esperienza di gioco immersiva e
                    fluida.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={3} md={6}>
              <Card
                className="h-100 border-0 shadow-sm hover-card transition-all"
                style={customStyles.hoverCard}
              >
                <div className="position-relative">
                  <div
                    style={{
                      height: "8px",
                      background: "#fd7e14",
                      width: "100%",
                      position: "absolute",
                      top: 0,
                    }}
                  ></div>
                </div>
                <Card.Body className="text-center p-4 pt-5">
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "#fd7e14",
                    }}
                  >
                    <FaHeadset className="text-white" size={30} />
                  </div>
                  <Card.Title className="fw-bold" style={{ color: "#212529" }}>
                    Assistenza Tecnica
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Forniamo supporto tecnico completo e consulenza
                    specializzata per risolvere qualsiasi problema e ottimizzare
                    le prestazioni del tuo sistema.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Call To Action */}
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
            Pronto a costruire il PC dei tuoi sogni?
          </h2>
          <p className="lead mb-4">
            Contattaci oggi per una consulenza gratuita o inizia subito a
            configurare il tuo sistema
          </p>
          <Button
            variant="light"
            size="lg"
            className="me-3 px-4"
            onClick={() => navigate("/contact", { replace: true })}
          >
            Contattaci
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

      {/* CSS per animazioni e hover effect - Modificato qui */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `,
        }}
      />
    </Container>
  );
};

export default AboutPage;
