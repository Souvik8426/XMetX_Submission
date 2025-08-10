# XMETX Soulbound Token (SBT) System

## Overview

The XMETX Soulbound Token system implements non-transferable NFTs that serve as a **Web3 reputation passport** for developers. These tokens are permanently bound to recipient wallets and cannot be sold, transferred, or traded, ensuring authentic proof of work and contribution history.

## Features

### 🔒 **Soulbound Characteristics**
- **Non-transferable**: Tokens cannot be transferred, sold, or traded
- **Permanently bound**: Once minted, tokens stay with the recipient forever
- **Tamper-proof**: Achievement history cannot be altered or faked

### 🏆 **Achievement Types**
1. **Project Completion** - Successfully completed development projects
2. **5-Star Review** - Received excellent feedback from clients/peers
3. **DAO Proposal Passed** - Successfully proposed and passed governance proposals
4. **Skill Verification** - Verified expertise in specific technologies
5. **Collaboration Badge** - Demonstrated excellent teamwork skills
6. **Mentor Achievement** - Mentored other developers successfully
7. **Community Contribution** - Made valuable contributions to the ecosystem

### 🛡️ **Access Control & Security**
- **Role-based permissions**: Admin and Minter roles for controlled access
- **Verified developers only**: Only platform-verified addresses can receive SBTs
- **Pausable contract**: Emergency pause functionality for security
- **Comprehensive events**: Full audit trail of all operations

### 📊 **Reputation System**
- **Weighted scoring**: Different achievement types have different point values
- **Public verification**: Anyone can verify achievements on-chain
- **Detailed metadata**: Rich achievement descriptions and context
- **Historical tracking**: Complete timeline of developer accomplishments

## Smart Contract Architecture

### Main Contract: `SoulboundToken.sol`

```solidity
// Core inheritance
contract SoulboundToken is ERC721, AccessControl, Pausable
```

#### Key Components:

1. **Achievement Structure**
```solidity
struct Achievement {
    AchievementType achievementType;
    string title;
    string description;
    string metadata; // JSON metadata
    uint256 timestamp;
    address issuer;
    bool verified;
}
```

2. **Role Management**
```solidity
bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
```

3. **Developer Verification**
```solidity
mapping(address => bool) public verifiedDevelopers;
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

# Deploy to testnet (Avalanche Fuji)
npx hardhat run scripts/deploy.js --network fuji
```

### Initial Setup
1. Deploy the contract
2. Grant minter role to platform addresses
3. Verify initial developer addresses
4. Begin minting achievements

## Usage Examples

### For Platform Administrators

#### 1. Verify Developers
```javascript
// Single developer
await sbt.setDeveloperVerification(developerAddress, true);

// Batch verification
const developers = [addr1, addr2, addr3];
await sbt.batchSetDeveloperVerification(developers, true);
```

#### 2. Mint Achievements
```javascript
await sbt.mintAchievement(
  recipientAddress,
  0, // AchievementType.PROJECT_COMPLETION
  "Full-Stack DeFi Application",
  "Built a complete DeFi trading platform with React and Solidity",
  JSON.stringify({
    project_name: "DeFi Trader",
    technologies: ["React", "Solidity", "Web3.js"],
    repository: "https://github.com/user/defi-trader"
  })
);
```

### For Public Verification

#### 1. Check Developer Verification
```javascript
const isVerified = await sbt.verifiedDeveloper(developerAddress);
```

#### 2. Get Reputation Score
```javascript
const score = await sbt.getReputationScore(developerAddress);
```

#### 3. View All Achievements
```javascript
const achievements = await sbt.getUserAchievements(developerAddress);
for (const tokenId of achievements) {
  const achievement = await sbt.getAchievement(tokenId);
  console.log(achievement.title, achievement.description);
}
```

#### 4. Count Specific Achievement Types
```javascript
// Count 5-star reviews
const reviewCount = await sbt.getUserAchievementCount(
  developerAddress, 
  1 // AchievementType.FIVE_STAR_REVIEW
);
```

## Reputation Scoring System

### Point Values by Achievement Type:
- **Project Completion**: 100 points
- **5-Star Review**: 150 points
- **DAO Proposal Passed**: 200 points
- **Skill Verification**: 75 points
- **Collaboration Badge**: 80 points
- **Mentor Achievement**: 120 points
- **Community Contribution**: 90 points

### Reputation Calculation:
The total reputation score is the sum of all achievement point values for a verified developer.

## Metadata Standards

### Achievement Metadata Structure:
```json
{
  "name": "Achievement Title",
  "description": "Detailed description",
  "achievement_type": "Project Completion",
  "timestamp": 1640995200,
  "verified": true,
  "custom_fields": {
    "project_name": "DeFi Platform",
    "technologies": ["React", "Solidity"],
    "repository": "https://github.com/...",
    "skills_demonstrated": ["Smart Contracts", "Frontend"]
  }
}
```

## Integration Guide

### Frontend Integration

#### 1. Connect to Contract
```javascript
import { ethers } from 'ethers';
import SoulboundTokenABI from './SoulboundToken.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const sbt = new ethers.Contract(SBT_ADDRESS, SoulboundTokenABI, provider);
```

#### 2. Display Developer Profile
```javascript
async function getDeveloperProfile(address) {
  const isVerified = await sbt.verifiedDeveloper(address);
  const score = await sbt.getReputationScore(address);
  const achievements = await sbt.getUserAchievements(address);
  
  const profile = {
    verified: isVerified,
    reputationScore: score.toNumber(),
    totalAchievements: achievements.length,
    achievements: []
  };
  
  for (const tokenId of achievements) {
    const achievement = await sbt.getAchievement(tokenId);
    profile.achievements.push({
      id: tokenId.toString(),
      title: achievement.title,
      description: achievement.description,
      type: achievement.achievementType,
      timestamp: new Date(achievement.timestamp * 1000),
      metadata: JSON.parse(achievement.metadata || '{}')
    });
  }
  
  return profile;
}
```

#### 3. Achievement Dashboard Component
```jsx
function AchievementDashboard({ userAddress }) {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    if (userAddress) {
      getDeveloperProfile(userAddress).then(setProfile);
    }
  }, [userAddress]);
  
  if (!profile) return <div>Loading...</div>;
  
  return (
    <div className="achievement-dashboard">
      <div className="reputation-score">
        <h2>Reputation Score: {profile.reputationScore}</h2>
        <p>Total Achievements: {profile.totalAchievements}</p>
      </div>
      
      <div className="achievements-grid">
        {profile.achievements.map(achievement => (
          <div key={achievement.id} className="achievement-card">
            <h3>{achievement.title}</h3>
            <p>{achievement.description}</p>
            <span className="achievement-type">
              {getAchievementTypeName(achievement.type)}
            </span>
            <span className="achievement-date">
              {achievement.timestamp.toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Backend Integration

#### Automated Achievement Minting
```javascript
// Example: Mint achievement when project is completed
async function onProjectCompleted(projectId, developerId) {
  const project = await getProjectDetails(projectId);
  const developer = await getDeveloperAddress(developerId);
  
  if (await sbt.verifiedDeveloper(developer)) {
    await sbt.mintAchievement(
      developer,
      0, // PROJECT_COMPLETION
      `Completed: ${project.title}`,
      `Successfully delivered ${project.description}`,
      JSON.stringify({
        project_id: projectId,
        project_name: project.title,
        technologies: project.technologies,
        completion_date: new Date().toISOString(),
        client_satisfaction: project.rating
      })
    );
  }
}

// Example: Mint achievement for 5-star review
async function onFiveStarReview(reviewId, developerId) {
  const review = await getReviewDetails(reviewId);
  const developer = await getDeveloperAddress(developerId);
  
  if (review.rating === 5 && await sbt.verifiedDeveloper(developer)) {
    await sbt.mintAchievement(
      developer,
      1, // FIVE_STAR_REVIEW
      "5-Star Excellence",
      `Received 5-star review: "${review.comment}"`,
      JSON.stringify({
        review_id: reviewId,
        reviewer: review.reviewer,
        project_type: review.projectType,
        rating: review.rating,
        review_text: review.comment
      })
    );
  }
}
```

## Security Considerations

### 1. **Access Control**
- Only admin addresses can verify developers
- Only minter addresses can mint achievements
- Emergency pause functionality for security incidents

### 2. **Data Integrity**
- All achievement data is immutable once minted
- Comprehensive event logging for audit trails
- Metadata validation on the frontend

### 3. **Non-transferability**
- All transfer functions are disabled
- Approval functions are disabled
- True soulbound implementation

## Gas Optimization

### Batch Operations
- Use `batchSetDeveloperVerification` for multiple developers
- Consider batching achievement minting for efficiency

### Metadata Storage
- Store large metadata on IPFS and reference by hash
- Keep on-chain metadata minimal for gas efficiency

## Testing

### Run Example Script
```bash
# First deploy the contracts
npx hardhat run scripts/deploy.js --network fuji

# Then run examples (update SBT_ADDRESS in the script)
SBT_ADDRESS=0x... npx hardhat run scripts/sbt-examples.js --network fuji
```

### Test Coverage
The contract includes comprehensive tests for:
- ✅ Achievement minting
- ✅ Developer verification
- ✅ Reputation scoring
- ✅ Access control
- ✅ Non-transferability enforcement
- ✅ Metadata handling

## Future Enhancements

### Planned Features
1. **Achievement Categories**: Organize achievements into skill categories
2. **Expirable Achievements**: Time-limited achievements for active engagement
3. **Achievement Dependencies**: Prerequisites for advanced achievements
4. **Cross-chain Support**: Multi-chain SBT support
5. **Integration APIs**: Standardized APIs for external platform integration

### Community Governance
- DAO-controlled achievement type additions
- Community-driven reputation scoring adjustments
- Decentralized developer verification processes

## Support & Resources

### Documentation
- Smart contract source code with comprehensive comments
- Frontend integration examples
- Backend automation patterns

### Community
- GitHub Issues for bug reports
- Discord for development discussions
- Documentation updates and contributions welcome

---

**Built for XMETX Platform** - Empowering developers with verifiable, permanent proof of their Web3 contributions and achievements.
