const ENDPOINT_STORAGE_KEY = "deriv_endpoint_settings";

// Production configuration
export const PROD_CONFIG = {
    APP_ID: '72191',
    WS_URL: 'wss://ws.derivws.com/websockets/v3',
    OAUTH_URL: 'https://oauth.deriv.com'
}

// Get base configuration
const getBaseConfig = () => {
    return PROD_CONFIG;
}

// Get stored endpoint settings if they exist
export const getStoredEndpointSettings = () => {
    try {
        const storedSettings = localStorage.getItem(ENDPOINT_STORAGE_KEY);
        if (storedSettings) {
            return JSON.parse(storedSettings);
        }
    } catch (error) {
        console.error('Error getting endpoint settings:', error);
    }
    return null;
}

// Store endpoint settings
export const setEndpointSettings = (server, appId) => {
    try {
        if (!server || !appId) {
            console.error('Invalid endpoint settings:', { server, appId });
            return;
        }
        
        console.log('Storing endpoint settings:', { server, appId });
        localStorage.setItem(
            ENDPOINT_STORAGE_KEY,
            JSON.stringify({ server, appId })
        );

        // Verify storage
        const stored = localStorage.getItem(ENDPOINT_STORAGE_KEY);
        console.log('Verified stored settings:', stored);

        // Parse and validate stored data
        const parsedStored = JSON.parse(stored);
        if (!parsedStored || !parsedStored.server || !parsedStored.appId) {
            console.error('Stored settings validation failed:', parsedStored);
        }
    } catch (error) {
        console.error('Error setting endpoint settings:', error);
    }
}

// Clear stored endpoint settings
export const clearEndpointSettings = () => {
    localStorage.removeItem(ENDPOINT_STORAGE_KEY);
}

// Get configuration with custom endpoint support
export const getConfig = () => {
    const baseConfig = getBaseConfig();
    const storedSettings = getStoredEndpointSettings();

    if (storedSettings) {
        const { server, appId } = storedSettings;
        return {
            ...baseConfig,
            APP_ID: appId,
            WS_URL: `wss://${server}/websockets/v3`
        };
    }

    return baseConfig;
}

// Get default server URL (without protocol and path)
export const getDefaultServer = () => {
    const { WS_URL } = getBaseConfig();
    return WS_URL.replace(/^wss?:\/\//, "").replace(/\/websockets\/v3$/, "");
}

// Get default app ID
export const getDefaultAppId = () => {
    return getBaseConfig().APP_ID;
}
