// 

import { useState } from "react";
import { Spinner, SectionMessage } from "@deriv-com/quill-ui";
import PropTypes from "prop-types";
import useCopyTradersList from "../hooks/useCopyTradersList";
import TraderStatistics from "./TraderStatistics";
import TraderBanner from "./TraderBanner";
import TokenManagement from "./TokenManagement";
import Settings from "./Settings";
import TraderDesktopNavigation from "./TraderDesktopNavigation";
import TraderMobileNavigation from "./TraderMobileNavigation";
import { useNavigate } from "react-router-dom";

const AddCopiers = ({ settings, updateSettings, fetchSettings }) => {
    const { traders, isLoading: tradersLoading } = useCopyTradersList();
    const [selectedMenu, setSelectedMenu] = useState("statistics");

    const [accessGranted, setAccessGranted] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const correctPassword = "supersecret123"; // Set your access password

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInput === correctPassword) {
            setAccessGranted(true);
        } else {
            setError("Incorrect password. Try again.");
            setPasswordInput("");
        }
    };

    const handleCancel = () => {
        window.location.reload(); // Go back to previous page
    };

    const handleStartTrading = async () => {
        try {
            await updateSettings({ allow_copiers: 1 });
            fetchSettings();
        } catch (error) {
            console.error("Failed to update settings:", error);
        }
    };

    if (!accessGranted) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center">
                    <h2 className="text-2xl font-semibold mb-4">Protected Page</h2>
                    <p className="mb-6 text-gray-600">Please enter the password to continue.</p>
                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        />
                        {error && (
                            <p className="text-red-500 text-sm mb-2">{error}</p>
                        )}
                        <div className="flex space-x-4 mt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
                            >
                                Unlock
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (tradersLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row gap-6">
                <TraderDesktopNavigation
                    selectedMenu={selectedMenu}
                    onMenuSelect={setSelectedMenu}
                />
                <div className="flex-1 pb-20 md:pb-0">
                    {selectedMenu === "statistics" && <TraderStatistics />}
                    {selectedMenu === "tokens" && <TokenManagement />}
                    {selectedMenu === "settings" && (
                        <Settings
                            settings={settings}
                            updateSettings={updateSettings}
                            onChangeSettings={fetchSettings}
                        />
                    )}
                </div>
                <TraderMobileNavigation
                    selectedMenu={selectedMenu}
                    onMenuSelect={setSelectedMenu}
                />
            </div>
        </div>
    );
};

AddCopiers.propTypes = {
    settings: PropTypes.object,
    updateSettings: PropTypes.func.isRequired,
    fetchSettings: PropTypes.func.isRequired,
};

export default AddCopiers;
