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

  const handleCreateSubmit = async (formData, image) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Prima crea la CPU con i dati di base
      const cpuData = { ...formData };

      // Converti valori numerici se necessario
      if (cpuData.price) cpuData.price = Number(cpuData.price);
      if (cpuData.tdp) cpuData.tdp = Number(cpuData.tdp);
      if (cpuData.cores) cpuData.cores = Number(cpuData.cores);
      if (cpuData.threads) cpuData.threads = Number(cpuData.threads);
      if (cpuData.baseClock) cpuData.baseClock = Number(cpuData.baseClock);
      if (cpuData.boostClock) cpuData.boostClock = Number(cpuData.boostClock);
      if (cpuData.stock) cpuData.stock = Number(cpuData.stock);

      // Crea la CPU senza l'immagine
      const response = await api.createCPU(cpuData);
      const newCpuId = response.data._id;

      // 2. Poi, se c'è un'immagine, caricala separatamente
      let imageUploadError = null;
      if (image && image instanceof File) {
        try {
          const formData = new FormData();
          formData.append("image", image);

          console.log(
            "Tentativo di caricamento immagine per nuova CPU:",
            image.name
          );

          // API specifica per caricare solo l'immagine
          await api.updateCPUImage(newCpuId, formData);
        } catch (imageError) {
          console.error(
            "Errore nel caricamento dell'immagine per nuova CPU:",
            imageError
          );
          imageUploadError =
            "La CPU è stata creata, ma l'immagine non è stata caricata. " +
            (imageError.response?.data?.message ||
              "Verifica il formato e la dimensione.");
        }
      }

      if (imageUploadError) {
        setSuccess(
          "CPU creata con successo, ma c'è stato un problema con l'immagine."
        );
        setError(imageUploadError);
      } else {
        setSuccess("CPU creata con successo!");
      }

      fetchCPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione della CPU:", error);
      setError(
        "Errore nella creazione della CPU: " +
          (error.response?.data?.message || "Verifica i dati e riprova.")
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // 1. Prima aggiorna i dati della CPU (senza l'immagine)
      const cpuData = { ...editingCpu };

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
      fieldsToRemove.forEach((field) => delete cpuData[field]);

      // Converti valori numerici se necessario
      if (cpuData.price) cpuData.price = Number(cpuData.price);
      if (cpuData.tdp) cpuData.tdp = Number(cpuData.tdp);
      if (cpuData.cores) cpuData.cores = Number(cpuData.cores);
      if (cpuData.threads) cpuData.threads = Number(cpuData.threads);
      if (cpuData.baseClock) cpuData.baseClock = Number(cpuData.baseClock);
      if (cpuData.boostClock) cpuData.boostClock = Number(cpuData.boostClock);
      if (cpuData.stock) cpuData.stock = Number(cpuData.stock);

      // Effettua l'update dei dati
      await api.updateCPU(editingCpu._id, cpuData);

      // 2. Poi, se c'è una nuova immagine, gestiscila separatamente
      let imageUploadError = null;
      if (editingCpu.newImage && editingCpu.newImage instanceof File) {
        try {
          const formData = new FormData();
          formData.append("image", editingCpu.newImage);

          console.log(
            "Tentativo di caricamento immagine CPU:",
            editingCpu.newImage.name,
            {
              tipo: editingCpu.newImage.type,
              dimensione: `${(editingCpu.newImage.size / 1024).toFixed(2)} KB`,
            }
          );

          // API specifica per caricare solo l'immagine
          await api.updateCPUImage(editingCpu._id, formData);
        } catch (imageError) {
          console.error(
            "Errore nel caricamento dell'immagine CPU:",
            imageError
          );
          imageUploadError =
            "L'immagine della CPU non è stata aggiornata. " +
            (imageError.response?.data?.message ||
              "Verifica il formato e la dimensione.");
        }
      }

      setShowEditModal(false);
      fetchCPUs();

      if (imageUploadError) {
        setSuccess(
          "CPU aggiornata con successo, ma c'è stato un problema con l'immagine."
        );
        setError(imageUploadError);
      } else {
        setSuccess("CPU aggiornata con successo!");
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento della CPU:", error);
      setError(
        "Errore nell'aggiornamento della CPU: " +
          (error.response?.data?.message || "Verifica i dati e riprova.")
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
