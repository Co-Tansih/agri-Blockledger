
import React from 'react';
import AuthForm from '../components/AuthForm';
import { Leaf, Truck, Users, ShoppingCart } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-green-800 p-12 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">AgriTraceLedger</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Track Every Step of Your Agricultural Supply Chain
          </h2>
          
          <p className="text-green-100 text-lg mb-8 leading-relaxed">
            From APMC to your customers, ensure transparency and trust in India's agricultural ecosystem with blockchain-powered traceability.
          </p>
          
          {/* Supply Chain Flow */}
          <div className="space-y-4">
            <div className="flex items-center text-green-100">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span>APMC → Broker → MNC → Distributor → Retailer → Customer</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <p className="text-green-100 text-sm">Real-time Tracking</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-green-100 text-sm">Multi-role Access</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <p className="text-green-100 text-sm">End-to-End Visibility</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 rounded-full"></div>
      </div>
      
      {/* Right Panel - Authentication */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-3">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-green-800">AgriTraceLedger</h1>
            </div>
            <p className="text-gray-600">Track your agricultural supply chain</p>
          </div>
          
          <AuthForm />
          
          {/* Organization Registration Link */}
          <div className="mt-8 text-center">
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-600 mb-2">Business Organization?</p>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm hover:underline transition-colors">
                📢 Register your organization
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
