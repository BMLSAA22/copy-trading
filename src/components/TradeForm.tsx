


import React, { useState , useEffect} from "react";
import { ArrowUp, ArrowDown, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import useWebSocket from "../hooks/useWebSocket";
import useAuth from "../hooks/useAuth";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import Snackbar from "./ui/snackbar";
const TradeForm = () => {
  const [startTime, setStartTime] = useState("now");
  const [durationType, setDurationType] = useState("t");
  const [duration, setDuration] = useState("1");
  const [stakeType, setStakeType] = useState("stake");
  const [stake, setStake] = useState("1.00");
  const [currency, setCurrency] = useState("USD");
  const [market, setMarket] = useState("R_100");
  const [tradeType, setTradeType] = useState("rise-fall");
  const [markets, setMarkets] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [payout0, setpayout0] = useState<any>(0);
  const [payout1, setpayout1] = useState<any>(0);
  const [price, setPrice] = useState<any>(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [barrier, setBarrier] = useState("");
  const [priceHistory, setChart] = useState([
    { time: 1, price: 10 },
    { time: 2, price: 50 },
    { time: 3, price: 30 },
    { time: 4, price: 15 }
  ]);
  


  const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(e.target.value);
  };
  
  const handleStakeChange = (value: string) => {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      setStake(String(parsed));
    } else {
      setStake("0"); // or empty string if you want to allow clearing
    }
  };
  
  
  const { isConnected,sendMessage, lastMessage } = useWebSocket();

  const handleBarrierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarrier(e.target.value);
  };
      
  function getTokensFromLocalStorage() {
    try {
      const tokensRaw = localStorage.getItem('tokens');
      const tokens = tokensRaw ? JSON.parse(tokensRaw) : [];
  
      if (!Array.isArray(tokens)) {
        throw new Error('Stored value is not an array');
      }
      return tokens;
    } catch (error) {
      console.warn('Failed to parse tokens from localStorage:', error);
      return [];
    }
  }


  useEffect(() => {
    if (lastMessage !== null && lastMessage.msg_type === "tick") {
      const tick = lastMessage.tick;
      if (tick && tick.quote) {
        console.log('zebbbi')
        setChart(prev => [...prev.slice(-19), { time: new Date(tick.epoch * 1000).toLocaleTimeString(), price: tick.quote }]);
        setPrice(tick.quote); // Update the price display
      }
    }
  }, [lastMessage]);




const handlePurchase = (type) => {
  let contract_type_parsed = '';
  if (tradeType=='rise-fall'){
    if (type == 0) {contract_type_parsed = 'CALL'}
    else{contract_type_parsed = 'PUT'}
  }

if (tradeType=='ONETOUCH'){
  if (type == 0) {contract_type_parsed = 'TOUCH'}
  else{contract_type_parsed = 'NOTOUCH'}

}

  const object = {
    "buy_contract_for_multiple_accounts": "1",
    "tokens": [...tokens , defaultAccount.token],
    "price": 1,
    "parameters": {
        "amount": stake,
        "basis": stakeType,
        "contract_type": contract_type_parsed,
        "currency": "USD",
        "duration": duration,
        "duration_unit": durationType,
        "symbol": market,
        "selected_tick": 2,
        // "barrier": 2
    },
    "passthrough":{
      "subscribe":1
    },

}

sendMessage(object , (response)=>{
  const results = response.buy_contract_for_multiple_accounts?.result || [];
  const total = results.length;
  
  // Separate successful and failed results
  const successful = results.filter(item => !item.code);
  const failed = results.filter(item => item.code);
  
  let alertMessage = `Buy contract results:\n\n` +
                     `✅ Successful: ${successful.length}\n` +
                     `❌ Failed: ${failed.length}\n`;
  
  if (failed.length > 0) {
      alertMessage += `\nFailure details:\n`;
      failed.forEach((item, idx) => {
          alertMessage += `🔸 Token: ${item.token}\n   Reason: ${item.message_to_client}\n\n`;
      });
  }
  
  alert(alertMessage);
    }
  )
// sendMessage({"proposal_open_contract":1,"subscribe":1,"passthrough":{}})


}


  useEffect(() => {

    console.log("otheraccounts" , otherAccounts)
    const markets_req = {
        active_symbols: "brief",
        "product_type": "basic"
    }
    setTokens(getTokensFromLocalStorage())


    if (isConnected && isLoggedIn){


    sendMessage( markets_req, (response)=>{
        console.log("markets",response)
        setMarkets(response.active_symbols)
    }
  )}


  }, [isConnected , isLoggedIn]);
  


  useEffect(() => {
  

    // setInterval(() => {
    let type = 0
    let contract_type_parsed = '';
    let purchase =''
    let sell = ''
    if (tradeType=='rise-fall'){
      purchase = 'CALL'
      sell =  'PUT'
    }
  
  if (tradeType=='ONETOUCH'){
    purchase = 'TOUCH'
   sell = 'NOTOUCH'
  
  }
    const object = {
      "proposal":1,
      "subscribe":1,
      "amount": stake,
      "basis": stakeType,
      "contract_type": purchase,
      "currency": "USD",
      "duration": duration,
      "duration_unit": durationType,
      "symbol": market,
      // "barrier": 2
  }
  if (isConnected){


    sendMessage({
      "ticks": market,
      "subscribe": 1
  })
  sendMessage(object , (response)=>{


   if (response?.error) {
    alert("Error: " + response.error.message);
  } else if (response?.proposal) {
    console.log("barrier", response.proposal.contract_details?.barrier);
    setpayout0(response.proposal.payout);
    setPrice(response.proposal.contract_details?.barrier);
  } else {
    alert("Unknown error occurred.");
  }
  })

  object['contract_type'] = sell
  sendMessage(object , (response)=>{
    setpayout1(response?.proposal?.payout)
  })



  setCurrency(defaultAccount?.currency)}
    // or make an API call here
  }, [startTime, durationType, duration, stakeType, stake, market, tradeType , defaultAccount , isConnected]);



  useEffect(() => {


    setChart([]);


    if(isConnected){

    console.log(Symbol)
    sendMessage({"ticks": Symbol,
      "subscribe": 1
  })}
  },[Symbol])
  
  return (
    <div className="mb-6">



<div className="w-24 h-24 mb-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={priceHistory}>
            <XAxis dataKey="time" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


      {price !== 0 && (
                <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-lg inline-block mb-4">
                  Current Price: <span className="font-semibold">{price}</span>
                </div>
              )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-500">Market</label>
                <Select defaultValue={"R_100"} onValueChange={setMarket}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="volatility 100 index" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets?.map((index) => (
                      <SelectItem key={index.symbol} value={index.symbol}>
                        {index.display_name}
                      </SelectItem>
                    ))}
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
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col space-y-1">
          <label className="text-xs text-gray-500">Start Time</label>
          <Select value={startTime} onValueChange={setStartTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select start time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="now">Now</SelectItem>
              <SelectItem value="later">Later</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1"></div>
      </div>
      
      <div className="flex mb-4">   
        <div className="w-1/3">
          <label className="text-xs text-gray-500 mb-1 block">Duration</label>
          <Select value={stakeType} onValueChange={setStakeType}>
            <SelectTrigger className="rounded-r-none">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stake">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-1/3">
        <label className="text-xs text-gray-500 mb-1 block">Barrier</label>

        {/* <Input 
            type="text" 
            className="rounded-none border-x-0 text-center" 
            value={stake}
            onChange={handleStakeChange}
          /> */}
        <Input 
          type="text" 
          className="rounded-none border-x-0 text-center" 
          value={duration}
          onChange={handleDurationChange}
        />
      </div>
        
        <div className="w-1/3">
          <label className="text-xs text-gray-500 mb-1 block">&nbsp;</label>
          <Select value={durationType} onValueChange={setDurationType} defaultValue="t">
            <SelectTrigger className="rounded-l-none">
              <SelectValue  placeholder="ticks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="t">ticks</SelectItem>
              <SelectItem value="s">seconds</SelectItem>
              <SelectItem value="m">minutes</SelectItem>
              <SelectItem value="h">hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>




      <div className="text-xs text-gray-500 ml-3 mb-4">
        Minimum: 1
      </div>
      
      <div className="flex mb-6">
        <div className="w-1/3">
          <label className="text-xs text-gray-500 mb-1 block">Stake</label>
          <Select value={stakeType} onValueChange={setStakeType}>
            <SelectTrigger className="rounded-r-none">
              <SelectValue placeholder="Stake" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stake">Stake</SelectItem>
              <SelectItem value="payout">Payout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        &nbsp;
        <Input      
        className="rounded-none border-x-0 text-center mt-5"  
        placeholder="1.0"
        value={stake}
        onChange={(e) => handleStakeChange(e.target.value)}/>
        
        
        <div className="w-1/3">
          <label className="text-xs text-gray-500 mb-1 block">&nbsp;</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="rounded-l-none">
              <SelectValue placeholder="USD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={currency}>{currency}</SelectItem>
              {/* <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center mb-6 pl-3">
        <div className="flex items-center space-x-2">
          <Checkbox id="allow-equals" />
          <label htmlFor="allow-equals" className="text-sm text-gray-600 flex items-center">
            Allow equals
            <Popover>
              <PopoverTrigger>
                <Info size={14} className="ml-1 text-gray-400 cursor-help" />
              </PopoverTrigger>
              <PopoverContent className="text-xs max-w-xs">
                If you select "Allow equals", your contract will win if the exit spot is higher than or equal to the entry spot for a "Rise" contract, and lower than or equal to the entry spot for a "Fall" contract.
              </PopoverContent>
            </Popover>
          </label>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-center mb-4">
              <ArrowUp size={30} className="mx-auto text-red-500" />
              <div className="text-gray-700 font-medium">Rise</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-xs text-gray-500">Stake:</div>
                <div className="font-medium">{stake}USD</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Payout:</div>
                <div className="font-medium">{payout0} USD</div>
              </div>
            </div>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => handlePurchase(0)}
            >
              Purchase
            </Button>
          </div>
          <div>
            <div className="text-center mb-4">
              <ArrowDown size={30} className="mx-auto text-pink-600" />
              <div className="text-gray-700 font-medium">Fall</div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-xs text-gray-500">Stake:</div>
                <div className="font-medium">{stake} USD</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Payout:</div>
                <div className="font-medium">{payout1} USD</div>
              </div>
            </div>
            <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={() => handlePurchase(1)}
            >
              Purchase
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center text-xs text-gray-500" >
            Net profit: 15.33 USD | Return 95.8%
          </div>
          <div className="text-center text-xs text-gray-500">
            Net profit: 15.17 USD | Return 94.8%
          </div>
          
        </div>
      </div>
      <Snackbar message={"bonjour"} duration={2} onClose={() => setSnackbarMessage('')}></Snackbar>
    </div>
  );
};

export default TradeForm;