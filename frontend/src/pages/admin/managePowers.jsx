import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddPowerForm from "../../component/admin/power/AddPowerForm";
import EditPowerModal from "../../component/admin/power/EditPowerModal";
import DeletePowerModal from "../../component/admin/power/DeletePowerModal";
import PowersTable from "../../component/admin/power/PowersTable";

const ManagePowers = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  // Stati
  const [powers, setPowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingPower, setEditingPower] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingPower, setDeletingPower] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Verifica autenticazione
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/login");
      } else {
        fetchPowers();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Funzione per recuperare gli alimentatori
  const fetchPowers = async () => {
    try {
      setLoading(true);
      const response = await api.getPowerSupplies();
      setPowers(response.data);
    } catch (error) {
      console.error("Errore nel recupero degli alimentatori:", error);
      setError("Impossibile caricare gli alimentatori. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Funzione per preparare i dati per il backend
  const prepareDataForBackend = (formData) => {
    const data = { ...formData };

    // Converti campi numerici
    data.wattage = Number(data.wattage) || 0;
    data.price = Number(data.price) || 0;
    data.stock = Number(data.stock) || 0;

    return data;
  };

  // Handler per l'invio del form di creazione
  const handleCreateSubmit = async (formData, image) => {
    try {
      setLoading(true);
      setError(null);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(formData);
      console.log(
        "Dati dell'alimentatore preparati per il backend:",
        preparedData
      );

      // Crea l'alimentatore
      const response = await api.createPowerSupply(preparedData);

      // Se c'è un'immagine, caricala separatamente
      if (image) {
        const powerId = response.data._id || response.data.power._id;
        const formData = new FormData();
        formData.append("image", image);
        await api.updatePowerSupplyImage(powerId, formData);
      }

      setSuccess("Alimentatore creato con successo!");
      fetchPowers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione dell'alimentatore:", error);
      setError(
        "Errore nella creazione dell'alimentatore. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per la modifica
  const handleEditClick = (power) => {
    console.log("Alimentatore originale:", power);

    // Creiamo un oggetto completamente nuovo con i dati estratti correttamente
    const safePower = {
      _id: power._id,
      name: power.name || "",
      brand: power.brand || "",
      model: power.model || "",
      wattage: power.wattage || 0,
      efficiency: power.efficiency || "",
      modular: power.modular || "",
      formFactor: power.formFactor || "",
      price: power.price || 0,
      stock: power.stock || 0,
      description: power.description || "",
      imageUrl: power.imageUrl || "",
    };

    console.log("Alimentatore preparato per modifica:", safePower);
    setEditingPower(safePower);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      console.log(`Cambiato checkbox ${name} a ${checked}`);
      setEditingPower((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setEditingPower((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingPower((prev) => ({
        ...prev,
        newImage: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!editingPower) {
        setError("Nessun alimentatore da modificare");
        setLoading(false);
        return;
      }

      console.log(
        "Dati dell'alimentatore prima della preparazione:",
        editingPower
      );

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(editingPower);
      console.log(
        "Dati dell'alimentatore preparati per l'aggiornamento:",
        preparedData
      );

      // Aggiorna l'alimentatore
      await api.updatePowerSupply(editingPower._id, preparedData);

      // Se c'è una nuova immagine, caricala separatamente
      if (editingPower.newImage) {
        const formData = new FormData();
        formData.append("image", editingPower.newImage);
        await api.updatePowerSupplyImage(editingPower._id, formData);
      }

      setShowEditModal(false);
      setSuccess("Alimentatore aggiornato con successo!");
      fetchPowers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'alimentatore:", error);
      setError(
        "Errore nell'aggiornamento dell'alimentatore. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per l'eliminazione
  const handleDeleteClick = (power) => {
    setDeletingPower(power);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deletePowerSupply(deletingPower._id);
      setShowDeleteModal(false);
      setSuccess("Alimentatore eliminato con successo!");
      fetchPowers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione dell'alimentatore:", error);
      setError(
        "Errore nell'eliminazione dell'alimentatore. Riprova più tardi."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return null; // O un loader appropriato
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="d-flex">
      <SideAdmin />
      <div
        style={{
          marginLeft: "250px",
          width: "calc(100% - 250px)",
          padding: "20px",
        }}
      >
        <h1 className="mb-4">Gestione Alimentatori</h1>

        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Card className="mb-4">
          <Card.Header
            as="h5"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <i
                className={`bi ${
                  showAddForm ? "bi-dash-circle" : "bi-plus-circle"
                } me-2`}
              ></i>
              Aggiungi Nuovo Alimentatore
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddForm(!showAddForm);
              }}
            >
              {showAddForm ? "Chiudi" : "Apri"}
            </Button>
          </Card.Header>

          <Collapse in={showAddForm}>
            <div>
              <Card.Body>
                <AddPowerForm onSubmit={handleCreateSubmit} loading={loading} />
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        <Card>
          <Card.Header as="h5">
            <i className="bi bi-battery-charging me-2"></i>
            Alimentatori Disponibili
          </Card.Header>
          <Card.Body>
            <PowersTable
              powers={powers}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        <EditPowerModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          power={editingPower}
          onChange={handleEditChange}
          onImageChange={handleEditImageChange}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        <DeletePowerModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          power={deletingPower}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManagePowers;
