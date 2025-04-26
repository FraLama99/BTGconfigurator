import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../utlis/AuthContext.js";
import GamingPrebuiltCard from "../../component/configurator/utils/GamingPrebuiltCard.jsx";
import WorkstationPrebuiltCard from "../../component/configurator/utils/WorkstationPrebuiltCard.jsx";

const PreconfigSelection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleConfigClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <Container fluid className="p-0">
      <div
        className="position-relative bg-dark text-white py-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)), url('https://images.unsplash.com/photo-1558470598-a5dda9640f68?ixlib=rb-4.0.3')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "300px",
        }}
      >
        <Container className="text-center py-5">
          <motion.h1
            className="display-2 fw-bold mb-4"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Scegli la tua preconfigurazione
          </motion.h1>
          <motion.div
            className="mx-auto"
            style={{
              height: "5px",
              width: "150px",
              background: "linear-gradient(90deg, #0d6efd, #fd7e14)",
              marginBottom: "30px",
            }}
            initial={{ width: 0 }}
            animate={{ width: "150px" }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
          <motion.p
            className="lead mb-0 mx-auto"
            style={{ maxWidth: "700px" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Abbiamo creato configurazioni ottimizzate per ogni esigenza. Scegli
            tra i nostri sistemi preconfigurati professionali o per il gaming e
            risparmia tempo nella scelta dei componenti.
          </motion.p>
        </Container>
      </div>

      <Container className="py-5">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row className="g-5 py-4 align-items-center justify-content-center">
            <Col lg={6}>
              <GamingPrebuiltCard
                handleClick={handleConfigClick}
                itemVariants={itemVariants}
              />
            </Col>

            <Col lg={6}>
              <WorkstationPrebuiltCard
                handleClick={handleConfigClick}
                itemVariants={itemVariants}
              />
            </Col>
          </Row>
        </motion.div>

        <div className="text-center mt-5 pt-3">
          <p className="text-muted">
            Preferisci configurare il tuo PC da zero?{" "}
            <a href="/configintamd" className="text-decoration-none">
              Vai al configuratore personalizzato
            </a>
          </p>
        </div>
      </Container>

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
          <h2 className="fw-bold mb-4">Non trovi ciò che cerchi?</h2>
          <p className="lead mb-4">
            I nostri esperti possono suggerirti la configurazione perfetta per
            le tue esigenze specifiche
          </p>

          <Button
            style={{ backgroundColor: "#fd7e14", borderColor: "#fd7e14" }}
            size="lg"
            className="px-4"
            onClick={() => navigate("/contact")}
          >
            Richiedi assistenza
          </Button>
        </Container>
      </div>
    </Container>
  );
};

export default PreconfigSelection;
