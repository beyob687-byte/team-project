import React, { useState } from 'react';
import { Plus, Search, Eye, MessageSquare, ThumbsUp, MoreVertical, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import AiBadge from '../../components/shared/AiBadge';

const mockPosts = [
  { id: 1, title: 'Welcome to the new semester!', type: 'General', views: 450, comments: 12, likes: 89, date: '2 days ago', status: 'Published' },
  { id: 2, title: 'Vote on the next workshop topic', type: 'Poll', views: 320, comments: 45, likes: 21, date: '5 days ago', status: 'Published' },
  { id: 3, title: 'Reminder: Dues are due next week', type: 'Announcement', views: 120, comments: 0, likes: 5, date: '1 week ago', status: 'Draft' },
];

const Posts = () => {
  const [activeTab, setActiveTab] = useState('published');
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Posts</h1>
          <p className="text-text-2">Manage club announcements, polls, and discussions.</p>
        </div>
        <Button className="shadow-glow"><Plus className="w-4 h-4 mr-2" /> New Post</Button>
      </div>

      <div className="flex gap-4 border-b border-border-glow">
        <button 
          className={`pb-3 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'published' ? 'border-primary text-primary' : 'border-transparent text-text-2 hover:text-text-1'}`}
          onClick={() => setActiveTab('published')}
        >
          All Posts ({mockPosts.length})
        </button>
        <button 
          className={`pb-3 px-2 flex items-center gap-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'flagged' ? 'border-warning text-warning' : 'border-transparent text-text-2 hover:text-warning'}`}
          onClick={() => setActiveTab('flagged')}
        >
          <AlertTriangle className="w-4 h-4" /> Moderation Queue (0)
        </button>
      </div>

      <Card>
        <div className="p-4 border-b border-border-glow flex items-center bg-surface-2/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-2" />
            <Input placeholder="Search posts..." className="pl-9 py-2" />
          </div>
        </div>

        <div className="divide-y divide-border-glow/50">
          {mockPosts.map(post => (
            <div key={post.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface-2/20 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{post.type}</Badge>
                  <span className="text-xs text-text-2">{post.date}</span>
                  {post.status === 'Draft' && <Badge variant="default">Draft</Badge>}
                </div>
                <h3 className="text-lg font-bold text-text-1 mb-3">{post.title}</h3>
                
                <div className="flex items-center gap-6 text-sm text-text-2">
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {post.views}</span>
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
                  <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" /> {post.likes}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm">Edit</Button>
                <button className="p-2 text-text-2 hover:text-text-1 hover:bg-surface-2 rounded-md transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Posts;
