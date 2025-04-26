import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utlis/api";
import "./amd.css";

import ConfiguratorLayout from "../../component/configurator/ConfiguratorLayout";
import ComponentSelector from "../../component/configurator/ComponentSelector";
import ConfigurationSummary from "../../component/configurator/ConfigurationSummary";
import { calculateTotalPrice } from "../../component/configurator/utils/priceCalculator";
import * as componentLoaders from "../../component/configurator/utils/componentLoaders";
import { calculateDeliveryTime } from "../../component/configurator/utils/deliveryTimeCalculator";

const AmdConfigurator = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [totalPrice, setTotalPrice] = useState(250);
  const [configName, setConfigName] = useState("Configurazione AMD");
  const [configDesc, setConfigDesc] = useState(
    "Configurazione personalizzata basata su processori AMD"
  );

  const [cpus, setCpus] = useState([]);
  const [motherboards, setMotherboards] = useState([]);
  const [rams, setRams] = useState([]);
  const [gpus, setGpus] = useState([]);
  const [storages, setStorages] = useState([]);
  const [psus, setPsus] = useState([]);
  const [cases, setCases] = useState([]);
  const [coolers, setCoolers] = useState([]);

  const [configuration, setConfiguration] = useState({
    cpu: null,
    motherboard: null,
    ram: null,
    gpu: null,
    storage: null,
    powerSupply: null,
    case: null,
    cooling: null,
    name: "Configurazione AMD",
    description: "Configurazione personalizzata basata su processori AMD",
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    estimatedDays: 4,
    allAvailable: true,
    unavailableComponents: [],
    deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    message: "Consegna stimata in 4 giorni (96 ore)",
  });

  const steps = [
    "Processore",
    "Scheda Madre",
    "RAM",
    "Scheda Video",
    "Storage",
    "Alimentatore",
    "Case",
    "Raffreddamento",
    "Riepilogo",
  ];

  const selectComponent = (type, component) => {
    const newConfiguration = { ...configuration, [type]: component._id };
    setConfiguration(newConfiguration);
    updateTotalPrice(newConfiguration);
    updateDeliveryInfo(newConfiguration);

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const updateTotalPrice = (config) => {
    const components = {
      cpus,
      motherboards,
      rams,
      gpus,
      storages,
      psus,
      cases,
      coolers,
    };
    const price = calculateTotalPrice(config, components);
    setTotalPrice(price);
  };

  const updateDeliveryInfo = (config) => {
    const components = {
      cpus,
      motherboards,
      rams,
      gpus,
      storages,
      psus,
      cases,
      coolers,
    };
    const newDeliveryInfo = calculateDeliveryTime(config, components);
    setDeliveryInfo(newDeliveryInfo);
  };

  useEffect(() => {
    componentLoaders.loadCpus("AMD", setLoading, setError, setCpus);
  }, []);

  useEffect(() => {
    if (configuration.cpu) {
      componentLoaders.loadMotherboards(
        configuration,
        cpus,
        setLoading,
        setError,
        setMotherboards
      );
    }
  }, [configuration.cpu, cpus]);

  useEffect(() => {
    if (configuration.motherboard) {
      componentLoaders.loadRams(
        configuration,
        motherboards,
        setLoading,
        setError,
        setRams
      );
    }
  }, [configuration.motherboard, motherboards]);

  useEffect(() => {
    if (configuration.ram) {
      componentLoaders.loadGpus(setLoading, setError, setGpus);
    }
  }, [configuration.ram]);

  useEffect(() => {
    if (configuration.gpu) {
      componentLoaders.loadStorages(setLoading, setError, setStorages);
    }
  }, [configuration.gpu]);

  useEffect(() => {
    if (configuration.storage) {
      const components = { cpus, gpus };
      componentLoaders.loadPsus(
        configuration,
        components,
        setLoading,
        setError,
        setPsus
      );
    }
  }, [configuration.storage, cpus, gpus, configuration.cpu, configuration.gpu]);

  useEffect(() => {
    if (configuration.powerSupply) {
      componentLoaders.loadCases(
        configuration,
        motherboards,
        setLoading,
        setError,
        setCases
      );
    }
  }, [configuration.powerSupply, motherboards, configuration.motherboard]);

  useEffect(() => {
    if (configuration.case) {
      componentLoaders
        .loadCoolers(configuration, cpus, setLoading, setError, setCoolers)
        .then(() => {
          updateDeliveryInfo(configuration);
        });
    }
  }, [configuration.case, cpus, configuration.cpu]);

  useEffect(() => {
    sessionStorage.setItem("amdConfigStep", activeStep);
    sessionStorage.setItem("amdConfig", JSON.stringify(configuration));
  }, [activeStep, configuration]);

  useEffect(() => {
    const savedStep = sessionStorage.getItem("amdConfigStep");
    const savedConfig = sessionStorage.getItem("amdConfig");

    if (savedConfig) {
      try {
        setConfiguration(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Errore nel recupero della configurazione salvata", e);
      }
    }

    if (savedStep !== null) {
      setActiveStep(parseInt(savedStep, 10));
    }
  }, []);

  const handleSaveConfiguration = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const isAuthenticated = api.checkAuth();

      if (!isAuthenticated) {
        navigate("/login", { state: { from: "/amd" } });
        return;
      }

      const configToSave = {
        name: configName,
        description: configDesc,
        components: {
          cpu: configuration.cpu,
          motherboard: configuration.motherboard,
          ram: configuration.ram,
          gpu: configuration.gpu,
          storage: configuration.storage,
          powerSupply: configuration.powerSupply,
          case: configuration.case,
          cooling: configuration.cooling,
        },
        status: "draft",
        saveToUser: true,
        addToCart: false,
        estimatedDelivery: {
          days: deliveryInfo.estimatedDays,
          allAvailable: deliveryInfo.allAvailable,
          unavailableComponents: deliveryInfo.unavailableComponents.map(
            (c) => c.type
          ),
        },
      };

      const response = await api.createMachine(configToSave);

      if (response && response.data && response.data.machine) {
        setSuccess("Configurazione salvata con successo!");
        setTimeout(() => {
          navigate(`/profile/machines/${response.data.machine._id}`);
        }, 1500);
      } else {
        throw new Error("Formato di risposta non valido dal server");
      }
    } catch (err) {
      console.error("Errore completo:", err);
      setError(
        "Errore durante il salvataggio della configurazione: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <ComponentSelector
            title="Scegli il Processore AMD"
            components={cpus}
            onSelect={(component) => selectComponent("cpu", component)}
            selected={configuration.cpu}
          />
        );
      case 1:
        return (
          <ComponentSelector
            title="Scegli la Scheda Madre"
            components={motherboards}
            onSelect={(component) => selectComponent("motherboard", component)}
            selected={configuration.motherboard}
            emptyMessage="Seleziona prima un processore AMD"
          />
        );
      case 2:
        return (
          <ComponentSelector
            title="Scegli la Memoria RAM"
            components={rams}
            onSelect={(component) => selectComponent("ram", component)}
            selected={configuration.ram}
            emptyMessage="Seleziona prima una scheda madre"
          />
        );
      case 3:
        return (
          <ComponentSelector
            title="Scegli la Scheda Video"
            components={gpus}
            onSelect={(component) => selectComponent("gpu", component)}
            selected={configuration.gpu}
            emptyMessage="Seleziona prima la RAM"
          />
        );
      case 4:
        return (
          <ComponentSelector
            title="Scegli lo Storage"
            components={storages}
            onSelect={(component) => selectComponent("storage", component)}
            selected={configuration.storage}
            emptyMessage="Seleziona prima la scheda video"
          />
        );
      case 5:
        return (
          <ComponentSelector
            title="Scegli l'Alimentatore"
            components={psus}
            onSelect={(component) => selectComponent("powerSupply", component)}
            selected={configuration.powerSupply}
            emptyMessage="Seleziona prima lo storage"
          />
        );
      case 6:
        return (
          <ComponentSelector
            title="Scegli il Case"
            components={cases}
            onSelect={(component) => selectComponent("case", component)}
            selected={configuration.case}
            emptyMessage="Seleziona prima l'alimentatore"
          />
        );
      case 7:
        return (
          <ComponentSelector
            title="Scegli il Sistema di Raffreddamento"
            components={coolers}
            onSelect={(component) => selectComponent("cooling", component)}
            selected={configuration.cooling}
            emptyMessage="Seleziona prima il case"
          />
        );
      case 8:
        return (
          <ConfigurationSummary
            configuration={configuration}
            components={{
              cpus,
              motherboards,
              rams,
              gpus,
              storages,
              psus,
              cases,
              coolers,
            }}
            totalPrice={totalPrice}
            onSave={handleSaveConfiguration}
            loading={loading}
            configName={configName}
            setConfigName={setConfigName}
            configDesc={configDesc}
            setConfigDesc={setConfigDesc}
          />
        );
      default:
        return "Step sconosciuto";
    }
  };

  return (
    <ConfiguratorLayout
      title="Configuratore "
      error={error}
      success={success}
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      steps={steps}
      configuration={configuration}
      components={{
        cpus,
        motherboards,
        rams,
        gpus,
        storages,
        psus,
        cases,
        coolers,
      }}
      loading={loading}
      deliveryInfo={deliveryInfo}
    >
      {getStepContent(activeStep)}
    </ConfiguratorLayout>
  );
};

export default AmdConfigurator;
