import React, { useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaGoogle,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import api from "../../utlis/api.js";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    dataNascita: "",
    indirizzo: {
      via: "",
      citta: "",
      cap: "",
      paese: "",
    },
    adminCode: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome) newErrors.nome = "Il nome è obbligatorio";
    else if (formData.nome.length < 2)
      newErrors.nome = "Il nome deve contenere almeno 2 caratteri";

    if (!formData.cognome) newErrors.cognome = "Il cognome è obbligatorio";
    else if (formData.cognome.length < 2)
      newErrors.cognome = "Il cognome deve contenere almeno 2 caratteri";

    if (!formData.email) {
      newErrors.email = "L'email è obbligatoria";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formato email non valido";
    }

    if (!formData.password) {
      newErrors.password = "La password è obbligatoria";
    } else if (formData.password.length < 8) {
      newErrors.password = "La password deve contenere almeno 8 caratteri";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "La password deve contenere almeno una lettera minuscola, una maiuscola e un numero";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "La conferma della password è obbligatoria";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Le password non corrispondono";
    }

    if (!formData.telefono) {
      newErrors.telefono = "Il numero di telefono è obbligatorio";
    } else if (!/^[0-9]{10}$/.test(formData.telefono.replace(/\s/g, ""))) {
      newErrors.telefono = "Inserire un numero di telefono valido (10 cifre)";
    }

    if (!formData.dataNascita) {
      newErrors.dataNascita = "La data di nascita è obbligatoria";
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dataNascita);
      const age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.dataNascita = "Devi avere almeno 18 anni per registrarti";
      }
    }

    if (!formData.indirizzo.via) {
      newErrors["indirizzo.via"] = "La via è obbligatoria";
    }

    if (!formData.indirizzo.citta) {
      newErrors["indirizzo.citta"] = "La città è obbligatoria";
    }

    if (!formData.indirizzo.cap) {
      newErrors["indirizzo.cap"] = "Il CAP è obbligatorio";
    } else if (!/^\d{5}$/.test(formData.indirizzo.cap)) {
      newErrors["indirizzo.cap"] = "Inserire un CAP valido (5 cifre)";
    }

    if (!formData.indirizzo.paese) {
      newErrors["indirizzo.paese"] = "Il paese è obbligatorio";
    }

    if (isAdminRegistration && !formData.adminCode) {
      newErrors.adminCode = "Il codice admin è obbligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("indirizzo.")) {
      const indirizzoField = name.split(".")[1];
      setFormData({
        ...formData,
        indirizzo: {
          ...formData.indirizzo,
          [indirizzoField]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      await api.register({
        name: formData.nome,
        surname: formData.cognome,
        email: formData.email,
        password: formData.password,
        birth_date: formData.dataNascita,
        phone: formData.telefono,
        address: {
          street: formData.indirizzo.via,
          city: formData.indirizzo.citta,
          zipCode: formData.indirizzo.cap,
          country: formData.indirizzo.paese,
        },
        role: isAdminRegistration ? "admin" : "user",
        adminCode: isAdminRegistration ? formData.adminCode : undefined,
      });

      toast.success(
        "Registrazione completata con successo! Effettua il login."
      );
      navigate("/login");
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      setApiError(
        error.response?.data?.message ||
          "Si è verificato un errore durante la registrazione. Riprova più tardi."
      );
      toast.error("Errore durante la registrazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/users/login-google`;
  };

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold">Registrati</h2>
                  <p className="text-muted">
                    Crea un nuovo account per BTG System
                  </p>
                </div>

                {apiError && (
                  <Alert variant="danger" className="mb-4">
                    {apiError}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaUser />
                          </span>
                          <Form.Control
                            type="text"
                            name="nome"
                            value={formData.nome}
                            onChange={handleChange}
                            placeholder="Inserisci il tuo nome"
                            isInvalid={!!errors.nome}
                          />
                        </div>
                        {errors.nome && (
                          <Form.Text className="text-danger">
                            {errors.nome}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cognome</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaUser />
                          </span>
                          <Form.Control
                            type="text"
                            name="cognome"
                            value={formData.cognome}
                            onChange={handleChange}
                            placeholder="Inserisci il tuo cognome"
                            isInvalid={!!errors.cognome}
                          />
                        </div>
                        {errors.cognome && (
                          <Form.Text className="text-danger">
                            {errors.cognome}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaEnvelope />
                          </span>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Inserisci la tua email"
                            isInvalid={!!errors.email}
                          />
                        </div>
                        {errors.email && (
                          <Form.Text className="text-danger">
                            {errors.email}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Telefono</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaPhone />
                          </span>
                          <Form.Control
                            type="tel"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            placeholder="Inserisci il tuo numero"
                            isInvalid={!!errors.telefono}
                          />
                        </div>
                        {errors.telefono && (
                          <Form.Text className="text-danger">
                            {errors.telefono}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Data di Nascita</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaCalendarAlt />
                      </span>
                      <Form.Control
                        type="date"
                        name="dataNascita"
                        value={formData.dataNascita}
                        onChange={handleChange}
                        isInvalid={!!errors.dataNascita}
                      />
                    </div>
                    {errors.dataNascita && (
                      <Form.Text className="text-danger">
                        {errors.dataNascita}
                      </Form.Text>
                    )}
                  </Form.Group>

                  <Card className="bg-dark mb-3 p-3">
                    <Card.Title className="fs-6">Indirizzo</Card.Title>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Via/Piazza e Numero civico</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">
                              <FaMapMarkerAlt />
                            </span>
                            <Form.Control
                              type="text"
                              name="indirizzo.via"
                              value={formData.indirizzo.via}
                              onChange={handleChange}
                              placeholder="Es. Via Roma 123"
                              isInvalid={!!errors["indirizzo.via"]}
                            />
                          </div>
                          {errors["indirizzo.via"] && (
                            <Form.Text className="text-danger">
                              {errors["indirizzo.via"]}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Città</Form.Label>
                          <Form.Control
                            type="text"
                            name="indirizzo.citta"
                            value={formData.indirizzo.citta}
                            onChange={handleChange}
                            placeholder="Es. Milano"
                            isInvalid={!!errors["indirizzo.citta"]}
                          />
                          {errors["indirizzo.citta"] && (
                            <Form.Text className="text-danger">
                              {errors["indirizzo.citta"]}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>CAP</Form.Label>
                          <Form.Control
                            type="text"
                            name="indirizzo.cap"
                            value={formData.indirizzo.cap}
                            onChange={handleChange}
                            placeholder="Es. 20100"
                            isInvalid={!!errors["indirizzo.cap"]}
                          />
                          {errors["indirizzo.cap"] && (
                            <Form.Text className="text-danger">
                              {errors["indirizzo.cap"]}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-2">
                          <Form.Label>Paese</Form.Label>
                          <Form.Control
                            type="text"
                            name="indirizzo.paese"
                            value={formData.indirizzo.paese}
                            onChange={handleChange}
                            placeholder="Es. Italia"
                            isInvalid={!!errors["indirizzo.paese"]}
                          />
                          {errors["indirizzo.paese"] && (
                            <Form.Text className="text-danger">
                              {errors["indirizzo.paese"]}
                            </Form.Text>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaLock />
                          </span>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Crea una password"
                            isInvalid={!!errors.password}
                          />
                        </div>
                        {errors.password && (
                          <Form.Text className="text-danger">
                            {errors.password}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Conferma Password</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <FaLock />
                          </span>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Conferma la password"
                            isInvalid={!!errors.confirmPassword}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <Form.Text className="text-danger">
                            {errors.confirmPassword}
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Check
                    type="checkbox"
                    id="admin-registration"
                    className="mb-3"
                    label="Registrati come amministratore"
                    checked={isAdminRegistration}
                    onChange={() =>
                      setIsAdminRegistration(!isAdminRegistration)
                    }
                  />

                  {isAdminRegistration && (
                    <Form.Group className="mb-4">
                      <Form.Label>Codice Amministratore</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock />
                        </span>
                        <Form.Control
                          type="password"
                          name="adminCode"
                          value={formData.adminCode}
                          onChange={handleChange}
                          placeholder="Inserisci il codice admin"
                          isInvalid={!!errors.adminCode}
                        />
                      </div>
                      {errors.adminCode && (
                        <Form.Text className="text-danger">
                          {errors.adminCode}
                        </Form.Text>
                      )}
                    </Form.Group>
                  )}

                  <div className="d-grid gap-2 mb-4 mt-4">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-lg"
                    >
                      {isSubmitting
                        ? "Registrazione in corso..."
                        : "Registrati"}
                    </Button>

                    <div className="text-center my-3">
                      <span className="text-muted">oppure</span>
                    </div>

                    <Button
                      variant="outline-danger"
                      className="btn-lg d-flex align-items-center justify-content-center"
                      onClick={handleGoogleLogin}
                      disabled={isSubmitting}
                    >
                      <FaGoogle className="me-2" /> Registrati con Google
                    </Button>
                  </div>
                </Form>

                <div className="text-center mt-3">
                  <p className="mb-0">
                    Hai già un account?{" "}
                    <Link to="/login" className="text-decoration-none">
                      Accedi
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;
