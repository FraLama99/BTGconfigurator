import React from "react";
import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";

const WorkstationPrebuiltCard = ({ handleClick, itemVariants }) => {
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
        onClick={() => handleClick("/workstation")}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "linear-gradient(90deg, #1e3c72, #2a5298)",
          }}
        ></div>
        <Card.Body className="d-flex flex-column align-items-center p-5">
          <div
            className="mb-4 rounded"
            style={{
              height: "120px",
              width: "100%",
              background:
                "linear-gradient(135deg, #000000, #000000 30%, #0d6efd)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h3 className="text-white m-0 fw-bold">WORKSTATION</h3>
          </div>
          <h2 className="display-6 fw-bold mb-3" style={{ color: "#1e3c72" }}>
            Workstation
          </h2>
          <p className="text-muted mb-4">
            Sistemi professionali per design, modellazione 3D, editing video e
            sviluppo software. Affidabilità e performance senza compromessi.
          </p>
          <Button
            variant="outline-primary"
            size="lg"
            className="mt-auto px-5"
            style={{
              borderColor: "#1e3c72",
              color: "#1e3c72",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#1e3c72";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#1e3c72";
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick("/workstation");
            }}
          >
            Visualizza Workstation
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default WorkstationPrebuiltCard;
