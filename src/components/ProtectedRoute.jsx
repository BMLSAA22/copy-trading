import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { Skeleton } from "@deriv-com/quill-ui"

const ProtectedRoute = ({ children }) => {
    const { defaultAccount, isLoading } = useAuth()
    console.log('this is amayas login  , defaultacount' , defaultAccount)

    console.log('ProtectedRoute - defaultAccount:', defaultAccount)
    console.log('ProtectedRoute - isLoading:', isLoading)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto p-6">
                    {/* User Type Selection Shimmer */}
                    <div className="flex justify-center mb-8">
                        <Skeleton.Square active rounded width="200px" height="40px" />
                    </div>

                    {/* Add Trader Form Shimmer */}
                    <div className="bg-white p-6 rounded-lg shadow mb-8">
                        <Skeleton.Square active rounded width="100%" height="80px" />
                    </div>

                    {/* Traders List Header Shimmer */}
                    <div className="mb-8">
                        <Skeleton.Square active rounded width="200px" height="24px" />
                    </div>

                    {/* Traders List Shimmer */}
                    <div className="grid gap-6">
                        {[1, 2, 3].map((index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <Skeleton.Square active rounded width="150px" height="24px" />
                                    <Skeleton.Square active rounded width="100px" height="24px" />
                                </div>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <Skeleton.Square active rounded width="100%" height="60px" />
                                    <Skeleton.Square active rounded width="100%" height="60px" />
                                    <Skeleton.Square active rounded width="100%" height="60px" />
                                </div>
                                <div className="flex justify-end">
                                    <Skeleton.Square active rounded width="120px" height="36px" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!defaultAccount?.token) {
        console.log('No token found, redirecting to login')
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
