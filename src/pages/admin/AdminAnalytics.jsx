import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import AiBadge from '../../components/shared/AiBadge';

const categoryData = [
  { name: 'STEM', value: 45 },
  { name: 'Arts', value: 30 },
  { name: 'Sports', value: 25 },
  { name: 'Cultural', value: 20 },
  { name: 'Professional', value: 15 },
  { name: 'Hobbies', value: 10 },
];

const engagementData = [
  { name: 'Mon', active: 4000 },
  { name: 'Tue', active: 3000 },
  { name: 'Wed', active: 5000 },
  { name: 'Thu', active: 4500 },
  { name: 'Fri', active: 2000 },
  { name: 'Sat', active: 1000 },
  { name: 'Sun', active: 1500 },
];

const COLORS = ['#00AAFF', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#6B8CAE'];

const AdminAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Platform Analytics</h1>
          <p className="text-text-2">Macro-level insights across all UniClubs activity.</p>
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>System-wide AI Insight</CardTitle>
            <AiBadge />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-text-1/90 leading-relaxed text-sm">
            Platform engagement peaks significantly on Wednesdays. STEM clubs have the highest retention rate (85%) but Arts clubs acquire new members 2x faster at the start of semesters. Recommend promoting under-represented categories (Hobbies) in the next "Discover" newsletter batch.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Club Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0D1F3C', border: '1px solid rgba(0, 180, 255, 0.12)', borderRadius: '8px', color: '#E2EEFF' }}
                    itemStyle={{ color: '#00AAFF' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs text-text-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Active Users (Platform-wide)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid stroke="#1E3A5F" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B8CAE" tick={{ fill: '#6B8CAE' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6B8CAE" tick={{ fill: '#6B8CAE' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#0D1F3C', border: '1px solid rgba(0, 180, 255, 0.12)', borderRadius: '8px', color: '#E2EEFF' }}
                    cursor={{ fill: 'rgba(0, 170, 255, 0.1)' }}
                  />
                  <Bar dataKey="active" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
