import React, { useState } from "react";
import { Nav, Image, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../utlis/AuthContext"; // Importa il hook useAuth

const SideAdmin = () => {
  const { userData } = useAuth(); // Ottieni i dati dell'utente dal contesto di autenticazione
  const [isOpen, setIsOpen] = useState(true);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [configMenuOpen, setConfigMenuOpen] = useState(false);

  // Gestisce il toggle del menu prodotti
  const toggleProductMenu = () => {
    setProductMenuOpen(!productMenuOpen);
  };

  return (
    <>
      <button
        className="btn btn-dark d-md-none"
        style={{
          position: "fixed",
          left: isOpen ? "250px" : "20px",
          top: "20px",
          zIndex: 1000,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "←" : "→"}
      </button>

      <div
        className="sidebar bg-dark text-white"
        style={{
          height: "100vh",
          width: "250px",
          position: "fixed",
          left: isOpen ? 0 : "-250px",
          top: 0,
          padding: "20px",
          transition: "left 0.3s ease-in-out",
          overflowY: "auto",
        }}
      >
        <Container className="text-center mb-4">
          <Image
            src={userData?.avatar || "https://via.placeholder.com/80"}
            roundedCircle
            width={80}
            height={80}
            className="mb-2"
            alt="User Avatar"
          />
          <h5>{userData?.name || "Admin Panel"}</h5>
        </Container>

        <Nav className="flex-column">
          <Nav.Link as={Link} to="/admin" className="text-white mb-2">
            DASHBOARD
          </Nav.Link>

          {/* Menu dropdown per PRODOTTI */}
          <div className="mb-2">
            <div
              className="d-flex justify-content-between align-items-center text-white px-2 py-2"
              onClick={toggleProductMenu}
              style={{ cursor: "pointer" }}
            >
              <span>PRODOTTI</span>
              <i
                className={`bi bi-chevron-${
                  productMenuOpen ? "down" : "right"
                }`}
              ></i>
            </div>

            {/* Sottomenu prodotti visibile solo quando productMenuOpen è true */}
            <div
              className="ms-3"
              style={{
                maxHeight: productMenuOpen ? "500px" : "0",
                overflow: "hidden",
                transition: "max-height 0.3s ease-in-out",
              }}
            >
              {/* CPU */}
              <Nav.Link
                as={Link}
                to="/admin/manage-cpus"
                className="text-white"
              >
                <i className="bi bi-cpu me-2"></i> CPU
              </Nav.Link>

              {/* CASE */}
              <Nav.Link
                as={Link}
                to="/admin/manage-cases"
                className="text-white"
              >
                <i className="bi bi-box me-2"></i> CASE
              </Nav.Link>

              {/* COOLER */}
              <Nav.Link
                as={Link}
                to="/admin/manage-coolers"
                className="text-white"
              >
                <i className="bi bi-wind me-2"></i> COOLER
              </Nav.Link>

              {/* GPU */}
              <Nav.Link
                as={Link}
                to="/admin/manage-gpus"
                className="text-white"
              >
                <i className="bi bi-gpu-card me-2"></i> GPU
              </Nav.Link>

              {/* SCHEDA MADRE */}
              <Nav.Link
                as={Link}
                to="/admin/manage-motherboards"
                className="text-white"
              >
                <i className="bi bi-motherboard me-2"></i> SCHEDA MADRE
              </Nav.Link>

              {/* ALIMENTATORE */}
              <Nav.Link
                as={Link}
                to="/admin/manage-powers"
                className="text-white"
              >
                <i className="bi bi-battery-charging me-2"></i> ALIMENTATORE
              </Nav.Link>

              {/* RAM */}
              <Nav.Link
                as={Link}
                to="/admin/manage-rams"
                className="text-white"
              >
                <i className="bi bi-memory me-2"></i> RAM
              </Nav.Link>

              {/* STORAGE */}
              <Nav.Link
                as={Link}
                to="/admin/manage-storages"
                className="text-white"
              >
                <i className="bi bi-device-hdd me-2"></i> STORAGE
              </Nav.Link>
            </div>
          </div>

          {/* Menu configurazioni */}
          <div className="mb-2">
            <div
              className="d-flex justify-content-between align-items-center text-white px-2 py-2"
              onClick={() => setConfigMenuOpen(!configMenuOpen)}
              style={{ cursor: "pointer" }}
            >
              <span>CONFIGURAZIONI</span>
              <i
                className={`bi bi-chevron-${configMenuOpen ? "down" : "right"}`}
              ></i>
            </div>

            {/* Sottomenu configurazioni */}
            <div
              className="ms-3"
              style={{
                maxHeight: configMenuOpen ? "200px" : "0",
                overflow: "hidden",
                transition: "max-height 0.3s ease-in-out",
              }}
            >
              <Nav.Link
                as={Link}
                to="/admin/manage-gaming-presets"
                className="text-white"
              >
                <i className="bi bi-joystick me-2"></i> GAMING
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/admin/manage-workstations"
                className="text-white"
              >
                <i className="bi bi-pc-display me-2"></i> WORKSTATION
              </Nav.Link>
            </div>
          </div>

          {/* CLIENTI */}
          <Nav.Link
            as={Link}
            to="/admin/manage-users"
            className="text-white mb-2"
          >
            <i className="bi bi-people me-2"></i> UTENTI
          </Nav.Link>
        </Nav>
      </div>
    </>
  );
};

export default SideAdmin;
