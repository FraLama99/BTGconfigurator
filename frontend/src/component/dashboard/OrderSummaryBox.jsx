import React from "react";
import { Card, Row, Col, ProgressBar } from "react-bootstrap";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Registrazione dei componenti necessari per Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const OrderSummaryBox = ({ orders }) => {
  // Calcolo delle statistiche degli ordini
  const pendingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "processing"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const lateOrders = orders.filter((order) => {
    // Considera in ritardo se:
    // 1. Lo stato non è "delivered" o "cancelled"
    // 2. La data di consegna stimata è passata
    if (order.status === "delivered" || order.status === "cancelled")
      return false;

    const estimatedDate = new Date(order.estimatedDeliveryDate);
    const today = new Date();
    return estimatedDate < today;
  }).length;

  const totalOrders = orders.length;

  // Calcolo percentuali per il grafico
  const pendingPercentage =
    Math.round((pendingOrders / totalOrders) * 100) || 0;
  const completedPercentage =
    Math.round((completedOrders / totalOrders) * 100) || 0;
  const latePercentage = Math.round((lateOrders / totalOrders) * 100) || 0;

  // Dati per il grafico a torta
  const chartData = {
    labels: ["Da Evadere", "Evasi", "In Ritardo"],
    datasets: [
      {
        data: [pendingOrders, completedOrders, lateOrders],
        backgroundColor: ["#ffc107", "#198754", "#dc3545"],
        borderWidth: 1,
      },
    ],
  };

  // Opzioni per il grafico
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Riepilogo Ordini</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={8}>
            <div className="d-flex justify-content-between mb-3">
              <div className="text-center px-3">
                <h3 className="text-warning">{pendingOrders}</h3>
                <p className="mb-0">Da Evadere</p>
                <ProgressBar
                  now={pendingPercentage}
                  variant="warning"
                  className="mt-2"
                  label={`${pendingPercentage}%`}
                />
              </div>
              <div className="text-center px-3">
                <h3 className="text-success">{completedOrders}</h3>
                <p className="mb-0">Evasi</p>
                <ProgressBar
                  now={completedPercentage}
                  variant="success"
                  className="mt-2"
                  label={`${completedPercentage}%`}
                />
              </div>
              <div className="text-center px-3">
                <h3 className="text-danger">{lateOrders}</h3>
                <p className="mb-0">In Ritardo</p>
                <ProgressBar
                  now={latePercentage}
                  variant="danger"
                  className="mt-2"
                  label={`${latePercentage}%`}
                />
              </div>
            </div>
            <p className="text-center text-muted">
              Totale ordini: <strong>{totalOrders}</strong>
            </p>
          </Col>
          <Col md={4}>
            <div style={{ height: "180px" }}>
              <Pie data={chartData} options={chartOptions} />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default OrderSummaryBox;
