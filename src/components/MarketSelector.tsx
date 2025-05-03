
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from"./ui/select";

const MarketSelector = () => {
  const [market, setMarket] = useState("bear");
  const [tradeType, setTradeType] = useState("rise-fall");

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="flex flex-col space-y-1">
        <label className="text-xs text-gray-500">Market</label>
        <Select value={market} onValueChange={setMarket}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select market" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bear">Bear Market Index</SelectItem>
            <SelectItem value="bull">Bull Market Index</SelectItem>
            <SelectItem value="volatility">Volatility Index</SelectItem>

            
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-col space-y-1">
        <label className="text-xs text-gray-500">Trade types</label>
        <Select value={tradeType} onValueChange={setTradeType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select trade type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rise-fall">Rise/Fall</SelectItem>
            <SelectItem value="higher-lower">Higher/Lower</SelectItem>
            <SelectItem value="in-out">In/Out</SelectItem>
            <SelectItem value="ONETOUCH">Touch / No Touch</SelectItem>
            <SelectItem value="DIGITOVER">Over / Under</SelectItem> 
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MarketSelector;