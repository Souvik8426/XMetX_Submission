const hre = require('hardhat');

/**
 * Example script demonstrating SoulboundToken functionality
 * This script shows how to:
 * 1. Verify developers
 * 2. Mint various types of achievements
 * 3. Query reputation data
 */
async function main() {
  const [deployer, developer1, developer2, developer3] = await hre.ethers.getSigners();
  
  console.log('=== XMETX SoulboundToken Examples ===\n');
  
  // Get deployed contract (you'll need to update this address after deployment)
  const SBT_ADDRESS = process.env.SBT_ADDRESS || 'REPLACE_WITH_DEPLOYED_ADDRESS';
  
  if (SBT_ADDRESS === 'REPLACE_WITH_DEPLOYED_ADDRESS') {
    console.log('Please set SBT_ADDRESS environment variable with the deployed contract address');
    console.log('Example: SBT_ADDRESS=0x1234... npx hardhat run scripts/sbt-examples.js --network fuji');
    return;
  }

  const SoulboundToken = await hre.ethers.getContractFactory('SoulboundToken');
  const sbt = SoulboundToken.attach(SBT_ADDRESS);

  console.log('Using SoulboundToken at:', SBT_ADDRESS);
  console.log('Deployer (Admin):', deployer.address);
  console.log('Developer 1:', developer1.address);
  console.log('Developer 2:', developer2.address);
  console.log('Developer 3:', developer3.address);
  console.log();

  // Step 1: Verify developers
  console.log('=== Step 1: Verifying Developers ===');
  
  const developersToVerify = [developer1.address, developer2.address, developer3.address];
  
  await sbt.connect(deployer).batchSetDeveloperVerification(developersToVerify, true);
  console.log('✅ Verified developers:', developersToVerify.length);
  
  // Check verification status
  for (const dev of developersToVerify) {
    const isVerified = await sbt.verifiedDeveloper(dev);
    console.log(`   ${dev}: ${isVerified ? 'Verified' : 'Not Verified'}`);
  }
  console.log();

  // Step 2: Mint achievements
  console.log('=== Step 2: Minting Achievements ===');

  // Achievement Type enum values:
  // 0: PROJECT_COMPLETION
  // 1: FIVE_STAR_REVIEW  
  // 2: DAO_PROPOSAL_PASSED
  // 3: SKILL_VERIFICATION
  // 4: COLLABORATION_BADGE
  // 5: MENTOR_ACHIEVEMENT
  // 6: COMMUNITY_CONTRIBUTION

  const achievements = [
    {
      recipient: developer1.address,
      type: 0, // PROJECT_COMPLETION
      title: "Full-Stack DeFi Application",
      description: "Successfully completed a full-stack DeFi application using React, Node.js, and Solidity with smart contract integration",
      metadata: JSON.stringify({
        project_name: "DeFi Trading Platform",
        technologies: ["React", "Node.js", "Solidity", "Web3.js"],
        completion_date: "2024-01-15",
        repository: "https://github.com/example/defi-platform",
        skills_demonstrated: ["Smart Contract Development", "Frontend Development", "API Integration"]
      })
    },
    {
      recipient: developer1.address,
      type: 1, // FIVE_STAR_REVIEW
      title: "5-Star Review: Backend Excellence",
      description: "Received a 5-star review for exceptional backend development skills and timely delivery",
      metadata: JSON.stringify({
        reviewer: "TechLead123",
        project_type: "Backend API Development",
        rating: 5,
        review_text: "Outstanding work on the backend API. Clean code, excellent documentation, and delivered ahead of schedule.",
        skills_highlighted: ["Node.js", "Database Design", "API Architecture"]
      })
    },
    {
      recipient: developer2.address,
      type: 2, // DAO_PROPOSAL_PASSED
      title: "DAO Proposal: Platform Improvement",
      description: "Successfully proposed and passed a DAO proposal to implement new developer verification mechanisms",
      metadata: JSON.stringify({
        proposal_id: "PROP-2024-001",
        proposal_title: "Enhanced Developer Verification System",
        votes_for: 1250,
        votes_against: 180,
        voting_power: "78.5%",
        implementation_status: "Approved"
      })
    },
    {
      recipient: developer2.address,
      type: 3, // SKILL_VERIFICATION
      title: "Solidity Expert Certification",
      description: "Verified expertise in Solidity smart contract development through comprehensive skill assessment",
      metadata: JSON.stringify({
        skill: "Solidity Development",
        verification_method: "Code Review + Technical Interview",
        assessor: "BlockchainExpert.eth",
        score: "95/100",
        certification_date: "2024-01-20"
      })
    },
    {
      recipient: developer3.address,
      type: 4, // COLLABORATION_BADGE
      title: "Cross-Team Collaboration",
      description: "Demonstrated exceptional collaboration skills while working across multiple development teams",
      metadata: JSON.stringify({
        project: "Multi-Chain Bridge Protocol",
        teams_involved: ["Backend", "Smart Contracts", "Frontend", "DevOps"],
        collaboration_duration: "3 months",
        team_feedback_score: "4.8/5.0"
      })
    },
    {
      recipient: developer3.address,
      type: 5, // MENTOR_ACHIEVEMENT  
      title: "Junior Developer Mentor",
      description: "Successfully mentored 5 junior developers, helping them complete their first blockchain projects",
      metadata: JSON.stringify({
        mentees_count: 5,
        mentoring_duration: "6 months",
        success_rate: "100%",
        technologies_taught: ["Solidity", "Web3.js", "React", "Testing"],
        mentee_satisfaction: "4.9/5.0"
      })
    }
  ];

  console.log('Minting achievements...');
  const mintedTokenIds = [];

  for (let i = 0; i < achievements.length; i++) {
    const achievement = achievements[i];
    
    try {
      const tx = await sbt.connect(deployer).mintAchievement(
        achievement.recipient,
        achievement.type,
        achievement.title,
        achievement.description,
        achievement.metadata
      );
      
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === 'AchievementMinted');
      const tokenId = event.args.tokenId.toString();
      
      mintedTokenIds.push(tokenId);
      console.log(`✅ Minted Token #${tokenId}: ${achievement.title} → ${achievement.recipient.substring(0, 8)}...`);
      
    } catch (error) {
      console.error(`❌ Failed to mint achievement ${i + 1}:`, error.message);
    }
  }
  console.log();

  // Step 3: Query reputation data
  console.log('=== Step 3: Querying Reputation Data ===');

  for (const developer of [developer1, developer2, developer3]) {
    console.log(`\n--- ${developer.address} ---`);
    
    // Get all achievements
    const userAchievements = await sbt.getUserAchievements(developer.address);
    console.log(`Total Achievements: ${userAchievements.length}`);
    
    // Get reputation score
    const reputationScore = await sbt.getReputationScore(developer.address);
    console.log(`Reputation Score: ${reputationScore}`);
    
    // Get achievement breakdown by type
    const achievementTypes = [
      'Project Completion',
      '5-Star Review', 
      'DAO Proposal Passed',
      'Skill Verification',
      'Collaboration Badge',
      'Mentor Achievement',
      'Community Contribution'
    ];
    
    console.log('Achievement Breakdown:');
    for (let typeIndex = 0; typeIndex < achievementTypes.length; typeIndex++) {
      const count = await sbt.getUserAchievementCount(developer.address, typeIndex);
      if (count > 0) {
        console.log(`  ${achievementTypes[typeIndex]}: ${count}`);
      }
    }
    
    // Show detailed achievement info
    if (userAchievements.length > 0) {
      console.log('\nDetailed Achievements:');
      for (const tokenId of userAchievements) {
        const achievement = await sbt.getAchievement(tokenId);
        console.log(`  Token #${tokenId}: ${achievement.title}`);
        console.log(`    Type: ${achievementTypes[achievement.achievementType]}`);
        console.log(`    Date: ${new Date(achievement.timestamp * 1000).toLocaleDateString()}`);
        console.log(`    Verified: ${achievement.verified}`);
      }
    }
  }

  // Step 4: Global statistics
  console.log('\n=== Step 4: Global Platform Statistics ===');
  
  const totalAchievements = await sbt.totalAchievements();
  console.log(`Total Achievements Minted: ${totalAchievements}`);
  
  console.log('\nAchievement Type Distribution:');
  const achievementTypes = [
    'Project Completion',
    '5-Star Review', 
    'DAO Proposal Passed',
    'Skill Verification',
    'Collaboration Badge',
    'Mentor Achievement',
    'Community Contribution'
  ];
  
  for (let typeIndex = 0; typeIndex < achievementTypes.length; typeIndex++) {
    const count = await sbt.getGlobalAchievementCount(typeIndex);
    console.log(`  ${achievementTypes[typeIndex]}: ${count}`);
  }

  console.log('\n=== Examples Complete ===');
  console.log('✅ All example operations completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Integrate the SBT contract with your frontend application');
  console.log('2. Set up automated achievement minting based on platform events');
  console.log('3. Create a reputation dashboard using the query functions');
  console.log('4. Implement additional achievement types as needed');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
