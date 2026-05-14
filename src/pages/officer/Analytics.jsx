import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AiBadge from '../../components/shared/AiBadge';

const attendanceData = [
  { name: 'Workshop 1', attendees: 35 },
  { name: 'Mixer', attendees: 80 },
  { name: 'Hackathon', attendees: 150 },
  { name: 'Workshop 2', attendees: 45 },
];

const engagementData = [
  { name: 'Week 1', views: 400, likes: 240, comments: 24 },
  { name: 'Week 2', views: 300, likes: 139, comments: 22 },
  { name: 'Week 3', views: 200, likes: 980, comments: 229 },
  { name: 'Week 4', views: 278, likes: 390, comments: 20 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Analytics</h1>
          <p className="text-text-2">Deep dive into your club's data and trends.</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>AI Executive Summary</CardTitle>
            <AiBadge />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-text-1/90 leading-relaxed text-sm">
            Based on the last 30 days, your club has seen a <strong className="text-success">24% increase</strong> in overall engagement. The recent "Hackathon" event was a major outlier, contributing to 40% of new member sign-ups this month. Post engagement is highest on Tuesdays and Thursdays. Consider scheduling future major announcements during these windows.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid stroke="#1E3A5F" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B8CAE" tick={{ fill: '#6B8CAE' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6B8CAE" tick={{ fill: '#6B8CAE' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0D1F3C', border: '1px solid rgba(0, 180, 255, 0.12)', borderRadius: '8px', color: '#E2EEFF' }}
                    cursor={{ fill: 'rgba(0, 170, 255, 0.1)' }}
                  />
                  <Bar dataKey="attendees" fill="#00AAFF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post Engagement Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid stroke="#1E3A5F" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B8CAE" tick={{ fill: '#6B8CAE' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6B8CAE" tick={{ fill: '#6B8CAE' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0D1F3C', border: '1px solid rgba(0, 180, 255, 0.12)', borderRadius: '8px', color: '#E2EEFF' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="views" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="likes" stroke="#00AAFF" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="comments" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
