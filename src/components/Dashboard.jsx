// // 

// import { useState, useEffect } from "react";
// import { SegmentedControlSingleChoice, Skeleton } from "@deriv-com/quill-ui";
// import { useAuth } from "../hooks/useAuth.jsx";
// import useSettings from "../hooks/useSettings.js";
// import TraderDashboard from "./TraderDashboard";
// import CopierDashboard from "./CopierDashboard";

// const Dashboard = () => {
//     const { isLoading: authLoading } = useAuth();
//     const {
//         settings,
//         isLoading: settingsLoading,
//         updateSettings,
//         fetchSettings,
//     } = useSettings();

//     // const isLoading = authLoading || settingsLoading;
//     const isLoading = false

//     // Start with a default view (e.g., "copier") and update later
//     const [userType, setUserType] = useState("copier");

//     useEffect(() => {
//         if (settings) {
//             setUserType(settings.allow_copiers ? "trader" : "copier");
//         }
//     }, [settings]);

//     return (
//         <div className="min-h-screen">
//             <div className="md:max-w-6xl mx-auto md:p-6">
//                 {/* User Type Selection */}
//                 <div className="flex justify-center mt-4 md:mt-6 mb-8">
//                     <SegmentedControlSingleChoice
//                         onChange={(index) => {
//                             setUserType(index === 0 ? "copier" : "trader");
//                         }}
//                         options={[
//                             {
//                                 label: "Copy",
//                                 disabled: isLoading,
//                             },
//                             {
//                                 label: "Trade",
//                                 disabled: isLoading,
//                             },
//                         ]}
//                         selectedItemIndex={userType === "copier" ? 0 : 1}
//                         size="md"
//                     />
//                 </div>

//                 {/* Dashboard Content */}
//                 {isLoading ? (
//                     <div className="space-y-4">
//                         <div className="bg-white p-6 rounded-lg shadow">
//                             <Skeleton.Square active rounded width="100%" height="100px" />
//                         </div>
//                         <div className="bg-white p-6 rounded-lg shadow">
//                             <Skeleton.Square active rounded width="100%" height="200px" />
//                         </div>
//                         <div className="bg-white p-6 rounded-lg shadow">
//                             <Skeleton.Square active rounded width="100%" height="150px" />
//                         </div>
//                     </div>
//                 ) : userType === "trader" ? (
//                     <TraderDashboard
//                         settings={settings}
//                         updateSettings={updateSettings}
//                         fetchSettings={fetchSettings}
//                     />
//                 ) : (
//                     <CopierDashboard
//                         settings={settings}
//                         updateSettings={updateSettings}
//                         fetchSettings={fetchSettings}
//                     />
//                 )}


//             </div>
//         </div>
//     );
// };

// export default Dashboard;


import { useState, useEffect } from "react";
import { SegmentedControlSingleChoice, Skeleton } from "@deriv-com/quill-ui";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";  // Import the useAuth hook
import useSettings from "../hooks/useSettings.js";
import useWebSocket from "../hooks/useWebSocket"; // Your custom WebSocket hook
import TraderDashboard from "./TraderDashboard";
import CopierDashboard from "./CopierDashboard";
import AddCopiers from "./AddCopiers.jsx";

const Dashboard = () => {
    // const { isLoading: authLoading, authorize, isLoggedIn } = useAuth();  // Destructure isLoggedIn and authorize from useAuth
    const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
    const {
        settings,
        isLoading: settingsLoading,
        updateSettings,
        fetchSettings,
    } = useSettings();


    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token1");
    const account = searchParams.get("acct1");
    const currency = searchParams.get("curr1");

    const { isConnected, sendMessage } = useWebSocket();
    const [userType, setUserType] = useState("copier");

    useEffect(() => {
        if (settings) {
            setUserType(settings.allow_copiers ? "trader" : "copier");
        }
    }, [settings]);

    // Send authorize message via WebSocket if token is present
    useEffect(() => {
        if (token && isConnected) {
            console.log("🔐 Sending authorize with token:", token);

            // Use the authorize function from useAuth to change the auth status globally
            authorize(token)
                .then((response) => {
                    console.log("✅ Authorization response:", response);
                    localStorage.setItem(
                        "deriv_default_account",
                        JSON.stringify({"token":token , "account":account , "currency":currency })
                        
                    );

                    // console.log(response.authorize.account_list)
                    // updateAccounts(response.authorize.account_list ,response.authorize.account_list.slice(0) )
                    // console.log(response.authorize.account_list)
                })
                .catch((error) => {
                    console.error("Authorization failed:", error);
                });
        }

        // // Log all URL params
        // console.log("🌐 URL Params:");
        // for (const [key, value] of searchParams.entries()) {
        //     console.log(`${key}: ${value}`);
        // }
    }, [token, isConnected, sendMessage, authorize]);  // Make sure authorize is included in dependencies

    const isLoading = authLoading || settingsLoading; // Loading state for both auth and settings

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

                {/* Check if the user is logged in */}
                {isLoggedIn ? (
                    <div>Welcome, you are logged in!</div>
                ) : (
                    <div>Please log in to continue</div>
                )}

                {/* Dashboard Content */}
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square active rounded width="100%" height="100px" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square active rounded width="100%" height="200px" />
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <Skeleton.Square active rounded width="100%" height="150px" />
                        </div>
                    </div>
                ) : userType === "trader" ? (
                    <AddCopiers
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
