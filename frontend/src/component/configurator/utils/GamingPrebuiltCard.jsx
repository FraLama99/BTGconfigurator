import React from "react";
import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";

const GamingPrebuiltCard = ({ handleClick, itemVariants }) => {
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
        onClick={() => handleClick("/prebuilt")}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "linear-gradient(90deg, #6a11cb, #2575fc)",
          }}
        ></div>
        <Card.Body className="d-flex flex-column align-items-center p-5">
          <div
            className="mb-4 rounded"
            style={{
              height: "120px",
              width: "100%",
              background:
                "linear-gradient(135deg, #fd7e14, #fd7e14 30%, #000000)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h3 className="text-white m-0 fw-bold">GAMING</h3>
          </div>
          <h2 className="display-6 fw-bold mb-3" style={{ color: "#6a11cb" }}>
            PC Gaming
          </h2>
          <p className="text-muted mb-4">
            Configurazioni ad alte prestazioni ottimizzate per i giochi più
            esigenti. Esperienza di gioco fluida e grafica mozzafiato garantita.
          </p>
          <Button
            variant="outline-primary"
            size="lg"
            className="mt-auto px-5"
            style={{
              borderColor: "#6a11cb",
              color: "#6a11cb",
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#6a11cb";
              e.target.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "#6a11cb";
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleClick("/prebuilt");
            }}
          >
            Visualizza Gaming PC
          </Button>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default GamingPrebuiltCard;
