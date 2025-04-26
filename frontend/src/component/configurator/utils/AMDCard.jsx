import React from "react";
import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import amdLogo from "../../../assets/amd-seeklogo.png";

const AMDCard = ({ handleClick, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      <Card
        className="text-center border-0 shadow h-100 position-relative overflow-hidden"
        style={{
          borderRadius: "15px",
          cursor: "pointer",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-10px)";
          e.currentTarget.style.boxShadow = "0 15px 30px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.08)";
        }}
        onClick={() => handleClick("/configure/amd")}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "#ED1C24",
          }}
        ></div>
        <Card.Body className="d-flex flex-column align-items-center p-5">
          <div
            className="mb-4"
            style={{
              height: "120px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src={amdLogo}
              alt="AMD Logo"
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
              }}
            />
          </div>
          <h2 className="display-6 fw-bold mb-3" style={{ color: "#ED1C24" }}>
            Configura la tua Bestia
          </h2>
          <p className="text-muted mb-4">
            Potenza bruta, multitasking estremo e prestazioni gaming superiori.
            Porta la tua esperienza ad un livello completamente nuovo con AMD.
          </p>
          <Button
            variant="outline-danger"
            size="lg"
            className="mt-auto px-5"
            onClick={(e) => {
              e.stopPropagation();
              handleClick("/configure/amd");
            }}
          >
            Inizia con AMD
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default AMDCard;
