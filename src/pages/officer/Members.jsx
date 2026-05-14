import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Download, Mail, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

const mockMembers = [
  { id: 1, name: 'Alice Smith', email: 'alice@uni.edu', role: 'President', joinDate: '2023-09-01', attendance: '95%' },
  { id: 2, name: 'Bob Jones', email: 'bob@uni.edu', role: 'VP', joinDate: '2023-09-01', attendance: '90%' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@uni.edu', role: 'Member', joinDate: '2024-01-15', attendance: '75%' },
  { id: 4, name: 'Diana Prince', email: 'diana@uni.edu', role: 'Event Coordinator', joinDate: '2023-10-10', attendance: '100%' },
];

const mockRequests = [
  { id: 101, name: 'Eve Adams', email: 'eve@uni.edu', requestDate: '2024-05-10', message: 'I am really passionate about coding!' },
];

const Members = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Members</h1>
          <p className="text-text-2">Manage your club roster and join requests.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button><Mail className="w-4 h-4 mr-2" /> Message All</Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border-glow">
        <button 
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-text-2 hover:text-text-1'}`}
          onClick={() => setActiveTab('members')}
        >
          All Members ({mockMembers.length})
        </button>
        <button 
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'requests' ? 'border-primary text-primary' : 'border-transparent text-text-2 hover:text-text-1'}`}
          onClick={() => setActiveTab('requests')}
        >
          Pending Requests ({mockRequests.length})
        </button>
      </div>

      {activeTab === 'members' ? (
        <Card>
          <div className="p-4 border-b border-border-glow flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-2/30">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
              <Input 
                placeholder="Search members..." 
                className="pl-9 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-2 uppercase bg-surface-2/50 border-b border-border-glow">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Join Date</th>
                  <th className="px-6 py-4 font-medium">Attendance</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-glow/50">
                {mockMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-2/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" />
                        <div>
                          <p className="font-medium text-text-1">{member.name}</p>
                          <p className="text-xs text-text-2">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={member.role === 'Member' ? 'outline' : 'primary'}>{member.role}</Badge>
                    </td>
                    <td className="px-6 py-4 text-text-2">{member.joinDate}</td>
                    <td className="px-6 py-4 text-text-2">{member.attendance}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-text-2 hover:text-text-1 p-1"><MoreVertical className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {mockRequests.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar size="md" />
                  <div>
                    <h3 className="font-medium text-text-1">{req.name}</h3>
                    <p className="text-sm text-text-2 mb-2">{req.email} • Applied {req.requestDate}</p>
                    <p className="text-sm text-text-1 bg-surface-2/50 p-3 rounded-lg border border-border-glow">"{req.message}"</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <Button variant="outline" className="flex-1 text-danger border-danger/30 hover:bg-danger/10"><UserX className="w-4 h-4 mr-2" /> Decline</Button>
                  <Button className="flex-1"><UserCheck className="w-4 h-4 mr-2" /> Approve</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;
