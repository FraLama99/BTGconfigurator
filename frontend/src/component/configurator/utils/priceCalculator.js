
export const calculateTotalPrice = (config, components, basePrice = 250) => {
    const {
        cpus,
        motherboards,
        rams,
        gpus,
        storages,
        psus,
        cases,
        coolers
    } = components;

    let price = basePrice;

    if (config.cpu) {
        const selectedCpu = cpus.find((c) => c._id === config.cpu);
        if (selectedCpu) price += selectedCpu.price;
    }

    if (config.motherboard) {
        const selectedMb = motherboards.find((m) => m._id === config.motherboard);
        if (selectedMb) price += selectedMb.price;
    }

    if (config.ram) {
        const selectedRam = rams.find((r) => r._id === config.ram);
        if (selectedRam) price += selectedRam.price;
    }

    if (config.gpu) {
        const selectedGpu = gpus.find((g) => g._id === config.gpu);
        if (selectedGpu) price += selectedGpu.price;
    }

    if (config.storage) {
        const selectedStorage = storages.find((s) => s._id === config.storage);
        if (selectedStorage) price += selectedStorage.price;
    }

    if (config.powerSupply) {
        const selectedPsu = psus.find((p) => p._id === config.powerSupply);
        if (selectedPsu) price += selectedPsu.price;
    }

    if (config.case) {
        const selectedCase = cases.find((c) => c._id === config.case);
        if (selectedCase) price += selectedCase.price;
    }

    if (config.cooling) {
        const selectedCooler = coolers.find((c) => c._id === config.cooling);
        if (selectedCooler) price += selectedCooler.price;
    }

    return price;
};


export const calculateRequiredPower = (config, components) => {
    const { cpus, gpus } = components;

    const selectedCpu = cpus.find(c => c._id === config.cpu);
    const selectedGpu = gpus.find(g => g._id === config.gpu);

    let powerNeeded = 100;

    if (selectedCpu) powerNeeded += selectedCpu.tdp || 0;
    if (selectedGpu) powerNeeded += selectedGpu.tdp || 0;

    return Math.ceil(powerNeeded * 1.3);
};