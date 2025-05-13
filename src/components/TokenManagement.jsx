import { useState, useEffect } from "react";
import { TextField, Button, Text, SectionMessage } from "@deriv-com/quill-ui";
import TokenContainer from "./TokenContainer";
import useAPIToken from "../hooks/useAPIToken";
import TokenShimmer from "./TokenShimmer";
import useWebSocket from "../hooks/useWebSocket";
import useAuth from "../hooks/useAuth";
import useSettings from "../hooks/useSettings";

const TOKEN_NAME_REGEX = /^[a-zA-Z0-9_]+$/;

// Google Sheets API configuration
const API_KEY = 'AIzaSyDtYO5ZakdF5XWKUtGkdipsFUsc1_tXVU4';
const SPREADSHEET_ID = '1MOJ6UG0zvh-fl35ucAwn1D2_B9OWUBhXKKfSK8lvOM8'; 
const SHEET_NAME = 'Data';
const RANGE = 'Data!A1:Z1000'; // Expanded range to accommodate more data

const TokenManagement = () => {
    const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
    const { createToken, getTokens, deleteToken } = useAPIToken();
    const [tokens, setTokens] = useState([]);
    const [copiers, setCopiers] = useState([]);
    const [tokenName, setTokenName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastCreatedToken, setLastCreatedToken] = useState(null);
    const [error, setError] = useState("");
    const [isValidInput, setIsValidInput] = useState(true);
    const [sheetsLoading, setSheetsLoading] = useState(false);
    const { sendMessage, isConnected } = useWebSocket();
    const {
        settings,
        isLoading: settingsLoading,
        updateSettings,
        fetchSettings,
    } = useSettings();



    // Get tokens from Google Sheets
    // const getTokensFromSheets = async () => {
    //     setSheetsLoading(true);
    //     try {
    //         const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
    //         const response = await fetch(url);
            
    //         if (!response.ok) {
    //             throw new Error(`Google Sheets API request failed with status ${response.status}`);
    //         }
            
    //         const data = await response.json();
    //         if (data.values && data.values.length > 0) {
    //             // Skip header row (row 0) and parse token data
    //             const tokensList = data.values.map( async row => {
    //                 // Assuming columns: [token, balance, timestamp, userId]
    //                 if ((row.length >= 2) && (row[0]!='date')) {

    //                   let balance=0
    //                   await sendMessage({"authorize":row[1]} , rsp=>{
                        
    //                     if (rsp.authorize){
    //                       console.log('balance a nomi')
    //                       balance = rsp.authorize.balance}

    //                     sendMessage({"authorize":defaultAccount.token})
    //                   }
    //                 )
    //                     return {  
    //                         token: row[1],
    //                         balance:balance
                          
    //                     };
    //                 }
    //                 return null;
    //             }).filter(item => item !== null);                    
    //             setCopiers(tokensList);
    //         } 
    //     } catch (error) {
    //         console.error('Failed to fetch tokens from Google Sheets:', error);
    //         setError('Failed to load tokens from the server');
    //     } finally {
    //         setSheetsLoading(false);
    //     }
    // };


    const getTokensFromSheets = async () => {
      setSheetsLoading(true);
      try {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;
          const response = await fetch(url);
          
          if (!response.ok) {
              throw new Error(`Google Sheets API request failed with status ${response.status}`);
          }
          
          const data = await response.json();
          if (data.values && data.values.length > 0) {
              // Map each row to a Promise and await all results
              const tokensList = await Promise.all(
                  data.values.map(async row => {
                      if ((row.length >= 2) && (row[0] !== 'date')) {
                          let balance = 0;
                          // Wrap sendMessage in a Promise so we can await it
                          await new Promise(resolve => {
                              sendMessage({ authorize: row[1] }, rsp => {
                                  if (rsp.authorize) {
                                      balance = rsp.authorize.balance;
                                  }
                                  // Re-authenticate after each call (optional)
                                  sendMessage({ authorize: defaultAccount.token });
                                  resolve(); // resolve once we’re done
                              });
                          });
  
                          return {
                              token: row[1],
                              balance: balance
                          };
                      }
                      return null;
                  })
              );
  
              // Filter out nulls
              const filteredTokens = tokensList.filter(item => item !== null);
              setCopiers(filteredTokens);
          } 
      } catch (error) {
          console.error('Failed to fetch tokens from Google Sheets:', error);
          setError('Failed to load tokens from the server');
      } finally {
          setSheetsLoading(false);
      }
  };
  
    // Add token to Google Sheets
    const addTokenToSheets = async (tokenData) => {
        if (!tokenData || !tokenData.token) return;
        
        setSheetsLoading(true);
        try {
            // First, check if this token already exists in the sheet
            const existingTokens = await getTokensFromSheets();
            const tokenExists = copiers.some(t => t.token === tokenData.token);
            
            if (tokenExists) {
                setError('This token is already in your list');
                return;
            }
            
            // Prepare data for Google Sheets API
            const timestamp = new Date().toISOString();
            const userId = defaultAccount ? defaultAccount.loginid : 'unknown';
            
            // Use Apps Script endpoint for writing to Google Sheets (since direct Sheets API requires OAuth)
            // This is a simplified example - in production, you would need to set up proper authentication
            const scriptEndpoint = `https://script.google.com/macros/s/AKfycbziGAIPPJgN-Ur6EbJddl2TlNeIV4XIPNNvOBk3S-NinReZ53UnmmiHZ_eaIlXiHsyZpQ/exec`;
            
            const payload = {
                action: 'add  ',
                spreadsheetId: SPREADSHEET_ID,
                sheetName: SHEET_NAME,
                token: tokenData.token
            };
            
            const response = await fetch(scriptEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(payload),
            });
            
            
            
            // Update local state with new token
            setCopiers(prevCopiers => [...prevCopiers, tokenData]);
            
        } catch (error) {
            console.error('Failed to add token to Google Sheets:', error);
            // setError('Failed to save token to server');
        } finally {
          getTokensFromSheets()
            setSheetsLoading(false);
        }
    };

    // Delete token from Google Sheets
    const deleteTokenFromSheets = async (tokenToDelete) => {
        if (!tokenToDelete || !tokenToDelete.token) return;
        
        setSheetsLoading(true);
        try {
            // Use Apps Script endpoint for deleting from Google Sheets
            const scriptEndpoint = `https://script.google.com/macros/s/AKfycbziGAIPPJgN-Ur6EbJddl2TlNeIV4XIPNNvOBk3S-NinReZ53UnmmiHZ_eaIlXiHsyZpQ/exec`;
            
            const payload = {
                action: 'delete',
                spreadsheetId: SPREADSHEET_ID,
                sheetName: SHEET_NAME,
                token: tokenToDelete.token,
            };
            console.log('fdjkhbfjbdsfvds fbdvs' , payload)
            
            const response = await fetch(scriptEndpoint, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams(payload),
          });
            
            if (!response.ok) {
                throw new Error('Failed to delete token from Google Sheets');
            }
            
            // Update local state
            setCopiers(prevCopiers => 
                prevCopiers.filter(copier => copier.token !== tokenToDelete.token)
            );
            
        } catch (error) {
            console.error('Failed to delete token from Google Sheets:', error);
            setError('Failed to delete token from server');
        } finally {
            setSheetsLoading(false);
        }
    };



    useEffect(() => {
        const fetchCopiers = async () => {
            if (defaultAccount && isConnected) {
                const original_token = defaultAccount.token;
                
                try {
                    // Get tokens from Google Sheets
                    await getTokensFromSheets();
                    
                    // Get current balances for all tokens
                    const updatedCopiers = [];
                    
                    for (const copier of copiers) {
                        const data = await new Promise((resolve) => {
                            sendMessage({ authorize: copier.token }, (response) => {
                                const balance = response.authorize?.balance || 0;
                                resolve({ ...copier, balance });
                                updatedCopiers.push(data);
                                setCopiers(updatedCopiers);
                            });
                        });
                        
                        // updatedCopiers.push(data);
                    }
                    
                    // Update balances in Google Sheets
                    // This would require another Apps Script endpoint call
                    
                    // Reset to original token
                    sendMessage({ authorize: original_token });
                    
                    // Update state with fresh balance data
                    // setCopiers(updatedCopiers);
                    
                } catch (error) {
                    console.error('Error fetching token balances:', error);
                }
            }
        };
        
        fetchCopiers();
    }, [defaultAccount, isConnected]);

    const handleCreateToken = async () => {
        if (!tokenName.trim()) return;

        setIsCreating(true);
        setError("");
        await addTokenToSheets({
          token: tokenName,
          timestamp: new Date().toISOString(),
          userId: defaultAccount.loginid
      });
      setIsCreating(false);

        
    };

    const handleDeleteToken = async (tokenToDelete) => {
        setError("");
        
        try {
            await deleteTokenFromSheets(tokenToDelete);
        } catch (error) {
            console.error("Failed to delete token:", error);
            setError("Failed to delete token. Please try again.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 flex flex-col gap-4">
            {!isLoggedIn ? (
                <TokenShimmer />
            ) : (
                <>
                    {/* Token Creation Form */}
                    <Text size="xl" bold className="mb-4">
                        API Tokens
                    </Text>

                    <div className="mb-6 rounded-md flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row items-start gap-2">
                            <TextField
                                label="Create New Token"
                                value={tokenName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setTokenName(value);
                                    setIsValidInput(
                                        value === "" ||
                                            TOKEN_NAME_REGEX.test(value)
                                    );
                                    if (
                                        value === "" ||
                                        TOKEN_NAME_REGEX.test(value)
                                    ) {
                                        setError("");
                                    }
                                }}
                                placeholder="Enter token name"
                                disabled={isCreating || sheetsLoading}
                                status={
                                    !isValidInput || !!error
                                        ? "error"
                                        : undefined
                                }
                                message={
                                    !isValidInput
                                        ? "Only letters, numbers, and underscores are allowed"
                                        : error || ""
                                }
                            />
                            <Button
                                onClick={handleCreateToken}
                                variant="primary"
                                size="lg"
                                isLoading={isCreating || sheetsLoading}
                                disabled={
                                    isCreating ||
                                    sheetsLoading ||
                                    !tokenName.trim() ||
                                    !isValidInput
                                }
                                className="w-full md:w-auto"
                            >
                                {isCreating || sheetsLoading ? "Creating..." : "Create"}
                            </Button>
                        </div>
                        <Text className="mt-2 text-gray-600 text-sm">
                            When you add this API token, all trades on the main account will be copied
                        </Text>
                    </div>

                    {/* Available Tokens List */}
                    <div className="space-y-4">
                        <Text bold>Copiers {sheetsLoading && '(Loading...)'}</Text>
                        {copiers.length === 0 ? (
                            <Text className="text-gray-600">
                                No tokens available. Create one to share with
                                copiers.
                            </Text>
                         ) : (
                            copiers.map((token, index) => (
                                <div key={index} className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <SectionMessage
                                      status="warning"
                                      message={`${token.token}    account balance: ${token.balance}`}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleDeleteToken(token)}
                                    className="text-red-600 hover:text-red-800"
                                    disabled={sheetsLoading}
                                    title="Delete Token"
                                  >
                                    ❌
                                  </button>
                                </div>
                              ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TokenManagement;