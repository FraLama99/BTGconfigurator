import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../utlis/AuthContext";
import api from "../../../utlis/api";
import paymentService from "../../../utlis/paymentService";
import { calculateDeliveryTime } from "../../../component/configurator/utils/deliveryTimeCalculator";
import { calculatePrices, validateCheckoutForm } from "./utils/checkoutHelpers";

import CartSummary from "./components/CartSummary";
import ShippingForm from "./components/ShippingForm";
import PaymentMethodForm from "./components/PaymentMethodForm";
import OrderSummary from "./components/OrderSummary";
import EmptyCart from "./components/EmptyCart";

import "./checkout.css";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, isAuthenticated, loading: authLoading } = useAuth();

  // Stati
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  // Dati di spedizione e pagamento
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Italia",
  });
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [creditCardInfo, setCreditCardInfo] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  // Calcoli dei prezzi
  const { subtotalWithoutVAT, vatAmount, totalWithVAT } =
    calculatePrices(totalPrice);

  // Stati per consegna e pagamento
  const [deliveryInfo, setDeliveryInfo] = useState({
    estimatedDays: 4,
    allAvailable: true,
    unavailableComponents: [],
    deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    message: "Calcolo tempi di consegna...",
  });
  const [processPayment, setProcessPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState({
    processing: false,
    success: false,
    error: false,
    message: "",
  });

  // Effetto per monitorare lo stato dell'autenticazione
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }

    fetchData();
  }, [isAuthenticated, authLoading, navigate]);

  // Caricamento dei dati
  const fetchData = async () => {
    setFetchingData(true);
    setError("");

    try {
      // Caso 1: Acquisto diretto dalla pagina dettaglio macchina
      if (location.state?.fromBuyNow && location.state?.machineId) {
        const response = await api.getMachineById(location.state.machineId);
        if (response && response.data) {
          const machine = response.data.machine || response.data;

          // Aggiunta al carrello tramite API
          await api.addToCart({
            itemId: machine._id,
            itemType: "machine",
            quantity: 1,
          });
        }
      }

      // Carica il carrello
      await loadCartFromServer();

      // Carica i dati di spedizione dell'utente
      if (userData) {
        setShippingAddress({
          fullName: userData.name || userData.fullName || "",
          address: userData.address?.street || "",
          city: userData.address?.city || "",
          postalCode: userData.address?.zipCode || "",
          country: userData.address?.country || "Italia",
        });
      }
    } catch (err) {
      console.error("Errore nel caricamento dei dati:", err);
      setError("Impossibile caricare i dati. Riprova più tardi.");
    } finally {
      setFetchingData(false);
    }
  };

  // Carica il carrello dal server
  const loadCartFromServer = async () => {
    try {
      const cartResponse = await api.getUserCart();

      if (cartResponse && cartResponse.data) {
        setCartItems(cartResponse.data.items || []);
        setTotalPrice(cartResponse.data.totalPrice || 0);
      } else {
        setCartItems([]);
        setTotalPrice(0);
      }
    } catch (error) {
      console.error("Errore nel recupero del carrello:", error);
      throw error;
    }
  };

  // Calcolo dei tempi di consegna
  useEffect(() => {
    if (cartItems.length > 0) {
      try {
        const deliveryDetails = calculateDeliveryTime(cartItems);
        setDeliveryInfo(deliveryDetails);
      } catch (error) {
        console.error(
          "Errore nell'aggiornamento dei tempi di consegna:",
          error
        );
        setDeliveryInfo({
          estimatedDays: 7,
          allAvailable: false,
          unavailableComponents: [],
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          message:
            "Si è verificato un errore nel calcolo dei tempi di consegna",
        });
      }
    }
  }, [cartItems]);

  // Handler per modifiche form
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreditCardChange = (e) => {
    const { name, value } = e.target;
    setCreditCardInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Gestione quantità e rimozione elementi del carrello
  const increaseQuantity = async (index) => {
    setLoading(true);
    try {
      const item = cartItems[index];
      const newQuantity = item.quantity + 1;
      await api.updateCartItem(item.id, newQuantity);
      await loadCartFromServer();
    } catch (error) {
      console.error("Errore nell'aggiornamento della quantità:", error);
      setError("Impossibile aggiornare la quantità. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const decreaseQuantity = async (index) => {
    if (cartItems[index].quantity <= 1) return;

    setLoading(true);
    try {
      const item = cartItems[index];
      const newQuantity = item.quantity - 1;
      await api.updateCartItem(item.id, newQuantity);
      await loadCartFromServer();
    } catch (error) {
      console.error("Errore nell'aggiornamento della quantità:", error);
      setError("Impossibile aggiornare la quantità. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (index) => {
    setLoading(true);
    try {
      const item = cartItems[index];
      await api.removeCartItem(item.id);
      await loadCartFromServer();
    } catch (error) {
      console.error("Errore nella rimozione dell'elemento:", error);
      setError(
        "Impossibile rimuovere l'elemento dal carrello. Riprova più tardi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Creazione ordine
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setProcessPayment(true);
    setPaymentStatus({
      processing: true,
      success: false,
      error: false,
      message: "Elaborazione del pagamento in corso...",
    });

    try {
      // Validazione form
      const validationError = validateCheckoutForm(
        shippingAddress,
        paymentMethod,
        creditCardInfo
      );
      if (validationError) {
        throw new Error(validationError);
      }

      // Elabora il pagamento
      let paymentResult = null;
      if (paymentMethod === "creditCard") {
        paymentResult = await paymentService.processCardPayment(
          creditCardInfo,
          totalPrice
        );
        setPaymentStatus({
          ...paymentStatus,
          message: "Pagamento con carta di credito completato!",
        });
      } else if (paymentMethod === "paypal") {
        paymentResult = await paymentService.processPayPalPayment(totalPrice);
        setPaymentStatus({
          ...paymentStatus,
          message: "Pagamento PayPal completato!",
        });
      } else {
        // Per bonifico non serve processare pagamento
        paymentResult = { status: "pending" };
        setPaymentStatus({
          ...paymentStatus,
          message: "Ordine registrato, in attesa di bonifico bancario",
        });
      }

      // Se il pagamento è andato a buon fine o è in attesa (bonifico)
      if (paymentResult) {
        setPaymentStatus({
          processing: false,
          success: true,
          error: false,
          message:
            paymentResult.message || "Pagamento completato con successo!",
        });
        // Modifica questa parte per gestire correttamente i tipi di macchine

        // Estrai tutti gli elementi macchina dal carrello
        const machineItems = cartItems.filter(
          (item) => item.type === "machine" || item.type === "preset"
        );

        if (machineItems.length === 0) {
          throw new Error("Nessuna macchina valida nel carrello");
        }

        // Prepara array di tutte le macchine da inserire nell'ordine
        const machinesArray = machineItems
          .map((machine) => {
            // Determina il tipo di macchina correttamente
            let machineType =
              machine.type === "preset" || machine.type === "customMachine"
                ? "CustomMachine"
                : "Machine";

            // Verifica che l'oggetto machine.item contenga l'ID
            if (!machine.item || !machine.item._id) {
              console.error("Dati macchina non validi:", machine);
              return null;
            }

            return {
              machineType: machineType,
              machineId: machine.item._id,
              quantity: machine.quantity || 1,
              name: machine.item.name || "Configurazione PC",
              price: machine.price || 0,
              components: machine.item.components || {},
            };
          })
          .filter(Boolean); // Rimuovi eventuali elementi null

        if (machinesArray.length === 0) {
          throw new Error("Nessuna macchina valida nel carrello");
        }

        // Log per debug
        console.log("Macchine da inserire nell'ordine:", machinesArray);

        // Preparazione dati ordine con il nuovo array di macchine
        const orderData = {
          machines: machinesArray,
          shippingInfo: {
            fullName: shippingAddress.fullName,
            address: shippingAddress.address,
            city: shippingAddress.city,
            zipCode: shippingAddress.postalCode,
            country: shippingAddress.country,
          },
          paymentMethod,
          paymentStatus:
            paymentMethod === "bankTransfer" ? "pending" : "completed",
          totalPrice: totalWithVAT,
          estimatedDelivery: {
            allAvailable: deliveryInfo.allAvailable,
            estimatedDays: deliveryInfo.estimatedDays,
            estimatedDate: deliveryInfo.deliveryDate,
          },
          items: machineItems.length,
        };

        // Invio creazione ordine
        const response = await api.createOrder(orderData);
        setSuccess(
          `Ordine #${
            response.data.order.orderNumber || "N/A"
          } completato con successo!`
        );

        // Reindirizza alla pagina di conferma
        setTimeout(() => {
          navigate(`/orders/${response.data.order._id}/confirmation`, {
            state: {
              orderDetails: response.data.order,
              deliveryInfo: deliveryInfo,
            },
          });
        }, 2000);
      }
    } catch (err) {
      console.error("Errore durante il completamento dell'ordine:", err);
      setPaymentStatus({
        processing: false,
        success: false,
        error: true,
        message: err.message || "Errore durante l'elaborazione del pagamento",
      });
      setError(
        err.message ||
          "Errore durante il completamento dell'ordine. Riprova più tardi."
      );
    } finally {
      setLoading(false);
      setProcessPayment(false);
    }
  };

  // Mostro spinner durante il loading
  if (authLoading || fetchingData) {
    return (
      <Container className="py-5 text-center bg-dark text-white">
        <Spinner animation="border" variant="warning" />
        <p className="mt-3">
          {authLoading
            ? "Verifica autenticazione..."
            : "Caricamento dati checkout..."}
        </p>
      </Container>
    );
  }

  return (
    <div className="checkout-page bg-dark text-white">
      <Container className="py-5">
        <h1 className="text-warning mb-4">Checkout</h1>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Carrello vuoto */}
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <Row>
            {/* Colonna sinistra: Carrello, Spedizione, Pagamento */}
            <Col lg={8}>
              <CartSummary
                cartItems={cartItems}
                loading={loading}
                increaseQuantity={increaseQuantity}
                decreaseQuantity={decreaseQuantity}
                removeItem={removeItem}
              />

              <ShippingForm
                shippingAddress={shippingAddress}
                handleAddressChange={handleAddressChange}
              />

              <PaymentMethodForm
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                creditCardInfo={creditCardInfo}
                handleCreditCardChange={handleCreditCardChange}
              />
            </Col>

            {/* Colonna destra: Riepilogo ordine */}
            <Col lg={4}>
              <OrderSummary
                totalPrice={totalPrice}
                subtotalWithoutVAT={subtotalWithoutVAT}
                vatAmount={vatAmount}
                totalWithVAT={totalWithVAT}
                deliveryInfo={deliveryInfo}
                processPayment={processPayment}
                paymentStatus={paymentStatus}
                loading={loading}
                navigate={navigate}
                cartItems={cartItems}
                handlePlaceOrder={handlePlaceOrder}
              />
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default CheckoutPage;
