import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth.jsx";
import { LegacyLogout1pxIcon } from "@deriv/quill-icons";
import useLogout from "../hooks/useLogout";

const AccountSelector = ({ account }) => {
    const { logout } = useLogout();
    const { clearAccounts } = useAuth();
    console.log('account from header logout' , account )


    const label = `${account.loginid} | ${
        account.balance
            ? `${account.balance.toFixed(2)} ${account.currency}`
            : `0.00 ${account.currency}`
    }`;
        const handleLogout = async () => {
            try {
                await logout();
                window.location.href = "/";
            } catch (error) {
                console.error("Logout failed:", error);
            }
        };
    

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md max-w-fit">
            <span className="text-sm font-medium">{label}</span>
            <button
                onClick={handleLogout}
                className="hover:opacity-75 transition"
                title="Logout"
            >
                <LegacyLogout1pxIcon fill="#000000" iconSize="xs" />
            </button>
        </div>
    );
};



export default AccountSelector;
