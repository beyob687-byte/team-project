import React from 'react';
import { Shield, Users, Building, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AdminOverview = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Platform Overview</h1>
          <p className="text-text-2">Superadmin control panel for UniClubs.</p>
        </div>
        <Button variant="outline" className="border-border-glow"><Shield className="w-4 h-4 mr-2 text-primary" /> Security Audit</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                +4% <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-text-1">12,450</p>
            <p className="text-sm text-text-2">Total Active Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Building className="w-5 h-5 text-secondary" />
              </div>
              <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                +2 <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-text-1">142</p>
            <p className="text-sm text-text-2">Registered Clubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-success" />
              </div>
              <span className="flex items-center text-xs font-medium text-danger bg-danger/10 px-2 py-1 rounded-full">
                -12% <ArrowDownRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-text-1">8,451</p>
            <p className="text-sm text-text-2">Weekly Active Sessions</p>
          </CardContent>
        </Card>

        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <AlertTriangle className="w-5 h-5 text-deep" />
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-warning">14</p>
            <p className="text-sm text-warning/80">Pending Moderation Items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-2">API Server</span>
                <span className="text-success font-medium">99.9% Uptime</span>
              </div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full w-[99%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-2">Database Cluster</span>
                <span className="text-success font-medium">Healthy (42% Load)</span>
              </div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full w-[42%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-2">WebSocket Server</span>
                <span className="text-warning font-medium">Warning (85% Load)</span>
              </div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full bg-warning rounded-full w-[85%]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Approved Club', target: 'AI Research Group', time: '10 mins ago', user: 'admin_sys' },
                { action: 'Suspended User', target: 'user_19382', time: '1 hour ago', user: 'mod_sarah' },
                { action: 'System Update', target: 'v1.4.2 Deployed', time: '3 hours ago', user: 'devops_auto' },
                { action: 'Resolved Report', target: 'Inappropriate Content #492', time: '5 hours ago', user: 'mod_sarah' },
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-start py-3 border-b border-border-glow/50 last:border-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-text-1">{log.action}: <span className="text-primary">{log.target}</span></p>
                    <p className="text-xs text-text-2 mt-0.5">by {log.user}</p>
                  </div>
                  <span className="text-xs text-text-2/60">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
