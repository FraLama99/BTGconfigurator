import React, { useState, useEffect } from "react";
import {
  Navbar,
  Container,
  NavDropdown,
  Image,
  NavLink,
  Button,
  Modal,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utlis/AuthContext";
import logo from "../../assets/logo.png";
import { BsCart3 } from "react-icons/bs";
import api from "../../utlis/api";
import { registerCartUpdateCallback } from "../../utlis/cartUtils";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isAuthenticated, logout, getToken } = useAuth();
  const navigate = useNavigate();
  const [showCartModal, setShowCartModal] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cartUpdating, setCartUpdating] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);

  const fetchCartData = async () => {
    if (cartUpdating) return;

    setCartUpdating(true);
    try {
      if (isAuthenticated) {
        const response = await api.getUserCart();
        console.log("Dati carrello ricevuti:", response.data);

        if (response.data && response.data.items) {
          const processedItems = response.data.items.map((item) => {
            const productData = item.item || item;

            let price = 0;
            if (item.price) {
              price = parseFloat(item.price);
            } else if (productData.finalPrice) {
              price = parseFloat(productData.finalPrice);
            } else if (productData.basePrice) {
              price = parseFloat(productData.basePrice);
            } else if (productData.totalPrice) {
              price = parseFloat(productData.totalPrice);
            } else if (productData.price) {
              price = parseFloat(productData.price);
            }

            console.log(`Prezzo estratto per ${productData.name}: ${price}`);

            return {
              id: item.id || item._id,
              name: productData.name || "Prodotto senza nome",
              price: price || 0,
              quantity: item.quantity || 1,
              image: productData.image || null,
              configName: productData.configName || null,
              category: productData.category || null,
              type: productData.type || item.type || "product",
              productId: productData._id || null,
            };
          });

          console.log("Elementi processati:", processedItems);
          setCartItems(processedItems);
        } else {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Errore caricamento carrello:", error);
      setCartItems([]);
    } finally {
      setCartUpdating(false);
    }
  };

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
    fetchCartData();
  }, [isAuthenticated]);

  useEffect(() => {
    const unregister = registerCartUpdateCallback(() => {
      console.log("🔄 Notifica di aggiornamento carrello ricevuta in Header");
      fetchCartData();
    });

    const handleStorageChange = (e) => {
      if (e.key === "cart") {
        console.log("🔄 Aggiornamento localStorage del carrello rilevato");
        fetchCartData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      unregister();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const unregister = registerCartUpdateCallback(() => {
      console.log("🔄 Notifica di aggiornamento carrello ricevuta in Header");
      fetchCartData();
    });

    return () => {
      unregister();
    };
  }, []);

  const handleLogout = () => {
    logout();
    setCartItems([]);
    navigate("/login");
  };

  const handleCartModal = () => {
    setShowCartModal(!showCartModal);
  };

  const removeFromCart = async (itemId) => {
    setRemovingItemId(itemId);

    try {
      if (isAuthenticated) {
        console.log("Rimozione elemento dal carrello:", itemId);

        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );

        await api.removeCartItem(itemId);
        console.log("Elemento rimosso con successo");

        setIsLoading(true);
        setTimeout(async () => {
          await fetchCartData();
          setIsLoading(false);
        }, 300);
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Errore rimozione articolo:", error);

      setIsLoading(true);
      await fetchCartData();
      setIsLoading(false);
    } finally {
      setRemovingItemId(null);
    }
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      className="shadow-sm mb-3 px-5"
    >
      <Container fluid className="d-flex justify-content-between">
        <Navbar.Brand href="/">
          <Image
            src={logo}
            width={50}
            height={50}
            alt="Logo"
            className="me-2"
          />
          <span className="text-light ps-3">BTG System</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse
          id="basic-navbar-nav"
          className="justify-content-end px-5 mx-5"
        >
          <NavLink href="/configintamd" className="text-light me-3">
            Configuratore
          </NavLink>
          <NavLink href="/preconfigintamd" className="text-light me-3">
            PC Preconfigurati
          </NavLink>
          <NavLink href="/about" className="text-light me-3">
            Chi siamo
          </NavLink>
          <NavLink href="/contact" className="text-light me-3">
            Contatti
          </NavLink>
          <NavDropdown
            title={<span className="text-light">Menu</span>}
            id="basic-nav-dropdown"
            className="nav-dropdown-dark"
            drop="start"
          >
            {isLoggedIn ? (
              <>
                <NavDropdown.Item href="/profile">Profilo</NavDropdown.Item>

                <NavDropdown.Item
                  href="/myconfiguration"
                  className="text-light me-3"
                >
                  I Miei PC
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              </>
            ) : (
              <>
                <NavDropdown.Item href="/login">Login</NavDropdown.Item>
                <NavDropdown.Item href="/register">Registrati</NavDropdown.Item>
              </>
            )}
          </NavDropdown>
          <Button
            variant="outline-light"
            className="mx-3 position-relative"
            onClick={handleCartModal}
          >
            <BsCart3 size={20} />
            {cartItems.length > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {cartItems.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </Button>
          <Modal show={showCartModal} onHide={handleCartModal} size="lg">
            <Modal.Header closeButton className="bg-dark text-light">
              <Modal.Title>Il tuo carrello</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {isLoading && (
                <div className="text-center mb-3 p-2 bg-dark rounded">
                  <Spinner
                    animation="border"
                    variant="primary"
                    size="sm"
                    className="me-2"
                  />
                  <span className="text-primary">
                    Aggiornamento carrello...
                  </span>
                </div>
              )}

              {cartItems.length === 0 && !isLoading ? (
                <p className="text-center my-4">Il tuo carrello è vuoto</p>
              ) : (
                <ListGroup>
                  {cartItems.map((item) => (
                    <ListGroup.Item
                      key={item.id}
                      className={`d-flex justify-content-between align-items-center ${
                        removingItemId === item.id ? "bg-light" : ""
                      }`}
                    >
                      <div className="d-flex align-items-center">
                        {item.image && (
                          <Image
                            src={item.image}
                            width={50}
                            height={50}
                            className="me-3"
                          />
                        )}
                        <div>
                          <h6 className="mb-0">{item.name}</h6>
                          <div className="d-flex flex-column">
                            <small className="text-muted">
                              Quantità: {item.quantity}
                            </small>
                            {item.configName && (
                              <small className="text-info">
                                <i className="bi bi-pc-display me-1"></i>
                                {item.configName}
                              </small>
                            )}
                            {item.category && (
                              <small className="text-secondary">
                                <i className="bi bi-tag me-1"></i>
                                {item.category}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <span className="me-3">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          disabled={isLoading || removingItemId === item.id}
                        >
                          {removingItemId === item.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "Rimuovi"
                          )}
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Modal.Body>
            {cartItems.length > 0 && (
              <div className="border-top p-3">
                <div className="d-flex justify-content-between mb-3">
                  <h5>Totale:</h5>
                  <h5>€{calculateTotal()}</h5>
                </div>
                <div className="d-flex justify-content-between">
                  <Button variant="outline-secondary" onClick={handleCartModal}>
                    Continua lo shopping
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleCartModal();
                      navigate("/checkout");
                    }}
                  >
                    Procedi al checkout
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
