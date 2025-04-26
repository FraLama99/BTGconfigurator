import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddCoolerForm from "../../component/admin/coolers/AddCoolerForm";
import EditCoolerModal from "../../component/admin/coolers/EditCoolerModal";
import DeleteCoolerModal from "../../component/admin/coolers/DeleteCoolerModal";
import CoolersTable from "../../component/admin/coolers/CoolersTable";

const ManageCoolers = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    debugToken,
  } = useAuth();

  // Stati
  const [coolers, setCoolers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingCooler, setEditingCooler] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingCooler, setDeletingCooler] = useState(null);
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
        fetchCoolers();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Funzione per recuperare i cooler
  const fetchCoolers = async () => {
    try {
      setLoading(true);
      const response = await api.getCoolers();
      setCoolers(response.data);
    } catch (error) {
      console.error("Errore nel recupero dei cooler:", error);
      setError("Impossibile caricare i cooler. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Funzione per preparare i dati per il backend
  const prepareDataForBackend = (formData) => {
    const data = { ...formData };

    // Converti campi numerici
    data.fanSize = Number(data.fanSize) || 0;
    data.fanCount = Number(data.fanCount) || 1;
    data.radiatorSize = Number(data.radiatorSize) || 0;
    data.height = Number(data.height) || 0;
    data.tdpRating = Number(data.tdpRating) || 0;
    data.price = Number(data.price) || 0;
    data.stock = Number(data.stock) || 0;

    // Gestisci array di socket
    if (typeof data.supportedSockets === "string") {
      data.supportedSockets = data.supportedSockets
        .split(",")
        .map((socket) => socket.trim())
        .filter((socket) => socket !== "");
    }

    // Converti booleani in stringhe
    if (typeof data.rgb === "boolean") {
      data.rgb = data.rgb ? "true" : "false";
    }

    return data;
  };

  // Handler per l'invio del form di creazione
  const handleCreateSubmit = async (formData, image) => {
    try {
      setLoading(true);
      setError(null);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(formData);
      console.log("Dati del cooler preparati per il backend:", preparedData);

      // Crea il cooler
      const response = await api.createCooler(preparedData);

      // Se c'è un'immagine, caricala separatamente
      if (image) {
        const coolerId = response.data._id || response.data.cooler._id;
        const formData = new FormData();
        formData.append("image", image);
        await api.updateCoolerImage(coolerId, formData);
      }

      setSuccess("Cooler creato con successo!");
      fetchCoolers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione del cooler:", error);
      setError("Errore nella creazione del cooler. Verifica i dati e riprova.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers per la modifica
  const handleEditClick = (cooler) => {
    console.log("Cooler originale:", cooler);

    // Creiamo un oggetto completamente nuovo con i dati estratti correttamente
    const safeCooler = {
      _id: cooler._id,
      name: cooler.name || "",
      brand: cooler.brand || "",
      model: cooler.model || "",
      type: cooler.type || "",
      // Converti l'array di socket in una stringa
      supportedSockets: Array.isArray(cooler.supportedSockets)
        ? cooler.supportedSockets.join(", ")
        : "",
      radiatorSize: cooler.radiatorSize || "",
      fanSize: cooler.fanSize || "",
      fanCount: cooler.fanCount || 1,
      height: cooler.height || "",
      rgb: cooler.rgb || false,
      tdpRating: cooler.tdpRating || "",
      price: cooler.price || 0,
      stock: cooler.stock || 0,
      description: cooler.description || "",
      imageUrl: cooler.imageUrl || "",
    };

    console.log("Cooler preparato per modifica:", safeCooler);
    setEditingCooler(safeCooler);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      console.log(`Cambiato checkbox ${name} a ${checked}`);
      setEditingCooler((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setEditingCooler((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingCooler((prev) => ({
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

      if (!editingCooler) {
        setError("Nessun cooler da modificare");
        setLoading(false);
        return;
      }

      console.log("Dati del cooler prima della preparazione:", editingCooler);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(editingCooler);
      console.log(
        "Dati del cooler preparati per l'aggiornamento:",
        preparedData
      );

      // Aggiorna il cooler
      await api.updateCooler(editingCooler._id, preparedData);

      // Se c'è una nuova immagine, caricala separatamente
      if (editingCooler.newImage) {
        const formData = new FormData();
        formData.append("image", editingCooler.newImage);
        await api.updateCoolerImage(editingCooler._id, formData);
      }

      setShowEditModal(false);
      setSuccess("Cooler aggiornato con successo!");
      fetchCoolers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento del cooler:", error);
      setError(
        "Errore nell'aggiornamento del cooler. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per l'eliminazione
  const handleDeleteClick = (cooler) => {
    setDeletingCooler(cooler);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deleteCooler(deletingCooler._id);
      setShowDeleteModal(false);
      setSuccess("Cooler eliminato con successo!");
      fetchCoolers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione del cooler:", error);
      setError("Errore nell'eliminazione del cooler. Riprova più tardi.");
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
        <h1 className="mb-4">Gestione Dissipatori CPU</h1>

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
              Aggiungi Nuovo Dissipatore
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
                <AddCoolerForm
                  onSubmit={handleCreateSubmit}
                  loading={loading}
                />
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        <Card>
          <Card.Header as="h5">
            <i className="bi bi-fan me-2"></i>
            Dissipatori Disponibili
          </Card.Header>
          <Card.Body>
            <CoolersTable
              coolers={coolers}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        <EditCoolerModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          cooler={editingCooler}
          onChange={handleEditChange}
          onImageChange={handleEditImageChange}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        <DeleteCoolerModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          cooler={deletingCooler}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageCoolers;
