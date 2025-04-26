import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../src/utlis/AuthContext";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showResetOption, setShowResetOption] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  // Gestisce il token ricevuto dalla callback OAuth
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const errorParam = queryParams.get("error");

    if (token) {
      console.log("🔑 Token OAuth ricevuto, effettuo login automatico");
      setIsGoogleLoading(true);

      // Esegui login con il token Google
      loginWithToken(token);
    }

    if (errorParam) {
      console.error("❌ Errore da OAuth:", errorParam);
      setError(
        "Autenticazione con Google fallita. Riprova o usa un altro metodo di accesso."
      );
    }
  }, [location]);

  // Funzione per effettuare il login con il token
  const loginWithToken = async (token) => {
    try {
      console.log("🔄 Tentativo di login con token OAuth");

      // Chiama la funzione login dal contesto Auth
      const success = await login(token);

      if (success) {
        console.log("✅ Login con token OAuth riuscito");
        // Rimuovi pendingGoogleAuth
        localStorage.removeItem("pendingGoogleAuth");
        navigate("/", { replace: true });
      } else {
        console.error("❌ Login con token OAuth fallito");
        setError(
          "Autenticazione con Google fallita. Riprova o usa un altro metodo di accesso."
        );
      }
    } catch (error) {
      console.error("❌ Errore durante il login con OAuth:", error);
      setError("Errore durante il login. Riprova più tardi.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleGoogleLogin = () => {
    // Salva lo stato corrente nell'URL o in sessionStorage se necessario
    sessionStorage.setItem("redirectAfterLogin", "true");
    localStorage.setItem("pendingGoogleAuth", "true");
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/users/login-google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Salviamo solo il token nel localStorage
        localStorage.setItem("token", data.token);

        // Aggiorniamo il contesto di autenticazione
        await login(data.token);
        navigate("/", { replace: true });
      } else {
        setError(data.message || "Login fallito");
        setShowResetOption(true); // Mostra l'opzione di reset password dopo un login fallito
      }
    } catch (error) {
      console.error("Errore durante il login:", error);
      setError("Si è verificato un errore durante il login");
      setShowResetOption(true); // Mostra l'opzione di reset password anche in caso di errore di rete
    }
  };

  // Funzione per reindirizzare alla pagina di reset password
  const handleForgotPassword = () => {
    navigate("/forgot-password", { state: { email: loginData.email } });
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2 className="text-center mb-4">Login</h2>
          {error && (
            <Alert variant="danger">
              {error}
              {showResetOption && (
                <div className="mt-2">
                  <strong>Problemi ad accedere?</strong> Puoi reimpostare la tua
                  password.
                </div>
              )}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                required
                autoComplete="username"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
              />
              <div className="d-flex justify-content-end mt-1">
                <Button
                  variant="link"
                  className="p-0 text-decoration-none"
                  onClick={handleForgotPassword}
                  style={{
                    fontSize: "0.9rem",
                    color: showResetOption ? "#dc3545" : "#6c757d",
                    fontWeight: showResetOption ? "500" : "normal",
                  }}
                >
                  Password dimenticata? Reimposta la password
                </Button>
              </div>
            </Form.Group>

            <Button variant="dark" type="submit" className="w-100">
              Login
            </Button>
            <Row className="mb-3 mt-4">
              <Col>
                <hr />
                <p className="text-center">oppure</p>
              </Col>
            </Row>

            <Button
              variant="light"
              type="button"
              onClick={handleGoogleLogin}
              className="w-100 d-flex justify-content-center align-items-center gap-2 border"
              style={{ height: "42px" }}
            >
              <img
                src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/icons/google.svg"
                alt="Google logo"
                style={{ width: "20px", height: "20px" }}
              />
              Accedi con Google
            </Button>

            <div className="text-center mt-4">
              <p className="mb-0">
                Non hai un account?{" "}
                <Link to="/register" className="text-decoration-none">
                  Registrati
                </Link>
              </p>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
