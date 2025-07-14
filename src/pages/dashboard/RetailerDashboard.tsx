
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RetailerActivityForm } from '@/components/forms/RetailerActivityForm';
import { Store, ShoppingCart, Package, Users, Plus } from 'lucide-react';

const RetailerDashboard = () => {
  const [showActivityForm, setShowActivityForm] = useState(false);

  return (
    <DashboardLayout title="Retailer Dashboard">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Manage your store inventory and sales</h3>
        </div>
        <Button onClick={() => setShowActivityForm(!showActivityForm)} variant="default">
          <Plus className="mr-2 h-4 w-4" />
          {showActivityForm ? 'Hide Form' : 'Log Retail Activity'}
        </Button>
      </div>

      {showActivityForm && (
        <div className="mb-6">
          <RetailerActivityForm onSuccess={() => setShowActivityForm(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹89,500</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers Served</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Locations</CardTitle>
            <Store className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Active stores</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Products requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Organic Tomatoes</p>
                    <p className="text-xs text-gray-500">Low stock - 12 units left</p>
                  </div>
                </div>
                <div className="text-xs text-red-600 font-medium">Critical</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Wheat Flour 1kg</p>
                    <p className="text-xs text-gray-500">Expiring in 3 days</p>
                  </div>
                </div>
                <div className="text-xs text-orange-600 font-medium">Warning</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Rice Basmati 5kg</p>
                    <p className="text-xs text-gray-500">Restock recommended</p>
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-medium">Info</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Management</CardTitle>
            <CardDescription>Manage your retail operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <div className="font-medium text-blue-800">Update Inventory</div>
              <div className="text-sm text-blue-600">Add or modify product stock</div>
            </button>
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <div className="font-medium text-green-800">Scan Products</div>
              <div className="text-sm text-green-600">Verify product authenticity</div>
            </button>
            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <div className="font-medium text-purple-800">Customer Info</div>
              <div className="text-sm text-purple-600">Share product traceability</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RetailerDashboard;
