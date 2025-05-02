import { useEffect, useState, useCallback } from 'react'
import useWebSocket from './useWebSocket'
import { useAuth } from '../hooks/useAuth.jsx'

const useCopyTradersList = () => {
    const { sendMessage, lastMessage } = useWebSocket()
    const { defaultAccount, otherAccounts, authLoading, isLoggedIn, updateAccounts, clearAccounts, authorize } = useAuth();
    const [traders, setTraders] = useState([])
    const [copiers, setCopiers] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchList = useCallback(() => {


        // if (!isConnected ) {
        //     console.log('here fetching list izzzzan')
        //     return}



        console.log('here fetching copy traders list')
        

        sendMessage(
            {
                copytrading_list: 1,
                // Optional parameters can be added here:
                // sort_fields: ["performance", "monthly_profitable_trades"],
                // sort_order: ["DESC", "DESC"]
            },
            (response) => {
                console.log('Copy Trading List Response:', response)

                if (response.error) {
                    console.log('copy trading failed ')
                    setError(response.error.message)
                    setIsLoading(false)
                    return
                }

                if (response.copytrading_list) {
                    setTraders(response.copytrading_list.traders)
                    setCopiers(response.copytrading_list.copiers)
                    setIsLoading(false)
                    setError(null)
                }
            }
        )
    }, [sendMessage, isLoggedIn , authLoading ])

    // Initial fetch when authorized and connected
    useEffect(() => {
        if (isLoggedIn ) {
            fetchList()
        }
    }, [isLoggedIn, authLoading, fetchList])

    // Handle broadcast messages
    useEffect(() => {
        if (!lastMessage) return

        if (lastMessage.msg_type === 'copytrading_list') {
            if (lastMessage.error) {
                setError(lastMessage.error.message)
                setIsLoading(false)
                return
            }

            if (lastMessage.copytrading_list) {
                setTraders(lastMessage.copytrading_list.traders)
                setCopiers(lastMessage.copytrading_list.copiers)
                setIsLoading(false)
                setError(null)
            }
        }
    }, [lastMessage])

    return {
        traders,
        copiers,
        isLoading,
        error,
        refreshList: fetchList
    }
}

export default useCopyTradersList
