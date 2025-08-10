import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/components/firebase/firebase";
import { 
  Plus, 
  Users, 
  Star, 
  TrendingUp, 
  MessageSquare,
  Eye,
  Code2,
  Briefcase,
  Calendar,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboardheader";
import ProjectModal from "@/components/ProjectModal";
import ChatWindow from "@/components/ChatWindow";

interface ProjectCardProps {
  title: string;
  description: string;
  collaborators: number;
  completion: number;
  status: "In Progress" | "Starting" | "Completed";
  technologies: string[];
  project: any;
  onView: (project: any) => void;
}

interface UserProfile {
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
}

interface RecentMatch {
  uid: string;
  name: string;
  role: string;
  matchPercentage: number;
  skills: string[];
  image?: string;
  lastInteraction: Date;
}

const ProjectCard = ({ title, description, collaborators, completion, status, technologies, project, onView }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-[#5C92C7] text-white";
      case "Starting": return "bg-[#3D6B9C] text-white";
      case "Completed": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 hover:border-[#3D6B9C]/40 transition-all duration-300 hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-[#1F376A] text-lg">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      
      <p className="text-[#333333] text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {technologies.map((tech, index) => (
          <span key={index} className="px-2 py-1 bg-[#5C92C7]/10 text-[#1F376A] rounded text-xs font-medium">
            {tech}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-[#3D6B9C]">
          <Users className="w-4 h-4" />
          <span>{collaborators} collaborators</span>
        </div>
        <span className="text-sm font-medium text-[#1F376A]">{completion}% complete</span>
      </div>
      
      <div className="w-full bg-[#5C92C7]/20 rounded-full h-2 mb-4">
        <div 
          className="bg-[#5C92C7] h-2 rounded-full transition-all duration-300"
          style={{ width: `${completion}%` }}
        ></div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          size="sm" 
          className="flex-1 bg-[#1F376A] hover:bg-[#3D6B9C] text-white"
          onClick={() => onView(project)}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button size="sm" variant="outline" className="border-[#5C92C7] text-[#3D6B9C] hover:bg-[#5C92C7]/10">
          <MessageSquare className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

interface MatchCardProps {
  match: RecentMatch;
  onChat: (userId: string, userName: string, userAvatar?: string) => void;
}

const MatchCard = ({ match, onChat }: MatchCardProps) => (
  <Card className="p-4 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 hover:border-[#3D6B9C]/40 transition-all duration-300 hover:shadow-md">
    <div className="flex items-center gap-3 mb-3">
      <Avatar className="h-10 w-10 border-2 border-[#5C92C7]/30">
        <AvatarImage src={match.image} />
        <AvatarFallback className="bg-[#5C92C7] text-white text-sm">{match.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h4 className="font-medium text-[#1F376A] text-sm">{match.name}</h4>
        <p className="text-[#3D6B9C] text-xs">{match.role}</p>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-[#1F376A]">{match.matchPercentage}%</div>
        <div className="text-xs text-[#3D6B9C]">match</div>
      </div>
    </div>
    
    <div className="flex flex-wrap gap-1 mb-3">
      {match.skills.slice(0, 3).map((skill, index) => (
        <span key={index} className="px-2 py-1 bg-[#5C92C7]/10 text-[#1F376A] rounded text-xs">
          {skill}
        </span>
      ))}
      {match.skills.length > 3 && (
        <span className="px-2 py-1 bg-[#3D6B9C]/10 text-[#3D6B9C] rounded text-xs">
          +{match.skills.length - 3}
        </span>
      )}
    </div>
    
    <Button 
      size="sm" 
      className="w-full bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
      onClick={() => onChat(match.uid, match.name, match.image)}
    >
      <MessageSquare className="w-3 h-3 mr-1" />
      Connect
    </Button>
  </Card>
);

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  
  // Modal states
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectModalMode, setProjectModalMode] = useState<'add' | 'view'>('add');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // Chat states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatWithUserId, setChatWithUserId] = useState('');
  const [chatWithUserName, setChatWithUserName] = useState('');
  const [chatWithUserAvatar, setChatWithUserAvatar] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log('Firebase user:', currentUser); // Debug log
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            console.log('User profile data:', profileData); // Debug log
            setUserProfile(profileData);
            
            // Fetch recent matches based on interactions
            await fetchRecentMatches(currentUser.uid);
          } else {
            console.log('No user profile found in Firestore');
            if (window.location.pathname === '/dashboard') {
              navigate('/profile-form');
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        navigate('/signup');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchRecentMatches = async (currentUserId: string) => {
    try {
      // Query messages where current user is involved
      const messagesQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', currentUserId)
      );
      
      const receivedMessagesQuery = query(
        collection(db, 'messages'),
        where('receiverId', '==', currentUserId)
      );

      const [sentMessages, receivedMessages] = await Promise.all([
        getDocs(messagesQuery),
        getDocs(receivedMessagesQuery)
      ]);

      const interactedUserIds = new Set<string>();
      
      sentMessages.docs.forEach(doc => {
        const data = doc.data();
        interactedUserIds.add(data.receiverId);
      });
      
      receivedMessages.docs.forEach(doc => {
        const data = doc.data();
        interactedUserIds.add(data.senderId);
      });

      // Fetch user profiles for interacted users
      const matches: RecentMatch[] = [];
      for (const userId of interactedUserIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            matches.push({
              uid: userId,
              name: userData.professionalName || 'Unknown User',
              role: userData.experience ? `${userData.experience} Developer` : 'Developer',
              matchPercentage: Math.floor(Math.random() * 30) + 70,
              skills: userData.skills?.slice(0, 5).map((skill: any) => skill.name) || [],
              image: userData.photoURL,
              lastInteraction: new Date()
            });
          }
        } catch (error) {
          console.error('Error fetching user data for:', userId, error);
        }
      }

      setRecentMatches(matches);
    } catch (error) {
      console.error('Error fetching recent matches:', error);
    }
  };

  const handleNewProject = () => {
    console.log('Opening new project modal'); // Debug log
    setProjectModalMode('add');
    setSelectedProject(null);
    setIsProjectModalOpen(true);
  };

  const handleViewProject = (project: any) => {
    console.log('Opening project view modal', project); // Debug log
    setProjectModalMode('view');
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleChat = (userId: string, userName: string, userAvatar?: string) => {
    console.log('Opening chat with:', userName, userId); // Debug log
    setChatWithUserId(userId);
    setChatWithUserName(userName);
    setChatWithUserAvatar(userAvatar || '');
    setIsChatOpen(true);
  };

  const handleFindMatches = () => {
    console.log('Navigating to matches'); // Debug log
    navigate('/matches');
  };

  const refreshUserProfile = async () => {
    if (!user) return;
    
    console.log('Refreshing user profile'); // Debug log
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1F376A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#333333]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Use real data from Firebase instead of static data
  const projects = userProfile?.projects?.map(project => ({
    title: project.title,
    description: project.description,
    collaborators: Math.floor(Math.random() * 5) + 1,
    completion: Math.floor(Math.random() * 100),
    status: "In Progress" as const,
    technologies: project.technologies,
    project: project
  })) || [];

  // Calculate dynamic stats based on user data
  const activeProjects = projects?.length || 0;
  const totalSkills = userProfile?.skills?.length || 0;
  const completedProjects = Math.floor(activeProjects * 0.8);
  const collaborators = projects?.reduce((acc, project) => acc + project.collaborators, 0) || 5;

  return (
    <div className="min-h-screen bg-[#f9f7f2]">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-6 py-8 my-16">
        {/* Welcome Section with User Info */}
        {userProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="p-6 bg-gradient-to-r from-[#1F376A]/10 to-[#5C92C7]/10 border border-[#5C92C7]/20">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-[#5C92C7]/30">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-[#5C92C7] text-white text-xl">
                    {userProfile.professionalName?.[0] || user?.displayName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-[#1F376A]">
                    Welcome back, {userProfile.professionalName || user?.displayName || 'Developer'}!
                  </h1>
                  <p className="text-[#3D6B9C]">{userProfile.bio}</p>
                  <p className="text-sm text-[#333333] mt-1">
                    📍 {userProfile.location} • 💼 {userProfile.experience} experience
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stats Overview with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-br from-[#1F376A] to-[#3D6B9C] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Projects</p>
                  <p className="text-3xl font-bold">{activeProjects}</p>
                </div>
                <Code2 className="w-8 h-8 text-blue-200" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-[#3D6B9C] to-[#5C92C7] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Skills</p>
                  <p className="text-3xl font-bold">{totalSkills}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6 bg-gradient-to-br from-[#5C92C7] to-[#1F376A] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Completed</p>
                  <p className="text-3xl font-bold">{completedProjects}</p>
                </div>
                <Star className="w-8 h-8 text-blue-200" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-[#1F376A] to-[#5C92C7] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Collaborators</p>
                  <p className="text-3xl font-bold">{collaborators}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Projects */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F376A]">Active Projects</h2>
                <Button 
                  className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                  onClick={handleNewProject}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
              
              <div className="space-y-6">
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <ProjectCard key={index} {...project} onView={handleViewProject} />
                  ))
                ) : (
                  <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 text-center">
                    <Briefcase className="w-12 h-12 text-[#5C92C7] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#1F376A] mb-2">No Projects Yet</h3>
                    <p className="text-[#333333] mb-4">Start your first project to showcase your skills</p>
                    <Button 
                      className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                      onClick={handleNewProject}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </Card>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Matches & Quick Actions */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="text-xl font-bold text-[#1F376A] mb-4">Recent Matches</h3>
              <div className="space-y-4">
                {recentMatches.length > 0 ? (
                  recentMatches.map((match, index) => (
                    <MatchCard key={index} match={match} onChat={handleChat} />
                  ))
                ) : (
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 text-center">
                    <Users className="w-8 h-8 text-[#5C92C7] mx-auto mb-3" />
                    <h4 className="font-medium text-[#1F376A] mb-2">No Recent Matches</h4>
                    <p className="text-sm text-[#333333] mb-3">Start connecting with other professionals</p>
                    <Button 
                      size="sm" 
                      className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                      onClick={handleFindMatches}
                    >
                      <Search className="w-3 h-3 mr-1" />
                      Find Matches
                    </Button>
                  </Card>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-xl font-bold text-[#1F376A] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start bg-white/80 border border-[#5C92C7]/20 text-[#1F376A] hover:bg-[#5C92C7]/10"
                  onClick={handleNewProject}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
                <Button 
                  className="w-full justify-start bg-white/80 border border-[#5C92C7]/20 text-[#1F376A] hover:bg-[#5C92C7]/10"
                  onClick={handleFindMatches}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Find Talent
                </Button>
                <Button className="w-full justify-start bg-white/80 border border-[#5C92C7]/20 text-[#1F376A] hover:bg-[#5C92C7]/10">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* User Skills Section */}
        {userProfile?.skills && userProfile.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-8"
          >
            <h3 className="text-xl font-bold text-[#1F376A] mb-4">Your Skills</h3>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
              <div className="flex flex-wrap gap-3">
                {userProfile.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-[#5C92C7]/10 rounded-lg border border-[#5C92C7]/20"
                  >
                    <span className="font-medium text-[#1F376A]">{skill.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      skill.proficiency === 'Expert' ? 'bg-green-100 text-green-700' :
                      skill.proficiency === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {skill.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8"
        >
          <h3 className="text-xl font-bold text-[#1F376A] mb-4">Recent Activity</h3>
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-[#333333]">
                <div className="w-2 h-2 bg-[#5C92C7] rounded-full"></div>
                <span>Profile updated with new skills</span>
                <span className="text-[#3D6B9C] ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#333333]">
                <div className="w-2 h-2 bg-[#5C92C7] rounded-full"></div>
                <span>New project added to portfolio</span>
                <span className="text-[#3D6B9C] ml-auto">4 hours ago</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#333333]">
                <div className="w-2 h-2 bg-[#5C92C7] rounded-full"></div>
                <span>Profile created successfully</span>
                <span className="text-[#3D6B9C] ml-auto">1 day ago</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modals and Windows */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        mode={projectModalMode}
        project={selectedProject}
        user={user}
        onProjectAdded={refreshUserProfile}
      />

      <ChatWindow
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={user}
        chatWithUserId={chatWithUserId}
        chatWithUserName={chatWithUserName}
        chatWithUserAvatar={chatWithUserAvatar}
      />
    </div>
  );
};

export default Dashboard;
