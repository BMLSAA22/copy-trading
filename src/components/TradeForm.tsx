



import React, { useState , useEffect } from "react";
import { Info, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,LabelList , PieChart ,Pie
   } from 'recharts';
import { Card, CardContent } from "./ui/card";
import useWebSocket from "../hooks/useWebSocket";
import useAuth from "../hooks/useAuth";
import PriceChart from "./PriceChart";

const TradeForm = () => {
  const [startTime, setStartTime] = useState("now");
  const [durationType, setDurationType] = useState("t");
  const [duration, setDuration] = useState("1");
  const [stakeType, setStakeType] = useState("stake");
  const [stake, setStake] = useState("1.00");
  const [currency, setCurrency] = useState("USD");
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeDirection, setTradeDirection] = useState("");
  const [market, setMarket] = useState("R_100");
  const [tokens, setTokens] = useState<any[]>([]);
  const { isConnected,sendMessage, lastMessage } = useWebSocket();
  const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
  const [markets, setMarkets] = useState<any[]>([]);
  const [price, setPrice] = useState<any>(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [barrier, setBarrier] = useState("");
  const [priceHistory, setChart] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [contract, setContract] = useState("");
  const [tradeType, setTradeType] = useState("rise-fall");
  const [pipSize , setPip] = useState(2)
  const [percentageUp , setPercentageUp] = useState(50);

  // Google Sheets API configuration
const API_KEY = 'AIzaSyDtYO5ZakdF5XWKUtGkdipsFUsc1_tXVU4';
const SPREADSHEET_ID = '1MOJ6UG0zvh-fl35ucAwn1D2_B9OWUBhXKKfSK8lvOM8'; 
const SHEET_NAME = 'Data';
const RANGE = 'Data!A1:Z1000'; // Expanded range to accommodate more data


const getTokensFromSheets = async () => {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Sheets API request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.values || data.values.length <= 1) return [];

    const tokenRows = data.values.slice(1); // Skip header row

    const tokensList = await Promise.all(
      tokenRows.map((row) => {
        if (row.length >= 2 && row[0] !== 'date') {
          const token = row[1];
          return token
        }
        return null;
      })
    );


    return tokensList.filter(Boolean); // remove nulls
  } catch (error) {
    console.error('Failed to fetch tokens from Google Sheets:', error);
    return [];
  }
};


  
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(e.target.value);
  };
  
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStake(e.target.value);
  };
  
  const openTrade = (direction: string) => {
    setTradeDirection(direction);
    let type = 0;
    if (direction == 'rise') {type = 0} else{type = 1}
    handlePurchase(type  );
    setTradeOpen(true);
  };
  
  const closePosition = () => {
    setTradeOpen(false);
  };
  
  const payout = (parseFloat(stake) * 1.95).toFixed(2);

  function getTokensFromLocalStorage() {
    const raw = localStorage.getItem('tokens'); 
  
    try {
      const tokens = raw ? JSON.parse(raw) : [];
  
      if (!Array.isArray(tokens)) {
        console.warn('Expected an array but got:', tokens);
        return [];
      }
  
      return tokens;
    } catch (error) {
      console.warn('Error parsing tokens from localStorage:', error);
      return [];
    }
  }

  const handlePurchase = (type) => {
    let contract_type_parsed = 'CALL';
  
    if (tradeType === 'rise-fall') {
      contract_type_parsed = type === 0 ? 'CALL' : 'PUT';
    } else if (tradeType === 'ONETOUCH') {
      contract_type_parsed = type === 0 ? 'TOUCH' : 'NOTOUCH';
    } else {
      alert("Unsupported trade type.");
      return;
    }
  
    // Merge tokens and avoid duplicates
    const allTokens = [...new Set([...tokens, defaultAccount.token])];
    
  
    const payload = {
      buy_contract_for_multiple_accounts: "1",
      tokens: allTokens,
      price: stake,
      parameters: {
        amount: stake,
        basis: stakeType,
        contract_type: contract_type_parsed,
        currency: "USD",
        duration: duration,
        duration_unit: durationType,
        symbol: market,
        selected_tick: 2,
      },
      passthrough: {
        subscribe: 1,
      }
    };
  


    sendMessage({"authorize" : defaultAccount.token }, rsp=>{
    sendMessage(payload, (response) => {
      const results = response.buy_contract_for_multiple_accounts?.result || [];
      const total = results.length;
  
      const successful = results.filter(item => !item.code);
      const failed = results.filter(item => item.code);
  
      let alertMessage = `Buy contract results:\n\n` +
                         `✅ Successful: ${successful.length}\n` +
                         `❌ Failed: ${failed.length}\n`;
  
      if (failed.length > 0) {
        alertMessage += `\nFailure details:\n`;
        failed.forEach((item) => {
          alertMessage += `🔸 Token: ${item.token}\n   Reason: ${item.message_to_client || 'Unknown'}\n\n`;
        });
      }
  
      // alert(alertMessage);
  
      if (successful.length > 0 && successful[0].contract_id) {
        const contract_id = successful[0].contract_id;

        setContract(contract_id)

        const data = {
          "proposal_open_contract": 1,
          // "contract_id":contract_id,
          "subscribe": 1,
        }
  
        sendMessage(data , response =>{
          console.log('contract subscription response' , response)
        });
  
      }
    });
  });}
  
  



    useEffect(() => {

    const markets_req = {
        active_symbols: "brief",
        "product_type": "basic"
    }

    const fetchTokens = async () => {
      const tokens = await getTokensFromSheets();
      setTokens(tokens);
    };
    // 
    
    fetchTokens()


    if (isConnected && isLoggedIn){


    sendMessage( markets_req, (response)=>{
        const uniqueMarkets = Array.from(new Map(response.active_symbols.map(m => [m.symbol, m])).values());

        setMarkets(uniqueMarkets)
    }
  )}

  }, [isConnected , isLoggedIn]);

  useEffect(()=>{

  if(isConnected){
    sendMessage({
      "forget_all": "ticks"
  })
  sendMessage({"ticks_history":market,"end":"latest","start":1,"style":"ticks","count":21 , adjust_start_time:1},resp=>{
    const combined = resp.history.prices.map((price, index) => ({
      price,
      time: resp.history.times[index]
    }));
    setChart(combined)
    setPip(resp.pip_size)

    
    
    console.log("data" ,resp.history)})
    sendMessage({
            "ticks": market,
       "subscribe": 1
        })
      setChart([])}

  },[market ,isConnected])




  useEffect(() => {
    if (!lastMessage) return;
  
    // if (lastMessage.msg_type === "tick" && lastMessage.tick?.quote) {
    //   setChart(prev => [
    //     ...prev.slice(-19),
    //     {
    //       time: new Date(lastMessage.tick.epoch * 1000).toLocaleTimeString(),
    //       price: lastMessage.tick.quote
    //     }
    //   ]);
    //   setPrice(lastMessage.tick.quote);
    //   console.log(priceHistory)
    // }else{
    //   console.log(lastMessage)
    // }


    if (lastMessage.msg_type === "tick" && lastMessage.tick?.quote) {
      const newPrice = lastMessage.tick.quote;
      const newTime = new Date(lastMessage.tick.epoch * 1000).toLocaleTimeString();
    
      setChart(prev => {
        const updated = [...prev.slice(-19), { time: newTime, price: newPrice }];
    
        // Calculate how many times price went up
        let upCount = 0;
        for (let i = 1; i < updated.length; i++) {
          if (updated[i].price > updated[i - 1].price) {
            upCount++;
          }
        }
    
        const percentageUp = ((upCount / (updated.length - 1)) * 100).toFixed(2); // to 2 decimals
        setPercentageUp(parseFloat(percentageUp));
        console.log('percentageUp' , percentageUp)
    
        return updated;
      });
    
      setPrice(newPrice);
      console.log(priceHistory);
    } else {
      console.log(lastMessage);
    }
    





    
  
    if (lastMessage?.msg_type === "proposal_open_contract" && lastMessage.proposal_open_contract) {
      setSelectedProposal(lastMessage?.proposal_open_contract);
      console.log("New proposal_open_contract:", lastMessage.proposal_open_contract);
    }
  }, [lastMessage]);
  

        {/* <ResponsiveContainer width={200} height={200}>  {/* Hardcoding height and width for testing */}
    //     <LineChart data={priceHistory}>
    //     <XAxis dataKey="time" hide />
    //     <YAxis domain={['auto', 'auto']} hide />
    //     <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
    //     <Line
    //       type="monotone"
    //       dataKey="price"
    //       stroke="#10b981"
    //       strokeWidth={2}
    //       dot={false}
    //       isAnimationActive={false}
    //     />
    //   </LineChart>
    // </ResponsiveContainer>

    // const LastDigitsRow = ({ data }) => {
    //   return (
    //     <div className="flex justify-between w-full absolute -top-8 px-1">
    //       {data.map((d, i) => {
    //         const lastDigit = String(d.price).split('.').pop().slice(-1);
    
    //         // Check if current digit is greater or smaller than the previous one
    //         const isGreater = i > 0 && d.price > data[i - 1].price;
    
    //         return (
    //           <div
    //             key={i}
    //             className={`text-sm w-[24px] h-[24px] rounded-md flex items-center justify-center 
    //               ${isGreater ? 'bg-green-500' : 'bg-red-500'} text-white`}
    //           >
    //             {lastDigit}
    //           </div>
    //         );
    //       })}
    //     </div>
    //   );
    // };
    

    const LastDigitsRow = ({ data, pipSize }) => {
      return (
        <div className="flex justify-between w-full absolute -top-8 px-1">
          {data.map((d, i) => {
            const priceStr = String(d.price);
            const decimalPart = priceStr.split('.')[1] || '';
    
            // pipSize = 1 means first decimal place → index 0
            const digitIndex = pipSize - 1;
    
            // Get digit at pip position or fallback to '0'
            const pipDigit = decimalPart[digitIndex] || '0';
    
            const isGreater = i > 0 && d.price > data[i - 1].price;
    
            return (
              <div
                key={i}
                className={`text-sm w-[24px] h-[24px] rounded-md flex items-center justify-center 
                  ${isGreater ? 'bg-green-500' : 'bg-red-500'} text-white`}
              >
                {pipDigit}
              </div>
            );
          })}
        </div>
      );
    };
    
    
  
  return (
    <div className="mb-6 p-5 rounded">
<div className="flex flex-col md:flex-row items-center gap-4 mt-10">
  {/* Price Chart Container */}
  <div className="relative w-[320px] h-[170px] bg-white rounded-xl shadow-md p-4">
    <LastDigitsRow data={priceHistory} pipSize={pipSize} />
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

  {/* Pie Chart Container */}
  <div className="w-[120px] h-[120px] bg-white rounded-xl shadow-md relative flex items-center justify-center">
    <div
      className={`absolute text-lg font-bold z-10 ${
        percentageUp > 50 ? 'text-green-500' : 'text-red-500'
      }`}
    >
      {percentageUp.toFixed(1)}%
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          dataKey="value"
          data={[
            { name: 'Up', value: percentageUp, fill: '#10b981' },
            { name: 'Down', value: 100 - percentageUp, fill: '#ef4444' }
          ]}
          cx="50%"
          cy="50%"
          innerRadius={35}
          outerRadius={50}
          labelLine={false}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
</div>





      <div className="bg-white rounded-md shadow-sm mb-6 mt-5">
      {priceHistory.length > 1 && (
    <div
      className={`text-sm font-semibold px-3 py-1 rounded border mt-5
        ${priceHistory[priceHistory.length - 1].price > priceHistory[priceHistory.length - 2].price
          ? 'bg-green-100 text-green-700 border-green-300'
          : 'bg-red-100 text-red-700 border-red-300'}
      `}
      style={{
        marginLeft: '1rem',
        display: 'inline-block', // Add space between the chart and the price box
      }}
    >
      {priceHistory[priceHistory.length - 1].price.toFixed(2) + " USD"}
    </div>
  )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Input controls */}
          <div className="flex-1 bg-white p-4 rounded-l-md">

          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-1">Select Market</div>
            <div className="flex gap-2">
              <div className="w-1/2">
                <Select value={market} onValueChange={setMarket}> 
                  <SelectTrigger className="w-full bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500">
                    <SelectValue placeholder="Select a Market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market) => (
                      <SelectItem key={market.symbol} value={market.symbol}>
                        {market.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/2">
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
          </div>




            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-1">Start Time</div>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="w-full bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500">
                  <SelectValue>Now</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">Now</SelectItem>
                  <SelectItem value="later">Later</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-6">
              <div className="flex">
                <div className="w-1/3">
                  <Select value="duration" onValueChange={() => {}}>
                    <SelectTrigger className="rounded-r-none bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500">
                      <SelectValue>Duration</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-1/3">
                  <Input 
                    type="text" 
                    className="rounded-none border-x-0 text-center h-10 bg-white hover:border-blue-400 focus:border-blue-500" 
                    value={duration}
                    onChange={handleDurationChange}
                  />
                </div>
                
                <div className="w-1/3">
                  <Select value={durationType} onValueChange={setDurationType}>
                    <SelectTrigger className="rounded-l-none bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500">
                      <SelectValue>{durationType}</SelectValue>
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
              <div className="text-xs text-gray-400 mt-1 ml-1">Minimum: 1</div>
            </div>
            
            <div className="mb-6">
              <div className="flex">
                <div className="w-1/3">
                  <Select value={stakeType} onValueChange={setStakeType}>
                    <SelectTrigger className="rounded-r-none bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500">
                      <SelectValue>Stake</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stake">Stake</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-1/3">
                  <Input 
                    type="text" 
                    className="rounded-none border-x-0 text-center h-10 bg-white hover:border-blue-400 focus:border-blue-500" 
                    value={stake}
                    onChange={handleStakeChange}
                  />
                </div>
                
                <div className="w-1/3">
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="rounded-l-none bg-white border border-gray-200 hover:border-blue-400 focus:border-blue-500">
                      <SelectValue>USD</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="allow-equals" className="border-gray-300 hover:border-blue-400 data-[state=checked]:border-blue-500" />
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
          </div>
          
          {/* Right side - Purchase buttons or Trade info */}
          <div className="flex-1 p-4 border-l border-gray-200">
            {!tradeOpen ? (
              <div className="h-full flex flex-col justify-center mt-5 items-center  gap-4 hidden md:block">
                <div className="mb-2 text-center">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between px-4 mb-2">
                      <span>Stake: {stake} {currency}</span>
                      <span>Payout: {payout} {currency}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => openTrade("rise")} 
                  className="w-full mt-5 py-6 text-lg bg-green-500 hover:bg-green-600 text-white font-medium border-2 border-transparent hover:border-green-300 active:border-green-700 transition-colors"
                >
                  <ChevronUp className="mr-2" size={24} /> Rise
                </Button>
                <div className="mb-4 text-center">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between px-4 mb-2">
                      <span>Stake: {stake} {currency}</span>
                      <span>Payout: {payout} {currency}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => openTrade("fall")} 
                  className="w-full mt-5 py-6 text-lg bg-red-500 hover:bg-red-600 text-white font-medium border-2 border-transparent hover:border-red-300 active:border-red-700 transition-colors"
                >
                  <ChevronDown className="mr-2" size={24} /> Fall
                </Button>
              </div>
             

            ) : (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex justify-between mb-4">
                  <div className="font-semibold text-lg">Contract Details</div>
                  <button className="text-gray-500" onClick={closePosition}>×</button>
                </div>
                
                <div className="bg-white p-4 mb-6 rounded-md border border-gray-100">
                  <p className="text-sm">
                    Win payout if Volatility 100 Index after {duration} {durationType} is strictly {tradeDirection === "rise" ? "higher" : "lower"} than entry spot.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500">Potential Payout</div>
                    <div className="font-medium">{selectedProposal?.payout} {currency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total Cost</div>
                    <div className="font-medium">{stake} {currency}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">{selectedProposal?.is_expired ? 'Profit' : 'Potential  Profit'}</div>
                    <div className="font-medium">{selectedProposal?.profit} {currency}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">Barrier: 1,643.40</div>
                  <div className="text-sm text-gray-500">Your transaction reference is {selectedProposal?.contract_id}</div>
                </div>
                
               

                <PriceChart
                      tickStream={selectedProposal?.tick_stream || []}
                      entryPrice={selectedProposal?.entry_spot}
                    />
                

                
                <Button 
                  onClick={closePosition}
                  className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white border-2 border-transparent hover:border-red-300 active:border-red-700 transition-colors"
                >
                  Close Position
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden">
   <div className="flex gap-4">
     <Button
       onClick={() => openTrade("rise")}
       className="w-1/2 py-6 text-lg bg-green-500 hover:bg-green-600 text-white font-medium border-2 border-transparent hover:border-green-300 active:border-green-700 transition-colors"
     >
       <ChevronUp className="mr-2" size={24} /> Rise
     </Button>

     <Button
       onClick={() => openTrade("fall")}
       className="w-1/2 py-6 text-lg bg-red-500 hover:bg-red-600 text-white font-medium border-2 border-transparent hover:border-red-300 active:border-red-700 transition-colors"
     >
       <ChevronDown className="mr-2" size={24} /> Fall
     </Button>
   </div>
 </div>

    </div>



  );
};

export default TradeForm;