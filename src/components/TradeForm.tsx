


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

import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import Snackbar from "./ui/snackbar";
const TradeForm = () => {
  const [startTime, setStartTime] = useState("now");
  const [durationType, setDurationType] = useState("ticks");
  const [duration, setDuration] = useState("1");
  const [stakeType, setStakeType] = useState("stake");
  const [stake, setStake] = useState("1.00");
  const [currency, setCurrency] = useState("USD");
  const [market, setMarket] = useState("bear");
  const [tradeType, setTradeType] = useState("rise-fall");
  const [markets, setMarkets] = useState<any[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [payout0, setpayout0] = useState<any>(0);
  const [payout1, setpayout1] = useState<any>(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(e.target.value);
  };
  
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStake(value)
  
   
  };
  
  const { isConnected,sendMessage, lastMessage } = useWebSocket();


      
  function getTokensFromLocalStorage() {
    try {
      const tokensRaw = localStorage.getItem('tokens');
      const tokens = tokensRaw ? JSON.parse(tokensRaw) : [];
      console.log('toookens' , tokens)
  
      if (!Array.isArray(tokens)) {
        throw new Error('Stored value is not an array');
      }
      console.log('heeere' , tokens)
      return tokens;
    } catch (error) {
      console.warn('Failed to parse tokens from localStorage:', error);
      return [];
    }
  }




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
    "req_id": 47
}

sendMessage(object , (response)=>{
        console.log(response)
    }
  )
sendMessage({"proposal_open_contract":1,"subscribe":1,"passthrough":{}})


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
  sendMessage(object , (response)=>{
    console.log(response.proposal.payout  )
    setpayout0(response?.proposal?.payout)

  })

  object['contract_type'] = sell
  sendMessage(object , (response)=>{
    setpayout1(response?.proposal?.payout)
  })
    // or make an API call here
  }, [startTime, durationType, duration, stakeType, stake, market, tradeType]);
  
  return (
    <div className="mb-6">


            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col space-y-1">
                <label className="text-xs text-gray-500">Market</label>
                <Select value={market} onValueChange={setMarket}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((index) => (
                    <SelectItem key={index} value={index.symbol}>
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
          <label className="text-xs text-gray-500 mb-1 block">&nbsp;</label>
          <Input 
            type="text" 
            className="rounded-none border-x-0 text-center" 
            value={duration}
            onChange={handleDurationChange}
          />
        </div>
        
        <div className="w-1/3">
          <label className="text-xs text-gray-500 mb-1 block">&nbsp;</label>
          <Select value={durationType} onValueChange={setDurationType}>
            <SelectTrigger className="rounded-l-none">
              <SelectValue placeholder="ticks" />
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
        
        <div className="w-1/3">
          <label className="text-xs text-gray-500 mb-1 block">&nbsp;</label>
          <Input 
            type="text" 
            className="rounded-none border-x-0 text-center" 
            value={stake}
            onChange={handleStakeChange}
          />
        </div>
        
        <div className="w-1/3">
          <label className="text-xs text-gray-500 mb-1 block">&nbsp;</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="rounded-l-none">
              <SelectValue placeholder="USD" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
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