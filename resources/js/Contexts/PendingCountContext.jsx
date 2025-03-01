import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const PendingCountContext = createContext();

export const usePendingCount = () => {
    return useContext(PendingCountContext);
};

export const PendingCountProvider = ({ children }) => {
    const [pendingCount, setPendingCount] = useState(0);

    const fetchPendingCount = async () => {
        try {
            const response = await axios.get(route("admin.pendingCount"));
            setPendingCount(response.data.pendingCount);
        } catch (error) {
            // console.error("Failed t52222222222223o fetch pending count:", error);
        }
    };

    // useEffect(() => {
    //     fetchPendingCount();
    //     const interval = setInterval(fetchPendingCount, 5000);
    //     return () => clearInterval(interval);
    // }, []);

    return (
        <PendingCountContext.Provider
            value={{ pendingCount, setPendingCount, fetchPendingCount }}
        >
            {children}
        </PendingCountContext.Provider>
    );
};
