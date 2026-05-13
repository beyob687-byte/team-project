import React, { useState } from 'react';
import { Search, Filter, Shield, MoreVertical, Key, Ban } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

const mockUsers = [
  { id: 'u_1', name: 'Alice Smith', email: 'alice@uni.edu', role: 'Student', status: 'Active', lastLogin: '2 mins ago' },
  { id: 'u_2', name: 'System Admin', email: 'admin@uni.edu', role: 'Admin', status: 'Active', lastLogin: '1 hour ago' },
  { id: 'u_3', name: 'Bob Jones', email: 'bob@uni.edu', role: 'Student', status: 'Suspended', lastLogin: '2 weeks ago' },
];

const Users = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">User Directory</h1>
          <p className="text-text-2">Manage all registered users on the platform.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-border-glow flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-2/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
            <Input 
              placeholder="Search users..." 
              className="pl-9 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none"><Filter className="w-4 h-4 mr-2" /> Role</Button>
            <Button variant="outline" className="flex-1 sm:flex-none"><Filter className="w-4 h-4 mr-2" /> Status</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-2 uppercase bg-surface-2/50 border-b border-border-glow">
              <tr>
                <th className="px-6 py-4 font-medium">User Details</th>
                <th className="px-6 py-4 font-medium">Platform Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Last Login</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glow/50">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-2/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" />
                      <div>
                        <p className="font-medium text-text-1">{user.name}</p>
                        <p className="text-xs text-text-2">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.role === 'Admin' ? 'primary' : 'outline'}>
                      {user.role === 'Admin' && <Shield className="w-3 h-3 mr-1 inline" />}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-text-2">{user.lastLogin}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" className="hidden lg:flex" title="Reset Password">
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="hidden lg:flex text-danger border-danger/30 hover:bg-danger/10" title="Suspend">
                        <Ban className="w-4 h-4" />
                      </Button>
                      <button className="text-text-2 hover:text-text-1 p-1"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Users;
