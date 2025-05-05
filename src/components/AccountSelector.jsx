import PropTypes from "prop-types";
import { LegacyLogout1pxIcon } from "@deriv/quill-icons";
import useLogout from "../hooks/useLogout";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import useWebSocket from "../hooks/useWebSocket";

const AccountSelector = ({ accounts, selected, onChange }) => {
    const { logout } = useLogout();
    const { isLogged,authorize } = useAuth();
    const { sendMessage } = useWebSocket();

    const [accountsWithBalance, setAccountsWithBalance] = useState([]);

    // 🔁 Fetch balances for all accounts
    useEffect(() => {
        const fetchBalances = async () => {
            const updatedAccounts = await Promise.all(
                accounts.map(async (acc) => {
                    try {



                        await authorize(acc.token);
                        return new Promise((resolve) => {
                            sendMessage({ balance: 1 }, (res) => {
                                console.log(res.balance)
                                resolve({
                                    ...acc,
                                    balance: res.balance?.balance || 0,
                                });
                            });
                        });
                    } catch (err) {
                        console.error("Authorization/balance fetch failed:", err);
                        return acc;
                    }
                })
            );
            setAccountsWithBalance(updatedAccounts);
        };

        if (accounts.length > 0) {
            fetchBalances();
        }
    }, [accounts]);

    // 👉 Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const options = accountsWithBalance.map((acc) => (
        <option key={acc.token} value={acc.token}>
            {`${acc.account} | ${acc.balance?.toFixed(2) || "0.00"} ${acc.currency}`}
        </option>
    ));

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-md max-w-fit">
            <select
                value={selected?.token || ''}
                onChange={(e) => {
                    const selectedAcc = accountsWithBalance.find((acc) => acc.token === e.target.value);
                    if (selectedAcc) onChange(selectedAcc);
                }}
                className="min-w-[220px] px-2 py-1 border rounded-md"
            >
                <option value="" disabled>
                    Select Account
                </option>
                {options}
            </select>

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

AccountSelector.propTypes = {
    accounts: PropTypes.array.isRequired,
    selected: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default AccountSelector;
