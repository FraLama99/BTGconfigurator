import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Alert } from "react-bootstrap";
import { FaPrint, FaBug } from "react-icons/fa";
import Logo from "../../../src/assets/logo.png"; // Assicurati che il percorso sia corretto
import "../../styles/print.css";

const OrderPrintView = ({ order, customer }) => {
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    // Stampa i dati nel console per debug
    console.log("Dati ordine:", order);
    console.log("Dati cliente:", customer);
  }, [order, customer]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/D";
    try {
      return new Date(dateString).toLocaleDateString("it-IT");
    } catch (error) {
      return "Data non valida";
    }
  };

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("it-IT", {
      style: "currency",
      currency: "EUR",
    });
  };

  // Formatta lo stato dell'ordine
  const formatStatus = (status) => {
    switch (status) {
      case "pending":
        return "In attesa";
      case "processing":
        return "In lavorazione";
      case "assembled":
        return "Assemblato";
      case "shipped":
        return "Spedito";
      case "delivered":
        return "Consegnato";
      case "cancelled":
        return "Annullato";
      default:
        return status || "N/D";
    }
  };

  // Funzione di supporto per estrarre il nome dal componente

  // Ottieni un nome componente affidabile da vari formati possibili
  const getComponentName = (component) => {
    if (!component) return "N/D";

    // Se il componente ha direttamente un nome
    if (component.name) return component.name;

    // Se il componente ha un riferimento ad un altro oggetto con nome
    if (component.data && component.data.name) return component.data.name;

    // Se il componente è un ID con _id
    if (component._id) return `Componente #${component._id.substring(0, 6)}`;

    // Se il componente è una stringa (presumibilmente un ID)
    if (typeof component === "string")
      return `Componente #${component.substring(0, 6)}`;

    return "N/D";
  };

  // Ottieni il prezzo da vari formati possibili
  const getComponentPrice = (component) => {
    if (!component) return 0;

    // Prezzo diretto
    if (component.price) return component.price;

    // Prezzo nei dati
    if (component.data && component.data.price) return component.data.price;

    return 0;
  };

  // Funzione migliorata per il rendering dei componenti

  // Estrai tutti i componenti della macchina in modo sicuro
  const renderComponentDetails = (machine) => {
    if (!machine || !machine.components) {
      return <p>Dettagli componenti non disponibili</p>;
    }

    // Estrai i componenti in un formato più facile da utilizzare
    const components = machine.components;

    // Lista di tutti i possibili tipi di componenti
    const componentTypes = [
      { key: "cpu", label: "CPU" },
      { key: "motherboard", label: "Scheda Madre" },
      { key: "gpu", label: "GPU" },
      { key: "ram", label: "RAM" },
      { key: "storage", label: "Archiviazione" },
      { key: "case", label: "Case" },
      { key: "powerSupply", label: "Alimentatore" },
      { key: "cooling", label: "Sistema di raffreddamento" },
      { key: "fans", label: "Ventole" },
      { key: "os", label: "Sistema Operativo" },
      { key: "peripherals", label: "Periferiche" },
    ];

    return (
      <Table striped bordered>
        <thead>
          <tr>
            <th>Componente</th>
            <th>Dettagli</th>
            <th>Quantità</th>
            <th>Prezzo</th>
          </tr>
        </thead>
        <tbody>
          {componentTypes
            .map((type) => {
              const component = components[type.key];

              // Se il componente non esiste, saltalo
              if (!component) return null;

              // Gestione componente singolo o array di componenti
              if (Array.isArray(component)) {
                // Rendering per array di componenti (es. multiple RAM o storage)
                return component.map((item, idx) => (
                  <tr key={`${type.key}-${idx}`}>
                    <td>{idx === 0 ? <strong>{type.label}</strong> : ""}</td>
                    <td>{getComponentName(item)}</td>
                    <td>{item.quantity || 1}</td>
                    <td>{formatPrice(getComponentPrice(item))}</td>
                  </tr>
                ));
              } else {
                // Rendering per componente singolo
                return (
                  <tr key={type.key}>
                    <td>
                      <strong>{type.label}</strong>
                    </td>
                    <td>{getComponentName(component)}</td>
                    <td>{component.quantity || 1}</td>
                    <td>{formatPrice(getComponentPrice(component))}</td>
                  </tr>
                );
              }
            })
            .filter(Boolean)}{" "}
          {/* Filtra gli elementi null */}
        </tbody>
      </Table>
    );
  };

  return (
    <>
      <div className="print-actions no-print">
        <div className="d-flex justify-content-center gap-3 mb-4">
          <Button variant="primary" onClick={handlePrint}>
            <FaPrint className="me-2" /> Stampa Ordine
          </Button>

          <Button variant="outline-secondary" onClick={() => setDebug(!debug)}>
            <FaBug className="me-2" /> {debug ? "Nascondi" : "Mostra"} Debug
          </Button>
        </div>

        {debug && (
          <div className="debug-section mb-4 p-3 border rounded bg-light">
            <h5>Debug - Dati Completi</h5>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                onClick={() => console.log("Order data:", order)}
              >
                Log Order
              </Button>
              <Button
                size="sm"
                onClick={() => console.log("Customer data:", customer)}
              >
                Log Customer
              </Button>
            </div>
            <div
              style={{
                maxHeight: "300px",
                overflow: "auto",
                marginTop: "15px",
              }}
            >
              <h6>Dati Ordine:</h6>
              <pre
                className="bg-dark text-white p-2 rounded"
                style={{ fontSize: "10px" }}
              >
                {JSON.stringify(order, null, 2)}
              </pre>

              <h6>Dati Cliente:</h6>
              <pre
                className="bg-dark text-white p-2 rounded"
                style={{ fontSize: "10px" }}
              >
                {JSON.stringify(customer, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <Container className="print-container">
        {/* Intestazione */}
        <div className="print-header">
          <img
            src={Logo}
            alt="Logo Azienda"
            className="print-logo"
            style={{ maxWidth: "150px", height: "auto" }}
          />
          <h1 className="print-title">Dettaglio Ordine</h1>
        </div>

        {/* Informazioni Ordine */}
        <div className="print-section">
          <h2 className="print-section-title">Informazioni Ordine</h2>
          <Row>
            <Col md={6}>
              <p>
                <strong>Numero Ordine:</strong>{" "}
                {order.orderNumber || order._id.substring(0, 8)}
              </p>
              <p>
                <strong>Data Ordine:</strong> {formatDate(order.orderDate)}
              </p>
              <p>
                <strong>Stato:</strong> {formatStatus(order.status)}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Pagamento:</strong>{" "}
                {order.paymentStatus === "completed"
                  ? "Pagato"
                  : "In attesa di pagamento"}
              </p>
              <p>
                <strong>Metodo di Pagamento:</strong>{" "}
                {order.paymentMethod || "N/D"}
              </p>
              <p>
                <strong>Totale Ordine:</strong> {formatPrice(order.totalPrice)}
              </p>
            </Col>
          </Row>
        </div>

        {/* Informazioni Cliente */}
        <div className="print-section">
          <h2 className="print-section-title">Informazioni Cliente</h2>
          {!customer && (
            <Alert variant="warning" className="no-print">
              Dati cliente non disponibili. Verranno mostrate solo le
              informazioni parziali.
            </Alert>
          )}
          <Row>
            <Col md={6}>
              <p>
                <strong>Nome:</strong> {customer?.name || "N/D"}
              </p>
              <p>
                <strong>Cognome:</strong> {customer?.surname || "N/D"}
              </p>
              <p>
                <strong>Email:</strong>{" "}
                {customer?.email || order?.email || "N/D"}
              </p>
              <p>
                <strong>Telefono:</strong>{" "}
                {customer?.phone || order?.shippingAddress?.phone || "N/D"}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Indirizzo:</strong>{" "}
                {customer?.address?.street ||
                  order?.shippingAddress?.street ||
                  "N/D"}
              </p>
              <p>
                <strong>Città:</strong>{" "}
                {customer?.address?.city ||
                  order?.shippingAddress?.city ||
                  "N/D"}
              </p>
              <p>
                <strong>CAP:</strong>{" "}
                {customer?.address?.zipCode ||
                  order?.shippingAddress?.zipCode ||
                  "N/D"}
              </p>
              <p>
                <strong>Paese:</strong>{" "}
                {customer?.address?.country ||
                  order?.shippingAddress?.country ||
                  "Italia"}
              </p>
            </Col>
          </Row>
        </div>

        {/* Prodotti dell'Ordine */}
        <div className="print-section">
          <h2 className="print-section-title">Prodotti Ordinati</h2>
          <Table striped bordered>
            <thead>
              <tr>
                <th>#</th>
                <th>Prodotto</th>
                <th>Prezzo</th>
                <th>Quantità</th>
                <th>Totale</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(order.machines) && order.machines.length > 0 ? (
                order.machines.map((machine, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{machine.name || "Configurazione PC"}</td>
                    <td>{formatPrice(machine.price)}</td>
                    <td>{machine.quantity || 1}</td>
                    <td>
                      {formatPrice(
                        (machine.price || 0) * (machine.quantity || 1)
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    Nessun prodotto trovato
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-end">
                  <strong>Totale Ordine:</strong>
                </td>
                <td>{formatPrice(order.totalPrice)}</td>
              </tr>
            </tfoot>
          </Table>
        </div>

        {/* Dettagli delle Configurazioni */}
        {Array.isArray(order.machines) &&
          order.machines.length > 0 &&
          order.machines.map((machine, index) => (
            <div key={index} className="print-section machine-details">
              <h2 className="print-section-title">
                Dettagli Configurazione #{index + 1}:{" "}
                {machine.name || "Configurazione PC"}
              </h2>
              {renderComponentDetails(machine)}
            </div>
          ))}

        {/* Note e Termini */}
        <div className="print-section">
          <h2 className="print-section-title">Note e Termini</h2>
          <p>
            <strong>Note:</strong> {order.notes || "Nessuna nota"}
          </p>
          <p>
            <small>
              * Tutti i prezzi sono comprensivi di IVA. La garanzia è di 2 anni
              dalla data di acquisto come da normativa vigente. Per assistenza:
              support@btg-pc.it
            </small>
          </p>
        </div>

        {/* Footer */}
        <div className="print-section text-center">
          <p>
            <small>
              BTG Computer Systems - Via Roma, 123 - 20100 Milano - P.IVA
              12345678901
            </small>
          </p>
          <p>
            <small>
              Documento generato il {new Date().toLocaleDateString("it-IT")}
            </small>
          </p>
        </div>
      </Container>
    </>
  );
};

export default OrderPrintView;
