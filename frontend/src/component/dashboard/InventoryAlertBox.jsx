import React, { useState, useEffect } from "react";
import { Card, Badge, ListGroup, Spinner } from "react-bootstrap";
import api from "../../utlis/api";

const InventoryAlertBox = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // Questa chiamata API dovrebbe recuperare tutti i componenti con le loro scorte
        const response = await api.getInventory();

        // Processiamo i dati dalla risposta API
        const allItems = [];

        // Estrai componenti da tutte le categorie e aggiungili all'array
        if (response.data && response.data.inventory) {
          const inventory = response.data.inventory;

          // Processa CPU
          if (inventory.cpus) {
            inventory.cpus.forEach((item) =>
              allItems.push({
                _id: item._id,
                name: item.name,
                stock: item.stock,
                type: "cpu",
                price: item.price,
              })
            );
          }

          // Processa Motherboard
          if (inventory.motherboards) {
            inventory.motherboards.forEach((item) =>
              allItems.push({
                _id: item._id,
                name: item.name,
                stock: item.stock,
                type: "motherboard",
                price: item.price,
              })
            );
          }

          // Processa RAM
          if (inventory.rams) {
            inventory.rams.forEach((item) =>
              allItems.push({
                _id: item._id,
                name: item.name,
                stock: item.stock,
                type: "ram",
                price: item.price,
              })
            );
          }

          // Processa GPU
          if (inventory.gpus) {
            inventory.gpus.forEach((item) =>
              allItems.push({
                _id: item._id,
                name: item.name,
                stock: item.stock,
                type: "gpu",
                price: item.price,
              })
            );
          }

          // Processa Storage
          if (inventory.storages) {
            inventory.storages.forEach((item) =>
              allItems.push({
                _id: item._id,
                name: item.name,
                stock: item.stock,
                type: "storage",
                price: item.price,
              })
            );
          }

          // Processa Power Supply
          if (inventory.powerSupplies) {
            inventory.powerSupplies.forEach((item) =>
              allItems.push({
                _id: item._id,
                name: item.name,
                stock: item.stock,
                type: "powerSupply",
                price: item.price,
              })
            );
          }

          // Processa Case
          if (inventory.cases) {
            inventory.cases.forEach((item) =>
              allItems.push({
                _id: item._id,
                name: item.name,
                stock: item.stock,
                type: "case",
                price: item.price,
              })
            );
          }

          // Processa Cooling
          if (inventory.coolings) {
            inventory.coolings.forEach((item) =>
              allItems.push({
                _id: item._id,
                name: item.name,
                stock: item.stock,
                type: "cooling",
                price: item.price,
              })
            );
          }
        }

        // Filtra solo quelli con stock <= 2
        const lowStockItems = allItems.filter((item) => item.stock <= 2);

        // Ordina per stock (i più bassi prima)
        lowStockItems.sort((a, b) => a.stock - b.stock);

        setInventory(lowStockItems);
        setError(null);
      } catch (error) {
        console.error("Errore nel caricamento dell'inventario:", error);
        setError("Impossibile caricare i dati dell'inventario");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Funzione per ottenere il tipo di componente in italiano
  const getComponentType = (type) => {
    switch (type) {
      case "cpu":
        return "Processore";
      case "gpu":
        return "Scheda Video";
      case "motherboard":
        return "Scheda Madre";
      case "ram":
        return "RAM";
      case "storage":
        return "Storage";
      case "powerSupply":
        return "Alimentatore";
      case "case":
        return "Case";
      case "cooling":
        return "Raffreddamento";
      default:
        return type;
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Avvisi Inventario</h5>
        <Badge bg={inventory.length > 0 ? "danger" : "success"} pill>
          {inventory.length}
        </Badge>
      </Card.Header>
      <Card.Body style={{ padding: 0 }}>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
            <p className="mb-0 mt-2">Caricamento inventario...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-3">{error}</div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-3">
            <i className="bi bi-check-circle text-success fs-4"></i>
            <p className="mb-0 mt-2">Nessun componente con scorte basse</p>
          </div>
        ) : (
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            <ListGroup variant="flush">
              {inventory.map((item) => (
                <ListGroup.Item
                  key={item._id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <Badge
                      bg={item.stock === 0 ? "danger" : "warning"}
                      className="me-2"
                    >
                      {item.stock === 0 ? "Terminato" : "Scorta bassa"}
                    </Badge>
                    <strong>{getComponentType(item.type)}</strong>: {item.name}
                  </div>
                  <div>
                    <Badge bg={item.stock === 0 ? "danger" : "warning"} pill>
                      {item.stock}
                    </Badge>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default InventoryAlertBox;
