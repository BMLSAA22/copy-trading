import { useCallback } from 'react';
import useWebSocket from './useWebSocket';
import { useAuth } from '../hooks/useAuth.jsx';

const useAPIToken = () => {
    const { sendMessage } = useWebSocket();
    const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();

    const createToken = useCallback((tokenName, scopes = ['admin', 'read', 'trade']) => {
        if (!isLoggedIn) {
            throw new Error('Client is not authorized');
        }

        return new Promise((resolve, reject) => {
            sendMessage({
                api_token: 1,
                new_token: tokenName,
                new_token_scopes: scopes
            }, (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response);
                }
            });
        });
    }, [sendMessage, isLoggedIn]);

    const getTokens = useCallback(() => {
        if (!isLoggedIn) {
            throw new Error('Client is not authorized');
        }

        return new Promise((resolve, reject) => {
            sendMessage({
                api_token: 1
            }, (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response);
                }
            });
        });
    }, [sendMessage, isLoggedIn]);

    const deleteToken = useCallback((token) => {
        if (!isLoggedIn) {
            throw new Error('Client is not authorized');
        }

        return new Promise((resolve, reject) => {
            sendMessage({
                api_token: 1,
                delete_token: token
            }, (response) => {
                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response);
                }
            });
        });
    }, [sendMessage, isLoggedIn]);

    return {
        createToken,
        getTokens,
        deleteToken
    };
};

export default useAPIToken;
