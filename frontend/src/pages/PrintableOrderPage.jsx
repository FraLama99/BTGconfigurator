import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utlis/api";
import OrderPrintView from "../component/printable/OrderPrintView";
import { FaArrowLeft } from "react-icons/fa";

const PrintableOrderPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prova prima con l'endpoint di stampa
        let orderData = null;

        try {
          const printResponse = await api.getPrintableOrder(orderId);
          if (printResponse && printResponse.data) {
            orderData = printResponse.data;
            console.log(
              "Dati ordine recuperati da endpoint di stampa:",
              orderData
            );
          }
        } catch (printError) {
          console.log(
            "Endpoint di stampa fallito, tento alternative:",
            printError
          );
        }

        // Se non è riuscito, prova con l'endpoint admin
        if (!orderData) {
          try {
            const adminResponse = await api.getAdminOrderById(orderId);
            if (adminResponse && adminResponse.data) {
              orderData = adminResponse.data;
              console.log(
                "Dati ordine recuperati da endpoint admin:",
                orderData
              );
            }
          } catch (adminError) {
            console.log(
              "Endpoint admin fallito, tento endpoint standard:",
              adminError
            );

            // Ultima risorsa: endpoint standard
            const stdResponse = await api.getOrderById(orderId);
            if (stdResponse && stdResponse.data) {
              orderData = stdResponse.data;
              console.log(
                "Dati ordine recuperati da endpoint standard:",
                orderData
              );
            }
          }
        }

        // Se abbiamo i dati dell'ordine, procedi
        if (orderData) {
          // Normalizza i dati dell'ordine per garantire una struttura consistente
          const normalizedOrder = {
            ...orderData,
            orderDate: orderData.orderDate || orderData.createdAt,
            orderNumber:
              orderData.orderNumber || `ORD-${orderData._id.substring(0, 6)}`,
            status: orderData.status || "pending",
            paymentStatus: orderData.paymentStatus || "pending",
            totalPrice: orderData.totalPrice || 0,
            machines: Array.isArray(orderData.machines)
              ? orderData.machines
              : [],
          };

          // Se è un ordine del formato vecchio con un solo computer
          if (
            (!normalizedOrder.machines ||
              normalizedOrder.machines.length === 0) &&
            normalizedOrder.machineId
          ) {
            normalizedOrder.machines = [
              {
                machineId: normalizedOrder.machineId,
                machineType: normalizedOrder.machineType || "custom",
                name: normalizedOrder.machineName || "Configurazione PC",
                price: normalizedOrder.totalPrice,
                quantity: 1,
                components: normalizedOrder.components || {},
              },
            ];
          }

          setOrder(normalizedOrder);

          // MIGLIORAMENTO: Recupera sempre i dati cliente direttamente dall'API
          if (orderData.userId) {
            try {
              // Assicurati di usare l'ID corretto, potrebbe essere un oggetto o una stringa
              const userId =
                typeof orderData.userId === "object"
                  ? orderData.userId._id
                  : orderData.userId;
              console.log("Recupero dati utente con ID:", userId);

              // Chiamata API esplicita per ottenere i dati utente completi
              const userResponse = await api.getUserById(userId);

              if (userResponse && userResponse.data) {
                // Imposta i dati utente completi
                setCustomer(userResponse.data);
                console.log(
                  "Dati utente recuperati correttamente:",
                  userResponse.data
                );
              } else {
                throw new Error("La risposta API non contiene dati utente");
              }
            } catch (userError) {
              console.error("Errore nel recupero dei dati utente:", userError);
              console.error("Dettagli errore:", userError.response?.data);

              // Fallback: usa i dati di spedizione o i dati parziali disponibili
              let fallbackCustomer = null;

              // Prima opzione: dati utente parziali nell'ordine
              if (
                typeof orderData.userId === "object" &&
                orderData.userId.email
              ) {
                fallbackCustomer = orderData.userId;
                console.log(
                  "Usando dati utente parziali dall'ordine:",
                  fallbackCustomer
                );
              }
              // Seconda opzione: dati di spedizione
              else if (orderData.shippingAddress) {
                fallbackCustomer = {
                  name: orderData.shippingAddress.name || "",
                  surname: orderData.shippingAddress.surname || "",
                  email: orderData.email || orderData.customerEmail || "",
                  phone: orderData.shippingAddress.phone || "",
                  address: orderData.shippingAddress,
                };
                console.log(
                  "Usando dati di spedizione come fallback:",
                  fallbackCustomer
                );
              }

              setCustomer(fallbackCustomer);
            }
          } else {
            console.warn("Ordine senza riferimento all'utente (userId)");

            // Usa i dati disponibili nell'ordine
            const fallbackCustomer = {
              name:
                orderData.customerName || orderData.shippingAddress?.name || "",
              surname:
                orderData.customerSurname ||
                orderData.shippingAddress?.surname ||
                "",
              email: orderData.email || orderData.customerEmail || "",
              phone: orderData.phone || orderData.shippingAddress?.phone || "",
              address: orderData.shippingAddress || {},
            };

            setCustomer(fallbackCustomer);
            console.log(
              "Creato cliente di fallback dai dati ordine:",
              fallbackCustomer
            );
          }
        } else {
          throw new Error("Dati dell'ordine non disponibili");
        }
      } catch (err) {
        console.error("Errore nel recupero dei dati dell'ordine:", err);
        setError(
          "Impossibile caricare i dati dell'ordine. Verifica di avere i permessi necessari o che l'ID ordine sia corretto."
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-3">Caricamento dati dell'ordine in corso...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="mt-3">
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Torna indietro
          </button>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Ordine non trovato</Alert>
        <div className="mt-3">
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> Torna indietro
          </button>
        </div>
      </Container>
    );
  }

  return <OrderPrintView order={order} customer={customer} />;
};

export default PrintableOrderPage;
