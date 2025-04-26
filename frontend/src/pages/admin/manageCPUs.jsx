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

      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      if (image) {
        formDataToSend.append("image", image);
      }

      await api.createCPU(formDataToSend);

      setSuccess("CPU creata con successo!");
      fetchCPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione della CPU:", error);
      setError("Errore nella creazione della CPU. Verifica i dati e riprova.");
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

      const formDataToSend = new FormData();

      Object.keys(editingCpu).forEach((key) => {
        if (
          ![
            "_id",
            "createdAt",
            "updatedAt",
            "__v",
            "newImage",
            "imagePreview",
          ].includes(key)
        ) {
          formDataToSend.append(key, editingCpu[key]);
        }
      });

      if (editingCpu.newImage) {
        formDataToSend.append("image", editingCpu.newImage);
      }

      await api.updateCPU(editingCpu._id, formDataToSend);

      setShowEditModal(false);
      setSuccess("CPU aggiornata con successo!");
      fetchCPUs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento della CPU:", error);
      setError(
        "Errore nell'aggiornamento della CPU. Verifica i dati e riprova."
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
