
import React from "react";
import Header from "./Header";
import MarketSelector from "./MarketSelector";
// import ChartIndicator from "./ChartIndicator";
import TradeForm from "./TradeForm";
// import TradingInfo from "./TradingInfo";
// import GuideButton from "./GuideButton";

const TradingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">  
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* <GuideButton /> */}
          {/* <MarketSelector /> */}
          {/* <ChartIndicator /> */}
          <TradeForm />
          {/* <TradingInfo /> */}
        </div>
{/*         
        <footer className="flex justify-between items-center mt-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-400 rounded-full"></div>
            <div>2023-05-03 14:18:40 GMT</div>
          </div>
          <div className="flex items-center space-x-4">
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </button>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </button>
            <button>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
          </div>
        </footer> */}
      </div>
    </div>
  );
};

export default TradingPage;