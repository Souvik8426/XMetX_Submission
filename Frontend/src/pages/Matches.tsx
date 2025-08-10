import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { auth, db } from "@/components/firebase/firebase";
import { 
  Search, 
  Filter,
  MapPin,
  Clock,
  Code,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboardheader";

const Matches = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    experience: "",
    location: "",
    skills: ""
  });
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/signup');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSearch = async () => {
    if (!searchQuery.trim() && !filters.role && !filters.experience && !filters.location && !filters.skills) {
      return;
    }

    setIsSearching(true);

    try {
      // Navigate to results page with search parameters
      const searchParams = new URLSearchParams({
        query: searchQuery,
        role: filters.role,
        experience: filters.experience,
        location: filters.location,
        skills: filters.skills
      });

      navigate(`/matches/results?${searchParams.toString()}`);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      role: "",
      experience: "",
      location: "",
      skills: ""
    });
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1F376A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#333333]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      <DashboardHeader user={user} />
      
      <div className="container mx-auto px-6 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1F376A] mb-4">Find Your Perfect Match</h1>
            <p className="text-[#333333] text-lg">
              Discover talented professionals and exciting opportunities
            </p>
          </div>

          {/* Search Section */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 mb-8">
            <div className="space-y-6">
              {/* Main Search Bar */}
              <div>
                <Label htmlFor="search" className="text-[#1F376A] font-medium mb-3 block">
                  Project role description
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3D6B9C] w-5 h-5" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name, skills, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-[#5C92C7]/30 focus:border-[#1F376A] bg-[#f9f7f2] text-lg"
                  />
                </div>
              </div>

              {/* Filters */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-[#3D6B9C]" />
                  <Label className="text-[#1F376A] font-medium">Filters</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Role Filter */}
                  <div>
                    <Label className="text-[#3D6B9C] text-sm mb-2 block">Role</Label>
                    <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                      <SelectTrigger className="border-[#5C92C7]/30 focus:border-[#1F376A]">
                        <Briefcase className="w-4 h-4 mr-2 text-[#3D6B9C]" />
                        <SelectValue placeholder="Any role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend Developer</SelectItem>
                        <SelectItem value="backend">Backend Developer</SelectItem>
                        <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                        <SelectItem value="mobile">Mobile Developer</SelectItem>
                        <SelectItem value="devops">DevOps Engineer</SelectItem>
                        <SelectItem value="designer">UI/UX Designer</SelectItem>
                        <SelectItem value="manager">Product Manager</SelectItem>
                        <SelectItem value="data">Data Scientist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <Label className="text-[#3D6B9C] text-sm mb-2 block">Experience</Label>
                    <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                      <SelectTrigger className="border-[#5C92C7]/30 focus:border-[#1F376A]">
                        <Clock className="w-4 h-4 mr-2 text-[#3D6B9C]" />
                        <SelectValue placeholder="Any experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5-10 years)</SelectItem>
                        <SelectItem value="lead">Lead (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <Label className="text-[#3D6B9C] text-sm mb-2 block">Location</Label>
                    <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                      <SelectTrigger className="border-[#5C92C7]/30 focus:border-[#1F376A]">
                        <MapPin className="w-4 h-4 mr-2 text-[#3D6B9C]" />
                        <SelectValue placeholder="Any location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="usa">United States</SelectItem>
                        <SelectItem value="canada">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="germany">Germany</SelectItem>
                        <SelectItem value="india">India</SelectItem>
                        <SelectItem value="singapore">Singapore</SelectItem>
                        <SelectItem value="australia">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <Label className="text-[#3D6B9C] text-sm mb-2 block">Primary Skill</Label>
                    <Select value={filters.skills} onValueChange={(value) => handleFilterChange('skills', value)}>
                      <SelectTrigger className="border-[#5C92C7]/30 focus:border-[#1F376A]">
                        <Code className="w-4 h-4 mr-2 text-[#3D6B9C]" />
                        <SelectValue placeholder="Any skill" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="nodejs">Node.js</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="golang">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="swift">Swift</SelectItem>
                        <SelectItem value="kotlin">Kotlin</SelectItem>
                        <SelectItem value="flutter">Flutter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full sm:w-auto border-[#5C92C7]/30 text-[#3D6B9C] hover:bg-[#5C92C7]/10"
                >
                  Clear Filters
                </Button>
                
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#1F376A] to-[#5C92C7] hover:opacity-90 text-white px-8 py-3 text-lg font-medium"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search Professionals
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Search Suggestions */}
          <Card className="p-6 bg-gradient-to-r from-[#5C92C7]/10 to-[#3D6B9C]/10 border border-[#5C92C7]/20">
            <h3 className="font-medium text-[#1F376A] mb-4">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "React Developers",
                "UI/UX Designers", 
                "Python Engineers",
                "Product Managers",
                "DevOps Specialists",
                "Mobile Developers"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    handleSearch();
                  }}
                  className="text-xs border-[#5C92C7]/30 text-[#3D6B9C] hover:bg-[#5C92C7]/10"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </Card>

          {/* Statistics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                <div className="text-2xl font-bold text-[#1F376A] mb-1">10K+</div>
                <div className="text-sm text-[#3D6B9C]">Professionals</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                <div className="text-2xl font-bold text-[#1F376A] mb-1">50+</div>
                <div className="text-sm text-[#3D6B9C]">Skills Available</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                <div className="text-2xl font-bold text-[#1F376A] mb-1">95%</div>
                <div className="text-sm text-[#3D6B9C]">Match Success</div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                <div className="text-2xl font-bold text-[#1F376A] mb-1">24/7</div>
                <div className="text-sm text-[#3D6B9C]">Support</div>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Matches;
