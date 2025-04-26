
export const calculateDeliveryTime = (configuration, componentsData) => {
    let estimatedDays = 4;
    const unavailableComponents = [];
    let allAvailable = true;

    const componentMappings = {
        cpu: 'cpus',
        motherboard: 'motherboards',
        ram: 'rams',
        gpu: 'gpus',
        storage: 'storages',
        powerSupply: 'psus',
        case: 'cases',
        cooling: 'coolers',
    };

    const componentLabels = {
        cpu: 'Processore',
        motherboard: 'Scheda Madre',
        ram: 'RAM',
        gpu: 'Scheda Video',
        storage: 'Storage',
        powerSupply: 'Alimentatore',
        case: 'Case',
        cooling: 'Sistema di Raffreddamento',
    };

    Object.keys(componentMappings).forEach(componentKey => {
        if (!configuration[componentKey]) return;

        const componentListName = componentMappings[componentKey];
        const componentList = componentsData[componentListName] || [];

        const selectedComponent = componentList.find(
            comp => comp._id === configuration[componentKey]
        );

        if (selectedComponent && (selectedComponent.stock === 0 || selectedComponent.stock === undefined)) {
            allAvailable = false;
            unavailableComponents.push({
                type: componentKey,
                name: selectedComponent.name,
                label: componentLabels[componentKey]
            });
        }
    });

    if (!allAvailable) {
        estimatedDays = 15;
    }

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);

    return {
        estimatedDays,
        allAvailable,
        unavailableComponents,
        deliveryDate,
        message: allAvailable
            ? `Consegna stimata in ${estimatedDays} giorni (96 ore)`
            : `Consegna stimata in ${estimatedDays} giorni (componenti da ordinare)`
    };
};


export const formatDeliveryDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('it-IT', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};