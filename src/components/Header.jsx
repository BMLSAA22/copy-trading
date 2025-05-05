// import { Text, Button, Skeleton } from "@deriv-com/quill-ui";
// import AccountSelector from "./AccountSelector";
// import derivIcon from "../assets/deriv-icon.svg";
// import { useAuth } from "../hooks/useAuth.jsx";
// import useBalance from "../hooks/useBalance";
// import useLogout from "../hooks/useLogout";
// import { useEffect, useState } from "react";
// import useWebSocket from "../hooks/useWebSocket.js";

// const Header = () => {

    
//     const { sendMessage } = useWebSocket();
//     const [account, setAccount] = useState(null);
//     const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
//     const balances = useBalance();
//     const settings = JSON.parse(
//         localStorage.getItem("deriv_endpoint_settings") || "{}"
//     );
//     const server = settings.server;
//     const appId = settings.appId;
//     const { logout } = useLogout();



//     const handleDerivLogin = () => {
//         window.location.href = `https://${server}/oauth2/authorize?app_id=${appId}`;
//     };

//         useEffect(() => {
//             if(isLoggedIn){
//             sendMessage({"balance":1} , (response)=>{

//                 setAccount(response.balance)

//             })}
           
//         }, [isLoggedIn]);

//     return (
//         <header className="sticky top-0 z-50 bg-white shadow-sm">
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//                 <div className="flex justify-between items-center">
//                     <div className="flex items-center gap-2">
//                         <img src={derivIcon} alt="Deriv" className="w-6 h-6" />
//                         <Text size="lg" bold>
//                             Copy Trading
//                         </Text>
//                     </div>

//                     <div className="flex items-center space-x-4">
//                         {!account ? (
//                             <>
//                                 <div className="w-40 h-8">
//                                     <Skeleton.Square
//                                         active
//                                         rounded
//                                         width="100%"
//                                     />
//                                 </div>
//                                 <div className="w-20 h-8">
//                                     <Skeleton.Square
//                                         active
//                                         rounded
//                                         width="100%"
//                                     />
//                                 </div>
//                             </>
//                         ) : (
//                             <>
//                                 {account!=null ? (
//                                     <AccountSelector
//                                         account={account}
//                                     />
//                                 ) : (
//                                     <Button
//                                         variant="primary"
//                                         size="md"
//                                         onClick={handleDerivLogin}
//                                     >
//                                         Log in
//                                     </Button>
//                                 )}
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </header>
//     );
// };

// export default Header;


import { Text, Button, Skeleton } from "@deriv-com/quill-ui";
import AccountSelector from "./AccountSelector";
import derivIcon from "../assets/deriv-icon.svg";
import { useAuth } from "../hooks/useAuth.jsx";
import useBalance from "../hooks/useBalance";
import useLogout from "../hooks/useLogout";
import { useEffect, useState, useMemo } from "react";
import useWebSocket from "../hooks/useWebSocket.js";

const Header = () => {
    const { sendMessage } = useWebSocket();
    const {
        defaultAccount,
        otherAccounts,
        isLoggedIn,
        authorize,
        updateAccounts,
    } = useAuth();

    const balances = useBalance();
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountBalance, setAccountBalance] = useState(null);
    const settings = JSON.parse(localStorage.getItem("deriv_endpoint_settings") || "{}");
    const { logout } = useLogout();

    const server = settings.server;
    const appId = settings.appId;

    // Combine all available accounts
    const allAccounts = useMemo(() => {
        const accounts = [];
        if (defaultAccount) accounts.push(defaultAccount);
        if (Array.isArray(otherAccounts)) accounts.push(...otherAccounts);

        console.log("accounts" , accounts)
        return accounts;
    }, [defaultAccount, otherAccounts]);

    // Deriv login button action
    const handleDerivLogin = () => {
        window.location.href = `https://${server}/oauth2/authorize?app_id=${appId}`;
    };

    // Set default selected account and get balance
    useEffect(() => {
        if (defaultAccount && !selectedAccount) {
            setSelectedAccount(defaultAccount);
        }
    }, [defaultAccount]);

    // When selected account changes, authorize and get balance
    useEffect(() => {
        if (selectedAccount?.token && isLoggedIn) {
            authorize(selectedAccount.token).then(() => {
                sendMessage({ balance: 1 }, (response) => {
                    setAccountBalance(response.balance);
                });
            });
        }
    }, [selectedAccount, isLoggedIn]);

    const handleAccountChange = (newAccount) => {
        setSelectedAccount(newAccount);
    };

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src={derivIcon} alt="Deriv" className="w-6 h-6" />
                        <Text size="lg" bold>
                            Copy Trading
                        </Text>
                    </div>

                    <div className="flex items-center space-x-4">
                        {!accountBalance ? (
                            <>
                                <div className="w-40 h-8">
                                    <Skeleton.Square active rounded width="100%" />
                                </div>
                                <div className="w-20 h-8">
                                    <Skeleton.Square active rounded width="100%" />
                                </div>
                            </>
                        ) : (
                            <>
                                {selectedAccount ? (
                                   <AccountSelector
                                   accounts={allAccounts}
                                   selected={selectedAccount}
                                   onChange={handleAccountChange}
                               />
                               
                                ) : (
                                    <Button variant="primary" size="md" onClick={handleDerivLogin}>
                                        Log in
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

