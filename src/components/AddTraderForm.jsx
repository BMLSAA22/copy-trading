import { useState, useEffect } from "react";
import { Text, Button, TextField, Snackbar } from "@deriv-com/quill-ui";
import PropTypes from "prop-types";
import useWebSocket from "../hooks/useWebSocket";
import { useAuth } from "../hooks/useAuth.jsx";
import ActiveSymbolsSelector from "./ActiveSymbolsSelector";
import TradeTypeSelector from "./TradeTypeSelector";

const AddTraderForm = ({ onAddTrader }) => {
    const [traderData, setTraderData] = useState({
        token: "",
        maxStake: null,
        minStake: null,
        selectedSymbols: [],
        selectedContracts: [],
    });

    const { sendMessage, lastMessage } = useWebSocket();
    const { isAuthorized, isConnected } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: "",
        status: "neutral",
    });

    useEffect(() => {
        if (!lastMessage || !isProcessing) return;

        if (lastMessage.msg_type === "copy_start") {
            setIsProcessing(false);

            if (lastMessage.error) {
                setSnackbar({
                    isVisible: true,
                    message:
                        lastMessage.error.message ||
                        "Failed to start copy trading",
                    status: "fail",
                });
            } else {
                onAddTrader?.(traderData);
                setTraderData({
                    token: "",
                    maxStake: null,
                    minStake: null,
                    selectedSymbols: [],
                    selectedContracts: [],
                });
                setSnackbar({
                    isVisible: true,
                    message: "Successfully started copy trading",
                    status: "neutral",
                });
            }
        }
    }, [lastMessage, isProcessing, onAddTrader, traderData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // if (!isConnected || !isAuthorized) {
        //     setSnackbar({
        //         isVisible: true,
        //         message: "Not connected to server",
        //         status: "fail",
        //     });
        //     return;
        // }
        const { maxStake, minStake } = traderData;

        if (minStake && maxStake && minStake > maxStake) {
            setSnackbar({
                isVisible: true,
                message: "Minimum stake cannot be greater than maximum stake",
                status: "fail",
            });
            return;
        }

        setIsProcessing(true);
        const copyStartPayload = {
            copy_start: traderData.token,
        };

        if (maxStake) {
            copyStartPayload.max_trade_stake = maxStake;
        }

        if (minStake) {
            copyStartPayload.min_trade_stake = minStake;
        }

        if (traderData.selectedSymbols.length > 0) {
            copyStartPayload.assets = traderData.selectedSymbols.map(
                (s) => s.symbol
            );
        }

        if (traderData.selectedContracts.length > 0) {
            copyStartPayload.trade_types = traderData.selectedContracts.flatMap(
                (contract) =>
                    Object.values(contract.sentiments).map(
                        (sentiment) => sentiment.contract_type
                    )
            );
        }

        sendMessage(copyStartPayload);
    };

    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, isVisible: false }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTraderData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg border shadow-sm mb-8 flex flex-col gap-4">
                <Text size="xl" bold className="text-gray-600">
                    Copy a trader
                </Text>
                <Text size="sm" className="text-gray-600">
                    Enter trading details to start copying a trader
                </Text>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col md:flex-row gap-4 min-h-[56px]">
                                <TextField
                                    label="Trading Token"
                                    name="token"
                                    value={traderData.token}
                                    onChange={handleChange}
                                    placeholder="Enter trading token"
                                    required
                                />
                                <Button
                                    className="w-full md:w-auto md:p-7"
                                    type="submit"
                                    variant="primary"
                                    disabled={!traderData.token.trim()}
                                >
                                    Start Copying
                                </Button>


                            </div>
                            <div className="flex flex-col gap-2">
                                <Text bold className="text-gray-600">
                                    Stake
                                </Text>
                                <Text size="sm" className="text-gray-600">
                                    Choose the minimum and maximum stake limits
                                    for your trade.
                                </Text>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:flex-1">
                                        <TextField
                                            className="w-full"
                                            label="Minimum Stake (Optional)"
                                            name="minStake"
                                            type="number"
                                            min="0"
                                            value={traderData.minStake ?? ""}
                                            onChange={handleChange}
                                            placeholder="Enter minimum stake"
                                            message={
                                                traderData.minStake !== null &&
                                                Number(traderData.minStake) <= 0
                                                    ? "Stake should be more than 0"
                                                    : ""
                                            }
                                            status={
                                                traderData.minStake !== null &&
                                                Number(traderData.minStake) <= 0
                                                    ? "error"
                                                    : undefined
                                            }
                                        />
                                    </div>
                                    <div className="w-full md:flex-1">
                                        <TextField
                                            className="w-full"
                                            label="Maximum Stake (Optional)"
                                            name="maxStake"
                                            type="number"
                                            min="0"
                                            value={traderData.maxStake ?? ""}
                                            onChange={handleChange}
                                            placeholder="Enter maximum stake"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-4">
                            <ActiveSymbolsSelector
                                selectedSymbols={traderData.selectedSymbols}
                                onChange={(symbols) =>
                                    setTraderData((prev) => ({
                                        ...prev,
                                        selectedSymbols: symbols,
                                    }))
                                }
                            />
                            <TradeTypeSelector
                                selectedContracts={traderData.selectedContracts}
                                onChange={(contracts) =>
                                    setTraderData((prev) => ({
                                        ...prev,
                                        selectedContracts: contracts,
                                    }))
                                }
                            />
                        </div>
                    </div>
                </form>
            </div>
            <div className="fixed top-0 left-0 right-0 flex justify-center pt-4 z-50">
                <Snackbar
                    isVisible={snackbar.isVisible}
                    message={snackbar.message}
                    status={snackbar.status}
                    hasCloseButton={true}
                    onCloseAction={handleSnackbarClose}
                    standalone={true}
                />
            </div>
        </>
    );
};

AddTraderForm.propTypes = {
    onAddTrader: PropTypes.func,
};

export default AddTraderForm;
