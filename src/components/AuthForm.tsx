
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RoleSelector from './RoleSelector';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    district: '',
    state: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  // Dummy login for developers
  const handleDeveloperLogin = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Developer Login Successful",
        description: "Redirecting to APMC Dashboard...",
      });
      
      // TODO: Replace with actual Supabase auth and redirect
      console.log("Developer login successful");
      setLoading(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!isLogin && !formData.role) {
      toast({
        title: "Error", 
        description: "Please select your role",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // TODO: Implement Supabase authentication
    // For now, simulate success
    setTimeout(() => {
      toast({
        title: isLogin ? "Login Successful" : "Account Created",
        description: `Redirecting to your ${formData.role || 'default'} dashboard...`,
      });
      
      // TODO: Implement role-based redirects:
      // APMC → APMC Batch Creator Dashboard
      // Broker → Storage Logs
      // MNC → Processing + QR Generation Panel  
      // Distributor → Shipment Tracker
      // Retailer → Shelf Management
      // Customer → Trace View
      
      console.log("Auth successful", { isLogin, formData });
      setLoading(false);
    }, 1000);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      district: '',
      state: ''
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-600">
          {isLogin 
            ? 'Sign in to access your dashboard' 
            : 'Join the agricultural supply chain network'
          }
        </p>
      </div>

      {/* Developer Login Button */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 mb-2">
          <strong>Developers:</strong> Quick access for testing
        </p>
        <Button 
          onClick={handleDeveloperLogin}
          disabled={loading}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
          size="sm"
        >
          {loading ? 'Signing in...' : 'Dev Login (dev@agri.com)'}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">or continue with email</span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name - Only for signup */}
        {!isLogin && (
          <div>
            <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleInputChange}
              required={!isLogin}
              className="mt-1 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your full name"
            />
          </div>
        )}

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-gray-700">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter your email"
          />
        </div>

        {/* Password */}
        <div>
          <Label htmlFor="password" className="text-gray-700">Password</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              required
              className="pr-10 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password - Only for signup */}
        {!isLogin && (
          <div>
            <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required={!isLogin}
                className="pr-10 focus:ring-green-500 focus:border-green-500"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Role Selection - Only for signup */}
        {!isLogin && (
          <div>
            <Label className="text-gray-700">Select Your Role</Label>
            <RoleSelector selectedRole={formData.role} onRoleChange={handleRoleChange} />
          </div>
        )}

        {/* Location - Only for signup */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="district" className="text-gray-700">District</Label>
              <Input
                id="district"
                name="district"
                type="text"
                value={formData.district}
                onChange={handleInputChange}
                required={!isLogin}
                className="mt-1 focus:ring-green-500 focus:border-green-500"
                placeholder="Your district"
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-gray-700">State</Label>
              <Input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                required={!isLogin}
                className="mt-1 focus:ring-green-500 focus:border-green-500"
                placeholder="Your state"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 transition-colors"
        >
          {loading 
            ? (isLogin ? 'Signing in...' : 'Creating account...') 
            : (isLogin ? 'Sign In' : 'Create Account')
          }
        </Button>
      </form>

      {/* Toggle Mode */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={toggleMode}
            className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      {/* Forgot Password - Only for login */}
      {isLogin && (
        <div className="text-center">
          <button className="text-sm text-green-600 hover:text-green-700 hover:underline transition-colors">
            Forgot your password?
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
