import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddMotherboardForm from "../../component/admin/motherboards/AddMotherboardForm.jsx";
import EditMotherboardModal from "../../component/admin/motherboards/EditMotherboardModal";
import DeleteMotherboardModal from "../../component/admin/motherboards/DeleteMotherboardModal";
import MotherboardsTable from "../../component/admin/motherboards/MotherboardsTable";

const ManageMotherboards = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    decodedToken,
    debugToken,
  } = useAuth();

  // Stati
  const [motherboards, setMotherboards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingMotherboard, setEditingMotherboard] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingMotherboard, setDeletingMotherboard] = useState(null);
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
        fetchMotherboards();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Funzione per recuperare le schede madri
  const fetchMotherboards = async () => {
    try {
      setLoading(true);
      const response = await api.getMotherboards();
      setMotherboards(response.data);
    } catch (error) {
      console.error("Errore nel recupero delle schede madri:", error);
      setError("Impossibile caricare le schede madri. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Handler per l'invio del form di creazione
  const handleCreateSubmit = async (formData, image) => {
    try {
      setLoading(true);
      setError(null);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(formData);
      console.log(
        "Dati della scheda madre preparati per il backend:",
        preparedData
      );

      // Crea la scheda madre
      const response = await api.createMotherboard(preparedData);

      // Se c'è un'immagine, caricala separatamente
      if (image && image instanceof File) {
        try {
          const gpuId = response.data._id || response.data.motherboard._id;
          const imageFormData = new FormData();
          imageFormData.append("image", image); // Usa l'immagine passata come parametro, non editingGpu

          console.log("Tentativo di caricamento immagine:", image.name);
          await api.updateMotherboardImage(gpuId, imageFormData);
        } catch (imageError) {
          console.error("Dettagli errore immagine:", imageError);
          setError(
            `Scheda madre creata, ma c'è stato un problema con l'immagine: ${
              imageError.response?.data?.message || imageError.message
            }`
          );
        }
      }

      setSuccess("Scheda madre creata con successo!");
      fetchMotherboards();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione della scheda madre:", error);
      setError(
        "Errore nella creazione della scheda madre: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Funzione per preparare i dati per il backend
  const prepareDataForBackend = (formData) => {
    const data = { ...formData };

    // Estrai valori nidificati
    data.pcie_x16 = Number(data.pciSlots?.pcie_x16) || 0;
    data.pcie_x8 = Number(data.pciSlots?.pcie_x8) || 0;
    data.pcie_x4 = Number(data.pciSlots?.pcie_x4) || 0;
    data.pcie_x1 = Number(data.pciSlots?.pcie_x1) || 0;
    data.usb2 = Number(data.usbPorts?.usb2) || 0;
    data.usb3 = Number(data.usbPorts?.usb3) || 0;
    data.typeC = Number(data.usbPorts?.typeC) || 0;

    // Rimuovi oggetti annidati
    delete data.pciSlots;
    delete data.usbPorts;

    // Converti booleani in stringhe
    if (typeof data.wifiIncluded === "boolean") {
      data.wifiIncluded = data.wifiIncluded ? "true" : "false";
    }
    if (typeof data.bluetoothIncluded === "boolean") {
      data.bluetoothIncluded = data.bluetoothIncluded ? "true" : "false";
    }

    return data;
  };

  // Handlers per la modifica
  const handleEditClick = (motherboard) => {
    const safeMotherboard = {
      ...motherboard,
      pciSlots: motherboard.pciSlots || {
        pcie_x16: 0,
        pcie_x8: 0,
        pcie_x4: 0,
        pcie_x1: 0,
      },
      usbPorts: motherboard.usbPorts || {
        usb2: 0,
        usb3: 0,
        typeC: 0,
      },
      wifiIncluded: motherboard.wifiIncluded || false,
      bluetoothIncluded: motherboard.bluetoothIncluded || false,
    };
    setEditingMotherboard(safeMotherboard);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditingMotherboard({
        ...editingMotherboard,
        [parent]: {
          ...editingMotherboard[parent],
          [child]: type === "number" ? Number(value) || 0 : value,
        },
      });
    } else {
      setEditingMotherboard({
        ...editingMotherboard,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? Number(value) || 0
            : value,
      });
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingMotherboard({
        ...editingMotherboard,
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

      // Aggiorna dati
      const preparedData = prepareDataForBackend(editingMotherboard);
      await api.updateMotherboard(editingMotherboard._id, preparedData);

      // Gestisci immagine separatamente
      if (
        editingMotherboard.newImage &&
        editingMotherboard.newImage instanceof File
      ) {
        try {
          const formData = new FormData();
          formData.append("image", editingMotherboard.newImage);

          // Log per debug
          console.log(
            `Caricamento immagine: ${editingMotherboard.newImage.name}, tipo: ${editingMotherboard.newImage.type}, dimensione: ${editingMotherboard.newImage.size} bytes`
          );

          // NON impostare manualmente il Content-Type nell'API call
          await api.updateMotherboardImage(editingMotherboard._id, formData);
        } catch (imageError) {
          console.error("Errore immagine dettagliato:", imageError);
          setError(
            `Scheda madre aggiornata, ma problema con l'immagine: ${
              imageError.response?.data?.message || imageError.message
            }`
          );
        }
      }

      setShowEditModal(false);
      fetchMotherboards();
      setSuccess("Scheda madre aggiornata con successo!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento della scheda madre:", error);
      setError(
        `Errore nell'aggiornamento: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per l'eliminazione
  const handleDeleteClick = (motherboard) => {
    setDeletingMotherboard(motherboard);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deleteMotherboard(deletingMotherboard._id);
      setShowDeleteModal(false);
      setSuccess("Scheda madre eliminata con successo!");
      fetchMotherboards();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione della scheda madre:", error);
      setError(
        "Errore nell'eliminazione della scheda madre. Riprova più tardi."
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
        <h1 className="mb-4">Gestione Schede Madri</h1>

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
              Aggiungi Nuova Scheda Madre
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
                <AddMotherboardForm
                  onSubmit={handleCreateSubmit}
                  loading={loading}
                />
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        <Card>
          <Card.Header as="h5">
            <i className="bi bi-motherboard me-2"></i>
            Schede Madri Disponibili
          </Card.Header>
          <Card.Body>
            <MotherboardsTable
              motherboards={motherboards}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        <EditMotherboardModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          motherboard={editingMotherboard}
          onChange={handleEditChange}
          onImageChange={handleEditImageChange}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        <DeleteMotherboardModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          motherboard={deletingMotherboard}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageMotherboards;
