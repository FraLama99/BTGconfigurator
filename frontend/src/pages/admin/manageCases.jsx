import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddCaseForm from "../../component/admin/case/AddCaseForm";
import EditCaseModal from "../../component/admin/case/EditCaseModal";
import DeleteCaseModal from "../../component/admin/case/DeleteCaseModal";
import CasesTable from "../../component/admin/case/CasesTable";

const ManageCases = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    isAdmin,
    loading: authLoading,
    debugToken,
  } = useAuth();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingCase, setDeletingCase] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/login");
      } else {
        fetchCases();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await api.getCases();
      setCases(response.data);
    } catch (error) {
      console.error("Errore nel recupero dei case:", error);
      setError("Impossibile caricare i case. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const prepareDataForBackend = (formData) => {
    const data = { ...formData };

    if (data.formFactor) {
      if (typeof data.formFactor === "string") {
        data.formFactor = data.formFactor
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    data.height = Number(data.height) || 0;
    data.width = Number(data.width) || 0;
    data.depth = Number(data.depth) || 0;

    data.maxGpuLength = Number(data.maxGpuLength) || 0;
    data.maxCpuCoolerHeight = Number(data.maxCpuCoolerHeight) || 0;
    data.includedFans = Number(data.includedFans) || 0;
    data.price = Number(data.price) || 0;
    data.stock = Number(data.stock) || 0;

    if (typeof data.rgb === "boolean") {
      data.rgb = data.rgb ? "true" : "false";
    }

    return data;
  };

  const handleCreateSubmit = async (formData, image) => {
    try {
      setLoading(true);
      setError(null);

      const preparedData = prepareDataForBackend(formData);
      console.log("Dati del case preparati per il backend:", preparedData);

      const response = await api.createCase(preparedData);

      if (image) {
        const caseId = response.data._id || response.data.case._id;
        await api.updateCaseImage(caseId, image);
      }

      setSuccess("Case creato con successo!");
      fetchCases();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nella creazione del case:", error);
      setError("Errore nella creazione del case. Verifica i dati e riprova.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (pcCase) => {
    console.log("Case originale:", pcCase);

    const safeCase = {
      _id: pcCase._id,
      name: pcCase.name || "",
      brand: pcCase.brand || "",
      model: pcCase.model || "",
      formFactor: Array.isArray(pcCase.formFactor)
        ? pcCase.formFactor.join(", ")
        : pcCase.formFactor || "",
      height: pcCase.dimensions?.height || 0,
      width: pcCase.dimensions?.width || 0,
      depth: pcCase.dimensions?.depth || 0,
      maxGpuLength: pcCase.maxGpuLength || 0,
      maxCpuCoolerHeight: pcCase.maxCpuCoolerHeight || 0,
      includedFans: pcCase.includedFans || 0,
      panelType: pcCase.panelType || "",
      rgb: pcCase.rgb || false,
      price: pcCase.price || 0,
      stock: pcCase.stock || 0,
      description: pcCase.description || "",
      imageUrl: pcCase.imageUrl || "",
    };

    console.log("Case preparato per modifica:", safeCase);
    setEditingCase(safeCase);
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      console.log(`Cambiato checkbox ${name} a ${checked}`);
      setEditingCase((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setEditingCase((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditingCase((prev) => ({
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

      if (!editingCase) {
        setError("Nessun case da modificare");
        setLoading(false);
        return;
      }

      console.log("Dati del case prima della preparazione:", editingCase);

      const preparedData = prepareDataForBackend(editingCase);
      console.log("Dati del case preparati per l'aggiornamento:", preparedData);

      await api.updateCase(editingCase._id, preparedData);

      if (editingCase.newImage) {
        await api.updateCaseImage(editingCase._id, editingCase.newImage);
      }

      setShowEditModal(false);
      setSuccess("Case aggiornato con successo!");
      fetchCases();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento del case:", error);
      setError(
        "Errore nell'aggiornamento del case. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (pcCase) => {
    setDeletingCase(pcCase);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deleteCase(deletingCase._id);
      setShowDeleteModal(false);
      setSuccess("Case eliminato con successo!");
      fetchCases();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione del case:", error);
      setError("Errore nell'eliminazione del case. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return null;
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
        <h1 className="mb-4">Gestione Case PC</h1>

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
              Aggiungi Nuovo Case
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
                <AddCaseForm onSubmit={handleCreateSubmit} loading={loading} />
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        <Card>
          <Card.Header as="h5">
            <i className="bi bi-pc-display me-2"></i>
            Case Disponibili
          </Card.Header>
          <Card.Body>
            <CasesTable
              cases={cases}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        <EditCaseModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          pcCase={editingCase}
          onChange={handleEditChange}
          onImageChange={handleEditImageChange}
          onSubmit={handleEditSubmit}
          loading={loading}
        />

        <DeleteCaseModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          pcCase={deletingCase}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageCases;
