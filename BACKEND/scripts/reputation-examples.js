const hre = require('hardhat');

/**
 * Example script demonstrating ReputationToken functionality
 * This script shows how to:
 * 1. Mint tokens for tasks and ratings
 * 2. Stake tokens for various purposes
 * 3. Use premium features and governance
 * 4. Check balances and statistics
 */
async function main() {
  const [deployer, user1, user2, user3, user4] = await hre.ethers.getSigners();
  
  console.log('=== XMETX Reputation Token Examples ===\n');
  
  // Get deployed contract (you'll need to update this address after deployment)
  const REP_ADDRESS = process.env.REP_ADDRESS || 'REPLACE_WITH_DEPLOYED_ADDRESS';
  
  if (REP_ADDRESS === 'REPLACE_WITH_DEPLOYED_ADDRESS') {
    console.log('Please set REP_ADDRESS environment variable with the deployed contract address');
    console.log('Example: REP_ADDRESS=0x1234... npx hardhat run scripts/reputation-examples.js --network fuji');
    return;
  }

  const ReputationToken = await hre.ethers.getContractFactory('ReputationToken');
  const rep = ReputationToken.attach(REP_ADDRESS);

  console.log('Using ReputationToken at:', REP_ADDRESS);
  console.log('Deployer (Admin):', deployer.address);
  console.log('User 1:', user1.address);
  console.log('User 2:', user2.address);
  console.log('User 3:', user3.address);
  console.log('User 4:', user4.address);
  console.log();

  // Step 1: Check initial state
  console.log('=== Step 1: Initial State ===');
  const initialSupply = await rep.totalSupply();
  const deployerBalance = await rep.balanceOf(deployer.address);
  console.log(`Total Supply: ${hre.ethers.formatEther(initialSupply)} REP`);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(deployerBalance)} REP`);
  console.log();

  // Step 2: Mint tokens for task completion
  console.log('=== Step 2: Task Completion Rewards ===');

  // Task Difficulty enum: 0=EASY, 1=MEDIUM, 2=HARD, 3=EXPERT, 4=LEGENDARY
  const taskExamples = [
    { user: user1.address, difficulty: 0, multiplier: 1000, desc: "EASY task (basic bug fix)" },
    { user: user1.address, difficulty: 1, multiplier: 1200, desc: "MEDIUM task with 20% bonus" },
    { user: user2.address, difficulty: 2, multiplier: 1000, desc: "HARD task (full feature implementation)" },
    { user: user2.address, difficulty: 3, multiplier: 1500, desc: "EXPERT task with 50% bonus" },
    { user: user3.address, difficulty: 4, multiplier: 1000, desc: "LEGENDARY task (major protocol upgrade)" }
  ];

  for (const task of taskExamples) {
    try {
      await rep.connect(deployer).mintForTask(task.user, task.difficulty, task.multiplier);
      console.log(`✅ ${task.desc} → ${task.user.substring(0, 8)}...`);
    } catch (error) {
      console.error(`❌ Failed to mint for task:`, error.message);
    }
  }
  console.log();

  // Step 3: Mint tokens for ratings
  console.log('=== Step 3: Rating-Based Rewards ===');

  // Rating Level enum: 0=ONE_STAR, 1=TWO_STAR, 2=THREE_STAR, 3=FOUR_STAR, 4=FIVE_STAR
  const ratingExamples = [
    { user: user1.address, rater: user2.address, rating: 4, desc: "4-star rating" },
    { user: user2.address, rater: user3.address, rating: 4, desc: "5-star rating" },
    { user: user3.address, rater: user1.address, rating: 3, desc: "4-star rating" },
    { user: user1.address, rater: user3.address, rating: 4, desc: "5-star rating" }
  ];

  for (const rating of ratingExamples) {
    try {
      await rep.connect(deployer).mintForRating(rating.user, rating.rater, rating.rating);
      console.log(`✅ ${rating.desc} → ${rating.user.substring(0, 8)}...`);
    } catch (error) {
      console.error(`❌ Failed to mint for rating:`, error.message);
    }
  }
  console.log();

  // Step 4: Check balances and premium tiers
  console.log('=== Step 4: User Balances and Premium Tiers ===');
  
  const users = [user1, user2, user3, user4];
  const tierNames = ['BASIC', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  
  for (const user of users) {
    const balance = await rep.balanceOf(user.address);
    const tier = await rep.getUserPremiumTier(user.address);
    const votes = await rep.getVotes(user.address);
    
    console.log(`${user.address}:`);
    console.log(`  Balance: ${hre.ethers.formatEther(balance)} REP`);
    console.log(`  Premium Tier: ${tierNames[tier]}`);
    console.log(`  Voting Power: ${hre.ethers.formatEther(votes)} votes`);
    console.log();
  }

  // Step 5: Transfer some tokens to demonstrate transferability
  console.log('=== Step 5: Token Transfers ===');
  
  try {
    // Transfer 100 REP from deployer to user4
    const transferAmount = hre.ethers.parseEther("100");
    await rep.connect(deployer).transfer(user4.address, transferAmount);
    console.log(`✅ Transferred 100 REP from deployer to ${user4.address.substring(0, 8)}...`);
    
    const user4Balance = await rep.balanceOf(user4.address);
    console.log(`   User4 new balance: ${hre.ethers.formatEther(user4Balance)} REP`);
  } catch (error) {
    console.error(`❌ Transfer failed:`, error.message);
  }
  console.log();

  // Step 6: Staking functionality
  console.log('=== Step 6: Token Staking ===');
  
  // First, give user1 and user2 enough tokens to stake
  const stakeAmount = hre.ethers.parseEther("500"); // 500 REP to stake
  
  try {
    // Transfer more tokens for staking
    await rep.connect(deployer).transfer(user1.address, stakeAmount);
    await rep.connect(deployer).transfer(user2.address, stakeAmount);
    
    console.log('Transferred additional REP for staking...');
    
    // User1 stakes for moderation rights
    await rep.connect(user1).stakeTokens(0, hre.ethers.parseEther("200")); // StakeType.MODERATION = 0
    console.log(`✅ User1 staked 200 REP for moderation rights`);
    
    // User2 stakes for governance
    await rep.connect(user2).stakeTokens(2, hre.ethers.parseEther("300")); // StakeType.GOVERNANCE = 2
    console.log(`✅ User2 staked 300 REP for governance`);
    
    // Check staking status
    const canModerate1 = await rep.canModerate(user1.address);
    const votingPower2 = await rep.getVotingPower(user2.address);
    
    console.log(`   User1 can moderate: ${canModerate1}`);
    console.log(`   User2 enhanced voting power: ${hre.ethers.formatEther(votingPower2)} votes`);
    
  } catch (error) {
    console.error(`❌ Staking failed:`, error.message);
  }
  console.log();

  // Step 7: Premium features demonstration
  console.log('=== Step 7: Premium Features ===');
  
  for (const user of users) {
    const tier = await rep.getUserPremiumTier(user.address);
    const hasGoldAccess = await rep.hasPremiumAccess(user.address, 2); // PremiumTier.GOLD = 2
    const canFund = await rep.canParticipateInFunding(user.address);
    
    console.log(`${user.address.substring(0, 8)}...:`);
    console.log(`  Premium Tier: ${tierNames[tier]}`);
    console.log(`  Has Gold Access: ${hasGoldAccess}`);
    console.log(`  Can Participate in Funding: ${canFund}`);
  }
  console.log();

  // Step 8: Boost listing demonstration
  console.log('=== Step 8: Listing Boost ===');
  
  try {
    // User1 boosts a listing by burning 50 REP for 24 hours
    const boostCost = hre.ethers.parseEther("50");
    const boostDuration = 24; // 24 hours
    
    const user1BalanceBefore = await rep.balanceOf(user1.address);
    await rep.connect(user1).boostListing(boostCost, boostDuration);
    const user1BalanceAfter = await rep.balanceOf(user1.address);
    
    console.log(`✅ User1 boosted listing for 24 hours (cost: 50 REP)`);
    console.log(`   Balance before: ${hre.ethers.formatEther(user1BalanceBefore)} REP`);
    console.log(`   Balance after: ${hre.ethers.formatEther(user1BalanceAfter)} REP`);
    
  } catch (error) {
    console.error(`❌ Boost failed:`, error.message);
  }
  console.log();

  // Step 9: Platform statistics
  console.log('=== Step 9: Platform Statistics ===');
  
  const stats = await rep.getPlatformStats();
  const currentSupply = await rep.totalSupply();
  
  console.log(`Total Tasks Completed: ${stats.totalTasks}`);
  console.log(`Total Reputation Minted: ${hre.ethers.formatEther(stats.totalMinted)} REP`);
  console.log(`Total Tokens Staked: ${hre.ethers.formatEther(stats.totalStaked)} REP`);
  console.log(`Current Total Supply: ${hre.ethers.formatEther(currentSupply)} REP`);
  console.log();

  // Step 10: Governance simulation
  console.log('=== Step 10: Governance Features ===');
  
  // Delegate voting power to themselves to participate in governance
  await rep.connect(user1).delegate(user1.address);
  await rep.connect(user2).delegate(user2.address);
  await rep.connect(user3).delegate(user3.address);
  
  console.log('Users delegated voting power to themselves');
  
  // Check voting power after delegation
  for (let i = 1; i <= 3; i++) {
    const user = users[i-1];
    const votes = await rep.getVotes(user.address);
    const enhancedVotes = await rep.getVotingPower(user.address);
    
    console.log(`User${i} standard voting power: ${hre.ethers.formatEther(votes)} votes`);
    console.log(`User${i} enhanced voting power: ${hre.ethers.formatEther(enhancedVotes)} votes`);
  }
  console.log();

  // Step 11: Final balances
  console.log('=== Step 11: Final State ===');
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const balance = await rep.balanceOf(user.address);
    const tier = await rep.getUserPremiumTier(user.address);
    const stakes = await rep.getUserStakes(user.address);
    
    console.log(`User${i+1} (${user.address}):`);
    console.log(`  Balance: ${hre.ethers.formatEther(balance)} REP`);
    console.log(`  Premium Tier: ${tierNames[tier]}`);
    
    // Check active stakes
    const stakeTypes = ['Moderation', 'Funding', 'Governance', 'Boost'];
    for (let j = 0; j < stakes.length; j++) {
      if (stakes[j].active) {
        console.log(`  Active Stake: ${stakeTypes[j]} - ${hre.ethers.formatEther(stakes[j].amount)} REP`);
      }
    }
    console.log();
  }

  console.log('=== Examples Complete ===');
  console.log('✅ All reputation token operations completed successfully!');
  console.log('\nKey Features Demonstrated:');
  console.log('• Task completion rewards with difficulty-based scaling');
  console.log('• Rating-based token rewards');
  console.log('• Automatic premium tier calculation');
  console.log('• Token staking for utility features');
  console.log('• Enhanced governance voting power');
  console.log('• Listing boost through token burning');
  console.log('• Full ERC-20 transferability');
  console.log('• Platform statistics tracking');
  console.log('\nNext Integration Steps:');
  console.log('1. Connect to your frontend for user dashboard');
  console.log('2. Integrate with task completion system');
  console.log('3. Set up automated rating rewards');
  console.log('4. Implement governance voting interface');
  console.log('5. Create premium feature gates');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
