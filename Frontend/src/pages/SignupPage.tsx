import { motion } from "framer-motion";
import { ArrowRight, Users, Zap, Shield, Code, User, Briefcase, Globe, Star, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/components/firebase/firebase";

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists in Firestore
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data()?.profileCompleted) {
        // Existing user with completed profile - go to dashboard
        navigate('/matches');
      } else {
        // New user or incomplete profile - go to form page
        // Create basic user document if doesn't exist
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            createdAt: new Date(),
            profileCompleted: false
          });
        }
        navigate('/profile-form');
      }
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // Handle error (you might want to show a toast notification)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f7f2] flex">
      {/* Left Side - Welcome Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1F376A] to-[#5C92C7] p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/20"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border border-white/20"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full border border-white/20"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Code className="w-8 h-8" />
            <span className="text-2xl font-bold">XMetX</span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Connect with developers worldwide. Share skills, collaborate on projects, and grow together.
            </h1>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 grid grid-cols-2 gap-6"
        >
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Users className="w-8 h-8 text-[#5C92C7]" />
            <div>
              <h3 className="font-medium">Real Connections</h3>
              <p className="text-sm opacity-80">Connect with actual developers</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Zap className="w-8 h-8 text-[#5C92C7]" />
            <div>
              <h3 className="font-medium">Skill Exchange</h3>
              <p className="text-sm opacity-80">Learn and teach simultaneously</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Shield className="w-8 h-8 text-[#5C92C7]" />
            <div>
              <h3 className="font-medium">Secure Platform</h3>
              <p className="text-sm opacity-80">Safe and trusted environment</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Code className="w-8 h-8 text-[#5C92C7]" />
            <div>
              <h3 className="font-medium">Project Collaboration</h3>
              <p className="text-sm opacity-80">Work together on real projects</p>
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 text-center">
          <div className="flex justify-center space-x-8 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm opacity-80">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">5K+</div>
              <div className="text-sm opacity-80">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm opacity-80">Sign-ups Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm opacity-80">Projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Authentication & Content */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 space-y-8">
        
        {/* Authentication Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#5C92C7]/20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1F376A] mb-2">
                Welcome to XMetX
              </h2>
              <p className="text-[#333333]">
                Join the Web3 talent revolution with secure Google authentication
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-[#333333] border border-[#5C92C7]/30 font-medium py-4 flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#1F376A] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                className="text-[#3D6B9C] hover:text-[#1F376A] hover:bg-[#5C92C7]/10"
                onClick={handleBackToHome}
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-[#5C92C7]/20">
            <h3 className="text-lg font-bold text-[#1F376A] mb-4 text-center">
              Why Join XMetX?
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#5C92C7]" />
                <span className="text-sm text-[#333333]">Showcase your skills & projects</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#5C92C7]" />
                <span className="text-sm text-[#333333]">Get matched with perfect opportunities</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#5C92C7]" />
                <span className="text-sm text-[#333333]">Web3-powered verification</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#5C92C7]" />
                <span className="text-sm text-[#333333]">Decentralized profile ownership</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="bg-gradient-to-r from-[#5C92C7]/10 to-[#3D6B9C]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#5C92C7]/20">
            <h3 className="text-lg font-bold text-[#1F376A] mb-4 text-center">
              Join Our Growing Community
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <User className="w-5 h-5 text-[#5C92C7] mr-1" />
                  <span className="text-2xl font-bold text-[#1F376A]">10K+</span>
                </div>
                <p className="text-xs text-[#333333]">Active Developers</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Briefcase className="w-5 h-5 text-[#5C92C7] mr-1" />
                  <span className="text-2xl font-bold text-[#1F376A]">2K+</span>
                </div>
                <p className="text-xs text-[#333333]">Companies Hiring</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-[#5C92C7] mr-1" />
                  <span className="text-2xl font-bold text-[#1F376A]">95%</span>
                </div>
                <p className="text-xs text-[#333333]">Match Success Rate</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-[#5C92C7] mr-1" />
                  <span className="text-2xl font-bold text-[#1F376A]">$120K</span>
                </div>
                <p className="text-xs text-[#333333]">Avg. Package</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#5C92C7]/5 rounded-xl p-4 border border-[#5C92C7]/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#5C92C7]" />
              <span className="text-sm font-medium text-[#1F376A]">Secure & Private</span>
            </div>
            <p className="text-xs text-[#333333] leading-relaxed">
              Your data is protected with enterprise-grade security. We use Google's OAuth 2.0 for authentication and Web3 technology for decentralized profile management.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
