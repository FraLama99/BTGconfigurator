import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button, Spinner } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddCpuForm from "../../component/admin/cpu/AddCpuForm";
import EditCpuModal from "../../component/admin/cpu/EditCpuModal";
import DeleteCpuModal from "../../component/admin/cpu/DeleteCpuModal";
import CpusTable from "../../component/admin/cpu/CpusTable";

const ManageCPUs = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    decodedToken,
    debugToken,
  } = useAuth();

  const [cpus, setCpus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingCpu, setEditingCpu] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingCpu, setDeletingCpu] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/login");
      } else {
        fetchCPUs();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const fetchCPUs = async () => {
    try {
      setLoading(true);
      const response = await api.getCPUs();
      setCpus(response.data);
    } catch (error) {
      console.error("Errore nel recupero delle CPU:", error);
      setError("Impossibile caricare le CPU. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Aggiungi questa funzione per preparare i dati
  const prepareDataForBackend = (formData) => {
    const data = { ...formData };

    // Converti valori numerici se necessario
    data.price = Number(data.price) || 0;
    data.tdp = Number(data.tdp) || 0;
    data.cores = Number(data.cores) || 0;
    data.threads = Number(data.threads) || 0;
    data.baseClock = Number(data.baseClock) || 0;
    data.boostClock = Number(data.boostClock) || 0;
    data.stock = Number(data.stock) || 0;

    // Gestisci booleani
    data.integratedGraphics = Boolean(data.integratedGraphics);

    return data;
  };

  // Modifica handleCreateSubmit
  const handleCreateSubmit = async (formData, image) => {
    try {
      setLoading(true);
      setError(null);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(formData);
      console.log("Dati della CPU preparati per il backend:", preparedData);

      // Crea la CPU
      const response = await api.createCPU(preparedData);
      const newCpuId = response.data._id || response.data.cpu._id;

      console.log("Risposta dalla creazione CPU:", response.data);
      console.log("ID della CPU creata:", newCpuId);

      // Se c'è un'immagine, caricala separatamente
      if (image && image instanceof File) {
        try {
          const formData = new FormData();
          formData.append("image", image);

          console.log("Caricamento immagine per CPU:", {
            id: newCpuId,
            nome: image.name,
            tipo: image.type,
            dimensione: `${(image.size / 1024).toFixed(2)} KB`,
          });

          // Usa un timeout prima di caricare l'immagine per assicurarsi che il server abbia
          // finito di elaborare la creazione della CPU
          await new Promise((resolve) => setTimeout(resolve, 300));

          // API specifica per caricare solo l'immagine
          await api.updateCPUImage(newCpuId, formData);
          console.log("Immagine caricata con successo");
        } catch (imageError) {
          console.error("Errore dettagliato caricamento immagine:", imageError);

          if (imageError.response) {
            console.error("Risposta server:", imageError.response.data);
            console.error("Status:", imageError.response.status);
          }

          // Impostare un messaggio di avviso ma non interrompere il flusso
          setError(
            "La CPU è stata creata, ma l'immagine non è stata caricata. " +
              (imageError.response?.data?.message ||
                "Verifica il formato e la dimensione.")
          );
        }
      }

      setSuccess("CPU creata con successo!");
      fetchCPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore completo nella creazione della CPU:", error);
      setError(
        "Errore nella creazione della CPU: " +
          (error.response?.data?.message ||
            error.message ||
            "Verifica i dati e riprova.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (cpu) => {
    setEditingCpu({
      ...cpu,
      integratedGraphics: cpu.integratedGraphics || false,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingCpu({
      ...editingCpu,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingCpu({
        ...editingCpu,
        newImage: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  // Modifica anche handleEditSubmit in modo simile
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (!editingCpu) {
        setError("Nessuna CPU da modificare");
        setLoading(false);
        return;
      }

      console.log("Dati della CPU prima della preparazione:", editingCpu);

      // Crea un nuovo oggetto escludendo campi non necessari
      const cpuToUpdate = { ...editingCpu };
      // Rimuovi i campi che non devono essere inviati
      const fieldsToRemove = [
        "_id",
        "createdAt",
        "updatedAt",
        "__v",
        "newImage",
        "imagePreview",
        "image",
      ];
      fieldsToRemove.forEach((field) => delete cpuToUpdate[field]);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(cpuToUpdate);
      console.log(
        "Dati della CPU preparati per l'aggiornamento:",
        preparedData
      );

      // Aggiorna la CPU
      await api.updateCPU(editingCpu._id, preparedData);

      // Se c'è una nuova immagine, caricala separatamente
      if (editingCpu.newImage && editingCpu.newImage instanceof File) {
        try {
          const formData = new FormData();
          formData.append("image", editingCpu.newImage);

          console.log("Caricamento immagine per CPU:", {
            id: editingCpu._id,
            nome: editingCpu.newImage.name,
            tipo: editingCpu.newImage.type,
            dimensione: `${(editingCpu.newImage.size / 1024).toFixed(2)} KB`,
          });

          // Usa un timeout prima di caricare l'immagine
          await new Promise((resolve) => setTimeout(resolve, 300));

          // API specifica per caricare solo l'immagine
          await api.updateCPUImage(editingCpu._id, formData);
          console.log("Immagine aggiornata con successo");
        } catch (imageError) {
          console.error("Errore dettagliato caricamento immagine:", imageError);

          if (imageError.response) {
            console.error("Risposta server:", imageError.response.data);
            console.error("Status:", imageError.response.status);
          }

          // Non bloccare l'operazione ma mostra un avviso
          setError(
            "La CPU è stata aggiornata, ma l'immagine non è stata caricata. " +
              (imageError.response?.data?.message ||
                "Verifica il formato e la dimensione.")
          );
        }
      }

      setShowEditModal(false);
      setSuccess("CPU aggiornata con successo!");
      fetchCPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore completo nell'aggiornamento della CPU:", error);
      setError(
        "Errore nell'aggiornamento della CPU: " +
          (error.response?.data?.message ||
            error.message ||
            "Verifica i dati e riprova.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (cpu) => {
    setDeletingCpu(cpu);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deleteCPU(deletingCpu._id);
      setShowDeleteModal(false);
      setSuccess("CPU eliminata con successo!");
      fetchCPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione della CPU:", error);
      setError("Errore nell'eliminazione della CPU. Riprova più tardi.");
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
        <h1 className="mb-4">Gestione CPU</h1>

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
              Aggiungi Nuova CPU
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
                <AddCpuForm onSubmit={handleCreateSubmit} loading={loading} />
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        <Card>
          <Card.Header as="h5">
            <i className="bi bi-cpu me-2"></i>
            CPU Disponibili
          </Card.Header>
          <Card.Body>
            <CpusTable
              cpus={cpus}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        <EditCpuModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          cpu={editingCpu}
          onChange={handleEditChange}
          onImageChange={handleEditImageChange}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        <DeleteCpuModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          cpu={deletingCpu}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageCPUs;
