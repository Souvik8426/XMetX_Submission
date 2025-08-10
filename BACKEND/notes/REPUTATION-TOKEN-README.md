# XMETX Reputation Token (REP) System

## Overview

The XMETX Reputation Token (REP) is a comprehensive ERC-20 token system designed to gamify platform participation, reward contributions, and enable governance through transferable reputation points. Unlike Soulbound Tokens which are permanent and non-transferable, REP tokens are fully transferable and can be used for various utility purposes within the platform.

## Key Features

### 🏆 **Gamified Reward System**
- **Task Difficulty Scaling**: Different reward amounts based on task complexity
- **Rating-Based Rewards**: Earn tokens for receiving positive ratings  
- **Bonus Multipliers**: Additional rewards for exceptional performance
- **Automatic Premium Tiers**: Unlock features based on token balance

### 🗳️ **Governance & Voting**
- **ERC-20 Votes Extension**: Built-in governance voting capabilities
- **Enhanced Voting Power**: Bonus voting power through staking
- **DAO Integration Ready**: Compatible with standard governance frameworks
- **Delegation Support**: Users can delegate voting power to others

### 💎 **Premium Features & Utility**
- **Tiered Access Control**: 5 premium tiers (Basic to Diamond)
- **Staking Mechanisms**: Lock tokens for special privileges
- **Listing Boosts**: Burn tokens to boost visibility
- **Moderation Rights**: Stake tokens to gain moderation privileges
- **Funding Pool Access**: Participate in investment opportunities

### 🔒 **Staking System**
- **4 Stake Types**: Moderation, Funding, Governance, Boost
- **Time-Locked Positions**: Different lock periods for each stake type
- **Utility-Based Rewards**: Gain specific platform privileges
- **Flexible Unstaking**: Retrieve tokens after lock period expires

## Token Economics

### Supply & Distribution
- **Name**: XMETX Reputation Token
- **Symbol**: REP  
- **Decimals**: 18
- **Initial Supply**: 1,000,000 REP
- **Max Supply**: Unlimited (controlled minting)

### Reward Structure

#### Task Completion Rewards
| Difficulty | Base Reward | Description |
|------------|-------------|-------------|
| **EASY** | 10 REP | Simple tasks, bug fixes |
| **MEDIUM** | 25 REP | Feature implementations |
| **HARD** | 50 REP | Complex integrations |
| **EXPERT** | 100 REP | Architecture design |
| **LEGENDARY** | 250 REP | Major protocol work |

#### Rating-Based Rewards
| Rating | Reward | Description |
|--------|--------|-------------|
| ⭐ (1-star) | 5 REP | Poor performance |
| ⭐⭐ (2-star) | 10 REP | Below average |
| ⭐⭐⭐ (3-star) | 20 REP | Satisfactory |
| ⭐⭐⭐⭐ (4-star) | 40 REP | Good quality |
| ⭐⭐⭐⭐⭐ (5-star) | 80 REP | Excellent work |

### Premium Tier System

| Tier | Requirement | Benefits |
|------|-------------|----------|
| **BASIC** | 0 REP | Standard platform access |
| **SILVER** | 1,000 REP | Priority support, enhanced profiles |
| **GOLD** | 5,000 REP | Advanced analytics, custom themes |
| **PLATINUM** | 15,000 REP | API access, early features |
| **DIAMOND** | 50,000 REP | VIP status, direct team access |

### Staking Mechanisms

| Stake Type | Lock Period | Minimum Amount | Benefits |
|------------|-------------|----------------|----------|
| **MODERATION** | 30 days | 100 REP | Platform moderation rights |
| **FUNDING** | 90 days | 100 REP | Investment pool participation |
| **GOVERNANCE** | 60 days | 100 REP | +50% voting power bonus |
| **BOOST** | 7 days | 100 REP | Listing visibility features |

## Smart Contract Architecture

### Core Contract: `ReputationToken.sol`

```solidity
contract ReputationToken is 
    ERC20, 
    ERC20Burnable, 
    ERC20Pausable, 
    AccessControl, 
    ERC20Permit, 
    ERC20Votes, 
    ReentrancyGuard
```

### Key Components

#### 1. Role-Based Access Control
```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
```

#### 2. Reward Structures
```solidity
enum TaskDifficulty { EASY, MEDIUM, HARD, EXPERT, LEGENDARY }
enum RatingLevel { ONE_STAR, TWO_STAR, THREE_STAR, FOUR_STAR, FIVE_STAR }
enum PremiumTier { BASIC, SILVER, GOLD, PLATINUM, DIAMOND }
```

#### 3. Staking System
```solidity
enum StakeType { MODERATION, FUNDING, GOVERNANCE, BOOST }

struct StakeInfo {
    uint256 amount;
    uint256 timestamp;
    uint256 lockPeriod;
    StakeType stakeType;
    bool active;
}
```

## Deployment & Setup

### Prerequisites
```bash
npm install @openzeppelin/contracts
```

### Deploy Contracts
```bash
# Deploy to local network
npx hardhat run scripts/deploy.js

# Deploy to Avalanche Fuji testnet
npx hardhat run scripts/deploy.js --network fuji
```

### Initial Configuration
1. Deploy ReputationToken contract
2. Grant minter role to platform addresses
3. Configure reward parameters if needed
4. Set up governance infrastructure

## Usage Examples

### For Platform Administrators

#### 1. Mint Tokens for Task Completion
```javascript
// Task difficulties: 0=EASY, 1=MEDIUM, 2=HARD, 3=EXPERT, 4=LEGENDARY
await rep.mintForTask(
  userAddress,
  2, // TaskDifficulty.HARD
  1200 // 20% bonus multiplier (1000 = 1x, 1200 = 1.2x)
);
```

#### 2. Reward Users for Ratings
```javascript
// Rating levels: 0=1-star, 1=2-star, 2=3-star, 3=4-star, 4=5-star
await rep.mintForRating(
  userAddress,
  raterAddress,
  4 // RatingLevel.FIVE_STAR
);
```

#### 3. Update Reward Parameters
```javascript
// Increase expert task rewards
await rep.updateTaskReward(
  3, // TaskDifficulty.EXPERT
  ethers.utils.parseEther("150") // New reward: 150 REP
);
```

### For Users

#### 1. Transfer Tokens
```javascript
// Standard ERC-20 transfer
await rep.transfer(recipientAddress, ethers.utils.parseEther("100"));

// Transfer with permit (gasless approval)
await rep.permit(owner, spender, value, deadline, v, r, s);
await rep.transferFrom(owner, recipient, value);
```

#### 2. Stake for Utility Features
```javascript
// Stake for moderation rights
await rep.stakeTokens(
  0, // StakeType.MODERATION
  ethers.utils.parseEther("500") // 500 REP
);

// Stake for enhanced governance voting
await rep.stakeTokens(
  2, // StakeType.GOVERNANCE  
  ethers.utils.parseEther("1000") // 1000 REP
);
```

#### 3. Unstake After Lock Period
```javascript
// Check if unstaking is available
const stake = await rep.userStakes(userAddress, 0); // MODERATION
const canUnstake = Date.now() > (stake.timestamp + stake.lockPeriod) * 1000;

if (canUnstake) {
  await rep.unstakeTokens(0); // StakeType.MODERATION
}
```

#### 4. Boost Listing Visibility
```javascript
// Burn 100 REP tokens for 48-hour listing boost
await rep.boostListing(
  ethers.utils.parseEther("100"), // Cost
  48 // Duration in hours
);
```

### For Governance

#### 1. Delegate Voting Power
```javascript
// Self-delegate to participate in governance
await rep.delegate(userAddress);

// Delegate to another address
await rep.delegate(delegateAddress);
```

#### 2. Check Voting Power
```javascript
// Standard voting power (token balance)
const standardVotes = await rep.getVotes(userAddress);

// Enhanced voting power (includes staking bonus)
const enhancedVotes = await rep.getVotingPower(userAddress);
```

### For Public Queries

#### 1. Check Premium Access
```javascript
// Check if user has gold tier access
const hasGoldAccess = await rep.hasPremiumAccess(
  userAddress,
  2 // PremiumTier.GOLD
);

// Get user's current premium tier
const userTier = await rep.getUserPremiumTier(userAddress);
```

#### 2. Verify Utility Rights
```javascript
// Check moderation rights
const canModerate = await rep.canModerate(userAddress);

// Check funding pool participation
const canFund = await rep.canParticipateInFunding(userAddress);
```

#### 3. Platform Statistics
```javascript
const stats = await rep.getPlatformStats();
console.log(`Total tasks completed: ${stats.totalTasks}`);
console.log(`Total REP minted: ${ethers.utils.formatEther(stats.totalMinted)}`);
console.log(`Total tokens staked: ${ethers.utils.formatEther(stats.totalStaked)}`);
```

## Frontend Integration

### React Hook Example
```jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function useReputationToken(userAddress) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      if (!userAddress) return;
      
      const balance = await rep.balanceOf(userAddress);
      const tier = await rep.getUserPremiumTier(userAddress);
      const votes = await rep.getVotingPower(userAddress);
      const stakes = await rep.getUserStakes(userAddress);
      
      setData({
        balance: ethers.utils.formatEther(balance),
        premiumTier: tier,
        votingPower: ethers.utils.formatEther(votes),
        stakes: stakes.filter(stake => stake.active),
        canModerate: await rep.canModerate(userAddress),
        canFund: await rep.canParticipateInFunding(userAddress)
      });
    }
    
    fetchData();
  }, [userAddress]);
  
  return data;
}
```

### Dashboard Component
```jsx
function ReputationDashboard({ userAddress }) {
  const repData = useReputationToken(userAddress);
  
  if (!repData) return <div>Loading...</div>;
  
  const tierNames = ['Basic', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const stakeTypes = ['Moderation', 'Funding', 'Governance', 'Boost'];
  
  return (
    <div className="reputation-dashboard">
      <div className="balance-section">
        <h2>{repData.balance} REP</h2>
        <p>Premium Tier: {tierNames[repData.premiumTier]}</p>
        <p>Voting Power: {repData.votingPower}</p>
      </div>
      
      <div className="utilities-section">
        <h3>Platform Utilities</h3>
        <p>Can Moderate: {repData.canModerate ? '✅' : '❌'}</p>
        <p>Can Fund: {repData.canFund ? '✅' : '❌'}</p>
      </div>
      
      <div className="stakes-section">
        <h3>Active Stakes</h3>
        {repData.stakes.map((stake, index) => (
          <div key={index}>
            <p>{stakeTypes[stake.stakeType]}: {ethers.utils.formatEther(stake.amount)} REP</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Backend Integration

### Task Completion Handler
```javascript
// Automated task completion reward
async function handleTaskCompletion(taskId, userId, difficulty, qualityScore) {
  try {
    const userAddress = await getUserWalletAddress(userId);
    
    // Calculate bonus multiplier based on quality
    let multiplier = 1000; // Base 1x
    if (qualityScore >= 95) multiplier = 1500; // 50% bonus for excellent work
    else if (qualityScore >= 85) multiplier = 1200; // 20% bonus for good work
    
    // Mint tokens
    await rep.mintForTask(userAddress, difficulty, multiplier);
    
    // Log the reward
    console.log(`Rewarded user ${userId} for completing task ${taskId}`);
    
  } catch (error) {
    console.error('Failed to reward task completion:', error);
  }
}
```

### Rating System Integration
```javascript
// Automated rating reward
async function handleUserRating(ratedUserId, raterUserId, rating) {
  try {
    const ratedUserAddress = await getUserWalletAddress(ratedUserId);
    const raterAddress = await getUserWalletAddress(raterUserId);
    
    // Convert 1-5 rating to enum (0-4)
    const ratingLevel = rating - 1;
    
    // Only reward for 4-5 star ratings
    if (rating >= 4) {
      await rep.mintForRating(ratedUserAddress, raterAddress, ratingLevel);
      console.log(`Rewarded ${ratedUserId} for ${rating}-star rating`);
    }
    
  } catch (error) {
    console.error('Failed to reward rating:', error);
  }
}
```

### Premium Feature Gate
```javascript
// Middleware to check premium access
function requirePremiumTier(requiredTier) {
  return async (req, res, next) => {
    try {
      const userAddress = req.user.walletAddress;
      const hasAccess = await rep.hasPremiumAccess(userAddress, requiredTier);
      
      if (!hasAccess) {
        return res.status(403).json({
          error: 'Premium tier required',
          required: tierNames[requiredTier],
          current: tierNames[await rep.getUserPremiumTier(userAddress)]
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ error: 'Failed to check premium access' });
    }
  };
}

// Usage in Express routes
app.get('/api/advanced-analytics', 
  requirePremiumTier(2), // Gold tier required
  (req, res) => {
    // Advanced analytics endpoint
  }
);
```

## Governance Integration

### DAO Proposal Creation
```javascript
// Create governance proposal (using OpenZeppelin Governor)
async function createProposal(description, targets, values, calldatas) {
  // Ensure proposer has enough voting power
  const proposerVotes = await rep.getVotingPower(proposer);
  const proposalThreshold = await governor.proposalThreshold();
  
  if (proposerVotes.lt(proposalThreshold)) {
    throw new Error('Insufficient voting power to create proposal');
  }
  
  return await governor.propose(targets, values, calldatas, description);
}
```

### Enhanced Voting Power
```javascript
// Calculate total voting power including staking bonuses
function calculateVotingPower(userAddress) {
  const baseVotes = await rep.getVotes(userAddress);
  const enhancedVotes = await rep.getVotingPower(userAddress);
  const stakingBonus = enhancedVotes.sub(baseVotes);
  
  return {
    base: baseVotes,
    staking_bonus: stakingBonus,
    total: enhancedVotes
  };
}
```

## Security Considerations

### Access Control
- **Role-based permissions**: Only authorized addresses can mint tokens
- **Staking protection**: Time locks prevent rapid stake/unstake cycles
- **Reentrancy guards**: Protect against reentrancy attacks
- **Pausable functionality**: Emergency pause for security incidents

### Economic Security
- **Controlled inflation**: Minting only through authorized platform actions
- **Burn mechanisms**: Listing boosts remove tokens from circulation
- **Stake locking**: Prevents gaming of utility features
- **Premium tier automation**: Transparent, algorithmic tier calculation

### Upgrade Safety
- **Role management**: Admin functions for parameter updates
- **Gradual changes**: Avoid sudden economic disruptions
- **Community governance**: Major changes through DAO voting

## Testing

### Run Examples
```bash
# Deploy contracts first
npx hardhat run scripts/deploy.js --network fuji

# Run comprehensive examples
REP_ADDRESS=0x... npx hardhat run scripts/reputation-examples.js --network fuji
```

### Test Coverage
- ✅ Task-based token minting
- ✅ Rating-based rewards
- ✅ Premium tier calculations  
- ✅ Staking mechanisms
- ✅ Governance voting power
- ✅ Token transfers and burns
- ✅ Access control functions
- ✅ Platform statistics

## Roadmap & Future Features

### Planned Enhancements
1. **Dynamic Reward Scaling**: Adjust rewards based on token supply and demand
2. **Reputation Decay**: Gradual decrease in idle accounts to encourage activity
3. **Cross-Platform Integration**: REP token usage across partner platforms
4. **Advanced Staking Pools**: Yield-generating staking mechanisms
5. **NFT Integration**: REP token requirements for special NFT features

### Community Governance
- **Parameter Voting**: Community control over reward rates and requirements
- **Feature Proposals**: DAO-driven platform feature development
- **Treasury Management**: Community fund allocation decisions

## Integration with Soulbound Tokens

The REP token system works synergistically with the SBT system:

| Feature | Soulbound Tokens (SBT) | Reputation Tokens (REP) |
|---------|------------------------|-------------------------|
| **Purpose** | Permanent achievement record | Transferable utility currency |
| **Transferability** | Non-transferable | Fully transferable |
| **Use Cases** | Proof of work, credentials | Governance, premium features |
| **Minting** | Achievement-based | Task/rating-based |
| **Burning** | Not applicable | Boost features, deflationary |

### Combined Benefits
- **SBTs** provide permanent, verifiable proof of contributions
- **REP tokens** enable liquid reputation that can be used for platform utility
- Together they create a comprehensive reputation ecosystem

---

**Built for XMETX Platform** - Empowering developers with both permanent credentials (SBT) and liquid reputation currency (REP) for a complete Web3 reputation system.
