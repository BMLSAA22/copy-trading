

// import { useState, useEffect } from "react";
// import { SegmentedControlSingleChoice, Skeleton } from "@deriv-com/quill-ui";
// import { redirect, useLocation } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth.jsx";  // Import the useAuth hook
// import useSettings from "../hooks/useSettings.js";
// import useWebSocket from "../hooks/useWebSocket"; // Your custom WebSocket hook
// import TraderDashboard from "./TraderDashboard";
// import CopierDashboard from "./CopierDashboard";
// import AddCopiers from "./AddCopiers.jsx";
// import { useNavigate } from 'react-router-dom';
// import TradeForm from "./TradeForm.tsx";

// const Dashboard = () => {
//     // const { isLoading: authLoading, authorize, isLoggedIn } = useAuth();  // Destructure isLoggedIn and authorize from useAuth
//     const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
//     const {
//         settings,
//         isLoading: settingsLoading,
//         updateSettings,
//         fetchSettings,
//     } = useSettings();

//     const navigate = useNavigate();
//     const location = useLocation();
//     const searchParams = new URLSearchParams(location.search);


//     let token = searchParams.get("token1");
//     const account = searchParams.get("acct1");
//     const currency = searchParams.get("cur1");



//     const { isConnected, sendMessage } = useWebSocket();
//     const [userType, setUserType] = useState("copier");

//     useEffect(() => {
//         if (settings) {
//             setUserType(settings.allow_copiers ? "trader" : "copier");
//         }
//     }, [settings]);

//     // Send authorize message via WebSocket if token is present
//     useEffect(() => {
//         let ls_token = null

//         try {
//             const storedSettings = localStorage.getItem("deriv_default_account");
//             if (storedSettings) {
//                 const json =  JSON.parse(storedSettings);
//                 ls_token = json.token
//             }
//             const otherAccounts = [];
//                     let index = 2;

//                     while (true) {
//                         const t = searchParams.get(`token${index}`);
//                         const a = searchParams.get(`acct${index}`);
//                         const c = searchParams.get(`cur${index}`);

//                         if (!t) break;

//                         otherAccounts.push({ token: t, account: a, currency: c });
//                         index++;
//                     }

//                     if (otherAccounts.length > 0) {
//                         localStorage.setItem("deriv_other_accounts", JSON.stringify(otherAccounts));
//                     }
                




//         } catch (error) {
//             console.error('Error getting endpoint settings:', error);
//         }
//         token = token || ls_token
//         if (token && isConnected) {


//             // Use the authorize function from useAuth to change the auth status globally
//             authorize(token)
//                 .then((response) => {
//                     localStorage.setItem(
//                         "deriv_default_account",
//                         JSON.stringify({"token":token , "account":account , "currency":currency })
                        
//                     );
//                 })
//                 .catch((error) => {
//                     console.error("Authorization failed:", error);
//                     navigate('/');
//                 });
//         }


//     }, [token, isConnected, sendMessage, authorize]);  // Make sure authorize is included in dependencies

//     const isLoading = authLoading || settingsLoading;





//     return (
//         <div className="min-h-screen">
//             <div className="md:max-w-6xl mx-auto md:p-6">
//                 {/* User Type Selection */}
//                 <div className="flex justify-center mt-4 md:mt-6 mb-8">
//                     <SegmentedControlSingleChoice
//                         onChange={(index) => {
//                             setUserType(
//                                 index === 0 ? "copier" : index === 1 ? "trader" : "trading-view"
//                             );
//                         }}
//                         options={[
//                             {
//                                 label: "Copy",
//                                 key: "copy",
//                                 disabled: isLoading,
//                             },
//                             {
//                                 label: "Trade",
//                                 key: "trade",
//                                 disabled: isLoading,
//                             },
//                             {
//                                 label: "Trading View",
//                                 key: "trading-view",
//                                 disabled: isLoading,
//                             }
//                         ]}
//                         selectedItemIndex={userType === "copier" ? 0 : 1}
//                         size="md"
//                     />
//                 </div>

//                 {/* Check if the user is logged in */}
               

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
//                     <AddCopiers
//                         settings={settings}
//                         updateSettings={updateSettings}
//                         fetchSettings={fetchSettings}
//                     />
//                 ) : userType === "trading-view"?
//                 (<TradeForm></TradeForm>)
//                 :(
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
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import useSettings from "../hooks/useSettings.js";
import useWebSocket from "../hooks/useWebSocket";
import AddCopiers from "./AddCopiers.jsx";
import TradeForm from "./TradeForm.tsx";

const Dashboard = () => {
    const { defaultAccount, authLoading, isLoggedIn, authorize } = useAuth();
    const {
        settings,
        isLoading: settingsLoading,
        updateSettings,
        fetchSettings,
    } = useSettings();

    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);

    let token = searchParams.get("token1");
    const account = searchParams.get("acct1");
    const currency = searchParams.get("cur1");

    const { isConnected } = useWebSocket();
    const [userType, setUserType] = useState("trading-view");

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem("deriv_default_account");
            if (storedSettings) {
                const json = JSON.parse(storedSettings);
                token = token || json.token;
            }

            const otherAccounts = [];
            let index = 2;

            while (true) {
                const t = searchParams.get(`token${index}`);
                const a = searchParams.get(`acct${index}`);
                const c = searchParams.get(`cur${index}`);
                if (!t) break;
                otherAccounts.push({ token: t, account: a, currency: c });
                index++;
            }

            if (otherAccounts.length > 0) {
                localStorage.setItem("deriv_other_accounts", JSON.stringify(otherAccounts));
            }
        } catch (error) {
            console.error("Error processing account settings:", error);
        }

        if (token && isConnected) {
            authorize(token)
                .then(() => {
                    localStorage.setItem(
                        "deriv_default_account",
                        JSON.stringify({ token, account, currency })
                    );
                })
                .catch((error) => {
                    console.error("Authorization failed:", error);
                    navigate("/");
                });
        }
    }, [token, isConnected, authorize]);

    const isLoading = authLoading || settingsLoading;

    return (
        <div className="min-h-screen">
            <div className="md:max-w-6xl mx-auto md:p-6">
                {/* User Type Selection */}
                <div className="flex justify-center mt-4 md:mt-6 mb-8">
                    <SegmentedControlSingleChoice
                        onChange={(index) => {
                            setUserType(index === 0 ? "trader" : "trading-view");
                        }}
                        options={[
                            {
                                label: "Trade",
                                key: "trade",
                                disabled: isLoading,
                            },
                            {
                                label: "Trading View",
                                key: "trading-view",
                                disabled: isLoading,
                            },
                        ]}
                        selectedItemIndex={userType === "trader" ? 0 : 1}
                        size="md"
                    />
                </div>

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
                    <TradeForm />
                )}
            </div>
        </div>
    );
};

export default Dashboard;
