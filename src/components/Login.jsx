import { Spinner, Text, Button } from "@deriv-com/quill-ui";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { defaultAccount, isLoading, updateAccounts } = useAuth();

    const settings = JSON.parse(localStorage.getItem("deriv_endpoint_settings") || "{}");
    const server = settings.server;
    const appId = 72191;

    // Parse URL parameters
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace("#", ""));

    useEffect(() => {
        console.log("🔍 Checking URL params for OAuth redirect...");
        console.log("📌 Search:", location.search);
        console.log("📌 Hash:", location.hash);

        const handleOAuthRedirect = () => {
            const accounts = [];
            let defaultAcct = null;
            let index = 1;

            while (searchParams.has(`acct${index}`) || hashParams.has(`acct${index}`)) {
                const account = {
                    account: searchParams.get(`acct${index}`) || hashParams.get(`acct${index}`),
                    token: searchParams.get(`token${index}`) || hashParams.get(`token${index}`),
                    currency: searchParams.get(`cur${index}`) || hashParams.get(`cur${index}`),
                };

                if (account.account && account.token) {
                    accounts.push(account);
                    if (index === 1) defaultAcct = account;
                }

                index++;
            }

            if (accounts.length > 0) {
                updateAccounts(defaultAcct, accounts.slice(1));
                window.location.href = `${window.location.origin}/dashboard`;
                return true;
            }

            return false;
        };

        // Try handling redirect if token/account info is in the URL
        const redirected = handleOAuthRedirect();
        if (redirected) return;

        // If already authenticated, redirect to dashboard
        if (!isLoading && defaultAccount?.token) {
            navigate("/dashboard");
        }

    }, [defaultAccount?.token, isLoading, navigate, updateAccounts]); // Exclude `location` to avoid unnecessary re-renders

    const showSpinner = (
        isLoading ||
        location.search ||
        location.hash.includes("acct")
    ) && !defaultAccount?.token;

    return (
        <div className="min-h-screen">
            {showSpinner ? (
                <div className="flex items-center justify-center min-h-screen">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-8 lg:px-16 text-center">
                    <Text
                        as="h1"
                        size="6xl"
                        className="font-bold mb-6 max-w-3xl text-[2.5rem] md:text-[3.5rem] lg:text-[4rem]"
                    >
                        Deriv: Where Smart Traders Copy Smarter
                    </Text>
                    <Text
                        size="lg"
                        className="mt-6 mb-12 max-w-2xl text-gray-600"
                    >
                        Mirror the success of top traders automatically. Set up in minutes and start making gains.
                    </Text>
                    <Button
                        variant="primary"
                        size="lg"
                        className="mt-6"
                        onClick={() =>
                            window.location.href = `https://${server}/oauth2/authorize?app_id=${appId}`
                        }
                    >
                        Get started
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Login;
