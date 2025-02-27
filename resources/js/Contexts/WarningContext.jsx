import { createContext, useContext, useState } from "react";

const WarningContext = createContext(null);

export const WarningProvider = ({ children }) => {
    const [warning, setWarning] = useState({ show: false, message: "" });

    const showWarning = (message) => {
        setWarning({ show: true, message });
        setTimeout(() => setWarning({ show: false, message: "" }), 3000);
    };

    return (
        <WarningContext.Provider value={{ warning, showWarning }}>
            {children}
        </WarningContext.Provider>
    );
};

export const useWarning = () => {
    const context = useContext(WarningContext);
    if (!context) {
        throw new Error("useWarning must be used within a WarningProvider");
    }
    return context;
};
