import React from 'react';
import { Plus, Clock, CheckCircle2, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/shared/StatusBadge';

const mockProjects = [
  { id: 1, title: 'Campus Map App', description: 'Building a new interactive campus map for incoming freshmen.', status: 'Active', progress: 65, team: 8, dueDate: '2024-08-01' },
  { id: 2, title: 'Hackathon Registration Portal', description: 'Custom portal for the upcoming Spring Hackathon.', status: 'Planning', progress: 15, team: 4, dueDate: '2024-06-15' },
  { id: 3, title: 'Club Website Redesign', description: 'Migrating the old wordpress site to React/Next.js.', status: 'Completed', progress: 100, team: 5, dueDate: '2024-01-10' },
];

const Projects = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-1">Projects</h1>
          <p className="text-text-2">Track ongoing club initiatives and milestones.</p>
        </div>
        <Button className="shadow-glow"><Plus className="w-4 h-4 mr-2" /> New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map(project => (
          <Card key={project.id} className="flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <StatusBadge status={project.status} />
                <button className="text-text-2 hover:text-text-1">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-text-1 mb-2">{project.title}</h3>
              <p className="text-sm text-text-2 flex-1 mb-6">{project.description}</p>
              
              <div className="space-y-4 mt-auto border-t border-border-glow/50 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-2">Progress</span>
                  <span className="font-medium text-text-1">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs text-text-2 pt-2">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {project.dueDate}</span>
                  <span>{project.team} members</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
