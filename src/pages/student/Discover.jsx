import React, { useState, useEffect } from "react";
import { Search, Filter, Compass } from "lucide-react";
import ClubCard from "../../components/shared/ClubCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";
import { clubsApi } from "../../api/clubs";

const categories = [
  "All",
  "STEM",
  "Arts",
  "Sports",
  "Cultural",
  "Professional",
  "Hobbies",
];

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubCategory, setNewClubCategory] = useState("STEM");
  const [newClubContact, setNewClubContact] = useState("");

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      try {
        const data = await clubsApi.getClubs({
          category: selectedCategory === "All" ? undefined : selectedCategory,
          search: searchQuery || undefined,
        });
        // Handle both direct array response and object with items property
        const clubsData = Array.isArray(data)
          ? data
          : data?.data?.items || data?.items || [];
        setClubs(clubsData);
      } catch (err) {
        console.error("Failed to fetch clubs", err);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 p-6">
      {/* Header & Search */}
      <section className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl font-display font-bold text-text-1 mb-4">
          Discover Clubs
        </h1>
        <p className="text-text-2 mb-8">
          Find your community. Search through hundreds of student organizations.
        </p>

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
          <Button
            variant="outline"
            className="shrink-0 rounded-full px-4 border-surface bg-surface text-text-1 hover:border-primary"
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            onClick={() => setShowRegister((s) => !s)}
            className="shrink-0 rounded-full px-4 bg-primary/10 text-primary hover:bg-primary/20"
          >
            Register a Club
          </Button>
        </div>
      </section>

      {showRegister && (
        <section className="max-w-2xl mx-auto mb-8 p-4 bg-surface rounded-card border border-border-glow">
          <h3 className="text-lg font-bold mb-3">Register a New Club</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <Input
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              placeholder="Club name"
            />
            <select
              value={newClubCategory}
              onChange={(e) => setNewClubCategory(e.target.value)}
              className="rounded-btn p-2 border-border-glow bg-surface"
            >
              {categories
                .filter((c) => c !== "All")
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
            <Input
              value={newClubContact}
              onChange={(e) => setNewClubContact(e.target.value)}
              placeholder="Contact email"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                if (!newClubName || !newClubCategory || !newClubContact) {
                  alert("Please fill name, category and contact email.");
                  return;
                }
                try {
                  await clubsApi.createClub({
                    name: newClubName,
                    category: newClubCategory,
                    contact_email: newClubContact,
                  });
                  alert("Registration submitted — admins will review it.");
                  setShowRegister(false);
                  setNewClubName("");
                  setNewClubContact("");
                  setNewClubCategory("STEM");
                } catch (err) {
                  console.error(err);
                  alert("Failed to register club. See console for details.");
                }
              }}
              className="bg-primary text-deep"
            >
              Submit
            </Button>
            <Button variant="outline" onClick={() => setShowRegister(false)}>
              Cancel
            </Button>
          </div>
        </section>
      )}

      {/* Category Filter Strip */}
      <section className="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              selectedCategory === cat
                ? "bg-primary text-deep border-primary shadow-glow"
                : "bg-surface border-border-glow text-text-2 hover:border-primary/50 hover:text-text-1"
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
            {searchQuery ? "Search Results" : "Explore"}
          </h2>
          <span className="text-sm text-text-2">
            {loading ? "..." : clubs.length} clubs found
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[280px] rounded-card" />
              ))}
          </div>
        ) : clubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface rounded-card border border-border-glow border-dashed">
            <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-text-2" />
            </div>
            <h3 className="text-xl font-display font-bold text-text-1 mb-2">
              No clubs found
            </h3>
            <p className="text-text-2">
              We couldn't find any clubs matching your criteria.
            </p>
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Discover;
