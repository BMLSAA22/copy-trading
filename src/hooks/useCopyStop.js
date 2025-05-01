import { useState } from "react";
import useWebSocket from "./useWebSocket";
import { useAuth } from "../hooks/useAuth.jsx";

const useCopyStop = () => {
    const { sendMessage } = useWebSocket();
    // const { isAuthorized, isConnected } = useAuth();
    const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
    const [processingTrader, setProcessingTrader] = useState(null);

    const stopCopyTrading = (trader, onSuccess, onError) => {
        if (!isLoggedIn ) {
            onError("Connection not ready. Please try again.");
            return;
        }

        setProcessingTrader(trader);
        sendMessage({ copy_stop: trader.token }, (response) => {
            if (response.error) {
                onError(response.error.message || "Error stopping copy trade");
            } else {
                onSuccess(trader);
            }
            setProcessingTrader(null);
        });
    };

    return {
        stopCopyTrading,
        processingTrader
    };
};

export default useCopyStop;
