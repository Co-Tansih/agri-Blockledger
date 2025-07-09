
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Leaf, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { profile, signOut } = useAuth();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'farmer': return 'text-green-600';
      case 'broker': return 'text-orange-600';
      case 'mnc': return 'text-purple-600';
      case 'retailer': return 'text-blue-600';
      case 'customer': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <Leaf className="w-8 h-8 text-green-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">AgriTraceLedger</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{profile?.full_name || profile?.email}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${getRoleColor(profile?.role || '')}`}>
                {profile?.role?.toUpperCase()}
              </div>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
