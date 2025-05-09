


// import React, { useState , useEffect} from "react";
// import { ArrowUp, ArrowDown, Info } from "lucide-react";
// import { Button } from "./ui/button";
// import { Checkbox } from "./ui/checkbox";
// import { Input } from "./ui/input"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select"
// import useWebSocket from "../hooks/useWebSocket";
// import useAuth from "../hooks/useAuth";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
// } from 'recharts';

// import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
// import Snackbar from "./ui/snackbar";
// import { Dialog , DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";


// const TradeForm = () => {
//   const [startTime, setStartTime] = useState("now");
//   const [durationType, setDurationType] = useState("t");
//   const [duration, setDuration] = useState("10");
//   const [stakeType, setStakeType] = useState("stake");
//   const [stake, setStake] = useState("1.00");
//   const [currency, setCurrency] = useState("USD");
//   const [market, setMarket] = useState("R_100");
//   const [tradeType, setTradeType] = useState("rise-fall");
//   const [markets, setMarkets] = useState<any[]>([]);
//   const [tokens, setTokens] = useState<any[]>([]);
//   const [payout0, setpayout0] = useState<any>(0);
//   const [payout1, setpayout1] = useState<any>(0);
//   const [price, setPrice] = useState<any>(0);
//   const [snackbarMessage, setSnackbarMessage] = useState('');
//   const [barrier, setBarrier] = useState("");
//   const [priceHistory, setChart] = useState([
//     { time: 1, price: 10 },
//     { time: 2, price: 50 },
//     { time: 3, price: 30 },
//     { time: 4, price: 15 }
//   ]);


// const [selectedProposal, setSelectedProposal] = useState(null);
// const [isDialogOpen, setIsDialogOpen] = useState(false);

  
// const handleSelectProposal = (proposal) => {
//   setSelectedProposal(proposal);
//   setIsDialogOpen(true);
// };


//   const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
//   const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setDuration(e.target.value);
//   };
  
//   const handleStakeChange = (value: string) => {
//     const parsed = parseFloat(value);
//     if (!isNaN(parsed)) {
//       setStake(String(parsed));
//     } else {
//       setStake("0"); // or empty string if you want to allow clearing
//     }
//   };
  
  
//   const { isConnected,sendMessage, lastMessage } = useWebSocket();

//   const handleBarrierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setBarrier(e.target.value);
//   };
      
//   function getTokensFromLocalStorage() {
//     try {
//       const tokensRaw = localStorage.getItem('tokens');
//       const tokens = tokensRaw ? JSON.parse(tokensRaw) : [];
  
//       if (!Array.isArray(tokens)) {
//         throw new Error('Stored value is not an array');
//       }
//       return tokens;
//     } catch (error) {
//       console.warn('Failed to parse tokens from localStorage:', error);
//       return [];
//     }
//   }


//   useEffect(() => {
//     if (lastMessage !== null && lastMessage.msg_type === "tick") {
//       const tick = lastMessage.tick;
//       if (tick && tick.quote) {
//         console.log('zebbbi')
//         setChart(prev => [...prev.slice(-19), { time: new Date(tick.epoch * 1000).toLocaleTimeString(), price: tick.quote }]);
//         setPrice(tick.quote); // Update the price display
//       }
//     }

//     if (lastMessage !== null && lastMessage.msg_type === 'proposal_open_contract'){

//       if(lastMessage.proposal_open_contract){ setSelectedProposal(lastMessage.proposal_open_contract) }
//       console.log(selectedProposal)
//       console.log("proposal")
    
//     }
//   }, [lastMessage]);




// const handlePurchase = (type) => {
//   let contract_type_parsed = '';
//   if (tradeType=='rise-fall'){
//     if (type == 0) {contract_type_parsed = 'CALL'}
//     else{contract_type_parsed = 'PUT'}
//   }

// if (tradeType=='ONETOUCH'){
//   if (type == 0) {contract_type_parsed = 'TOUCH'}
//   else{contract_type_parsed = 'NOTOUCH'}

// }

//   const object = {
//     "buy_contract_for_multiple_accounts": "1",
//     "tokens": [...tokens , defaultAccount.token],
//     "price":stake,
//     "parameters": {
//         "amount": stake,
//         "basis": stakeType,
//         "contract_type": contract_type_parsed,
//         "currency": "USD",
//         "duration": duration,
//         "duration_unit": durationType,
//         "symbol": market,
//         "selected_tick": 2,
//         // "barrier": 2
//     },
//     // "subscribe":1,
//     "passthrough":{
//       "subscribe":1
//     },

// }

// sendMessage(object , (response)=>{
//   const results = response.buy_contract_for_multiple_accounts?.result || [];
//   const total = results.length;
  
//   // Separate successful and failed results
//   const successful = results.filter(item => !item.code);
//   const failed = results.filter(item => item.code);
  
//   let alertMessage = `Buy contract results:\n\n` +
//                      `✅ Successful: ${successful.length}\n` +
//                      `❌ Failed: ${failed.length}\n`;
  
//   if (failed.length > 0) {
//       alertMessage += `\nFailure details:\n`;
//       failed.forEach((item, idx) => {
//           alertMessage += `🔸 Token: ${item.token}\n   Reason: ${item.message_to_client}\n\n`;
//       });
//   }

//   if (results){
//     console.log('contract_id' , results[0].contract_id)
//     let contract_id = results[0].contract_id
//     if (contract_id){ 
//     sendMessage({
      
//         "proposal_open_contract": 1,
//         "contract_id": contract_id,
//         "subscribe": 1
    
//     })
//     setIsDialogOpen(true)
//   }
// }
//   alert(alertMessage);
//     }
//   )
// // sendMessage({"proposal_open_contract":1,"subscribe":1,"passthrough":{}})


// }


//   useEffect(() => {

//     console.log("otheraccounts" , otherAccounts)
//     const markets_req = {
//         active_symbols: "brief",
//         "product_type": "basic"
//     }
//     setTokens(getTokensFromLocalStorage())


//     if (isConnected && isLoggedIn){


//     sendMessage( markets_req, (response)=>{
//         console.log("markets",response)
//         setMarkets(response.active_symbols)
//     }
//   )}


//   }, [isConnected , isLoggedIn]);
  


//   useEffect(() => {
  

//     // setInterval(() => {
//     let type = 0
//     let contract_type_parsed = '';
//     let purchase =''
//     let sell = ''
//     if (tradeType=='rise-fall'){
//       purchase = 'CALL'
//       sell =  'PUT'
//     }
  
//   if (tradeType=='ONETOUCH'){
//     purchase = 'TOUCH'
//    sell = 'NOTOUCH'
  
//   }
//     const object = {
//       "proposal":1,
//       "subscribe":1,
//       "amount": stake,
//       "basis": stakeType,
//       "contract_type": purchase,
//       "currency": "USD",
//       "duration": duration,
//       "duration_unit": durationType,
//       "symbol": market,
//       // "barrier": 2
//   }
//   if (isConnected){


//     sendMessage({
//       "ticks": market,
//       "subscribe": 1
//   })
//   sendMessage(object , (response)=>{


//    if (response?.error) {
//     console.log('error')
//   } else if (response?.proposal) {
//     console.log("barrier", response.proposal.contract_details?.barrier);
//     setpayout0(response.proposal.payout);
//     setPrice(response.proposal.contract_details?.barrier);
//   } else {
//     alert("Unknown error occurred.");
//   }
//   })

//   object['contract_type'] = sell
//   sendMessage(object , (response)=>{
//     setpayout1(response?.proposal?.payout)
//   })



//   setCurrency(defaultAccount?.currency)}
//     // or make an API call here
//   }, [startTime, durationType, duration, stakeType, stake, market, tradeType , defaultAccount , isConnected]);



//   useEffect(() => {


//     setChart([]);


//     if(isConnected){

//     console.log(Symbol)
//     sendMessage({"ticks": Symbol,
//       "subscribe": 1
//   })}
//   },[Symbol])
  
//   return (
//     <div className="mb-6">



// <div className="w-24 h-24 mb-2">
// <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//   <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
//     <DialogHeader>
//       <DialogTitle>Contract Summary</DialogTitle>
//     </DialogHeader>
//     {selectedProposal ? (
//       <div className="space-y-4">
//         <div className="flex justify-between">
//           <p><strong>Contract Type:</strong> {selectedProposal?.display_value?.includes("higher") ? "Rise" : "Fall"}</p>
//           <p><strong>Payout:</strong> ${selectedProposal?.payout?.toFixed(2)}</p>
//         </div>
//         <div className="flex justify-between">
//           <p><strong>Entry Spot:</strong> {selectedProposal?.entry_spot_display_value}</p>
//           <p><strong>Current Spot:</strong> {selectedProposal?.current_spot_display_value}</p>
//         </div>
//         <div className="flex justify-between">
//           <p><strong>Profit:</strong> ${selectedProposal?.profit}</p>
//           <p><strong>profit_percentage:</strong> ${selectedProposal?.profit_percentage}</p>
//         </div>
//         <div className="flex justify-between">
//           <p><strong>Expiration:</strong> {new Date(selectedProposal?.date_expiry)}</p>
//           <p><strong>Status:</strong> {selectedProposal?.status}</p>
//         </div>
//         <div>
//           <strong>Transaction ID:</strong> {selectedProposal?.transaction_ids?.buy}
//         </div>
//       </div>
//     ) : (
//       <div>Loading contract details...</div> // This shows while the data is being fetched or if there's no data
//     )}
//   </DialogContent>
// </Dialog>




//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={priceHistory}>
//             <XAxis dataKey="time" hide />
//             <YAxis domain={['auto', 'auto']} hide />
//             <Tooltip contentStyle={{ fontSize: '0.75rem' }} />
//             <Line
//               type="monotone"
//               dataKey="price"
//               stroke="#10b981"
//               strokeWidth={2}
//               dot={false}
//               isAnimationActive={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>


//       {price !== 0 && (
//                 <div className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-lg inline-block mb-4">
//                   Current Price: <span className="font-semibold">{price}</span>
//                 </div>
//               )}

//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <div className="flex flex-col space-y-1">
//                 <label className="text-xs text-gray-500">Market</label>
//                 <Select defaultValue={"R_100"} onValueChange={setMarket}>
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="volatility 100 index" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {markets?.map((index) => (
//                       <SelectItem key={index.symbol} value={index.symbol}>
//                         {index.display_name}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <div className="flex flex-col space-y-1">
//                 <label className="text-xs text-gray-500">Trade types</label>
//                 <Select value={tradeType} onValueChange={setTradeType}>
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Select trade type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="rise-fall">Rise/Fall</SelectItem>
//                     <SelectItem value="higher-lower">Higher/Lower</SelectItem>
//                     <SelectItem value="in-out">In/Out</SelectItem>
//                     <SelectItem value="ONETOUCH">Touch / No Touch</SelectItem>
//                     <SelectItem value="DIGITOVER">Over / Under</SelectItem> 
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>    
//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <div className="flex flex-col space-y-1">
//           <label className="text-xs text-gray-500">Start Time</label>
//           <Select value={startTime} onValueChange={setStartTime}>
//             <SelectTrigger className="w-full">
//               <SelectValue placeholder="Select start time" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="now">Now</SelectItem>
//               <SelectItem value="later">Later</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         <div className="flex-1"></div>
//       </div>
      
//       <div className="flex mb-4">   
//         <div className="w-1/3">
//           <label className="text-xs text-gray-500 mb-1 block">Duration</label>
//           <Select value={stakeType} onValueChange={setStakeType}>
//             <SelectTrigger className="rounded-r-none">
//               <SelectValue placeholder="Duration" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="stake">Duration</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
        
//         <div className="w-1/3">
//         <label className="text-xs text-gray-500 mb-1 block">Barrier</label>

//         {/* <Input 
//             type="text" 
//             className="rounded-none border-x-0 text-center" 
//             value={stake}
//             onChange={handleStakeChange}
//           /> */}
//         <Input 
//           type="text" 
//           className="rounded-none border-x-0 text-center" 
//           value={duration}
//           onChange={handleDurationChange}
//         />
//       </div>
        
//         <div className="w-1/3">
//           <label className="text-xs text-gray-500 mb-1 block">&nbsp;</label>
//           <Select value={durationType} onValueChange={setDurationType} defaultValue="t">
//             <SelectTrigger className="rounded-l-none">
//               <SelectValue  placeholder="ticks" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="t">ticks</SelectItem>
//               <SelectItem value="s">seconds</SelectItem>
//               <SelectItem value="m">minutes</SelectItem>
//               <SelectItem value="h">hours</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>




//       <div className="text-xs text-gray-500 ml-3 mb-4">
//         Minimum: 1
//       </div>
      
//       <div className="flex mb-6">
//         <div className="w-1/3">
//           <label className="text-xs text-gray-500 mb-1 block">Stake</label>
//           <Select value={stakeType} onValueChange={setStakeType}>
//             <SelectTrigger className="rounded-r-none">
//               <SelectValue placeholder="Stake" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="stake">Stake</SelectItem>
//               <SelectItem value="payout">Payout</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         &nbsp;
//         <Input      
//         className="rounded-none border-x-0 text-center mt-5"  
//         placeholder="1.0"
//         value={stake}
//         onChange={(e) => handleStakeChange(e.target.value)}/>
        
        
//         <div className="w-1/3">
//           <label className="text-xs text-gray-500 mb-1 block">&nbsp;</label>
//           <Select value={currency} onValueChange={setCurrency}>
//             <SelectTrigger className="rounded-l-none">
//               <SelectValue placeholder="USD" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value={currency}>{currency}</SelectItem>
//               {/* <SelectItem value="EUR">EUR</SelectItem>
//               <SelectItem value="GBP">GBP</SelectItem> */}
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
      
//       <div className="flex items-center mb-6 pl-3">
//         <div className="flex items-center space-x-2">
//           <Checkbox id="allow-equals" />
//           <label htmlFor="allow-equals" className="text-sm text-gray-600 flex items-center">
//             Allow equals
//             <Popover>
//               <PopoverTrigger>
//                 <Info size={14} className="ml-1 text-gray-400 cursor-help" />
//               </PopoverTrigger>
//               <PopoverContent className="text-xs max-w-xs">
//                 If you select "Allow equals", your contract will win if the exit spot is higher than or equal to the entry spot for a "Rise" contract, and lower than or equal to the entry spot for a "Fall" contract.
//               </PopoverContent>
//             </Popover>
//           </label>
//         </div>
//       </div>
      
//       <div className="bg-gray-50 rounded-lg p-4 mb-4">
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <div>
//             <div className="text-center mb-4">
//               <ArrowUp size={30} className="mx-auto text-red-500" />
//               <div className="text-gray-700 font-medium">Rise</div>
//             </div>
//             <div className="grid grid-cols-2 gap-2 mb-3">
//               <div>
//                 <div className="text-xs text-gray-500">Stake:</div>
//                 <div className="font-medium">{stake}USD</div>
//               </div>
//               <div>
//                 <div className="text-xs text-gray-500">Payout:</div>
//                 <div className="font-medium">{payout0} USD</div>
//               </div>
//             </div>
//             <Button className="w-full bg-green-500 hover:bg-green-600 text-white" onClick={() => handlePurchase(0)}
//             >
//               Purchase
//             </Button>
//           </div>
//           <div>
//             <div className="text-center mb-4">
//               <ArrowDown size={30} className="mx-auto text-pink-600" />
//               <div className="text-gray-700 font-medium">Fall</div>
//             </div>
//             <div className="grid grid-cols-2 gap-2 mb-3">
//               <div>
//                 <div className="text-xs text-gray-500">Stake:</div>
//                 <div className="font-medium">{stake} USD</div>
//               </div>
//               <div>
//                 <div className="text-xs text-gray-500">Payout:</div>
//                 <div className="font-medium">{payout1} USD</div>
//               </div>
//             </div>
//             <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={() => handlePurchase(1)}
//             >
//               Purchase
//             </Button>
//           </div>
//         </div>
//         <div className="grid grid-cols-2 gap-4">
//           <div className="text-center text-xs text-gray-500" >
//             Net profit: 15.33 USD | Return 95.8%
//           </div>
//           <div className="text-center text-xs text-gray-500">
//             Net profit: 15.17 USD | Return 94.8%
//           </div>
          
//         </div>
//       </div>
//       <Snackbar message={"bonjour"} duration={2} onClose={() => setSnackbarMessage('')}></Snackbar>
//     </div>
//   );
// };

// export default TradeForm;



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
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
   } from 'recharts';
import { Card, CardContent } from "./ui/card";
import useWebSocket from "../hooks/useWebSocket";
import useAuth from "../hooks/useAuth";
import PriceChart from "./PriceChart";

const TradeForm = () => {
  const [startTime, setStartTime] = useState("now");
  const [durationType, setDurationType] = useState("t");
  const [duration, setDuration] = useState("10");
  const [stakeType, setStakeType] = useState("stake");
  const [stake, setStake] = useState("10.00");
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
    handlePurchase(0);
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
  
      alert(alertMessage);
  
      if (successful.length > 0 && successful[0].contract_id) {
        const contract_id = successful[0].contract_id;

        setContract(contract_id)

        const data = {
          "proposal_open_contract": 1,
          // "contract_id":contract_id,
          "subscribe": 1,
        }
        console.log('contract' , data)
  
        sendMessage(data , response =>{
          console.log('contract subscription response' , response)
        });
  
      }
    });
  });}
  
  



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
        const uniqueMarkets = Array.from(new Map(response.active_symbols.map(m => [m.symbol, m])).values());

        setMarkets(uniqueMarkets)
    }
  )}

  }, [isConnected , isLoggedIn]);

  useEffect(()=>{
    sendMessage({
      "forget_all": "ticks"
  })
    sendMessage({
            "ticks": market,
       "subscribe": 1
        })
      setChart([])

  },[market])


  useEffect(() => {
    if (!lastMessage) return;
  
    if (lastMessage.msg_type === "tick" && lastMessage.tick?.quote) {
      setChart(prev => [
        ...prev.slice(-19),
        {
          time: new Date(lastMessage.tick.epoch * 1000).toLocaleTimeString(),
          price: lastMessage.tick.quote
        }
      ]);
      setPrice(lastMessage.tick.quote);
      console.log(priceHistory)
    }else{
      console.log(lastMessage)
    }





    
  
    if (lastMessage?.msg_type === "proposal_open_contract" && lastMessage.proposal_open_contract) {
      setSelectedProposal(lastMessage?.proposal_open_contract);
      console.log("New proposal_open_contract:", lastMessage.proposal_open_contract);
    }
  }, [lastMessage]);
  

  
  
  return (
    <div className="mb-6">
      <ResponsiveContainer width={120} height={100}>  {/* Hardcoding height and width for testing */}
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

      <div className="bg-white rounded-md shadow-sm mb-6">

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left side - Input controls */}
          <div className="flex-1 bg-gray-50 p-4 rounded-l-md">

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
              <div className="h-full flex flex-col justify-center gap-4">
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
                  className="w-full py-6 text-lg bg-green-500 hover:bg-green-600 text-white font-medium border-2 border-transparent hover:border-green-300 active:border-green-700 transition-colors"
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
                  className="w-full py-6 text-lg bg-red-500 hover:bg-red-600 text-white font-medium border-2 border-transparent hover:border-red-300 active:border-red-700 transition-colors"
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

    </div>
  );
};

export default TradeForm;