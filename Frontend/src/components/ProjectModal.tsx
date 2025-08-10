import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/components/firebase/firebase";
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Calendar,
  X,
  Github,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  startDate: string;
  endDate: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'view';
  project?: Project | null;
  user: User | null;
  onProjectAdded?: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  mode, 
  project, 
  user, 
  onProjectAdded 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Project>({
    title: '',
    description: '',
    technologies: [''],
    githubUrl: '',
    liveUrl: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (project && mode === 'view') {
      setFormData(project);
    } else if (mode === 'add') {
      setFormData({
        title: '',
        description: '',
        technologies: [''],
        githubUrl: '',
        liveUrl: '',
        startDate: '',
        endDate: ''
      });
    }
  }, [project, mode, isOpen]);

  const updateProject = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTechnology = () => {
    setFormData(prev => ({
      ...prev,
      technologies: [...prev.technologies, '']
    }));
  };

  const updateTechnology = (techIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.map((tech, j) => 
        j === techIndex ? value : tech
      )
    }));
  };

  const removeTechnology = (techIndex: number) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, j) => j !== techIndex)
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || mode === 'view') return;

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      const validProject = {
        ...formData,
        technologies: formData.technologies.filter(tech => tech.trim() !== ''),
        createdAt: new Date()
      };

      await updateDoc(userDocRef, {
        projects: arrayUnion(validProject),
        updatedAt: new Date()
      });

      if (onProjectAdded) {
        onProjectAdded();
      }
      onClose();
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-white/95 backdrop-blur-md rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#5C92C7]/20"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#1F376A] mb-1">
                {mode === 'add' ? 'Add New Project' : 'Project Details'}
              </h2>
              <p className="text-[#3D6B9C] text-sm">
                {mode === 'add' 
                  ? 'Showcase your work and technical expertise' 
                  : 'Complete project information and links'
                }
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#3D6B9C] hover:bg-[#5C92C7]/10 h-10 w-10 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {mode === 'view' ? (
            // View Mode
            <div className="space-y-8">
              {/* Project Title & Description */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-[#1F376A] leading-tight">
                  {formData.title || 'Untitled Project'}
                </h3>
                <p className="text-[#333333] leading-relaxed text-base">
                  {formData.description || 'No description provided.'}
                </p>
              </div>

              {/* Technologies */}
              {formData.technologies.filter(tech => tech.trim()).length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-[#1F376A] text-lg">Technologies Used</h4>
                  <div className="flex flex-wrap gap-3">
                    {formData.technologies.filter(tech => tech.trim()).map((tech, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-[#5C92C7] to-[#3D6B9C] text-white rounded-full text-sm font-medium shadow-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Duration */}
              {(formData.startDate || formData.endDate) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formData.startDate && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-[#1F376A]">Start Date</h4>
                      <p className="text-[#333333] bg-[#5C92C7]/5 px-3 py-2 rounded-lg">
                        {formatDate(formData.startDate)}
                      </p>
                    </div>
                  )}
                  {formData.endDate && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-[#1F376A]">End Date</h4>
                      <p className="text-[#333333] bg-[#5C92C7]/5 px-3 py-2 rounded-lg">
                        {formatDate(formData.endDate)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {(formData.githubUrl || formData.liveUrl) && (
                <div className="flex flex-wrap gap-4 pt-4 border-t border-[#5C92C7]/10">
                  {formData.githubUrl && (
                    <Button
                      onClick={() => window.open(formData.githubUrl, '_blank')}
                      className="bg-[#333333] hover:bg-[#555555] text-white flex-1 sm:flex-none transition-all duration-200 shadow-sm"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </Button>
                  )}
                  {formData.liveUrl && (
                    <Button
                      onClick={() => window.open(formData.liveUrl, '_blank')}
                      className="bg-gradient-to-r from-[#5C92C7] to-[#3D6B9C] hover:opacity-90 text-white flex-1 sm:flex-none transition-all duration-200 shadow-sm"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Live Demo
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Add Mode
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[#1F376A] font-semibold text-base">
                    Project Title *
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateProject('title', e.target.value)}
                    placeholder="e.g., E-commerce Platform"
                    className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] focus:ring-1 focus:ring-[#1F376A]/20 bg-white/80 backdrop-blur-sm h-12 transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1F376A] font-semibold text-base">
                    GitHub Repository
                  </Label>
                  <Input
                    value={formData.githubUrl}
                    onChange={(e) => updateProject('githubUrl', e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] focus:ring-1 focus:ring-[#1F376A]/20 bg-white/80 backdrop-blur-sm h-12 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1F376A] font-semibold text-base">
                    Live Demo URL
                  </Label>
                  <Input
                    value={formData.liveUrl}
                    onChange={(e) => updateProject('liveUrl', e.target.value)}
                    placeholder="https://yourproject.vercel.app"
                    className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] focus:ring-1 focus:ring-[#1F376A]/20 bg-white/80 backdrop-blur-sm h-12 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1F376A] font-semibold text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Project Duration
                  </Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      type="month"
                      value={formData.startDate}
                      onChange={(e) => updateProject('startDate', e.target.value)}
                      className="border-[#5C92C7]/30 focus:border-[#1F376A] focus:ring-1 focus:ring-[#1F376A]/20 bg-white/80 backdrop-blur-sm h-12 transition-all duration-200"
                    />
                    <Input
                      type="month"
                      value={formData.endDate}
                      onChange={(e) => updateProject('endDate', e.target.value)}
                      className="border-[#5C92C7]/30 focus:border-[#1F376A] focus:ring-1 focus:ring-[#1F376A]/20 bg-white/80 backdrop-blur-sm h-12 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Project Description */}
              <div className="space-y-2">
                <Label className="text-[#1F376A] font-semibold text-base">
                  Project Description *
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateProject('description', e.target.value)}
                  placeholder="Describe your project, the problem it solves, key features, and your development approach..."
                  className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] focus:ring-1 focus:ring-[#1F376A]/20 bg-white/80 backdrop-blur-sm min-h-[120px] resize-none transition-all duration-200"
                  required
                />
              </div>

              {/* Technologies Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[#1F376A] font-semibold text-base">
                    Technologies & Tools Used
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addTechnology}
                    className="bg-gradient-to-r from-[#5C92C7] to-[#3D6B9C] hover:opacity-90 text-white shadow-sm transition-all duration-200"
                  >
                    <Plus className="w-3 h-3 mr-2" />
                    Add Technology
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.technologies.map((tech, techIndex) => (
                    <motion.div 
                      key={techIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-[#5C92C7]/20 hover:border-[#5C92C7]/40 transition-all duration-200"
                    >
                      <div className="w-2 h-2 bg-gradient-to-r from-[#5C92C7] to-[#3D6B9C] rounded-full flex-shrink-0"></div>
                      <Input
                        value={tech}
                        onChange={(e) => updateTechnology(techIndex, e.target.value)}
                        placeholder="e.g., React, TypeScript, Tailwind CSS"
                        className="border-none shadow-none focus:ring-0 bg-transparent px-2 py-1 text-sm font-medium placeholder:text-[#3D6B9C]/60"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeTechnology(techIndex)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 flex-shrink-0 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-[#5C92C7]/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-[#5C92C7]/30 text-[#3D6B9C] hover:bg-[#5C92C7]/5 px-6 h-11 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#1F376A] to-[#5C92C7] hover:opacity-90 text-white px-8 h-11 shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Adding Project...
                    </>
                  ) : (
                    <>
                      Add Project
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectModal;
