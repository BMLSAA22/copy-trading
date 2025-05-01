import {
    useState,
    useCallback,
    useEffect,
    createContext,
    useContext,
} from "react";
import useWebSocket from "./useWebSocket";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

// Singleton state
let isAuthorizedGlobal = false;
let authErrorGlobal = null;

export const useAuthState = () => {
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [otherAccounts, setOtherAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { isConnected, sendMessage, close } = useWebSocket();

    // Load accounts from localStorage when hook is initialized
    useEffect(() => {
        try {
            console.log("Loading accounts from localStorage");
            const storedDefault = localStorage.getItem("deriv_default_account");
            // const storedDefault = {"account":"VRTC13286333","token":"a1-2oj1v16u1h5AVvT1KjpJmP2Lap8vG","currency":"USD"}
            console.log("this is the added" , storedDefault)
            const storedOthers = localStorage.getItem("deriv_other_accounts");

            if (storedDefault) {
                console.log(
                    "Found stored default account:",
                    JSON.parse(storedDefault)
                );
                setDefaultAccount(JSON.parse(storedDefault));
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

    // Authorize effect - handles both initial auth and account switching
    useEffect(() => {
        let isActive = true; // For cleanup/prevent state updates after unmount
        let isAuthorizingRef = false; // Track in-flight authorize requests

        const authorizeAccount = async () => {
            if (
                !isConnected ||
                !defaultAccount?.token ||
                isAuthorizedGlobal ||
                isAuthorizingRef
            ) {
                return;
            }

            console.log(
                "Sending authorize request for account switch/initial auth"
            );
            setIsLoading(true);
            isAuthorizingRef = true; // Set flag before starting request

            try {
                await new Promise((resolve, reject) => {
                    sendMessage(
                        { authorize: defaultAccount.token },
                        (response) => {
                            if (!isActive) return; // Don't update state if component unmounted

                            if (response.error) {
                                console.error(
                                    "Authorization failed:",
                                    response.error
                                );
                                reject(response.error);
                            } else {
                                console.log("Authorization successful");
                                resolve(response);
                            }
                        }
                    );
                });

                if (isActive) {
                    authErrorGlobal = null;
                    isAuthorizedGlobal = true;
                }
            } catch (error) {
                if (isActive) {
                    authErrorGlobal = error;
                    isAuthorizedGlobal = false;
                    clearAccounts();
                    close();
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                    isAuthorizingRef = false; // Reset flag when request completes
                }
            }
        };

        authorizeAccount();

        return () => {
            isActive = false; // Cleanup to prevent state updates after unmount
            isAuthorizingRef = false; // Reset flag on cleanup
        };
    }, [isConnected, defaultAccount?.token]); // Reduced dependencies

    const updateAccounts = useCallback(
        (newDefaultAccount, newOtherAccounts) => {
            console.log("Updating accounts:", {
                newDefaultAccount,
                newOtherAccounts,
            });

            // Reset authorization state before updating accounts
            isAuthorizedGlobal = false;
            authErrorGlobal = null;

            // Update state
            setDefaultAccount(newDefaultAccount);
            setOtherAccounts(newOtherAccounts);

            // Update localStorage
            localStorage.setItem(
                "deriv_default_account",
                JSON.stringify(newDefaultAccount)
            );
            localStorage.setItem(
                "deriv_other_accounts",
                JSON.stringify(newOtherAccounts)
            );
        },
        []
    ); // No dependencies needed

    const clearAccounts = useCallback(() => {
        console.log("Clearing accounts");
        setDefaultAccount(null);
        setOtherAccounts([]);
        localStorage.removeItem("deriv_default_account");
        localStorage.removeItem("deriv_other_accounts");
    }, []);

    const authorize = useCallback(
        async (token) => {
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
                        authErrorGlobal = response.error;
                        isAuthorizedGlobal = false;
                        clearAccounts();
                        close();
                        reject(response.error);
                    } else {
                        console.log("Authorization successful");
                        authErrorGlobal = null;
                        isAuthorizedGlobal = true;
                        resolve(response);
                    }
                });
            });
        },
        [isConnected, sendMessage, clearAccounts, close]
    );

    return {
        defaultAccount,
        otherAccounts,
        isLoading,
        isAuthorized: isAuthorizedGlobal,
        authError: authErrorGlobal,
        isConnected,
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
