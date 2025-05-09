import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { LegacyLogout1pxIcon } from "@deriv/quill-icons";
import useLogout from "../hooks/useLogout";
import { useAuth } from "../hooks/useAuth.jsx";
import useWebSocket from "../hooks/useWebSocket";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../components/ui/select";

const AccountSelector = ({ accounts, selected, onChange }) => {
  const { logout } = useLogout();
  const { defaultAccount } = useAuth();
  const { sendMessage } = useWebSocket();
  const [accountsWithBalance, setAccountsWithBalance] = useState([]);

  // 🔁 Fetch balances for all accounts
  useEffect(() => {
    const fetchBalances = async () => {
      const updatedAccounts = await Promise.all(
        accounts.map((acc) => {
          return new Promise((resolve) => {
            if (acc?.token) {
              sendMessage({ authorize: acc.token }, (res) => {
                if (res?.authorize?.balance !== undefined) {
                  acc.balance = res.authorize.balance;
                }
                resolve(acc);
              });
            } else {
              resolve(acc);
            }
          });
        })
      );
      setAccountsWithBalance(updatedAccounts);
    };

    if (accounts.length > 0) {
      fetchBalances();
    }

    if (defaultAccount) {
      sendMessage({ authorize: defaultAccount.token });
    }
  }, [accounts]);

  // 🔒 Logout
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleResetBalance = (acc, e) => {
   sendMessage({"authorize" : acc.token} , resp=>{
    sendMessage({"topup_virtual":1} , res =>{sendMessage({'authorize':selected.token})}

    )
   })
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-md max-w-fit shadow-sm">
      <Select
        value={`select:${selected?.token}`}
        onValueChange={(value) => {
          const [action, token] = value.split(":");
          const acc = accountsWithBalance.find((a) => a.token === token);
          if (!acc) return;

          if (action === "select") onChange(acc);
          if (action === "reset") onChange({ ...acc, balance: 0 });
        }}
      >
        <SelectTrigger className="min-w-[250px] px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300">
          <SelectValue>
            {selected?.account
              ? `${selected.account} | ${selected.balance?.toFixed(2) || "0.00"} ${selected.currency}`
              : "Select Account"}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {accountsWithBalance.map((acc) => (
            <div
              key={acc.token}
              className="flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded"
            >
              <SelectItem
                value={`select:${acc.token}`}
                className="flex-1 truncate"
              >
                {acc.account} | {acc.balance?.toFixed(2) || "0.00"} {acc.currency}
              </SelectItem>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetBalance(acc);
                }}
                className="text-xs text-blue-600 hover:underline ml-2"
              >
                Reset
              </button>
            </div>
          ))}
        </SelectContent>
      </Select>

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
