import { useState, useEffect } from "react";
import { SegmentedControlSingleChoice, Skeleton } from "@deriv-com/quill-ui";
import { useAuth } from "../hooks/useAuth.jsx";
import useSettings from "../hooks/useSettings.js";
import TraderDashboard from "./TraderDashboard";
import CopierDashboard from "./CopierDashboard";

const Dashboard = () => {
    const { isLoading: authLoading } = useAuth();
    const {
        settings,
        isLoading: settingsLoading,
        updateSettings,
        fetchSettings,
    } = useSettings();
    const [userType, setUserType] = useState(
        settings?.allow_copiers ? "trader" : "copier"
    );

    // Update userType when settings change
    useEffect(() => {
        if (settings) {
            setUserType(settings.allow_copiers ? "trader" : "copier");
        }
    }, [settings]);

    // const isLoading = authLoading || settingsLoading;
    const isLoading = false

    return (
        <div className="min-h-screen">
            <div className="md:max-w-6xl mx-auto md:p-6">
                {/* User Type Selection */}
                <div className="flex justify-center mt-4 md:mt-6 mb-8">
                    <SegmentedControlSingleChoice
                        onChange={(index) => {
                            setUserType(index === 0 ? "copier" : "trader");
                        }}
                        options={[
                            {
                                label: "Copy",
                                disabled: isLoading,
                            },
                            {
                                label: "Trade",
                                disabled: isLoading,
                            },
                        ]}
                        selectedItemIndex={userType === "copier" ? 0 : 1}
                        size="md"
                    />
                </div>

                {/* Dashboard Content */}
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square
                                active
                                rounded
                                width="100%"
                                height="100px"
                            />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square
                                active
                                rounded
                                width="100%"
                                height="200px"
                            />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square
                                active
                                rounded
                                width="100%"
                                height="150px"
                            />
                        </div>
                    </div>
                ) : userType === "trader" ? (
                    <TraderDashboard
                        settings={settings}
                        updateSettings={updateSettings}
                        fetchSettings={fetchSettings}
                    />
                ) : userType === "copier" ? (
                    <CopierDashboard
                        settings={settings}
                        updateSettings={updateSettings}
                        fetchSettings={fetchSettings}
                    />
                ) : (
                    <CopierDashboard
                        settings={settings}
                        updateSettings={updateSettings}
                        fetchSettings={fetchSettings}
                    />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
