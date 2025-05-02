import { useEffect, useState } from "react";
import { Text, Snackbar, Spinner, SectionMessage } from "@deriv-com/quill-ui";
import PropTypes from "prop-types";
import useCopyTradersList from "../hooks/useCopyTradersList";
import CopyTradingBanner from "./CopyTradingBanner";
import useCopyStart from "../hooks/useCopyStart";
import useCopyStop from "../hooks/useCopyStop";
import AddTraderForm from "./AddTraderForm";
import TraderCard from "./TraderCard";

const CopierDashboard = ({ settings, updateSettings, fetchSettings }) => {
    const showCopierBanner = settings?.allow_copiers === 1;
    const { startCopyTrading, processingTrader: copyStartProcessingTrader } =
        useCopyStart();
    const { stopCopyTrading, processingTrader: copyStopProcessingTrader } =
        useCopyStop();
    const {
        copiers,
        traders: apiTraders,
        isLoading,
        error,
        refreshList,
    } = useCopyTradersList();
    const hasCopiers = copiers?.length > 0;

    useEffect(() => {
        console.log("CopierDashboard - Traders:", {
            apiTraders,
            isLoading,
            error,
        });
    }, [apiTraders, isLoading, error]);
    const isProcessing = copyStartProcessingTrader || copyStopProcessingTrader;
    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        message: "",
        status: "neutral",
    });

    const handleSnackbarClose = () => {
        setSnackbar((prev) => ({ ...prev, isVisible: false }));
    };

    const handleStartCopy = (trader) => {


        console.log('we are here in start copying trader here')
        startCopyTrading(
            trader,
            (trader) => {
                setSnackbar({
                    isVisible: true,
                    message: `Successfully started copying ${trader.id}`,
                    status: "neutral",
                });
            },
            (errorMessage) => {
                setSnackbar({
                    isVisible: true,
                    message: errorMessage,
                    status: "fail",
                });
            }
        );
    };

    const handleStopCopy = (trader) => {
        stopCopyTrading(
            trader,
            (trader) => {
                setSnackbar({
                    isVisible: true,
                    message: `Stopped copying ${trader.name}`,
                    status: "neutral",
                });
                refreshList();
            },
            (errorMessage) => {
                setSnackbar({
                    isVisible: true,
                    message: errorMessage,
                    status: "fail",
                });
            }
        );
    };

    const handleAddTrader = (trader) => {
        console.log("New trader added:", trader);
        // Refresh the traders list from API
        refreshList();
    };

    const handleGetStarted = async () => {
        try {
            await updateSettings({ allow_copiers: 0 });
            await fetchSettings();
        } catch (error) {
            setSnackbar({
                isVisible: true,
                message: error.message || "Failed to update settings",
                status: "fail",
            });
        }
    };

    if (false) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 relative">
            {showCopierBanner && !hasCopiers && (
                <CopyTradingBanner onGetStarted={handleGetStarted} />
            )}
            {hasCopiers && (
                <SectionMessage
                    message="Traders are not permitted to copy other traders."
                    size="sm"
                    status="danger"
                />
            )}
            <div className="relative">
                {(hasCopiers || showCopierBanner) && (
                    <div className="absolute inset-0 bg-gray-50/70 z-30" />
                )}
                <AddTraderForm onAddTrader={handleAddTrader} />

                <div className="mb-8">
                    <Text size="lg" bold>
                        Actively Copied Traders
                    </Text>
                </div>

                {error ? (
                    <div className="text-center py-8 text-red-600">
                        Error loading traders: {error}
                    </div>
                ) : !apiTraders?.length ? (
                    <div className="text-center py-8">No traders available</div>
                ) : (
                    <div className="grid gap-6">
                        {apiTraders?.map((trader) => (
                            <TraderCard
                                key={trader.loginid}
                                trader={trader}
                                onStartCopy={handleStartCopy}
                                onStopCopy={handleStopCopy}
                                isProcessing={isProcessing}
                            />
                        ))}
                    </div>
                )}  
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
        </div>
    );
};

CopierDashboard.propTypes = {
    settings: PropTypes.object,
    updateSettings: PropTypes.func.isRequired,
    fetchSettings: PropTypes.func.isRequired,
};

export default CopierDashboard;
