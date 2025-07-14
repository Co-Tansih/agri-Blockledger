
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MNCActivityForm } from '@/components/forms/MNCActivityForm';
import { Factory, Package2, Users, BarChart, Plus } from 'lucide-react';

const MNCDashboard = () => {
  const [showActivityForm, setShowActivityForm] = useState(false);

  return (
    <DashboardLayout title="MNC Dashboard">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Monitor your manufacturing operations</h3>
        </div>
        <Button onClick={() => setShowActivityForm(!showActivityForm)} variant="default">
          <Plus className="mr-2 h-4 w-4" />
          {showActivityForm ? 'Hide Form' : 'Log Manufacturing'}
        </Button>
      </div>

      {showActivityForm && (
        <div className="mb-6">
          <MNCActivityForm onSuccess={() => setShowActivityForm(false)} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Lines</CardTitle>
            <Factory className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products Processed</CardTitle>
            <Package2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Verified suppliers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <BarChart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Average quality rating</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Processing Pipeline</CardTitle>
            <CardDescription>Current production status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Tomato Sauce Line A</p>
                    <p className="text-xs text-gray-500">Batch TS001</p>
                  </div>
                </div>
                <div className="text-xs text-green-600 font-medium">Active</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Wheat Flour Line B</p>
                    <p className="text-xs text-gray-500">Batch WF034</p>
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-medium">Processing</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Rice Processing</p>
                    <p className="text-xs text-gray-500">Batch RP018</p>
                  </div>
                </div>
                <div className="text-xs text-orange-600 font-medium">Quality Check</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manufacturing Tools</CardTitle>
            <CardDescription>Manage processing operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <div className="font-medium text-purple-800">Start Production</div>
              <div className="text-sm text-purple-600">Begin new processing batch</div>
            </button>
            <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <div className="font-medium text-blue-800">Quality Control</div>
              <div className="text-sm text-blue-600">Monitor product quality</div>
            </button>
            <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <div className="font-medium text-green-800">Generate Labels</div>
              <div className="text-sm text-green-600">Create product QR codes</div>
            </button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MNCDashboard;
