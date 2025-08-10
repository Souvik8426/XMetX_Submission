import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "firebase/auth";
import { auth, db } from "@/components/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft,
  Wallet,
  Plus,
  Send,
  Check,
  X,
  Shield,
  Award,
  Copy,
  ExternalLink,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardHeader from "@/components/dashboardheader";

interface Deal {
  dealId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  participants: string[];
  deposits: { [key: string]: number };
  description: string;
  createdAt: Date;
  counterparty: string;
  amount: number;
}

interface WalletInfo {
  address: string;
  avaxBalance: number;
  repTokenBalance: number;
  isConnected: boolean;
}

interface SBTAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  metadata: any;
  earnedAt: Date;
}

const CollaborationPage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletInfo>({
    address: '',
    avaxBalance: 0,
    repTokenBalance: 0,
    isConnected: false
  });
  const [deals, setDeals] = useState<Deal[]>([]);
  const [sbtAchievements, setSbtAchievements] = useState<SBTAchievement[]>([]);
  
  // Form states
  const [newDeal, setNewDeal] = useState({
    counterpartyAddress: '',
    description: '',
    amount: ''
  });
  const [depositForm, setDepositForm] = useState({
    dealId: '',
    amount: ''
  });

  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const collaboratorName = location.state?.userName || 'User';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        loadUserData();
      } else {
        navigate('/signup');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadUserData = async () => {
    // Mock data - replace with actual blockchain calls
    setDeals([
      {
        dealId: 'deal_001',
        status: 'active',
        participants: ['0x123...', '0x456...'],
        deposits: { '0x123...': 50, '0x456...': 0 },
        description: 'Website Development Project',
        createdAt: new Date(),
        counterparty: '0x456...',
        amount: 100
      },
      {
        dealId: 'deal_002',
        status: 'pending',
        participants: ['0x123...', '0x789...'],
        deposits: { '0x123...': 0, '0x789...': 0 },
        description: 'Mobile App Design',
        createdAt: new Date(),
        counterparty: '0x789...',
        amount: 75
      }
    ]);

    setSbtAchievements([
      {
        id: 'sbt_001',
        title: 'First Collaborator',
        description: 'Successfully completed your first collaboration',
        icon: '🤝',
        metadata: { level: 1 },
        earnedAt: new Date()
      },
      {
        id: 'sbt_002',
        title: 'Trusted Developer',
        description: 'Maintained 5-star rating across 10+ projects',
        icon: '⭐',
        metadata: { level: 3 },
        earnedAt: new Date()
      }
    ]);
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Mock wallet data - replace with actual calls
        setWallet({
          address: accounts[0],
          avaxBalance: 125.75,
          repTokenBalance: 850,
          isConnected: true
        });
      } else {
        alert('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const createDeal = async () => {
    try {
      // Mock API call - replace with actual backend call
      const response = await fetch('/api/deal/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counterpartyAddress: newDeal.counterpartyAddress,
          description: newDeal.description,
          amount: parseFloat(newDeal.amount)
        })
      });
      
      if (response.ok) {
        alert('Deal created successfully!');
        setNewDeal({ counterpartyAddress: '', description: '', amount: '' });
        loadUserData(); // Refresh deals
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    }
  };

  const depositFunds = async () => {
    try {
      // Mock API call - replace with actual backend call
      const response = await fetch('/api/deal/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: depositForm.dealId,
          amount: parseFloat(depositForm.amount)
        })
      });
      
      if (response.ok) {
        alert('Funds deposited successfully!');
        setDepositForm({ dealId: '', amount: '' });
        loadUserData(); // Refresh deals
      }
    } catch (error) {
      console.error('Error depositing funds:', error);
    }
  };

  const confirmCompletion = async (dealId: string) => {
    try {
      const response = await fetch('/api/deal/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId })
      });
      
      if (response.ok) {
        alert('Deal confirmed successfully!');
        loadUserData();
      }
    } catch (error) {
      console.error('Error confirming deal:', error);
    }
  };

  const cancelDeal = async (dealId: string) => {
    try {
      const response = await fetch('/api/deal/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId })
      });
      
      if (response.ok) {
        alert('Deal cancelled successfully!');
        loadUserData();
      }
    } catch (error) {
      console.error('Error cancelling deal:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f7f2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1F376A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#333333]">Loading collaboration workspace...</p>
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
              <h1 className="text-3xl font-bold text-[#1F376A] mb-2">
                Collaborate with {collaboratorName}
              </h1>
              <p className="text-[#333333]">Web3 Skills Trading & Deal Management</p>
            </div>
          </div>

          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet & Profile
              </TabsTrigger>
              <TabsTrigger value="deals" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Deals (SkillTrade)
              </TabsTrigger>
            </TabsList>

            {/* Wallet & Profile Tab */}
            <TabsContent value="wallet" className="space-y-6">
              {/* Wallet Connection */}
              <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                <h3 className="text-xl font-bold text-[#1F376A] mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Wallet Connection
                </h3>
                
                {!wallet.isConnected ? (
                  <div className="text-center py-8">
                    <Wallet className="w-16 h-16 text-[#5C92C7] mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-[#1F376A] mb-2">Connect Your Wallet</h4>
                    <p className="text-[#333333] mb-6">Connect your MetaMask wallet to start trading skills on Avalanche</p>
                    <Button
                      onClick={connectWallet}
                      className="bg-gradient-to-r from-[#1F376A] to-[#5C92C7] hover:opacity-90 text-white"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect MetaMask/Avalanche
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 bg-[#5C92C7]/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#3D6B9C]">Wallet Address</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyToClipboard(wallet.address)}
                            className="h-6 w-6"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-mono text-sm text-[#1F376A]">
                          {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                        </p>
                      </Card>
                      
                      <Card className="p-4 bg-[#5C92C7]/5">
                        <div className="text-sm font-medium text-[#3D6B9C] mb-2">AVAX Balance</div>
                        <p className="text-xl font-bold text-[#1F376A]">{wallet.avaxBalance} AVAX</p>
                      </Card>
                      
                      <Card className="p-4 bg-[#5C92C7]/5">
                        <div className="text-sm font-medium text-[#3D6B9C] mb-2">REP Token Balance</div>
                        <p className="text-xl font-bold text-[#1F376A]">{wallet.repTokenBalance} REP</p>
                      </Card>
                    </div>
                  </div>
                )}
              </Card>

              {/* SBT Achievements */}
              {wallet.isConnected && (
                <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                  <h3 className="text-xl font-bold text-[#1F376A] mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    SBT Achievements
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sbtAchievements.map((achievement) => (
                      <Card key={achievement.id} className="p-4 bg-gradient-to-r from-[#5C92C7]/10 to-[#3D6B9C]/10 border border-[#5C92C7]/20">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#1F376A] mb-1">{achievement.title}</h4>
                            <p className="text-sm text-[#333333] mb-2">{achievement.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs border-[#5C92C7] text-[#3D6B9C]">
                                Level {achievement.metadata.level}
                              </Badge>
                              <span className="text-xs text-[#3D6B9C]">
                                Earned {achievement.earnedAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Deals Tab */}
            <TabsContent value="deals" className="space-y-6">
              {!wallet.isConnected ? (
                <Card className="p-8 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20 text-center">
                  <AlertCircle className="w-12 h-12 text-[#5C92C7] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1F376A] mb-2">Wallet Required</h3>
                  <p className="text-[#333333] mb-4">Please connect your wallet to create and manage deals</p>
                  <Button onClick={() => document.querySelector('[value="wallet"]')?.click()}>
                    Connect Wallet First
                  </Button>
                </Card>
              ) : (
                <>
                  {/* Create Deal Form */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                    <h3 className="text-xl font-bold text-[#1F376A] mb-4 flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Create New Deal
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-[#1F376A] font-medium">Counterparty Address</Label>
                        <Input
                          value={newDeal.counterpartyAddress}
                          onChange={(e) => setNewDeal(prev => ({ ...prev, counterpartyAddress: e.target.value }))}
                          placeholder="0x..."
                          className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-[#1F376A] font-medium">Deal Amount (AVAX)</Label>
                        <Input
                          type="number"
                          value={newDeal.amount}
                          onChange={(e) => setNewDeal(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00"
                          className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <Label className="text-[#1F376A] font-medium">Deal Description</Label>
                      <Textarea
                        value={newDeal.description}
                        onChange={(e) => setNewDeal(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the skills/services to be traded..."
                        className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                      />
                    </div>
                    
                    <Button
                      onClick={createDeal}
                      className="bg-gradient-to-r from-[#1F376A] to-[#5C92C7] hover:opacity-90 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Deal
                    </Button>
                  </Card>

                  {/* Deposit Funds */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                    <h3 className="text-xl font-bold text-[#1F376A] mb-4 flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      Deposit Funds
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-[#1F376A] font-medium">Deal ID</Label>
                        <Input
                          value={depositForm.dealId}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, dealId: e.target.value }))}
                          placeholder="deal_001"
                          className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-[#1F376A] font-medium">Amount (AVAX)</Label>
                        <Input
                          type="number"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00"
                          className="mt-2 border-[#5C92C7]/30 focus:border-[#1F376A] bg-white"
                        />
                      </div>
                    </div>
                    
                    <Button
                      onClick={depositFunds}
                      className="bg-[#5C92C7] hover:bg-[#3D6B9C] text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Deposit Funds
                    </Button>
                  </Card>

                  {/* Deal List */}
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-[#5C92C7]/20">
                    <h3 className="text-xl font-bold text-[#1F376A] mb-4">Active Deals</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#5C92C7]/20">
                            <th className="text-left py-3 px-4 font-medium text-[#1F376A]">Deal ID</th>
                            <th className="text-left py-3 px-4 font-medium text-[#1F376A]">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-[#1F376A]">Participants</th>
                            <th className="text-left py-3 px-4 font-medium text-[#1F376A]">Deposits</th>
                            <th className="text-left py-3 px-4 font-medium text-[#1F376A]">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deals.map((deal) => (
                            <tr key={deal.dealId} className="border-b border-[#5C92C7]/10 hover:bg-[#5C92C7]/5">
                              <td className="py-3 px-4 font-mono text-sm text-[#1F376A]">{deal.dealId}</td>
                              <td className="py-3 px-4">
                                <Badge className={getStatusColor(deal.status)}>
                                  {deal.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-[#333333]">
                                {deal.participants.length} participants
                              </td>
                              <td className="py-3 px-4 text-sm text-[#333333]">
                                {Object.values(deal.deposits).reduce((a, b) => a + b, 0)} AVAX
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  {deal.status === 'active' && (
                                    <Button
                                      size="sm"
                                      onClick={() => confirmCompletion(deal.dealId)}
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Confirm
                                    </Button>
                                  )}
                                  {deal.status !== 'completed' && deal.status !== 'cancelled' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => cancelDeal(deal.dealId)}
                                      className="border-red-300 text-red-600 hover:bg-red-50"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {deals.length === 0 && (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-[#5C92C7] mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-[#1F376A] mb-2">No Deals Yet</h4>
                        <p className="text-[#333333]">Create your first deal to start trading skills</p>
                      </div>
                    )}
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default CollaborationPage;
