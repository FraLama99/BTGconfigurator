import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button, Spinner } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddStorageForm from "../../component/admin/storage/AddStorageForm";
import EditStorageModal from "../../component/admin/storage/EditStorageModal";
import DeleteStorageModal from "../../component/admin/storage/DeleteStorageModal";
import StoragesTable from "../../component/admin/storage/StoragesTable";

const ManageStorage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  // Stati
  const [storageDevices, setStorageDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState(null);
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
        fetchStorage();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Funzione per recuperare i dispositivi di storage
  const fetchStorage = async () => {
    try {
      setLoading(true);
      const response = await api.getStorages();
      setStorageDevices(response.data);
    } catch (error) {
      console.error(
        "Errore nel recupero dei dispositivi di archiviazione:",
        error
      );
      setError(
        "Impossibile caricare i dispositivi di archiviazione. Riprova più tardi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Funzione per preparare i dati per il backend
  const prepareDataForBackend = (formData) => {
    const data = { ...formData };

    // Converti campi numerici
    data.capacity = Number(data.capacity) || 0;
    data.readSpeed = Number(data.readSpeed) || 0;
    data.writeSpeed = Number(data.writeSpeed) || 0;
    data.cache = Number(data.cache) || 0;
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
        "Dati del dispositivo preparati per il backend:",
        preparedData
      );

      // Crea il dispositivo
      const response = await api.createStorage(preparedData);

      // Se c'è un'immagine, caricala
      if (image) {
        const storageId = response.data._id || response.data.storage._id;
        const formData = new FormData();
        formData.append("image", image);
        await api.updateStorageImage(storageId, formData);
      }

      setSuccess("Dispositivo di archiviazione creato con successo!");
      fetchStorage();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione del dispositivo:", error);
      setError(
        "Errore nella creazione del dispositivo. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per la modifica
  const handleEditClick = (device) => {
    console.log("Dispositivo originale:", device);

    // Creiamo un oggetto completamente nuovo con i dati estratti correttamente
    const safeDevice = {
      _id: device._id,
      name: device.name || "",
      brand: device.brand || "",
      model: device.model || "",
      type: device.type || "",
      capacity: device.capacity || 0,
      formFactor: device.formFactor || "",
      interface: device.interface || "",
      readSpeed: device.readSpeed || 0,
      writeSpeed: device.writeSpeed || 0,
      cache: device.cache || 0,
      price: device.price || 0,
      stock: device.stock || 0,
      description: device.description || "",
      imageUrl: device.imageUrl || "",
    };

    console.log("Dispositivo preparato per modifica:", safeDevice);
    setEditingDevice(safeDevice);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      console.log(`Cambiato checkbox ${name} a ${checked}`);
      setEditingDevice((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setEditingDevice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingDevice((prev) => ({
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

      if (!editingDevice) {
        setError("Nessun dispositivo da modificare");
        setLoading(false);
        return;
      }

      console.log(
        "Dati del dispositivo prima della preparazione:",
        editingDevice
      );

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(editingDevice);
      console.log(
        "Dati del dispositivo preparati per l'aggiornamento:",
        preparedData
      );

      // Aggiorna il dispositivo
      await api.updateStorage(editingDevice._id, preparedData);

      // Se c'è una nuova immagine, caricala separatamente
      if (editingDevice.newImage) {
        const formData = new FormData();
        formData.append("image", editingDevice.newImage);
        await api.updateStorageImage(editingDevice._id, formData);
      }

      setShowEditModal(false);
      setSuccess("Dispositivo di archiviazione aggiornato con successo!");
      fetchStorage();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento del dispositivo:", error);
      setError(
        "Errore nell'aggiornamento del dispositivo. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per l'eliminazione
  const handleDeleteClick = (device) => {
    setDeletingDevice(device);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deleteStorage(deletingDevice._id);
      setShowDeleteModal(false);
      setSuccess("Dispositivo di archiviazione eliminato con successo!");
      fetchStorage();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione del dispositivo:", error);
      setError("Errore nell'eliminazione del dispositivo. Riprova più tardi.");
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
        <h1 className="mb-4">Gestione Archiviazione</h1>

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
              Aggiungi Nuovo Dispositivo di Archiviazione
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
                <AddStorageForm
                  onSubmit={handleCreateSubmit}
                  loading={loading}
                />
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        <Card>
          <Card.Header as="h5">
            <i className="bi bi-device-hdd me-2"></i>
            Dispositivi di Archiviazione Disponibili
          </Card.Header>
          <Card.Body>
            <StoragesTable
              storageDevices={storageDevices}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        <EditStorageModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          device={editingDevice}
          onChange={handleEditChange}
          onImageChange={handleEditImageChange}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        <DeleteStorageModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          device={deletingDevice}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageStorage;
