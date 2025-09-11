import { Building } from "lucide-react";
import { useState } from "react";
import AgencySignup from "./_components/AgencySignup";
import InvestorSignup from "./_components/ClientSignup";
import Login from "./_components/Login";
const Page = () => {
    const [currentView, setCurrentView] = useState('login');

    const renderCurrentView = () => {
        switch (currentView) {
            case 'agency-signup':
                return <AgencySignup />;
            case 'investor-signup':
                return <InvestorSignup />;
            case 'login':
            default:
                return <Login />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Building className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">RealEstate Platform</span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setCurrentView('login')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'login'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setCurrentView('investor-signup')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'investor-signup'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Investor Signup
                            </button>
                            <button
                                onClick={() => setCurrentView('agency-signup')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'agency-signup'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Agency Signup
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            {renderCurrentView()}
        </div>
    );
};

export default Page;