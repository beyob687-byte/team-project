import React from 'react';
import { Users, CalendarDays, MessageSquare, UserPlus, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const data = [
  { name: 'Jan', members: 120 },
  { name: 'Feb', members: 132 },
  { name: 'Mar', members: 145 },
  { name: 'Apr', members: 160 },
  { name: 'May', members: 190 },
  { name: 'Jun', members: 210 },
];

const ManageDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Club Dashboard</h1>
          <p className="text-text-2">Overview of your club's performance and activity.</p>
        </div>
        <Button className="shadow-glow">New Post</Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                +12% <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-text-1">210</p>
              <p className="text-sm text-text-2">Total Members</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-secondary" />
              </div>
              <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                +3 <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-text-1">4</p>
              <p className="text-sm text-text-2">Events This Month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-warning" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-text-1">12</p>
              <p className="text-sm text-text-2">Posts This Week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/50 shadow-glow bg-primary/5">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,170,255,0.4)]">
                <UserPlus className="w-5 h-5 text-deep" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-display font-bold text-primary">8</p>
              <p className="text-sm text-primary-dim">Pending Requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line type="monotone" dataKey="members" stroke="#00AAFF" strokeWidth={3} dot={{ r: 4, fill: '#00AAFF', strokeWidth: 2, stroke: '#050A14' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  <CartesianGrid stroke="#1E3A5F" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B8CAE" tick={{ fill: '#6B8CAE' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6B8CAE" tick={{ fill: '#6B8CAE' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0D1F3C', border: '1px solid rgba(0, 180, 255, 0.12)', borderRadius: '8px', color: '#E2EEFF' }}
                    itemStyle={{ color: '#00AAFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { title: 'New member joined', desc: 'Alice Smith joined the club', time: '2 hours ago', icon: UserPlus, color: 'text-success', bg: 'bg-success/10' },
                { title: 'New RSVP', desc: 'Bob Jones RSVP\'d to React Workshop', time: '5 hours ago', icon: CalendarDays, color: 'text-primary', bg: 'bg-primary/10' },
                { title: 'Content Flagged', desc: 'A recent comment was flagged by AI', time: '1 day ago', icon: MessageSquare, color: 'text-warning', bg: 'bg-warning/10' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-1">{item.title}</p>
                    <p className="text-xs text-text-2 mt-0.5">{item.desc}</p>
                    <p className="text-xs text-text-2/60 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-sm">View All Activity</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManageDashboard;
