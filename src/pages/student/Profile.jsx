import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, Bell, LogOut, CheckCircle2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { toast } from '../../components/ui/Toast';
import { usersApi } from '../../api/users';

const Profile = () => {
  const { user, logoutUser } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    major: user?.major || '',
    department: user?.department || '',
    bio: user?.bio || '',
    interests: user?.interests || []
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        major: user.major || '',
        department: user.department || '',
        bio: user.bio || '',
        interests: user.interests || []
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersApi.updateProfile(user.id, formData);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This is permanent.')) {
      try {
        await usersApi.deleteAccount(user.id);
        logoutUser();
        navigate('/');
      } catch (err) {
        toast.error('Could not delete account');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-text-2 hover:bg-surface hover:text-text-1'
            }`}
          >
            <Settings className="w-4 h-4" /> General Info
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-text-2 hover:bg-surface hover:text-text-1'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'privacy' ? 'bg-primary/10 text-primary' : 'text-text-2 hover:bg-surface hover:text-text-1'
            }`}
          >
            <Shield className="w-4 h-4" /> Privacy & Data
          </button>
          <div className="pt-4 mt-4 border-t border-border-glow">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 animate-fade-in">
          
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar src={user?.avatar} size="2xl" className="ring-4 ring-surface shadow-glow" />
                    <div>
                      <Button variant="outline" size="sm" type="button">Change Avatar</Button>
                      <p className="text-xs text-text-2 mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input 
                      label="First Name" 
                      value={formData.first_name} 
                      onChange={e => setFormData({...formData, first_name: e.target.value})} 
                    />
                    <Input 
                      label="Last Name" 
                      value={formData.last_name} 
                      onChange={e => setFormData({...formData, last_name: e.target.value})} 
                    />
                    <Input label="Student ID" defaultValue={user?.student_id || ''} disabled />
                    <Input label="Email Address" type="email" defaultValue={user?.email || ''} disabled />
                    <Input 
                      label="Major / Faculty" 
                      value={formData.major} 
                      onChange={e => setFormData({...formData, major: e.target.value})} 
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" isLoading={loading}>Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { id: 'events', title: 'Upcoming Events', desc: 'Reminders for events you RSVP\'d to (24h before)' },
                  { id: 'clubs', title: 'Club Announcements', desc: 'News and updates from clubs you are a member of' },
                  { id: 'admin', title: 'Platform Alerts', desc: 'Important administrative notices (Cannot be disabled)', disabled: true },
                ].map(item => (
                  <div key={item.id} className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border-glow bg-surface-2/30">
                    <div>
                      <p className="font-medium text-text-1">{item.title}</p>
                      <p className="text-sm text-text-2">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked disabled={item.disabled} />
                      <div className="w-11 h-6 bg-deep rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary opacity-50 peer-disabled:opacity-30"></div>
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-primary/30 bg-primary/5">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-1">AI Recommendations</p>
                      <Badge variant="primary" className="text-[10px] uppercase">✦ AI Feature</Badge>
                    </div>
                    <p className="text-sm text-text-2 mt-1">Allow UniClubs to analyze your club memberships and activity to provide personalized event and club recommendations.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-1">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-deep rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="pt-4 border-t border-border-glow">
                  <h4 className="text-sm font-medium text-danger mb-2">Danger Zone</h4>
                  <Button variant="outline" onClick={handleDelete} className="border-danger text-danger hover:bg-danger/10 hover:border-danger">
                    Request Account Deletion
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
