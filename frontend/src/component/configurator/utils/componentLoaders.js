import api from "../../../utlis/api";


export const loadCpus = async (brand, setLoading, setError, setCpus) => {
    setLoading(true);
    try {
        const response = await api.getCPUs({ brand });
        setCpus(response.data);
    } catch (err) {
        setError(`Errore durante il caricamento delle CPU ${brand}`);
        console.error(err);
    } finally {
        setLoading(false);
    }
};


export const loadMotherboards = async (config, cpus, setLoading, setError, setMotherboards) => {
    if (!config.cpu) return;

    setLoading(true);
    try {
        const selectedCpu = cpus.find((c) => c._id === config.cpu);
        if (selectedCpu) {
            const chipsetBrand = selectedCpu.brand === "Intel" ? "Intel" : "AMD";
            const response = await api.getMotherboards({
                socket: selectedCpu.socket,
                chipsetBrand
            });
            setMotherboards(response.data);
        }
    } catch (err) {
        setError("Errore durante il caricamento delle schede madri compatibili");
        console.error(err);
    } finally {
        setLoading(false);
    }
};
export const loadRams = async (config, motherboards, setLoading, setError, setRams) => {
    if (!config.motherboard) return;

    setLoading(true);
    try {
        // Trova la scheda madre selezionata
        const selectedMb = motherboards.find((m) => m._id === config.motherboard);

        if (selectedMb) {
            console.log("Filtro RAM per tipo di memoria:", selectedMb.memoryType);

            // Recupera solo le RAM compatibili con il tipo di memoria della scheda madre selezionata
            const response = await api.getRAMs({
                memoryType: selectedMb.memoryType // Filtra per il tipo di memoria della scheda madre
            });

            console.log(`Caricate ${response.data.length} RAM di tipo ${selectedMb.memoryType}`);
            setRams(response.data);
        } else {
            console.error("Scheda madre selezionata non trovata nei dati disponibili");
            setRams([]);
        }
    } catch (err) {
        console.error("Errore durante il caricamento delle RAM compatibili:", err);
        setError("Errore durante il caricamento delle RAM compatibili");
    } finally {
        setLoading(false);
    }
};


export const loadGpus = async (setLoading, setError, setGpus) => {
    setLoading(true);
    try {
        const response = await api.getGPUs();
        setGpus(response.data);
    } catch (err) {
        setError("Errore durante il caricamento delle schede video");
        console.error(err);
    } finally {
        setLoading(false);
    }
};

export const loadStorages = async (setLoading, setError, setStorages) => {
    setLoading(true);
    try {
        const response = await api.getStorages();
        setStorages(response.data);
    } catch (err) {
        setError("Errore durante il caricamento degli storage");
        console.error(err);
    } finally {
        setLoading(false);
    }
};


export const loadPsus = async (config, components, setLoading, setError, setPsus) => {
    const { cpus, gpus } = components;

    setLoading(true);
    try {
        const selectedCpu = cpus.find((c) => c._id === config.cpu);
        const selectedGpu = gpus.find((g) => g._id === config.gpu);

        let powerNeeded = 100;
        if (selectedCpu) powerNeeded += selectedCpu.tdp || 0;
        if (selectedGpu) powerNeeded += selectedGpu.tdp || 0;

        const recommendedPower = Math.ceil(powerNeeded * 1.3);

        try {
            const response = await api.getPowerSupplies({
                minWattage: recommendedPower,
            });
            setPsus(response.data);
        } catch (apiErr) {
            console.error("Errore API alimentatori:", apiErr);
            const fallbackResponse = await api.getPowerSupplies();
            setPsus(fallbackResponse.data);
        }
    } catch (err) {
        console.error("Errore durante il caricamento degli alimentatori:", err);
        setError("Errore durante il caricamento degli alimentatori. Riprova o procedi manualmente.");
    } finally {
        setLoading(false);
    }
};


export const loadCases = async (config, motherboards, setLoading, setError, setCases) => {
    if (!config.motherboard) return;

    setLoading(true);
    try {
        const selectedMb = motherboards.find((m) => m._id === config.motherboard);
        if (selectedMb) {
            const response = await api.getCases({
                formFactor: selectedMb.formFactor,
            });
            setCases(response.data);
        }
    } catch (err) {
        setError("Errore durante il caricamento dei case");
        console.error(err);
    } finally {
        setLoading(false);
    }
};


export const loadCoolers = async (config, cpus, setLoading, setError, setCoolers) => {
    if (!config.cpu) return;

    setLoading(true);
    try {
        const selectedCpu = cpus.find((c) => c._id === config.cpu);
        if (selectedCpu) {
            const response = await api.getCoolers({
                socket: selectedCpu.socket,
            });
            setCoolers(response.data);
        }
    } catch (err) {
        setError("Errore durante il caricamento dei sistemi di raffreddamento");
        console.error(err);
    } finally {
        setLoading(false);
    }
};