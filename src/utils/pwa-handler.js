// Initialize PWA installation handling
const initPWAInstall = () => {

    // Global handler for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        window.deferredPrompt = e;

        // Dispatch custom event for React components
        window.dispatchEvent(new CustomEvent('pwaInstallReady'));
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
        window.deferredPrompt = null;
        // Dispatch custom event for React components
        window.dispatchEvent(new CustomEvent('pwaInstalled'));
    });
};

// Execute initialization
initPWAInstall();

// Export for module usage
export { initPWAInstall };
