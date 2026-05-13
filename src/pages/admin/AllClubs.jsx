import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, ShieldAlert, Ban, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';

const mockSystemClubs = [
  { id: 1, name: 'Computer Science Society', category: 'STEM', owner: 'Alice Smith', members: 250, status: 'Active', created: '2022-09-01' },
  { id: 2, name: 'Debate Team', category: 'Professional', owner: 'David Kim', members: 45, status: 'Active', created: '2023-01-15' },
  { id: 3, name: 'Crypto Enthusiasts', category: 'Tech', owner: 'Eve Adams', members: 12, status: 'Suspended', created: '2024-02-10' },
];

const AllClubs = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Club Directory</h1>
          <p className="text-text-2">Manage all registered organizations on the platform.</p>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-border-glow flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-2/30">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
            <Input 
              placeholder="Search clubs by name or owner..." 
              className="pl-9 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none"><Filter className="w-4 h-4 mr-2" /> Status</Button>
            <Button variant="outline" className="flex-1 sm:flex-none"><Filter className="w-4 h-4 mr-2" /> Category</Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-2 uppercase bg-surface-2/50 border-b border-border-glow">
              <tr>
                <th className="px-6 py-4 font-medium">Club Details</th>
                <th className="px-6 py-4 font-medium">Primary Contact (Owner)</th>
                <th className="px-6 py-4 font-medium">Stats</th>
                <th className="px-6 py-4 font-medium">System Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-glow/50">
              {mockSystemClubs.map((club) => (
                <tr key={club.id} className="hover:bg-surface-2/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="sm" />
                      <div>
                        <p className="font-medium text-text-1">{club.name}</p>
                        <p className="text-xs text-text-2">{club.category} • ID: {club.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-2">{club.owner}</td>
                  <td className="px-6 py-4 text-text-2">{club.members} Members<br/><span className="text-xs opacity-70">Created {club.created}</span></td>
                  <td className="px-6 py-4">
                    <Badge variant={club.status === 'Active' ? 'success' : 'danger'}>{club.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {club.status === 'Suspended' ? (
                        <Button variant="outline" size="sm" className="text-success border-success/30 hover:bg-success/10" title="Reinstate">
                          <ShieldCheck className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="text-danger border-danger/30 hover:bg-danger/10" title="Suspend">
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
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

export default AllClubs;
