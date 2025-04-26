import React from "react";
import { Table, Button, Badge, Alert, Spinner } from "react-bootstrap";

const PresetsTable = ({ presets, loading, onEdit, onDelete }) => {
  // Formatta il prezzo
  const formatPrice = (price) => {
    return Number(price).toFixed(2);
  };

  // Filtra le configurazioni per mostrare solo gaming, entry-level e high-end
  const filteredPresets = presets.filter(
    (preset) =>
      preset.category === "gaming" ||
      preset.category === "entry-level" ||
      preset.category === "high-end"
  );

  if (loading && !filteredPresets.length) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (!filteredPresets.length) {
    return (
      <Alert variant="info">
        Nessuna configurazione gaming disponibile. Crea la tua prima
        configurazione utilizzando il form sopra.
      </Alert>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Componenti Principali</th>
            <th style={{ width: "120px" }}>Prezzo Base</th>
            <th style={{ width: "100px" }}>Stato</th>
            <th style={{ width: "180px" }}>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {filteredPresets.map((preset) => (
            <tr key={preset._id}>
              <td>
                <strong>{preset.name}</strong>
                {preset.description && (
                  <div className="text-muted small">
                    {preset.description.length > 50
                      ? `${preset.description.substring(0, 50)}...`
                      : preset.description}
                  </div>
                )}
              </td>
              <td>
                <Badge bg="secondary">{preset.category}</Badge>
              </td>
              <td>
                <div>
                  <strong>CPU:</strong> {preset.components.cpu?.brand}{" "}
                  {preset.components.cpu?.model}
                </div>
                <div>
                  <strong>GPU:</strong> {preset.components.gpu?.brand}{" "}
                  {preset.components.gpu?.model}
                </div>
                <div>
                  <strong>RAM:</strong> {preset.components.ram?.capacity}GB{" "}
                  {preset.components.ram?.type}
                </div>
              </td>
              <td className="text-end">
                <strong>€ {formatPrice(preset.basePrice)}</strong>
              </td>
              <td className="text-center">
                <Badge
                  bg={
                    preset.isActive === true || preset.isActive === "true"
                      ? "success"
                      : "danger"
                  }
                >
                  {preset.isActive === true || preset.isActive === "true"
                    ? "Attivo"
                    : "Inattivo"}
                </Badge>
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => onEdit(preset)}
                >
                  <i className="bi bi-pencil"></i> Modifica
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(preset)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PresetsTable;
