import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import AiBadge from '../../components/shared/AiBadge';

const mockQueue = [
  { 
    id: 'req_1', 
    type: 'Club Registration', 
    target: 'Blockchain Society', 
    submittedBy: 'Eve Adams', 
    date: '2 hours ago',
    riskLevel: 'Low',
    details: 'New club registration request for "Blockchain Society". All required fields completed.'
  },
  { 
    id: 'rpt_42', 
    type: 'User Report', 
    target: 'Post #4928', 
    submittedBy: 'Multiple Users (3)', 
    date: '5 hours ago',
    riskLevel: 'High',
    details: 'Post reported for inappropriate language and harassment.',
    aiFlag: true
  },
];

const Moderation = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Moderation Queue</h1>
          <p className="text-text-2">Review reported content, user appeals, and club registrations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center text-warning">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning leading-none">14</p>
              <p className="text-sm text-warning/80">Pending Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center text-danger">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1 leading-none">3</p>
              <p className="text-sm text-text-2">High Risk Items</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-1 leading-none">42</p>
              <p className="text-sm text-text-2">Resolved Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {mockQueue.map(item => (
          <Card key={item.id} className={item.riskLevel === 'High' ? 'border-danger/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : ''}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={item.type === 'User Report' ? 'danger' : 'primary'}>{item.type}</Badge>
                        {item.riskLevel === 'High' && <Badge variant="danger">High Risk</Badge>}
                        {item.aiFlag && <AiBadge />}
                        <span className="text-xs text-text-2 ml-2">{item.date}</span>
                      </div>
                      <h3 className="text-lg font-bold text-text-1 flex items-center gap-2">
                        {item.target} <ExternalLink className="w-4 h-4 text-text-2 cursor-pointer hover:text-primary" />
                      </h3>
                      <p className="text-sm text-text-2">Submitted by: {item.submittedBy}</p>
                    </div>
                  </div>
                  
                  <div className="bg-surface-2/50 p-4 rounded-lg border border-border-glow">
                    <p className="text-sm text-text-1">{item.details}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex flex-col justify-center gap-3 md:w-48 border-t md:border-t-0 md:border-l border-border-glow pt-4 md:pt-0 md:pl-6">
                  {item.type === 'Club Registration' ? (
                    <>
                      <Button className="w-full bg-success hover:bg-success/80 text-deep"><CheckCircle className="w-4 h-4 mr-2" /> Approve</Button>
                      <Button variant="outline" className="w-full text-danger border-danger/30 hover:bg-danger/10"><XCircle className="w-4 h-4 mr-2" /> Reject</Button>
                    </>
                  ) : (
                    <>
                      <Button className="w-full"><ShieldAlert className="w-4 h-4 mr-2" /> Take Action</Button>
                      <Button variant="outline" className="w-full">Dismiss</Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Moderation;
