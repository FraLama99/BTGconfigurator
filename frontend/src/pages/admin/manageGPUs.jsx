import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddGPUForm from "../../component/admin/gpu/AddGPUForm";
import EditGPUModal from "../../component/admin/gpu/EditGPUModal";
import DeleteGPUModal from "../../component/admin/gpu/DeleteGPUModal";
import GPUsTable from "../../component/admin/gpu/GPUsTable";

const ManageGPUs = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  // Stati
  const [gpus, setGpus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingGpu, setEditingGpu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingGpu, setDeletingGpu] = useState(null);
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
        fetchGPUs();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Funzione per recuperare le GPU
  const fetchGPUs = async () => {
    try {
      setLoading(true);
      const response = await api.getGPUs();
      setGpus(response.data);
    } catch (error) {
      console.error("Errore nel recupero delle GPU:", error);
      setError("Impossibile caricare le GPU. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Funzione per preparare i dati per il backend
  const prepareDataForBackend = (formData) => {
    const data = { ...formData };

    // Converti campi numerici
    data.vram = Number(data.vram) || 0;
    data.coreClock = Number(data.coreClock) || 0;
    data.boostClock = Number(data.boostClock) || 0;
    data.length = Number(data.length) || 0;
    data.tdp = Number(data.tdp) || 0;
    data.displayPorts = Number(data.displayPorts) || 0;
    data.hdmiPorts = Number(data.hdmiPorts) || 0;
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
      console.log("Dati della GPU preparati per il backend:", preparedData);

      // Crea la GPU
      const response = await api.createGPU(preparedData);

      // Se c'è un'immagine, caricala separatamente
      if (image) {
        const gpuId = response.data._id || response.data.gpu._id;
        const formData = new FormData();
        formData.append("image", image);
        await api.updateGPUImage(gpuId, formData);
      }

      setSuccess("GPU creata con successo!");
      fetchGPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione della GPU:", error);
      setError("Errore nella creazione della GPU. Verifica i dati e riprova.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers per la modifica
  const handleEditClick = (gpu) => {
    console.log("GPU originale:", gpu);

    // Creiamo un oggetto completamente nuovo con i dati estratti correttamente
    const safeGpu = {
      _id: gpu._id,
      name: gpu.name || "",
      brand: gpu.brand || "",
      model: gpu.model || "",
      chipset: gpu.chipset || "",
      vram: gpu.vram || 0,
      vramType: gpu.vramType || "",
      coreClock: gpu.coreClock || 0,
      boostClock: gpu.boostClock || 0,
      length: gpu.length || 0,
      tdp: gpu.tdp || 0,
      powerConnectors: gpu.powerConnectors || "",
      displayPorts: gpu.displayPorts || 0,
      hdmiPorts: gpu.hdmiPorts || 0,
      price: gpu.price || 0,
      stock: gpu.stock || 0,
      description: gpu.description || "",
      imageUrl: gpu.imageUrl || "",
    };

    console.log("GPU preparata per modifica:", safeGpu);
    setEditingGpu(safeGpu);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      console.log(`Cambiato checkbox ${name} a ${checked}`);
      setEditingGpu((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setEditingGpu((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingGpu((prev) => ({
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

      if (!editingGpu) {
        setError("Nessuna GPU da modificare");
        setLoading(false);
        return;
      }

      console.log("Dati della GPU prima della preparazione:", editingGpu);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(editingGpu);
      console.log(
        "Dati della GPU preparati per l'aggiornamento:",
        preparedData
      );

      // Aggiorna la GPU
      await api.updateGPU(editingGpu._id, preparedData);

      // Se c'è una nuova immagine, caricala separatamente
      if (editingGpu.newImage) {
        const formData = new FormData();
        formData.append("image", editingGpu.newImage);
        await api.updateGPUImage(editingGpu._id, formData);
      }

      setShowEditModal(false);
      setSuccess("GPU aggiornata con successo!");
      fetchGPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento della GPU:", error);
      setError(
        "Errore nell'aggiornamento della GPU. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per l'eliminazione
  const handleDeleteClick = (gpu) => {
    setDeletingGpu(gpu);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deleteGPU(deletingGpu._id);
      setShowDeleteModal(false);
      setSuccess("GPU eliminata con successo!");
      fetchGPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione della GPU:", error);
      setError("Errore nell'eliminazione della GPU. Riprova più tardi.");
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
        <h1 className="mb-4">Gestione GPU</h1>

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
              Aggiungi Nuova GPU
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
                <AddGPUForm onSubmit={handleCreateSubmit} loading={loading} />
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        <Card>
          <Card.Header as="h5">
            <i className="bi bi-gpu-card me-2"></i>
            GPU Disponibili
          </Card.Header>
          <Card.Body>
            <GPUsTable
              gpus={gpus}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        <EditGPUModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          gpu={editingGpu}
          onChange={handleEditChange}
          onImageChange={handleEditImageChange}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        <DeleteGPUModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          gpu={deletingGpu}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageGPUs;
