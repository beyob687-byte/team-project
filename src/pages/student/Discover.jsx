import React, { useState, useEffect } from 'react';
import { Search, Filter, Compass } from 'lucide-react';
import ClubCard from '../../components/shared/ClubCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';

const categories = ['All', 'STEM', 'Arts', 'Sports', 'Cultural', 'Professional', 'Hobbies'];

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    // Simulate API fetch for clubs
    setLoading(true);
    const timer = setTimeout(() => {
      setClubs([
        { id: 1, name: 'Computer Science Society', description: 'For students passionate about computing.', category: 'STEM', memberCount: 250, status: 'Active' },
        { id: 2, name: 'Photography Club', description: 'Capture moments and learn photography.', category: 'Arts', memberCount: 85, status: 'Active' },
        { id: 3, name: 'Debate Team', description: 'Hone your public speaking skills.', category: 'Professional', memberCount: 40, status: 'Invite Only' },
        { id: 4, name: 'Robotics Team', description: 'Build and program robots.', category: 'STEM', memberCount: 45, status: 'Active' },
        { id: 5, name: 'Design Co.', description: 'Community of UI/UX designers.', category: 'Arts', memberCount: 120, status: 'Active' },
        { id: 6, name: 'Tennis Club', description: 'Weekly matches and training.', category: 'Sports', memberCount: 60, status: 'Active' },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          club.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || club.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <section className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-display font-bold text-text-1 mb-4">Discover Clubs</h1>
        <p className="text-text-2 mb-8">Find your community. Search through hundreds of student organizations.</p>
        
        <div className="flex gap-3 max-w-xl mx-auto">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-2 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search by name, keyword, or category..." 
              className="pl-12 py-3 rounded-full bg-surface shadow-card focus:shadow-glow text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="shrink-0 rounded-full px-4 border-surface bg-surface text-text-1 hover:border-primary">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Category Filter Strip */}
      <section className="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedCategory === cat 
                ? 'bg-primary text-deep border-primary shadow-glow' 
                : 'bg-surface border-border-glow text-text-2 hover:border-primary/50 hover:text-text-1'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Results Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-text-1 flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" />
            {searchQuery ? 'Search Results' : 'Explore'}
          </h2>
          <span className="text-sm text-text-2">{loading ? '...' : filteredClubs.length} clubs found</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-[280px] rounded-card" />)}
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClubs.map(club => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface rounded-card border border-border-glow border-dashed">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-text-2" />
            </div>
            <h3 className="text-xl font-display font-bold text-text-1 mb-2">No clubs found</h3>
            <p className="text-text-2">We couldn't find any clubs matching your criteria.</p>
            <Button variant="ghost" className="mt-4" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
              Clear filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Discover;
