'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Database, 
  Globe, 
  Bell, 
  Shield, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Users,
  Server,
  Key
} from 'lucide-react';
import { useToast } from '@/components/hooks/use-toast';
import { useAuth } from '@/hooks/useApi';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxFileSize: number;
  imageQuality: number;
  apiRateLimit: number;
  sessionTimeout: number;
}

interface NotificationSettings {
  enableNotifications: boolean;
  enableEmailAlerts: boolean;
  enableSMSAlerts: boolean;
  emailNotifications: boolean;
  newCarAlerts: boolean;
  reviewAlerts: boolean;
  systemAlerts: boolean;
}

interface SecuritySettings {
  requireTwoFactor: boolean;
  passwordMinLength: number;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enableAuditLog: boolean;
  ipWhitelist: string[];
}

interface DatabaseStatus {
  status: 'connected' | 'disconnected' | 'error';
  lastCheck: Date;
  responseTime: number;
  totalRecords: number;
  collections: {
    cars: number;
    brands: number;
    categories: number;
    reviews: number;
    users: number;
  };
}

export default function AdminSettings() {
  const { token } = useAuth();
  const { toast } = useToast();
  
  // Settings states
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: 'ESrent.ae',
    siteDescription: 'Premium Car Rental Platform',
    contactEmail: 'admin@esrent.ae',
    supportPhone: '+971 50 123 4567',
    maintenanceMode: false,
    allowRegistration: true,
    maxFileSize: 10,
    imageQuality: 85,
    apiRateLimit: 1000,
    sessionTimeout: 30,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enableNotifications: true,
    enableEmailAlerts: true,
    enableSMSAlerts: false,
    emailNotifications: true,
    newCarAlerts: true,
    reviewAlerts: true,
    systemAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireTwoFactor: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableAuditLog: true,
    ipWhitelist: [],
  });

  // Database status
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    status: 'disconnected',
    lastCheck: new Date(),
    responseTime: 0,
    totalRecords: 0,
    collections: {
      cars: 0,
      brands: 0,
      categories: 0,
      reviews: 0,
      users: 0,
    },
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Stats for the dashboard
  const [stats, setStats] = useState({
    systemStatus: 'operational',
  });

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
    checkDatabaseStatus();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real app, you'd fetch from API
      // const response = await fetch('/api/settings');
      // const data = await response.json();
      
      // For now, we'll use localStorage to persist settings
      const savedSystemSettings = localStorage.getItem('systemSettings');
      const savedNotificationSettings = localStorage.getItem('notificationSettings');
      const savedSecuritySettings = localStorage.getItem('securitySettings');

      if (savedSystemSettings) {
        setSystemSettings(JSON.parse(savedSystemSettings));
      }
      if (savedNotificationSettings) {
        setNotificationSettings(JSON.parse(savedNotificationSettings));
      }
      if (savedSecuritySettings) {
        setSecuritySettings(JSON.parse(savedSecuritySettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDatabaseStatus = async () => {
    try {
      setDbLoading(true);
      const startTime = Date.now();

      // Check database connectivity by making API calls
      const [carsRes, brandsRes, categoriesRes, reviewsRes] = await Promise.allSettled([
        fetch('/api/cars?limit=1'),
        fetch('/api/brands?limit=1'),
        fetch('/api/categories?limit=1'),
        fetch('/api/reviews?limit=1'),
      ]);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Count records in each collection
      const carsCount = carsRes.status === 'fulfilled' ? await getCollectionCount('/api/cars') : 0;
      const brandsCount = brandsRes.status === 'fulfilled' ? await getCollectionCount('/api/brands') : 0;
      const categoriesCount = categoriesRes.status === 'fulfilled' ? await getCollectionCount('/api/categories') : 0;
      const reviewsCount = reviewsRes.status === 'fulfilled' ? await getCollectionCount('/api/reviews') : 0;

      const totalRecords = carsCount + brandsCount + categoriesCount + reviewsCount;

      setDbStatus({
        status: 'connected',
        lastCheck: new Date(),
        responseTime,
        totalRecords,
        collections: {
          cars: carsCount,
          brands: brandsCount,
          categories: categoriesCount,
          reviews: reviewsCount,
          users: 0, // We don't have a users API endpoint
        },
      });
    } catch (error) {
      console.error('Error checking database status:', error);
      setDbStatus(prev => ({
        ...prev,
        status: 'error',
        lastCheck: new Date(),
      }));
    } finally {
      setDbLoading(false);
    }
  };

  const getCollectionCount = async (endpoint: string): Promise<number> => {
    try {
      const response = await fetch(`${endpoint}?limit=1000`);
      const data = await response.json();
      
      if (data.total) return data.total;
      if (data.data && Array.isArray(data.data)) return data.data.length;
      if (Array.isArray(data)) return data.length;
      return 0;
    } catch {
      return 0;
    }
  };

  const loadStats = async () => {
    try {
      // Simulate loading real stats
      setStats({
        systemStatus: 'operational',
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage (in a real app, you'd save to API)
      localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      localStorage.setItem('securitySettings', JSON.stringify(securitySettings));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Settings Saved',
        description: 'All settings have been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'operational':
        return 'bg-green-500/20 text-green-600 dark:text-green-400';
      case 'disconnected':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'bg-red-500/20 text-red-600 dark:text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'operational':
        return <CheckCircle className="w-4 h-4" />;
      case 'disconnected':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            System Settings
          </h1>
          <p className="text-muted-foreground">Configure your application settings and preferences</p>
        </div>
        <Button 
          onClick={saveSettings}
          disabled={saving}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stats.systemStatus)}`}>
                    {stats.systemStatus}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database Health</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dbStatus.status)}`}>
                    {dbStatus.status}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="text-2xl font-bold text-purple-400">{dbStatus.responseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-orange-400">{dbStatus.totalRecords}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* General Settings */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={systemSettings.siteName}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  placeholder="Enter site name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={systemSettings.contactEmail}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={systemSettings.siteDescription}
                onChange={(e) => setSystemSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                placeholder="Enter site description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={systemSettings.supportPhone}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                  placeholder="+971 50 123 4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={systemSettings.maxFileSize}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) || 10 }))}
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="imageQuality">Image Quality (%)</Label>
                <Input
                  id="imageQuality"
                  type="number"
                  value={systemSettings.imageQuality}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, imageQuality: parseInt(e.target.value) || 85 }))}
                  min="50"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">API Rate Limit</Label>
                <Input
                  id="apiRateLimit"
                  type="number"
                  value={systemSettings.apiRateLimit}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, apiRateLimit: parseInt(e.target.value) || 1000 }))}
                  min="100"
                  max="10000"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable the site for maintenance</p>
              </div>
              <Switch
                checked={systemSettings.maintenanceMode}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Registration</Label>
                <p className="text-sm text-muted-foreground">Allow new users to register</p>
              </div>
              <Switch
                checked={systemSettings.allowRegistration}
                onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, allowRegistration: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">Enable all system notifications</p>
              </div>
              <Switch
                checked={notificationSettings.enableNotifications}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enableNotifications: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Alerts</Label>
                <p className="text-sm text-muted-foreground">Send notifications via email</p>
              </div>
              <Switch
                checked={notificationSettings.enableEmailAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enableEmailAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
              </div>
              <Switch
                checked={notificationSettings.enableSMSAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enableSMSAlerts: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Car Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when new cars are added</p>
              </div>
              <Switch
                checked={notificationSettings.newCarAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newCarAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Review Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when new reviews are posted</p>
              </div>
              <Switch
                checked={notificationSettings.reviewAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, reviewAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Alerts</Label>
                <p className="text-sm text-muted-foreground">Notify about system events</p>
              </div>
              <Switch
                checked={notificationSettings.systemAlerts}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Settings */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for admin access</p>
              </div>
              <Switch
                checked={securitySettings.requireTwoFactor}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireTwoFactor: checked }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Min Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) || 8 }))}
                  min="6"
                  max="20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
                  min="3"
                  max="10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Audit Log</Label>
                <p className="text-sm text-muted-foreground">Log all admin actions</p>
              </div>
              <Switch
                checked={securitySettings.enableAuditLog}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableAuditLog: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>IP Whitelist</Label>
              <Textarea
                placeholder="Enter IP addresses (one per line)"
                value={securitySettings.ipWhitelist.join('\n')}
                onChange={(e) => setSecuritySettings(prev => ({ 
                  ...prev, 
                  ipWhitelist: e.target.value.split('\n').filter(ip => ip.trim()) 
                }))}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">Leave empty to allow all IPs</p>
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dbStatus.status)}`}>
                  {getStatusIcon(dbStatus.status)}
                </span>
                <span className="capitalize">{dbStatus.status}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkDatabaseStatus}
                disabled={dbLoading}
                className="border-border/50"
              >
                {dbLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Response Time</p>
                <p className="font-medium">{dbStatus.responseTime}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Check</p>
                <p className="font-medium">{dbStatus.lastCheck.toLocaleTimeString()}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Collection Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cars</span>
                  <span className="font-medium">{dbStatus.collections.cars}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brands</span>
                  <span className="font-medium">{dbStatus.collections.brands}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Categories</span>
                  <span className="font-medium">{dbStatus.collections.categories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-medium">{dbStatus.collections.reviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Users</span>
                  <span className="font-medium">{dbStatus.collections.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Records</span>
                  <span className="font-medium">{dbStatus.totalRecords}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">API Configuration</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base URL</span>
                  <span className="font-mono text-xs">{window.location.origin}/api</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version</span>
                  <span className="font-medium">v1.0.0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="border-green-500/20 text-green-600">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 