import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/components/firebase/firebase";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Star,
  Briefcase,
  Code,
  Github,
  Globe,
  MessageSquare,
  Mail,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardHeader from "@/components/dashboardheader";

interface UserProfile {
  uid: string;
  professionalName: string;
  bio: string;
  skills: Array<{ name: string; proficiency: string }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    startDate: string;
    endDate: string;
    githubUrl: string;
    liveUrl: string;
  }>;
  location: string;
  experience: string;
  photoURL?: string;
  email?: string;
  phone?: string;
  createdAt?: any;
}

const UserPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        if (userId) {
          fetchUserProfile(userId);
        }
      } else {
        navigate('/signup');
      }
    });

    return () => unsubscribe();
  }, [userId, navigate]);

  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profileData = { uid, ...userDoc.data() } as UserProfile;
        setUserProfile(profileData);
      } else {
        console.error('User profile not found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    if (userProfile) {
      navigate('/dashboard', { 
        state: { 
          openChat: true, 
          chatUserId: userProfile.uid, 
          chatUserName: userProfile.professionalName 
        } 
      });
    }
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Expert': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Beginner': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString + '-01').toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1F376A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#333333]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#f9f7f2]">
        <DashboardHeader user={currentUser} />
        <div className="container mx-auto px-6 py-8 mt-20">
          <Card className="p-12 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 text-center">
            <h3 className="text-xl font-bold text-[#1F376A] mb-2">Profile Not Found</h3>
            <p className="text-[#333333] mb-4">The user profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate(-1)} className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      <DashboardHeader user={currentUser} />
      
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
              onClick={() => navigate(-1)}
              className="text-[#3D6B9C] hover:text-[#1F376A] hover:bg-[#5C92C7]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#1F376A] mb-2">User Profile</h1>
              <p className="text-[#333333]">Professional details and portfolio</p>
            </div>
          </div>

          {/* User Profile Header */}
          <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Picture & Basic Info */}
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="h-32 w-32 border-4 border-[#5C92C7]/30 mb-4">
                  <AvatarImage src={userProfile.photoURL} />
                  <AvatarFallback className="bg-[#5C92C7] text-white text-3xl">
                    {userProfile.professionalName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleChat}
                    className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                  {userProfile.email && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`mailto:${userProfile.email}`, '_blank')}
                      className="border-[#5C92C7] text-[#3D6B9C] hover:bg-[#5C92C7]/10"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-[#1F376A] mb-2">
                  {userProfile.professionalName}
                </h2>
                <p className="text-[#333333] leading-relaxed mb-6">
                  {userProfile.bio || 'No bio provided.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {userProfile.experience && (
                    <div className="flex items-center gap-2 text-[#3D6B9C]">
                      <Briefcase className="w-4 h-4" />
                      <span>{userProfile.experience}</span>
                    </div>
                  )}
                  
                  {userProfile.location && (
                    <div className="flex items-center gap-2 text-[#3D6B9C]">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}
                  
                  {userProfile.projects && (
                    <div className="flex items-center gap-2 text-[#3D6B9C]">
                      <Code className="w-4 h-4" />
                      <span>{userProfile.projects.length} projects</span>
                    </div>
                  )}
                  
                  {userProfile.createdAt && (
                    <div className="flex items-center gap-2 text-[#3D6B9C]">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {userProfile.createdAt.toDate?.()?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {userProfile.skills && userProfile.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-[#1F376A] mb-3">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getProficiencyColor(skill?.proficiency || 'Beginner')}`}
                        >
                          {skill?.name || 'Unknown Skill'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Projects Section */}
          {userProfile.projects && userProfile.projects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-[#1F376A] mb-6">Projects Portfolio</h3>
              <div className="space-y-6">
                {userProfile.projects.map((project, index) => (
                  <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 hover:border-[#3D6B9C]/40 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-semibold text-[#1F376A]">{project.title}</h4>
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(project.githubUrl, '_blank')}
                            className="border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white"
                          >
                            <Github className="w-3 h-3 mr-1" />
                            Code
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button
                            size="sm"
                            onClick={() => window.open(project.liveUrl, '_blank')}
                            className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            Live
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-[#333333] mb-4 leading-relaxed">
                      {project.description}
                    </p>

                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-2 py-1 bg-[#5C92C7]/10 text-[#1F376A] rounded text-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {(project.startDate || project.endDate) && (
                      <div className="flex gap-4 text-sm text-[#3D6B9C]">
                        {project.startDate && (
                          <span>Started: {formatDate(project.startDate)}</span>
                        )}
                        {project.endDate && (
                          <span>Completed: {formatDate(project.endDate)}</span>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* No Projects State */}
          {(!userProfile.projects || userProfile.projects.length === 0) && (
            <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 text-center">
              <Code className="w-12 h-12 text-[#5C92C7] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#1F376A] mb-2">No Projects Yet</h3>
              <p className="text-[#333333]">This user hasn't added any projects to their portfolio.</p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserPage;
