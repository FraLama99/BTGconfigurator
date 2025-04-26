import React from "react";
import { Card, Button } from "react-bootstrap";
import { motion } from "framer-motion";
import intelLogo from "../../../assets/intel-logo.png";
const IntelCard = ({ handleClick, itemVariants }) => {
  return (
    <motion.div variants={itemVariants}>
      {" "}
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
        onClick={() => handleClick("/configure/intel")}
      >
        {" "}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "#0071c5",
          }}
        ></div>{" "}
        <Card.Body className="d-flex flex-column align-items-center p-5">
          {" "}
          <div
            className="mb-4"
            style={{ height: "120px", display: "flex", alignItems: "center" }}
          >
            {" "}
            <img
              src={intelLogo}
              alt="Intel Logo"
              style={{ maxHeight: "100%", maxWidth: "100%" }}
            />{" "}
          </div>{" "}
          <h2 className="display-6 fw-bold mb-3" style={{ color: "#0071c5" }}>
            {" "}
            Configura di Classe{" "}
          </h2>{" "}
          <p className="text-muted mb-4">
            {" "}
            Potenza, affidabilità e prestazioni eccellenti. Configura una
            macchina Intel per un'esperienza informatica di classe superiore.{" "}
          </p>{" "}
          <Button
            variant="outline-primary"
            size="lg"
            className="mt-auto px-5"
            onClick={(e) => {
              e.stopPropagation();
              handleClick("/configure/intel");
            }}
          >
            {" "}
            Inizia con Intel{" "}
          </Button>{" "}
        </Card.Body>{" "}
      </Card>{" "}
    </motion.div>
  );
};
export default IntelCard;
