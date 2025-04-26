import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button, Spinner } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddRAMForm from "../../component/admin/ram/AddRAMForm";
import EditRAMModal from "../../component/admin/ram/EditRAMModal";
import DeleteRAMModal from "../../component/admin/ram/DeleteRAMModal";
import RAMsTable from "../../component/admin/ram/RAMsTable";

const ManageRAMs = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    debugToken,
  } = useAuth();

  // Stati
  const [rams, setRAMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingRAM, setEditingRAM] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingRAM, setDeletingRAM] = useState(null);
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
        fetchRAMs();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Funzione per recuperare le RAM
  const fetchRAMs = async () => {
    try {
      setLoading(true);
      const response = await api.getRAMs();
      setRAMs(response.data);
    } catch (error) {
      console.error("Errore nel recupero delle RAM:", error);
      setError("Impossibile caricare le RAM. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Funzione per preparare i dati per il backend
  const prepareDataForBackend = (formData) => {
    const data = { ...formData };

    // Converti campi numerici
    data.capacity = Number(data.capacity) || 0;
    data.speed = Number(data.speed) || 0;
    data.casLatency = Number(data.casLatency) || 0;
    data.voltage = Number(data.voltage) || 0;
    data.kitSize = Number(data.kitSize) || 0;
    data.price = Number(data.price) || 0;
    data.stock = Number(data.stock) || 0;

    // Converti booleani in stringhe
    if (typeof data.hasRGB === "boolean") {
      data.hasRGB = data.hasRGB ? "true" : "false";
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
      console.log("Dati della RAM preparati per il backend:", preparedData);

      // Crea la RAM
      const response = await api.createRAM(preparedData);

      // Se c'è un'immagine, caricala
      if (image) {
        const ramId = response.data._id || response.data.ram._id;
        await api.updateRAMImage(ramId, image);
      }

      setSuccess("RAM creata con successo!");
      fetchRAMs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione della RAM:", error);
      setError("Errore nella creazione della RAM. Verifica i dati e riprova.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers per la modifica
  const handleEditClick = (ram) => {
    console.log("RAM originale:", ram);

    // Creiamo un oggetto completamente nuovo con i dati estratti correttamente
    const safeRAM = {
      _id: ram._id,
      name: ram.name || "",
      brand: ram.brand || "",
      model: ram.model || "",
      sku: ram.sku || "",
      memoryType: ram.memoryType || "",
      capacity: ram.capacity || 0,
      speed: ram.speed || 0,
      casLatency: ram.casLatency || 0,
      voltage: ram.voltage || 0,
      hasRGB: ram.hasRGB || false,
      kitSize: ram.kitSize || 0,
      price: ram.price || 0,
      stock: ram.stock || 0,
      description: ram.description || "",
      imageUrl: ram.imageUrl || "",
    };

    console.log("RAM preparata per modifica:", safeRAM);
    setEditingRAM(safeRAM);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      console.log(`Cambiato checkbox ${name} a ${checked}`);
      setEditingRAM((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setEditingRAM((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingRAM((prev) => ({
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

      if (!editingRAM) {
        setError("Nessuna RAM da modificare");
        setLoading(false);
        return;
      }

      console.log("Dati della RAM prima della preparazione:", editingRAM);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(editingRAM);
      console.log(
        "Dati della RAM preparati per l'aggiornamento:",
        preparedData
      );

      // Aggiorna la RAM
      await api.updateRAM(editingRAM._id, preparedData);

      // Se c'è una nuova immagine, caricala separatamente
      if (editingRAM.newImage) {
        await api.updateRAMImage(editingRAM._id, editingRAM.newImage);
      }

      setShowEditModal(false);
      setSuccess("RAM aggiornata con successo!");
      fetchRAMs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento della RAM:", error);
      setError(
        "Errore nell'aggiornamento della RAM. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per l'eliminazione
  const handleDeleteClick = (ram) => {
    setDeletingRAM(ram);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deleteRAM(deletingRAM._id);
      setShowDeleteModal(false);
      setSuccess("RAM eliminata con successo!");
      fetchRAMs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione della RAM:", error);
      setError("Errore nell'eliminazione della RAM. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Verifica autorizzazioni...</span>
        </Spinner>
      </div>
    );
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
        <h1 className="mb-4">Gestione RAM</h1>

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
              Aggiungi Nuova RAM
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
                <AddRAMForm onSubmit={handleCreateSubmit} loading={loading} />
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        <Card>
          <Card.Header as="h5">
            <i className="bi bi-memory me-2"></i>
            RAM Disponibili
          </Card.Header>
          <Card.Body>
            <RAMsTable
              rams={rams}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        <EditRAMModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          ram={editingRAM}
          onChange={handleEditChange}
          onImageChange={handleEditImageChange}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        <DeleteRAMModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          ram={deletingRAM}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageRAMs;
