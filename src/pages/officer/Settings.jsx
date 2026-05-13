import React, { useState } from 'react';
import { Save, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import { toast } from '../../components/ui/Toast';

const Settings = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    toast.success('Club settings updated successfully');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-text-1">Club Settings</h1>
        <p className="text-text-2">Manage your club's profile, visibility, and roles.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>This information is visible on your public club page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Visual Assets */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-1 mb-2 block">Cover Photo</label>
                <div className="h-32 w-full bg-surface-2 border-2 border-dashed border-border-glow rounded-xl flex flex-col items-center justify-center hover:bg-surface-2/80 transition-colors cursor-pointer group">
                  <ImageIcon className="w-6 h-6 text-text-2 group-hover:text-primary transition-colors mb-2" />
                  <span className="text-sm text-text-2 group-hover:text-primary transition-colors">Click to upload cover image (1200x400)</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div>
                  <label className="text-sm font-medium text-text-1 mb-2 block">Club Avatar</label>
                  <Avatar size="2xl" className="ring-2 ring-border-glow" />
                </div>
                <div className="flex-1">
                  <Button variant="outline" size="sm" type="button" className="mb-2">Change Avatar</Button>
                  <p className="text-xs text-text-2">Square image recommended. Max size 2MB.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <Input label="Club Name" defaultValue="Computer Science Society" />
              <Input label="Category" defaultValue="STEM" />
              <Input label="Contact Email" type="email" defaultValue="contact@css.uni.edu" className="md:col-span-2" />
              
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-text-1 ml-1">Short Description</label>
                <textarea 
                  className="w-full bg-deep border border-border-glow text-text-1 px-4 py-2.5 rounded-input placeholder:text-text-2/60 transition-all focus:border-primary focus:shadow-glow focus:outline-none min-h-[80px]"
                  defaultValue="The Computer Science Society is the largest tech community on campus."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibility & Joining</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 border border-primary/30 bg-primary/5 rounded-lg cursor-pointer">
              <input type="radio" name="visibility" id="vis-public" className="mt-1" defaultChecked />
              <div>
                <label htmlFor="vis-public" className="font-medium text-text-1 block cursor-pointer">Public (Open to All)</label>
                <p className="text-sm text-text-2">Anyone in the university can instantly join.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border border-border-glow bg-surface-2/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <input type="radio" name="visibility" id="vis-invite" className="mt-1" />
              <div>
                <label htmlFor="vis-invite" className="font-medium text-text-1 block cursor-pointer">Invite Only / Request to Join</label>
                <p className="text-sm text-text-2">Users must request access, and officers must approve.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-danger/30">
          <CardHeader>
            <CardTitle className="text-danger flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-danger/20 rounded-lg">
              <div>
                <h4 className="font-medium text-text-1">Archive Club</h4>
                <p className="text-sm text-text-2">Hide club from discovery. Preserves data.</p>
              </div>
              <Button type="button" variant="outline" className="border-warning text-warning hover:bg-warning/10 hover:border-warning shrink-0">Archive</Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-danger/20 rounded-lg">
              <div>
                <h4 className="font-medium text-text-1">Transfer Ownership</h4>
                <p className="text-sm text-text-2">Transfer your President role to another member.</p>
              </div>
              <Button type="button" variant="outline" className="border-danger text-danger hover:bg-danger/10 hover:border-danger shrink-0">Transfer</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4 pb-12">
          <Button type="submit" isLoading={loading} className="w-full sm:w-auto shadow-glow"><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
