let cartUpdateCallbacks = [];

export const registerCartUpdateCallback = (callback) => {
    cartUpdateCallbacks.push(callback);

    return () => {
        cartUpdateCallbacks = cartUpdateCallbacks.filter(cb => cb !== callback);
    };
};

export const notifyCartUpdated = () => {
    cartUpdateCallbacks.forEach(callback => callback());
};