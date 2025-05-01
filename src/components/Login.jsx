import { Spinner, Text, Button } from "@deriv-com/quill-ui";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { defaultAccount, isLoading, updateAccounts } = useAuth();
    const settings = JSON.parse(
        localStorage.getItem("deriv_endpoint_settings") || "{}"
    );
    const server = settings.server;
    const appId = 72191;

    useEffect(() => {
        const handleOAuthRedirect = () => {
            const urlParams = new URLSearchParams(
                window.location.search || location.search
            );
            const hashParams = new URLSearchParams(
                location.hash.replace("#", "")
            );

            const accounts = [];
            let defaultAcct = null;

            // Iterate through params to find account data
            let index = 1;
            while (
                urlParams.has(`acct${index}`) ||
                hashParams.has(`acct${index}`)
            ) {
                const account = {
                    account:
                        urlParams.get(`acct${index}`) ||
                        hashParams.get(`acct${index}`),
                    token:
                        urlParams.get(`token${index}`) ||
                        hashParams.get(`token${index}`),
                    currency:
                        urlParams.get(`cur${index}`) ||
                        hashParams.get(`cur${index}`),
                };

                if (account.account && account.token) {
                    accounts.push(account);
                    if (index === 1) {
                        defaultAcct = account;
                    }
                }
                index++;
            }

            if (accounts.length > 0) {
                const otherAccounts = accounts.slice(1);
                updateAccounts(defaultAcct, otherAccounts);
                window.location.href = `${window.location.origin}/dashboard`;
                return true;
            }
            return false;
        };

        // Only handle OAuth redirect if we have query params or hash
        if (window.location.search || window.location.hash) {
            const redirectHandled = handleOAuthRedirect();
            if (redirectHandled) return;
        }

        // Regular login flow - redirect if already logged in
        if (!isLoading && defaultAccount?.token) {
            navigate("/dashboard");
        }
    }, [defaultAccount?.token, navigate, isLoading, updateAccounts]); // Removed location dependency

    const showSpinner =
        (isLoading ||
            window.location.search ||
            window.location.hash.includes("acct")) &&
        !defaultAccount?.token;

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
                        Mirror the success of top traders automatically. Set up
                        in minutes and start makin gains
                    </Text>
                    <Button
                        variant="primary"
                        size="lg"
                        className="mt-6"
                        onClick={() =>
                            (window.location.href = `https://${server}/oauth2/authorize?app_id=72191`)
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
