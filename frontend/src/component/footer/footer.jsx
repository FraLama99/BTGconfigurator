import React from "react";
import "./footer.css";
import { Container, Row, Col } from "react-bootstrap";
import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer mt-5 py-4 bg-dark text-light">
      <Container>
        <Row className="mb-3">
          <Col md={6} className="mb-3">
            <h5>BTG Configurator</h5>
            <p className="disclaimer">
              <strong>ATTENZIONE:</strong> Questa è una pagina creata
              esclusivamente per un esame ed è solo a scopo dimostrativo. Gli
              ordini non verranno presi in considerazione e i dati delle carte
              di credito o altre modalità di pagamento non verranno memorizzati
              in alcun modo.
            </p>
            <p className="author">
              Realizzato da Francesco Lamauzzi a solo scopo didattico.
            </p>
          </Col>
          <Col md={3} className="mb-3">
            <h5>Link utili</h5>
            <ul className="list-unstyled">
              <li>
                <a href="#" className="text-light">
                  Home
                </a>
              </li>
              <li>
                <a href="/configintamd" className="text-light">
                  Configuratore
                </a>
              </li>
              <li>
                <a href="/about" className="text-light">
                  About
                </a>
              </li>
              <li>
                <a href="/about" className="text-light">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </Col>
          <Col md={3}>
            <h5>Contatti</h5>
            <ul className="list-unstyled social-links">
              <li>
                <a
                  href="https://github.com/FraLama99"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light"
                >
                  <FaGithub /> GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/francesco-alberto-lamanuzzi-119911186/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light"
                >
                  <FaLinkedin /> LinkedIn
                </a>
              </li>
              <li>
                <a href="mailto:info@esempio.com" className="text-light">
                  <FaEnvelope /> info@3dlama.com
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <Row>
          <Col className="text-center border-top pt-3 mt-2">
            <p className="copyright">
              &copy; {new Date().getFullYear()} BTG Configurator - Progetto demo
              per esame finale EPICODE
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
