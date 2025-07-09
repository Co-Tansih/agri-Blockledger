
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Truck, Factory, Store, User } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const roles = [
  {
    value: 'farmer',
    label: 'Farmer',
    description: 'Agricultural producer and cultivator',
    icon: Users,
    color: 'text-green-600'
  },
  {
    value: 'broker',
    label: 'Broker/Trader',
    description: 'Agricultural commodity broker',
    icon: Truck,
    color: 'text-orange-600'
  },
  {
    value: 'mnc',
    label: 'MNC/Processor',
    description: 'Food processing company',
    icon: Factory,
    color: 'text-purple-600'
  },
  {
    value: 'retailer',
    label: 'Retailer',
    description: 'Retail store or supermarket',
    icon: Store,
    color: 'text-blue-600'
  },
  {
    value: 'customer',
    label: 'Customer',
    description: 'End consumer',
    icon: User,
    color: 'text-gray-600'
  }
];

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  return (
    <div className="mt-1">
      <Select value={selectedRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-full focus:ring-green-500 focus:border-green-500">
          <SelectValue placeholder="Choose your role in the supply chain" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <SelectItem 
                key={role.value} 
                value={role.value}
                className="hover:bg-green-50 focus:bg-green-50 cursor-pointer"
              >
                <div className="flex items-center space-x-3 py-1">
                  <IconComponent className={`w-5 h-5 ${role.color}`} />
                  <div>
                    <div className="font-medium text-gray-900">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      {/* Role Info */}
      {selectedRole && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
          {(() => {
            const role = roles.find(r => r.value === selectedRole);
            if (!role) return null;
            
            const IconComponent = role.icon;
            return (
              <div className="flex items-start space-x-2">
                <IconComponent className={`w-4 h-4 mt-0.5 ${role.color}`} />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{role.label}</div>
                  <div className="text-gray-600 mt-1">
                    {role.value === 'farmer' && 'You will have access to crop batch creation and harvest tracking tools.'}
                    {role.value === 'broker' && 'You can manage storage logs and commodity trading records.'}
                    {role.value === 'mnc' && 'Access processing workflows and QR code generation for products.'}
                    {role.value === 'retailer' && 'Manage shelf inventory and customer-facing product information.'}
                    {role.value === 'customer' && 'Scan QR codes to trace product journey and verify authenticity.'}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default RoleSelector;
