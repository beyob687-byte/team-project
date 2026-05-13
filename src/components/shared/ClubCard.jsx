import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import AiBadge from './AiBadge';

const ClubCard = ({ club, isRecommendation = false }) => {
  return (
    <Link to={`/clubs/${club.id}`} className="block h-full">
      <Card className="h-full flex flex-col hover:-translate-y-2 group cursor-pointer overflow-hidden">
        
        {/* Cover Image Placeholder - could be an actual image if club.coverImage exists */}
        <div className="h-24 w-full bg-gradient-to-r from-primary/20 to-secondary/20 relative">
          {isRecommendation && (
            <div className="absolute top-2 right-2">
              <AiBadge />
            </div>
          )}
        </div>

        <CardContent className="flex-1 flex flex-col pt-0 relative">
          {/* Avatar floating above cover */}
          <div className="flex justify-between items-start -mt-8 mb-3">
            <Avatar 
              src={club.logo} 
              alt={club.name} 
              size="lg" 
              className="ring-4 ring-surface shadow-glow" 
            />
            {club.status === 'Invite Only' && (
              <Badge variant="secondary" className="mt-10">Invite Only</Badge>
            )}
          </div>

          <h3 className="font-display font-bold text-lg text-text-1 group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {club.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">{club.category}</Badge>
          </div>

          <p className="text-sm text-text-2 line-clamp-2 flex-1 mb-4">
            {club.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border-glow/50 mt-auto">
            <div className="flex items-center text-text-2 text-sm">
              <Users className="w-4 h-4 mr-1.5 opacity-70" />
              <span>{club.memberCount || 0} members</span>
            </div>
            <span className="text-sm font-medium text-primary group-hover:text-primary-dim">
              View Profile &rarr;
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ClubCard;
