import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "@/components/firebase/firebase";
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Star,
  Code,
  Briefcase,
  User as UserIcon,
  Globe,
  Github,
  Linkedin,
  Calendar,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardHeader from "@/components/dashboardheader";

interface Skill {
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Expert';
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  startDate: string;
  endDate: string;
}

const ProfileForm = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    professionalName: '',
    bio: '',
    location: '',
    experience: '',
    portfolio: '',
    github: '',
    linkedin: '',
    website: ''
  });
  const [skills, setSkills] = useState<Skill[]>([{ name: '', proficiency: 'Intermediate' }]);
  const [projects, setProjects] = useState<Project[]>([{
    title: '',
    description: '',
    technologies: [''],
    githubUrl: '',
    liveUrl: '',
    startDate: '',
    endDate: ''
  }]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          professionalName: user.displayName || ''
        }));
      } else {
        navigate('/signup');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    setSkills(prev => [...prev, { name: '', proficiency: 'Intermediate' }]);
  };

  const updateSkill = (index: number, field: string, value: string) => {
    setSkills(prev => prev.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    ));
  };

  const removeSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects(prev => [...prev, {
      title: '',
      description: '',
      technologies: [''],
      githubUrl: '',
      liveUrl: '',
      startDate: '',
      endDate: ''
    }]);
  };

  const updateProject = (index: number, field: string, value: string | string[]) => {
    setProjects(prev => prev.map((project, i) => 
      i === index ? { ...project, [field]: value } : project
    ));
  };

  const addTechnology = (projectIndex: number) => {
    setProjects(prev => prev.map((project, i) => 
      i === projectIndex 
        ? { ...project, technologies: [...project.technologies, ''] }
        : project
    ));
  };

  const updateTechnology = (projectIndex: number, techIndex: number, value: string) => {
    setProjects(prev => prev.map((project, i) => 
      i === projectIndex 
        ? { 
            ...project, 
            technologies: project.technologies.map((tech, j) => 
              j === techIndex ? value : tech
            )
          }
        : project
    ));
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    setProjects(prev => prev.map((project, i) => 
      i === projectIndex 
        ? { 
            ...project, 
            technologies: project.technologies.filter((_, j) => j !== techIndex)
          }
        : project
    ));
  };

  const removeProject = (index: number) => {
    setProjects(prev => prev.filter((_, i) => i !== index));
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'Beginner': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Expert': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Filter out empty skills and projects
      const validSkills = skills.filter(skill => skill.name.trim() !== '');
      const validProjects = projects.filter(project => 
        project.title.trim() !== '' && project.description.trim() !== ''
      ).map(project => ({
        ...project,
        technologies: project.technologies.filter(tech => tech.trim() !== '')
      }));

      await updateDoc(userDocRef, {
        ...formData,
        skills: validSkills,
        projects: validProjects,
        profileCompleted: true,
        updatedAt: new Date()
      });

      // Redirect to dashboard after successful profile completion
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1F376A] mb-4">Complete Your Profile</h1>
            <p className="text-[#333333] text-lg">
              Help us understand your skills and experience to provide better matches
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
              <div className="flex items-center gap-3 mb-6">
                <UserIcon className="w-6 h-6 text-[#5C92C7]" />
                <h2 className="text-xl font-bold text-[#1F376A]">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="professionalName" className="text-[#1F376A] font-medium">
                    Professional Name *
                  </Label>
                  <Input
                    id="professionalName"
                    value={formData.professionalName}
                    onChange={(e) => handleInputChange('professionalName', e.target.value)}
                    className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-[#f9f7f2]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-[#1F376A] font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-[#f9f7f2]"
                  />
                </div>

                <div>
                  <Label htmlFor="experience" className="text-[#1F376A] font-medium">
                    Years of Experience
                  </Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 3 years"
                    className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-[#f9f7f2]"
                  />
                </div>

                <div>
                  <Label htmlFor="portfolio" className="text-[#1F376A] font-medium">
                    Portfolio Website
                  </Label>
                  <Input
                    id="portfolio"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-[#f9f7f2]"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Label htmlFor="bio" className="text-[#1F376A] font-medium">
                  Professional Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                  className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-[#f9f7f2] min-h-[100px]"
                />
              </div>
            </Card>

            {/* Skills Section */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-[#5C92C7]" />
                  <h2 className="text-xl font-bold text-[#1F376A]">Skills & Proficiency</h2>
                </div>
                <Button
                  type="button"
                  onClick={addSkill}
                  className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-[#5C92C7]/5 rounded-lg">
                    <div className="flex-1">
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                        placeholder="e.g., JavaScript, React, Python"
                        className="border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#1F376A] font-medium whitespace-nowrap">Proficiency:</span>
                      <Select
                        value={skill.proficiency}
                        onValueChange={(value) => updateSkill(index, 'proficiency', value)}
                      >
                        <SelectTrigger className={`w-32 border-[#5C92C7]/30 focus:border-[#1F376A] ${getProficiencyColor(skill.proficiency)} font-medium`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner" className="text-orange-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              Beginner
                            </div>
                          </SelectItem>
                          <SelectItem value="Intermediate" className="text-blue-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              Intermediate
                            </div>
                          </SelectItem>
                          <SelectItem value="Expert" className="text-green-700">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Expert
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSkill(index)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Projects Section */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-[#5C92C7]" />
                  <h2 className="text-xl font-bold text-[#1F376A]">Projects</h2>
                </div>
                <Button
                  type="button"
                  onClick={addProject}
                  className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </Button>
              </div>

              <div className="space-y-6">
                {projects.map((project, projectIndex) => (
                  <div key={projectIndex} className="p-6 bg-[#5C92C7]/5 rounded-lg border border-[#5C92C7]/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-[#1F376A]">
                        Project {projectIndex + 1}
                      </h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProject(projectIndex)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-[#1F376A] font-medium">Project Title *</Label>
                        <Input
                          value={project.title}
                          onChange={(e) => updateProject(projectIndex, 'title', e.target.value)}
                          placeholder="e.g., E-commerce Website"
                          className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                        />
                      </div>

                      <div>
                        <Label className="text-[#1F376A] font-medium">Live URL</Label>
                        <Input
                          value={project.liveUrl}
                          onChange={(e) => updateProject(projectIndex, 'liveUrl', e.target.value)}
                          placeholder="https://yourproject.com"
                          className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                        />
                      </div>

                      <div>
                        <Label className="text-[#1F376A] font-medium">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Duration
                        </Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="month"
                            value={project.startDate}
                            onChange={(e) => updateProject(projectIndex, 'startDate', e.target.value)}
                            className="border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                          />
                          <Input
                            type="month"
                            value={project.endDate}
                            onChange={(e) => updateProject(projectIndex, 'endDate', e.target.value)}
                            className="border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label className="text-[#1F376A] font-medium">Description *</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(projectIndex, 'description', e.target.value)}
                        placeholder="Describe what you built, the challenges you solved, and your role in the project..."
                        className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-white min-h-[80px]"
                      />
                    </div>

                    {/* Improved Technologies Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-[#1F376A] font-medium">Technologies & Tools Used</Label>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addTechnology(projectIndex)}
                          className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Technology
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {project.technologies.map((tech, techIndex) => (
                          <div key={techIndex} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#5C92C7]/20">
                            <div className="w-2 h-2 bg-[#5C92C7] rounded-full flex-shrink-0"></div>
                            <Input
                              value={tech}
                              onChange={(e) => updateTechnology(projectIndex, techIndex, e.target.value)}
                              placeholder="e.g., React, Node.js, MongoDB, Docker"
                              className="border-none shadow-none focus:ring-0 bg-transparent px-2 py-1 text-sm"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => removeTechnology(projectIndex, techIndex)}
                              className="text-red-500 hover:bg-red-50 h-7 w-7 flex-shrink-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {project.technologies.filter(tech => tech.trim() !== '').length > 0 && (
                        <div className="mt-3 p-3 bg-[#5C92C7]/5 rounded-lg">
                          <p className="text-xs text-[#3D6B9C] mb-2">Technologies preview:</p>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies
                              .filter(tech => tech.trim() !== '')
                              .map((tech, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-[#5C92C7] text-white rounded-md text-xs font-medium"
                                >
                                  {tech}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#1F376A] to-[#5C92C7] hover:opacity-90 text-white px-8 py-3 text-lg font-medium"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileForm;
