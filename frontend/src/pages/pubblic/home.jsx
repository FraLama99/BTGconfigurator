import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Carousel, Button, Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import { motion } from "framer-motion";
import IntelCard from "../../component/configurator/utils/IntelCard.jsx";
import AMDCard from "../../component/configurator/utils/AMDCard.jsx";
import GamingPrebuiltCard from "../../component/configurator/utils/GamingPrebuiltCard.jsx";
import WorkstationPrebuiltCard from "../../component/configurator/utils/WorkstationPrebuiltCard.jsx";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [carouselImages, setCarouselImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        setLoading(true);
        const response = await api.getCarouselImages();

        console.log("Dati carosello ricevuti:", response.data);

        const formattedData = response.data.map((item, index) => ({
          id: item._id,
          title: item.name,
          description: item.description || "",
          image: item.url,
          altText: item.altText,
          path: getPathFromTitle(item.name),
          order: item.order || index,
        }));

        formattedData.sort((a, b) => a.order - b.order);
        setCarouselImages(formattedData);
        setLoading(false);
      } catch (error) {
        console.error(
          "Errore nel caricamento delle immagini del carosello:",
          error
        );
        setError("Impossibile caricare il carosello. Riprova più tardi.");
        setLoading(false);
      }
    };

    fetchCarouselImages();
  }, []);

  const getPathFromTitle = (title) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes("intel")) return "/configure/intel";
    if (titleLower.includes("amd")) return "/configure/amd";
    if (titleLower.includes("prebuild") || titleLower.includes("pre-built"))
      return "/prebuilt";
    if (titleLower.includes("workstation")) return "/workstation";
    return "/configure";
  };

  const handleSlideClick = (path) => {
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
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
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

  if (loading) {
    return (
      <div
        className="home-container d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container text-center my-5">
        <h2>Ops! Qualcosa è andato storto</h2>
        <p className="text-danger">{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Riprova
        </button>
      </div>
    );
  }

  const fallbackSlides = [
    {
      id: 1,
      title: "Configure Intel PC",
      description: "Build your custom Intel-based PC",
      image: "/images/intel.jpg",
      path: "/configure/intel",
    },
    {
      id: 2,
      title: "Configure AMD PC",
      description: "Build your custom AMD-based PC",
      image: "/images/amd.jpg",
      path: "/configure/amd",
    },
    {
      id: 3,
      title: "Pre-built Systems",
      description: "Choose from our pre-configured systems",
      image: "/images/prebuilt.jpg",
      path: "/prebuilt",
    },
    {
      id: 4,
      title: "Workstation Solutions",
      description: "Professional workstation configurations",
      image: "/images/workstation.jpg",
      path: "/workstation",
    },
  ];

  const slidesToShow =
    carouselImages.length > 0 ? carouselImages : fallbackSlides;

  return (
    <div className="home-container ">
      <h1 className="text-center my-4">Benvenuto in BTG System </h1>
      <h2 className="text-center mb-4">Il tuo configuratore di PC ideale</h2>
      <Carousel className="w-75 mx-auto mb-5  ">
        {slidesToShow.map((slide) => (
          <Carousel.Item
            key={slide.id}
            onClick={() => handleSlideClick(slide.path)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            <img
              className="d-block w-100 rounded-5 "
              src={slide.image}
              alt={slide.altText || slide.title}
              style={{ height: "400px", objectFit: "cover" }}
            />

            <div
              style={{
                position: "absolute",
                bottom: "30px",
                left: "0",
                right: "0",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                variant="dark"
                className="px-4 py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlideClick(slide.path);
                }}
              >
                {slide.altText || slide.title}
              </Button>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      <Container className="py-5">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold">Le nostre Possibilita di scelta</h2>
          <div
            className="mx-auto"
            style={{
              height: "4px",
              width: "100px",
              background: "linear-gradient(90deg, #0d6efd, #fd7e14)",
              marginBottom: "20px",
            }}
          ></div>
          <p className="lead mb-0 mx-auto" style={{ maxWidth: "700px" }}>
            Scegli la piattaforma preferita o opta per una configurazione
            preimpostata per le tue esigenze specifiche.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row className="g-4 mb-4">
            <Col md={6}>
              <IntelCard
                handleClick={handleSlideClick}
                itemVariants={itemVariants}
              />
            </Col>
            <Col md={6}>
              <AMDCard
                handleClick={handleSlideClick}
                itemVariants={itemVariants}
              />
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={6}>
              <GamingPrebuiltCard
                handleClick={handleSlideClick}
                itemVariants={itemVariants}
              />
            </Col>
            <Col md={6}>
              <WorkstationPrebuiltCard
                handleClick={handleSlideClick}
                itemVariants={itemVariants}
              />
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
};

export default HomePage;
