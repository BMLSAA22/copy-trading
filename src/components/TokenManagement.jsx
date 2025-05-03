// 

import { useState, useEffect } from "react";
import { TextField, Button, Text, SectionMessage } from "@deriv-com/quill-ui";
import TokenContainer from "./TokenContainer";
import useAPIToken from "../hooks/useAPIToken";
import TokenShimmer from "./TokenShimmer";
import useWebSocket from "../hooks/useWebSocket";
import useAuth from "../hooks/useAuth";
import useSettings from "../hooks/useSettings";

const TOKEN_NAME_REGEX = /^[a-zA-Z0-9_]+$/;

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
    const { sendMessage } = useWebSocket();
        const {
            settings,
            isLoading: settingsLoading,
            updateSettings,
            fetchSettings,
        } = useSettings();

    const fetchTokens = async () => {
        setIsLoading(true);
        try {
            const response = await getTokens();
            if (response.api_token?.tokens) {
                const readTokens = response.api_token.tokens.filter((token) =>
                    token.scopes?.includes("read")
                );
                setTokens(readTokens);
            }
        } catch (error) {
            console.error("Failed to fetch tokens:", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    useEffect(() => {
        // sendMessage({ copytrading_list: 1}, (response) => {
        //     setCopiers(response.copytrading_list.copiers)})


        setCopiers(getTokensFromLocalStorage())
        console.log("copiers" , copiers)
    }, []);

    const handleCreateToken = async () => {
        if (!tokenName.trim()) return;

        setIsCreating(true);
        setError("");

        try {
            

            if (defaultAccount.token){
           
                sendMessage({ authorize: tokenName}, async (listRes1) => {
                    
                    
                    await updateSettings({allow_copiers : 0})
                    sendMessage({ copy_start: defaultAccount.token }, (startRes) => {
                        console.log('copy start ' ,startRes )
                         


                     sendMessage({ authorize: defaultAccount.token}, (listRes2) => {
                        });
                    });
                });
            }

            
        } catch (error) {
            setError(
                error.message || "Failed to create token. Please try again."
            );
        } finally {
            setIsCreating(false);
        }
    };

    // const handleDeleteToken = async (token) => {
    //     setError("");
        
    //     try {
    //         await deleteToken(token);
    //         fetchTokens(); // Refresh token list after deletion
    //     } catch (error) {
    //         console.error("Failed to delete token:", error);
            
    //     }
    // };

    function handleDeleteToken(tokenToDelete) {
        const existingTokens = getTokensFromLocalStorage().filter(
          (token) => token !== tokenToDelete
        );
        localStorage.setItem('tokens', JSON.stringify(existingTokens));
        setCopiers(existingTokens); // assuming copiers is your local state
      }


    function addTokenToLocalStorage() {
        if (!tokenName.trim()) return;
      
        const token = tokenName.trim();
      
        let existingTokensRaw = localStorage.getItem('tokens');
        let existingTokens= [];
      
        try {
          existingTokens = existingTokensRaw ? JSON.parse(existingTokensRaw) : [];
          if (!Array.isArray(existingTokens)) {
            throw new Error('Corrupted tokens value');
          }
        } catch (error) {
          // If parsing failed or it's not an array, reset to a new array
          existingTokens = [];
        }
      
        existingTokens.push(token);
        localStorage.setItem('tokens', JSON.stringify(existingTokens));
      }
      
      

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
                                disabled={isCreating}
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
                                // onClick={handleCreateToken}
                                onClick={addTokenToLocalStorage}
                                variant="primary"
                                size="lg"
                                isLoading={isCreating}
                                disabled={
                                    isCreating ||
                                    !tokenName.trim() ||
                                    !isValidInput
                                }
                                className="w-full md:w-auto"
                            >
                                {isCreating ? "Creating..." : "Create"}
                            </Button>
                        </div>
                        <Text className="mt-2 text-gray-600 text-sm">
                                when you add this api token all trade on the main account will be copied
                        </Text>
                    </div>

                    {/* Available Tokens List */}
                    <div className="space-y-4">
                        <Text bold>Copiers</Text>
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
                                      message={token}
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleDeleteToken(token)}
                                    className="text-red-600 hover:text-red-800"
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
