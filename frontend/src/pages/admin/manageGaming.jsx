import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Alert, Collapse, Button, Spinner, Col } from "react-bootstrap";
import SideAdmin from "../../component/side/sideAdmin";
import api from "../../utlis/api.js";
import { useAuth } from "../../utlis/AuthContext.js";
import AddPresetForm from "../../component/admin/presetGaming/AddPresetForm";
import ComponentsPreview from "../../component/admin/presetGaming/elimiatoComponentsPreview.jsx";
import EditPresetModal from "../../component/admin/presetGaming/EditPresetModal";
import DeletePresetModal from "../../component/admin/presetGaming/DeletePresetModal";
import PresetsTable from "../../component/admin/presetGaming/PresetsTable";

const ManageGaming = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();

  // Stati
  const [presetMachines, setPresetMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingPreset, setEditingPreset] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingPreset, setDeletingPreset] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [incompatibilityWarnings, setIncompatibilityWarnings] = useState([]);

  // Stati per i componenti disponibili
  const [components, setComponents] = useState({
    cpus: [],
    motherboards: [],
    rams: [],
    gpus: [],
    storages: [],
    powerSupplies: [],
    cases: [],
    coolings: [],
  });

  // Stati per i componenti filtrati (compatibili)
  const [filteredComponents, setFilteredComponents] = useState({
    cpus: [],
    motherboards: [],
    rams: [],
    gpus: [],
    storages: [],
    powerSupplies: [],
    cases: [],
    coolings: [],
  });

  // Stati per gli oggetti selezionati (per il form di aggiunta)
  const [selectedComponents, setSelectedComponents] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    powerSupply: null,
    case: null,
    cooling: null,
  });

  // Verifica autenticazione
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (!isAdmin) {
        navigate("/login");
      } else {
        fetchPresetMachines();
        fetchAllComponents();
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  // Funzione per recuperare le configurazioni preset
  const fetchPresetMachines = async () => {
    try {
      setLoading(true);
      const response = await api.getPresets();
      setPresetMachines(response.data);
    } catch (error) {
      console.error("Errore nel recupero delle configurazioni preset:", error);
      setError("Impossibile caricare le configurazioni. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Funzione per caricare tutti i componenti disponibili
  const fetchAllComponents = async () => {
    try {
      setLoading(true);

      const [
        cpusRes,
        motherboardsRes,
        ramsRes,
        gpusRes,
        storagesRes,
        powerSuppliesRes,
        casesRes,
        coolingsRes,
      ] = await Promise.all([
        api.getCPUs(),
        api.getMotherboards(),
        api.getRAMs(),
        api.getGPUs(),
        api.getStorages(),
        api.getPowerSupplies(),
        api.getCases(),
        api.getCoolers(),
      ]);

      const allComponents = {
        cpus: cpusRes.data,
        motherboards: motherboardsRes.data,
        rams: ramsRes.data,
        gpus: gpusRes.data,
        storages: storagesRes.data,
        powerSupplies: powerSuppliesRes.data,
        cases: casesRes.data,
        coolings: coolingsRes.data,
      };

      setComponents(allComponents);
      setFilteredComponents(allComponents);
    } catch (error) {
      console.error("Errore nel recupero dei componenti:", error);
      setError("Impossibile caricare i componenti. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  // Funzione per filtrare i componenti compatibili
  const filterCompatibleComponents = (updatedComponents) => {
    let warnings = [];
    const filtered = { ...components };

    // CPU e Motherboard (compatibilità socket)
    if (updatedComponents.cpu) {
      const cpuSocket = updatedComponents.cpu.socket;
      filtered.motherboards = components.motherboards.filter(
        (mb) => mb.socket === cpuSocket
      );

      if (
        updatedComponents.motherboard &&
        updatedComponents.motherboard.socket !== cpuSocket
      ) {
        updatedComponents.motherboard = null;
        warnings.push(
          "La scheda madre selezionata non è compatibile con la CPU."
        );
      }
    }

    // Motherboard e RAM (compatibilità tipo RAM)
    if (updatedComponents.motherboard) {
      const mbRamType = updatedComponents.motherboard.ramType;
      filtered.rams = components.rams.filter((ram) => ram.type === mbRamType);

      // Corretto il controllo di compatibilità per le RAM
      if (updatedComponents.ram && updatedComponents.ram.type !== mbRamType) {
        updatedComponents.ram = null;
        warnings.push(
          "La RAM selezionata non è compatibile con la scheda madre."
        );
      }
    }

    // Motherboard e Case (compatibilità formato)
    if (updatedComponents.motherboard && updatedComponents.case) {
      // Ottieni e normalizza i valori
      const mbFormat = updatedComponents.motherboard.formFactor
        ? updatedComponents.motherboard.formFactor.trim().toLowerCase()
        : null;

      const supportedFormats = Array.isArray(
        updatedComponents.case.supportedMotherboards
      )
        ? updatedComponents.case.supportedMotherboards.map((format) =>
            format.trim().toLowerCase()
          )
        : [];

      // Log per debug
      console.log("Formato scheda madre:", mbFormat);
      console.log("Formati supportati dal case:", supportedFormats);

      // Controlla se il formato è valido e se non è supportato
      if (
        mbFormat &&
        supportedFormats.length > 0 &&
        !supportedFormats.includes(mbFormat)
      ) {
        warnings.push(
          `Il case selezionato potrebbe non supportare il formato ${updatedComponents.motherboard.formFactor} della scheda madre.`
        );
      }
    }

    // CPU/GPU e Alimentatore (potenza sufficiente)
    if (
      updatedComponents.cpu &&
      updatedComponents.gpu &&
      updatedComponents.powerSupply
    ) {
      const totalPower =
        (updatedComponents.cpu.tdp || 0) +
        (updatedComponents.gpu.tdp || 0) +
        100;
      if (updatedComponents.powerSupply.wattage < totalPower) {
        warnings.push(
          `L'alimentatore selezionato (${updatedComponents.powerSupply.wattage}W) potrebbe essere insufficiente. Potenza consigliata: ${totalPower}W.`
        );
      }
    }

    // GPU e Motherboard (slot PCIe)
    if (updatedComponents.motherboard && updatedComponents.gpu) {
      const mbPciSlots = updatedComponents.motherboard.pciSlots;
      const hasPCIex16 = mbPciSlots && mbPciSlots.pcie_x16 > 0;
      const hasPCIex8 = mbPciSlots && mbPciSlots.pcie_x8 > 0;

      if (
        updatedComponents.gpu.type === "dedicated" &&
        !hasPCIex16 &&
        !hasPCIex8
      ) {
        warnings.push(
          "La scheda madre non ha slot PCIe adeguati per la GPU selezionata."
        );
      }
    }

    // Case e GPU (lunghezza massima)
    if (updatedComponents.case && updatedComponents.gpu) {
      if (
        updatedComponents.case.maxGpuLength &&
        updatedComponents.gpu.length &&
        updatedComponents.gpu.length > updatedComponents.case.maxGpuLength
      ) {
        warnings.push(
          "La GPU selezionata potrebbe essere troppo lunga per il case selezionato."
        );
      }
    }

    // Case e CPU Cooler (altezza massima)
    if (
      updatedComponents.case &&
      updatedComponents.cooling &&
      updatedComponents.cooling.type === "air" &&
      updatedComponents.cooling.height
    ) {
      if (
        updatedComponents.case.maxCpuCoolerHeight &&
        updatedComponents.cooling.height >
          updatedComponents.case.maxCpuCoolerHeight
      ) {
        warnings.push(
          "Il dissipatore ad aria selezionato potrebbe essere troppo alto per il case."
        );
      }
    }

    setFilteredComponents(filtered);
    setIncompatibilityWarnings(warnings);

    return warnings;
  };

  // Prepara i dati per il backend
  const prepareDataForBackend = (formData) => {
    // Deep clone del formData
    const data = JSON.parse(JSON.stringify(formData));

    // Converti i campi numerici
    data.basePrice = Number(data.basePrice) || 0;

    // Converti booleani in stringhe
    if (typeof data.isActive === "boolean") {
      data.isActive = data.isActive ? "true" : "false";
    }

    return data;
  };

  // Modifica la funzione handleCreateSubmit
  const handleCreateSubmit = async (formData) => {
    setLoading(true);
    try {
      const data = prepareDataForBackend(formData);
      await api.createPreset(data);
      setSuccess("Configurazione creata con successo!");
      fetchPresetMachines();

      // Reset COMPLETO dei componenti selezionati - importante farlo PRIMA di qualsiasi altra operazione
      setSelectedComponents({
        cpu: null,
        motherboard: null,
        ram: null,
        gpu: null,
        storage: null,
        powerSupply: null,
        case: null,
        cooling: null,
      });

      // Reset degli avvisi di incompatibilità
      setIncompatibilityWarnings([]);

      // Rimuovi il messaggio di successo dopo 3 secondi
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      return Promise.resolve();
    } catch (error) {
      console.error("Errore durante la creazione:", error);
      setError(
        error.response?.data?.message ||
          "Si è verificato un errore durante la creazione della configurazione."
      );

      // Rimuovi il messaggio di errore dopo 5 secondi
      setTimeout(() => {
        setError(null);
      }, 5000);

      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  // Aggiungi questa funzione per resettare completamente lo stato quando si apre/chiude il form
  const toggleAddForm = () => {
    if (showAddForm) {
      // Se stiamo chiudendo il form, resettiamo tutto
      setSelectedComponents({
        cpu: null,
        motherboard: null,
        ram: null,
        gpu: null,
        storage: null,
        powerSupply: null,
        case: null,
        cooling: null,
      });
      setIncompatibilityWarnings([]);
    }
    setShowAddForm(!showAddForm);
  };

  // Modifica la funzione calculateBasePrice per essere più "sicura" nel caso di reset
  const calculateBasePrice = () => {
    // Verifica se ci sono componenti selezionati
    const hasAnyComponent = Object.values(selectedComponents).some(
      (comp) => comp !== null
    );

    // Se non ci sono componenti selezionati, restituisci 0 (per gaming non c'è costo fisso)
    if (!hasAnyComponent) {
      return "0.00";
    }

    let totalPrice = 0;

    // Aggiungi il prezzo dei componenti selezionati
    Object.values(selectedComponents).forEach((component) => {
      if (component && typeof component.price === "number") {
        totalPrice += component.price;
      }
    });

    // Applica sconto del 10%
    return (totalPrice * 0.9).toFixed(2);
  };

  // Handlers per la modifica
  const handleEditClick = (preset) => {
    console.log("Preset originale:", preset);

    // Estrae i componenti per il form di modifica
    const componentIds = {
      cpu: preset.components.cpu?._id || preset.components.cpu,
      motherboard:
        preset.components.motherboard?._id || preset.components.motherboard,
      ram: preset.components.ram?._id || preset.components.ram,
      gpu: preset.components.gpu?._id || preset.components.gpu,
      storage: preset.components.storage?._id || preset.components.storage,
      powerSupply:
        preset.components.powerSupply?._id || preset.components.powerSupply,
      case: preset.components.case?._id || preset.components.case,
      cooling: preset.components.cooling?._id || preset.components.cooling,
    };

    // Gestione del booleano isActive
    let isActive = preset.isActive;
    if (isActive === "true" || isActive === true) isActive = true;
    else if (isActive === "false" || isActive === false) isActive = false;
    else isActive = true; // Valore predefinito

    const safePreset = {
      _id: preset._id,
      name: preset.name || "",
      description: preset.description || "",
      category: preset.category || "gaming",
      basePrice: preset.basePrice || 0,
      isActive: isActive,
      components: componentIds,
      // Aggiungi altri campi necessari
    };

    // Imposta gli oggetti componente completi per la verifica di compatibilità
    const selectedComponentObjects = {
      cpu: components.cpus.find((c) => c._id === componentIds.cpu),
      motherboard: components.motherboards.find(
        (m) => m._id === componentIds.motherboard
      ),
      ram: components.rams.find((r) => r._id === componentIds.ram),
      gpu: components.gpus.find((g) => g._id === componentIds.gpu),
      storage: components.storages.find((s) => s._id === componentIds.storage),
      powerSupply: components.powerSupplies.find(
        (p) => p._id === componentIds.powerSupply
      ),
      case: components.cases.find((c) => c._id === componentIds.case),
      cooling: components.coolings.find((c) => c._id === componentIds.cooling),
    };

    // Verifica la compatibilità dei componenti selezionati
    filterCompatibleComponents(selectedComponentObjects);

    console.log("Preset preparato per modifica:", safePreset);
    setEditingPreset(safePreset);
    setSelectedComponents(selectedComponentObjects);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedPreset) => {
    try {
      setLoading(true);
      setError(null);

      // Prepara i dati per il backend
      const preparedData = prepareDataForBackend(updatedPreset);
      console.log(
        "Dati della configurazione preparati per l'aggiornamento:",
        preparedData
      );

      // Aggiorna la configurazione
      await api.updatePreset(updatedPreset._id, preparedData);

      setShowEditModal(false);
      setSuccess("Configurazione gaming aggiornata con successo!");
      fetchPresetMachines();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'aggiornamento della configurazione:", error);
      setError(
        "Errore nell'aggiornamento della configurazione. Verifica i dati e riprova."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers per l'eliminazione
  const handleDeleteClick = (preset) => {
    setDeletingPreset(preset);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await api.deletePreset(deletingPreset._id);
      setShowDeleteModal(false);
      setSuccess("Configurazione gaming eliminata con successo!");
      fetchPresetMachines();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error("Errore nell'eliminazione della configurazione:", error);
      setError(
        "Errore nell'eliminazione della configurazione. Riprova più tardi."
      );
    } finally {
      setLoading(false);
    }
  };

  // Funzione per aggiornare i componenti selezionati (per il form di aggiunta)
  const updateSelectedComponents = (componentType, componentId) => {
    if (!componentId) {
      const updatedComponents = {
        ...selectedComponents,
        [componentType]: null,
      };
      setSelectedComponents(updatedComponents);
      filterCompatibleComponents(updatedComponents);
      return;
    }

    let componentCollection;
    if (componentType === "powerSupply") {
      componentCollection = components.powerSupplies;
    } else {
      componentCollection = components[`${componentType}s`];
    }

    if (!componentCollection) {
      console.error(
        `Collezione di componenti non trovata per ${componentType}: ${componentType}s`
      );
      return;
    }

    const componentObject = componentCollection.find(
      (c) => c._id === componentId
    );

    if (componentObject) {
      const updatedComponents = {
        ...selectedComponents,
        [componentType]: componentObject,
      };
      setSelectedComponents(updatedComponents);
      filterCompatibleComponents(updatedComponents);
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
        <h1 className="mb-4">Gestione Configurazioni Gaming</h1>

        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Form per aggiungere una nuova configurazione */}
        <Card className="mb-4">
          <Card.Header
            as="h5"
            onClick={toggleAddForm}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <i
                className={`bi ${
                  showAddForm ? "bi-dash-circle" : "bi-plus-circle"
                } me-2`}
              ></i>
              Aggiungi Nuova Configurazione Gaming
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleAddForm();
              }}
            >
              {showAddForm ? "Chiudi" : "Apri"}
            </Button>
          </Card.Header>

          <Collapse in={showAddForm}>
            <div>
              <Card.Body>
                {showAddForm && (
                  <Col md={12}>
                    <AddPresetForm
                      onSubmit={handleCreateSubmit}
                      loading={loading}
                      components={components}
                      filteredComponents={filteredComponents}
                      selectedComponents={selectedComponents}
                      updateSelectedComponents={updateSelectedComponents}
                      calculateBasePrice={calculateBasePrice}
                      incompatibilityWarnings={incompatibilityWarnings}
                    />
                  </Col>
                )}
              </Card.Body>
            </div>
          </Collapse>
        </Card>

        {/* Tabella delle configurazioni esistenti */}
        <Card>
          <Card.Header as="h5">
            <i className="bi bi-pc-display me-2"></i>
            Configurazioni Gaming Esistenti
          </Card.Header>
          <Card.Body>
            <PresetsTable
              presets={presetMachines.filter((p) => p.category === "gaming")}
              loading={loading}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </Card.Body>
        </Card>

        {/* Modali per modifica ed eliminazione */}
        <EditPresetModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          preset={editingPreset}
          components={components}
          filteredComponents={filteredComponents}
          selectedComponents={selectedComponents}
          updateSelectedComponents={updateSelectedComponents}
          onSubmit={handleEditSubmit}
          loading={loading}
          incompatibilityWarnings={incompatibilityWarnings}
        />

        <DeletePresetModal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          preset={deletingPreset}
          onConfirm={confirmDelete}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ManageGaming;
