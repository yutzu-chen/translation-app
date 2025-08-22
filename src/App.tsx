import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CreateTranslation } from './components/CreateTranslation';
import { Analytics } from './components/Analytics';
import { LogIn, LogOut, Plus, BarChart3, Home } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{name: string; email: string} | null>(null);

  const handleSignIn = () => {
    // Simulate Holidu authentication
    const mockUser = {
      name: 'John Doe',
      email: 'john.doe@holidu.com'
    };
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Holidu Translation</h1>
              <p className="text-gray-600">Please sign in with your Holidu account to continue</p>
            </div>
            <button
              onClick={handleSignIn}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign in with Holidu
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'create':
        return <CreateTranslation />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Holidu Translation</h1>
              </div>
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeTab === 'create'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Translation
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeTab === 'dashboard'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Keys
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    activeTab === 'analytics'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Proofreading Progress
                </button>
                <div className="flex items-center space-x-3 ml-4">
                  <span className="text-sm text-gray-700">{user?.name}</span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-500 hover:text-gray-700"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className={isAuthenticated ? "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" : ""}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;