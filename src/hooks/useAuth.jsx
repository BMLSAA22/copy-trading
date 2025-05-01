import { useState, useCallback, useEffect, createContext, useContext } from "react";
import useWebSocket from "./useWebSocket";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

let isLoggedInGlobal = false;

export const useAuthState = () => {
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [otherAccounts, setOtherAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { isConnected, sendMessage, close } = useWebSocket();

    // Load accounts from localStorage
    useEffect(() => {
        try {
            const storedDefault = localStorage.getItem("deriv_default_account");
            const storedOthers = localStorage.getItem("deriv_other_accounts");

            if (storedDefault) {
                setDefaultAccount(JSON.parse(storedDefault));
                // isLoggedInGlobal = true
            }

            if (storedOthers) {
                setOtherAccounts(JSON.parse(storedOthers));
            }
        } catch (error) {
            console.error("Error loading accounts:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Authorize function that sets the global isLoggedIn state
    const authorize = useCallback(async (token) => {
        if (!isConnected) {
            throw new Error("WebSocket not connected");
        }

        let isAuthorizingRef = false;

        return new Promise((resolve, reject) => {
            if (isAuthorizingRef) {
                reject(new Error("Authorization already in progress"));
                return;
            }

            isAuthorizingRef = true;
            setIsLoading(true);

            sendMessage({ authorize: token }, (response) => {
                setIsLoading(false);
                isAuthorizingRef = false;

                if (response.error) {
                    console.error("Authorization failed:", response.error);
                    isLoggedInGlobal = false;
                    reject(response.error);
                } else {
                    console.log("Authorization successful");
                    isLoggedInGlobal = true; // Set isLoggedIn to true
                    resolve(response);
                }
            });
        });
    }, [isConnected, sendMessage]);

    const updateAccounts = useCallback((newDefaultAccount, newOtherAccounts) => {
        setDefaultAccount(newDefaultAccount);
        setOtherAccounts(newOtherAccounts);

        localStorage.setItem("deriv_default_account", JSON.stringify(newDefaultAccount));
        localStorage.setItem("deriv_other_accounts", JSON.stringify(newOtherAccounts));
    }, []);

    const clearAccounts = useCallback(() => {
        setDefaultAccount(null);
        setOtherAccounts([]);
        localStorage.removeItem("deriv_default_account");
        localStorage.removeItem("deriv_other_accounts");
    }, []);

    return {
        defaultAccount,
        otherAccounts,
        isLoading,
        isLoggedIn: isLoggedInGlobal, // Add isLoggedIn state here
        updateAccounts,
        clearAccounts,
        authorize,
    };
};

export const AuthProvider = ({ children }) => {
    const auth = useAuthState();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default useAuth;
