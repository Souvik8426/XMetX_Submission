import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, getDocs } from "firebase/firestore";
import { auth, db } from "@/components/firebase/firebase";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  MapPin,
  Calendar,
  Star,
  Filter,
  User as UserIcon,
  Briefcase,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/dashboardheader";

interface SearchResult {
  uid: string;
  professionalName: string;
  bio: string;
  skills: Array<{ name: string; proficiency: string }>;
  experience: string;
  location: string;
  photoURL?: string;
  projects?: Array<any>;
  matchPercentage?: number;
  searchRelevance?: number;
}

const SearchResults = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchTerm = searchParams.get('query') || '';
  const role = searchParams.get('role') || '';
  const experience = searchParams.get('experience') || '';
  const location = searchParams.get('location') || '';
  const skills = searchParams.get('skills') || '';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        performSearch();
      } else {
        navigate('/signup');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, searchParams]);

  // 🔥 Improved search scoring function
  const calculateSearchRelevance = (userData: any, searchTerm: string): number => {
    if (!searchTerm) return 100;

    let score = 0;
    const searchTermLower = searchTerm.toLowerCase();
    const searchWords = searchTermLower.split(' ').filter(word => word.length > 0);

    const getWordMatchScore = (text: string, searchWords: string[]): number => {
      if (!text) return 0;
      const textLower = text.toLowerCase();
      let wordScore = 0;

      searchWords.forEach(word => {
        if (textLower === word) {
          wordScore += 100;
        } else if (textLower.startsWith(word)) {
          wordScore += 80;
        } else if (textLower.includes(word)) {
          wordScore += 60;
        } else if (isFuzzyMatch(textLower, word)) {
          wordScore += 40;
        }
      });

      return wordScore;
    };

    // Name matching (highest priority)
    if (userData.professionalName) {
      const nameWords = userData.professionalName.toLowerCase().split(' ');
      searchWords.forEach(searchWord => {
        nameWords.forEach(nameWord => {
          if (nameWord.includes(searchWord) || searchWord.includes(nameWord)) {
            score += 100;
          }
        });
      });

      score += getWordMatchScore(userData.professionalName, searchWords) * 2;
    }

    // Bio matching (medium priority)
    if (userData.bio) {
      score += getWordMatchScore(userData.bio, searchWords) * 0.5;
    }

    // Skills matching (medium priority)
    if (userData.skills && Array.isArray(userData.skills)) {
      userData.skills.forEach((skill: any) => {
        if (skill?.name) {
          score += getWordMatchScore(skill.name, searchWords) * 1.5;
        }
      });
    }

    // Location matching (lower priority)
    if (userData.location) {
      score += getWordMatchScore(userData.location, searchWords) * 0.3;
    }

    // Experience matching (lower priority)
    if (userData.experience) {
      score += getWordMatchScore(userData.experience, searchWords) * 0.3;
    }

    return Math.min(score, 500);
  };

  // 🔥 Fuzzy matching function for typo tolerance
  const isFuzzyMatch = (text: string, searchWord: string): boolean => {
    if (searchWord.length < 3) return false;

    let matchCount = 0;
    for (let i = 0; i < searchWord.length; i++) {
      if (text.includes(searchWord[i])) {
        matchCount++;
      }
    }

    return (matchCount / searchWord.length) >= 0.7;
  };

  // 🔥 Better filtering function
  const shouldIncludeResult = (userData: any, searchTerm: string, filters: any): boolean => {
    let shouldInclude = true;

    if (searchTerm) {
      const relevanceScore = calculateSearchRelevance(userData, searchTerm);
      shouldInclude = relevanceScore > 10;
    }

    if (shouldInclude && filters.skills) {
      const hasSkill = userData.skills?.some((skill: any) =>
        skill?.name?.toLowerCase().includes(filters.skills.toLowerCase())
      );
      shouldInclude = shouldInclude && hasSkill;
    }

    if (shouldInclude && filters.role) {
      const roleMatch = userData.bio?.toLowerCase().includes(filters.role.toLowerCase()) ||
        userData.experience?.toLowerCase().includes(filters.role.toLowerCase());
      shouldInclude = shouldInclude && roleMatch;
    }

    if (shouldInclude && filters.experience) {
      const experienceMatch = userData.experience?.toLowerCase().includes(filters.experience.toLowerCase());
      shouldInclude = shouldInclude && experienceMatch;
    }

    if (shouldInclude && filters.location) {
      const locationMatch = userData.location?.toLowerCase().includes(filters.location.toLowerCase());
      shouldInclude = shouldInclude && locationMatch;
    }

    return shouldInclude;
  };

  const performSearch = async () => {
    setSearchLoading(true);

    try {
      const firestoreQuery = query(collection(db, 'users'));
      const querySnapshot = await getDocs(firestoreQuery);
      const searchResults: SearchResult[] = [];

      const filters = { skills, role, experience, location };

      querySnapshot.forEach((doc) => {
        const userData = doc.data();

        // Skip current user from results
        if (doc.id === user?.uid) return;

        if (shouldIncludeResult(userData, searchTerm, filters)) {
          const relevanceScore = calculateSearchRelevance(userData, searchTerm);

          searchResults.push({
            uid: doc.id,
            ...userData,
            matchPercentage: Math.floor(Math.random() * 30) + 70,
            searchRelevance: relevanceScore
          } as SearchResult);
        }
      });

      // Sort results by relevance score (highest first)
      searchResults.sort((a, b) => (b.searchRelevance || 0) - (a.searchRelevance || 0));

      setResults(searchResults);
      console.log(`Found ${searchResults.length} results for search: "${searchTerm}"`);
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 🔧 NEW: Handle chat functionality
  const handleCollaborate = (userId: string, userName: string) => {
    navigate(`/collaborate/${userId}`, {
      state: {
        userName: userName
      }
    });
  };

  // 🔧 NEW: Handle view profile functionality
  const handleViewProfile = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Expert': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Beginner': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // 🔥 Highlight matching text in results
  const highlightSearchTerm = (text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm || !text) return text;

    const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
    let highlightedText = text;

    searchWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });

    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
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
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/matches')}
              className="text-[#3D6B9C] hover:text-[#1F376A] hover:bg-[#5C92C7]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#1F376A] mb-2">Search Results</h1>
              <p className="text-[#333333]">
                {searchLoading ? 'Searching...' : `Found ${results.length} professionals`}
                {searchTerm && ` matching "${searchTerm}"`}
                {results.length > 0 && <span className="text-[#3D6B9C] text-sm ml-2">(sorted by relevance)</span>}
              </p>
            </div>
          </div>

          {/* Search Summary */}
          <Card className="p-4 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#3D6B9C]" />
                <span className="text-[#333333]">Active Filters:</span>
              </div>

              {searchTerm && (
                <Badge variant="outline" className="border-[#5C92C7] text-[#1F376A]">
                  🔍 Search: {searchTerm}
                </Badge>
              )}

              {role && (
                <Badge variant="outline" className="border-[#5C92C7] text-[#1F376A]">
                  💼 Role: {role}
                </Badge>
              )}

              {experience && (
                <Badge variant="outline" className="border-[#5C92C7] text-[#1F376A]">
                  ⏰ Experience: {experience}
                </Badge>
              )}

              {location && (
                <Badge variant="outline" className="border-[#5C92C7] text-[#1F376A]">
                  📍 Location: {location}
                </Badge>
              )}

              {skills && (
                <Badge variant="outline" className="border-[#5C92C7] text-[#1F376A]">
                  🔧 Skill: {skills}
                </Badge>
              )}

              {!searchTerm && !role && !experience && !location && !skills && (
                <Badge variant="outline" className="border-gray-300 text-gray-500">
                  No filters applied
                </Badge>
              )}
            </div>
          </Card>

          {/* Results */}
          {searchLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-[#1F376A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#333333]">Searching for professionals...</p>
            </div>
          ) : results.length === 0 ? (
            <Card className="p-12 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 text-center">
              <UserIcon className="w-16 h-16 text-[#5C92C7] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#1F376A] mb-2">No Results Found</h3>
              <p className="text-[#333333] mb-6">
                {searchTerm
                  ? `No professionals found matching "${searchTerm}". Try different keywords or remove some filters.`
                  : "Try adding search terms or adjusting your filters to find professionals."
                }
              </p>
              <div className="space-y-2 text-sm text-[#3D6B9C] mb-4">
                <p>💡 <strong>Search Tips:</strong></p>
                <p>• Try partial names (e.g., "Souv" to find "Souvik")</p>
                <p>• Search by skills, bio keywords, or location</p>
                <p>• Use fewer filters for broader results</p>
              </div>
              <Button
                onClick={() => navigate('/matches')}
                className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Try New Search
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {results.map((result, index) => (
                <motion.div
                  key={result.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 hover:border-[#3D6B9C]/40 transition-all duration-300 hover:shadow-lg">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Profile Section */}
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-16 w-16 border-4 border-[#5C92C7]/30">
                          <AvatarImage src={result.photoURL} />
                          <AvatarFallback className="bg-[#5C92C7] text-white text-lg">
                            {result.professionalName?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-[#1F376A]">
                              {/* Highlight matching terms in name */}
                              {searchTerm ?
                                highlightSearchTerm(result.professionalName || 'Unknown User', searchTerm) :
                                (result.professionalName || 'Unknown User')
                              }
                            </h3>
                            {result.matchPercentage && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                {result.matchPercentage}% match
                              </Badge>
                            )}
                            {/* Show relevance score for debugging */}
                            {process.env.NODE_ENV === 'development' && result.searchRelevance && (
                              <Badge variant="outline" className="border-blue-300 text-blue-700">
                                Reputation: {Math.round(result.searchRelevance)}
                              </Badge>
                            )}
                          </div>

                          <p className="text-[#333333] mb-3 line-clamp-2">
                            {/* Highlight matching terms in bio */}
                            {searchTerm && result.bio ?
                              highlightSearchTerm(result.bio, searchTerm) :
                              (result.bio || 'No bio available')
                            }
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#3D6B9C] mb-4">
                            {result.experience && (
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                <span>{result.experience}</span>
                              </div>
                            )}

                            {result.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{result.location}</span>
                              </div>
                            )}

                            {result.projects && result.projects.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Code className="w-4 h-4" />
                                <span>{result.projects.length} projects</span>
                              </div>
                            )}
                          </div>

                          {/* Skills */}
                          {result.skills && result.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {result.skills.slice(0, 5).map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getProficiencyColor(skill?.proficiency || 'Beginner')}`}
                                >
                                  {/* Highlight matching skills */}
                                  {searchTerm ?
                                    highlightSearchTerm(skill?.name || 'Unknown Skill', searchTerm) :
                                    (skill?.name || 'Unknown Skill')
                                  }
                                </span>
                              ))}
                              {result.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  +{result.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Section */}
                      <div className="flex flex-col gap-3 lg:w-48">
                        <Button
                          onClick={() => handleCollaborate(result.uid, result.professionalName)}
                          className="w-full bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Collaborate
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => handleViewProfile(result.uid)}
                          className="w-full border-[#5C92C7] text-[#3D6B9C] hover:bg-[#5C92C7]/10"
                        >
                          <UserIcon className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SearchResults;
