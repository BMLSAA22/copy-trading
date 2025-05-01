import { useState, useEffect, useCallback } from 'react';
import useWebSocket from './useWebSocket';
import { useAuth } from '../hooks/useAuth.jsx';

const useSettings = () => {
    const [settings, setSettings] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
    // const { isAuthorized, isConnected } = useAuth();
    const { sendMessage } = useWebSocket();

    const fetchSettings = useCallback(() => {
        if (!isLoggedIn) {
            return Promise.reject(new Error('Not connected or authorized'));
        }

        // Return cached settings if available
        if (settings !== null) {
            return Promise.resolve(settings);
        }

        setIsLoading(true);
        setError(null);

        // Fetch fresh settings only if cache is empty
        return new Promise((resolve, reject) => {
            sendMessage(
                { get_settings: 1 },
                (response) => {
                    if (response.error) {
                        console.error('Failed to fetch settings:', response.error);
                        setError(response.error);
                        setIsLoading(false);
                        reject(response.error);
                    } else {
                        console.log('Settings received:', response.get_settings);
                        setSettings(response.get_settings);
                        setError(null);
                        setIsLoading(false);
                        resolve(response.get_settings);
                    }
                }
            );
        });
    }, [isLoggedIn, sendMessage]);

    const updateSettings = useCallback(async (newSettings) => {
        if (!isLoggedIn) {
            throw new Error('Not connected or authorized');
        }

        setIsLoading(true);
        setError(null);

        try {
            // First update the settings
            await new Promise((resolve, reject) => {
                sendMessage(
                    { set_settings: 1, ...newSettings },
                    (response) => {
                        if (response.error) {
                            console.error('Failed to update settings:', response.error);
                            reject(response.error);
                        } else {
                            console.log('Settings updated:', response.set_settings);
                            resolve(response.set_settings);
                        }
                    }
                );
            });

            // Then fetch fresh settings
            await fetchSettings();
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn, sendMessage, fetchSettings]);

    // Initial fetch on mount and when connection/auth changes
    useEffect(() => {
        if (isLoggedIn) {
            fetchSettings();
        }
    }, [isLoggedIn, fetchSettings]);

    // Reset state when connection is lost
    useEffect(() => {
        if (!isLoggedIn) {
            setSettings(null);
            setError(null);
            setIsLoading(false);
        }
    }, [isLoggedIn]);

    return {
        settings,
        error,
        isLoading,
        fetchSettings,
        updateSettings
    };
};

export default useSettings;
