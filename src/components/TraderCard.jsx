import { Text, Button } from "@deriv-com/quill-ui";
import { LabelPairedChevronDownCaptionBoldIcon } from "@deriv/quill-icons";
import PropTypes from "prop-types";
import { useState, useMemo } from "react";
import ProfitableTrades from "./ProfitableTrades";
import useCopyTradingStats from "../hooks/useCopyTradingStats";
import useSymbolDisplayNames from "../hooks/useSymbolDisplayNames";
import useContractCategoryDisplay from "../hooks/useContractCategoryDisplay";

const TraderCard = ({ trader, onStopCopy }) => {
    const { stats, isLoading, fetchStats } = useCopyTradingStats(
        trader.loginid
    );
    const [showStats, setShowStats] = useState(false);

    const { displayNames } = useSymbolDisplayNames(trader.assets || []);
    const { contractCategoryDisplays } = useContractCategoryDisplay(
        trader.trade_types || []
    );
    const assetsDisplay = useMemo(() => {
        if (!trader.assets?.length) return "-";
        if (trader.assets.length === 1 && trader.assets[0] === "*")
            return "All";
        return displayNames.join(", ") || "-";
    }, [trader.assets, displayNames]);

    const handleStopCopy = () => {
        onStopCopy(trader);
    };

    const toggleStats = () => {
        const newShowStats = !showStats;
        setShowStats(newShowStats);

        if (newShowStats && trader.loginid) {
            fetchStats();
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div>
                    <Text size="sm" className="text-gray-500">
                        Trader
                    </Text>
                    <Text size="xl" bold>
                        {trader.loginid}
                    </Text>
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <Button
                        variant="secondary"
                        onClick={handleStopCopy}
                        fullWidth
                    >
                        Stop Copying
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <Text size="sm" className="text-gray-500">
                        Assets Copied
                    </Text>
                    <Text size="lg" bold>
                        {assetsDisplay}
                    </Text>
                </div>
                <div>
                    <Text size="sm" className="text-gray-500">
                        Trade Types Copied
                    </Text>
                    <Text size="lg" bold>
                        {trader.trade_types?.length === 1 &&
                        trader.trade_types[0] === "*"
                            ? "All"
                            : contractCategoryDisplays.join(", ") || "-"}
                    </Text>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <Text size="sm" className="text-gray-500">
                        Maximum Stake
                    </Text>
                    <Text size="lg" bold>
                        {trader.max_trade_stake}
                    </Text>
                </div>
                <div>
                    <Text size="sm" className="text-gray-500">
                        Minimum Stake
                    </Text>
                    <Text size="lg" bold>
                        {trader.min_trade_stake}
                    </Text>
                </div>
            </div>

            <div className="border-t pt-4 mb-4 flex flex-col gap-4">
                <Button
                    color="black"
                    onClick={toggleStats}
                    icon={
                        <div
                            className={`transform transition-transform ${
                                showStats ? "rotate-180" : ""
                            }`}
                        >
                            <LabelPairedChevronDownCaptionBoldIcon />
                        </div>
                    }
                    iconPosition="end"
                    size="md"
                    type="button"
                    variant="secondary"
                >
                    {showStats ? "Show Less" : "Show More"}
                </Button>

                {showStats &&
                    (isLoading ? (
                        <Text className="text-center text-gray-500">
                            Loading statistics...
                        </Text>
                    ) : stats ? (
                        <>
                            <Text size="lg" bold className="mb-4">
                                Trader Performance
                            </Text>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <Text size="sm" className="text-gray-500">
                                        Active Since
                                    </Text>
                                    <Text size="lg" bold>
                                        {stats.active_since
                                            ? new Date(
                                                  stats.active_since * 1000
                                              ).toLocaleDateString("en-US", {
                                                  month: "long",
                                                  year: "numeric",
                                              })
                                            : "-"}
                                    </Text>
                                </div>
                                <div>
                                    <Text size="sm" className="text-gray-500">
                                        No. of profitable trades
                                    </Text>
                                    <Text size="lg" bold>
                                        {stats.trades_profitable || 0}
                                    </Text>
                                </div>
                                <div>
                                    <Text size="sm" className="text-gray-500">
                                        No. of copiers
                                    </Text>
                                    <Text size="lg" bold>
                                        {stats.copiers || 0}
                                    </Text>
                                </div>
                                <div>
                                    <Text size="sm" className="text-gray-500">
                                        Total Loss
                                    </Text>
                                    <Text
                                        size="lg"
                                        bold
                                        className="text-red-600"
                                    >
                                        {stats.avg_loss || 0}
                                    </Text>
                                </div>
                                <div>
                                    <Text size="sm" className="text-gray-500">
                                        Total Profit
                                    </Text>
                                    <Text
                                        size="lg"
                                        bold
                                        className="text-green-600"
                                    >
                                        {stats.avg_profit || 0}
                                    </Text>
                                </div>
                                <div>
                                    <Text size="sm" className="text-gray-500">
                                        Performance Probability
                                    </Text>
                                    <Text size="lg" bold>
                                        {(
                                            (stats.performance_probability ||
                                                0) * 100
                                        ).toFixed(1)}
                                        %
                                    </Text>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Text className="text-center text-gray-500">
                            No statistics available
                        </Text>
                    ))}
            </div>

            {stats && !isLoading && showStats && (
                <div className="border-t pt-4">
                    <ProfitableTrades
                        monthlyTrades={stats.monthly_profitable_trades}
                        yearlyTrades={stats.yearly_profitable_trades}
                    />
                </div>
            )}
        </div>
    );
};

// TraderCard.propTypes = {
//     trader: PropTypes.shape({
//         loginid: PropTypes.string.isRequired,
//         token: PropTypes.string.isRequired,
//         max_trade_stake: PropTypes.number.isRequired,
//         min_trade_stake: PropTypes.number.isRequired,
//         assets: PropTypes.arrayOf(PropTypes.string),
//         trade_types: PropTypes.arrayOf(PropTypes.string),
//     }).isRequired,
//     onStopCopy: PropTypes.func.isRequired,
// };

export default TraderCard;
