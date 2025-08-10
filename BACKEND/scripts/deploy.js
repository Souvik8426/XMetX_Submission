const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy SkillTrade contract
  const ownerAddress = deployer.address; // platform owner (escrow fee receiver)

  const SkillTrade = await hre.ethers.getContractFactory('SkillTrade');
  const skillTrade = await SkillTrade.deploy(ownerAddress);
  await skillTrade.waitForDeployment();
  const skillTradeAddress = await skillTrade.getAddress();

  console.log('SkillTrade deployed to:', skillTradeAddress);

  // Deploy SoulboundToken contract
  const SoulboundToken = await hre.ethers.getContractFactory('SoulboundToken');
  const soulboundToken = await SoulboundToken.deploy();
  await soulboundToken.waitForDeployment();
  const soulboundTokenAddress = await soulboundToken.getAddress();

  console.log('SoulboundToken deployed to:', soulboundTokenAddress);

  // Deploy ReputationToken contract
  const ReputationToken = await hre.ethers.getContractFactory('ReputationToken');
  const reputationToken = await ReputationToken.deploy();
  await reputationToken.waitForDeployment();
  const reputationTokenAddress = await reputationToken.getAddress();

  console.log('ReputationToken deployed to:', reputationTokenAddress);

  // Grant minter role to the deployer/platform
  const MINTER_ROLE = await soulboundToken.MINTER_ROLE();
  const ADMIN_ROLE = await soulboundToken.ADMIN_ROLE();
  
  console.log('Setting up roles...');
  console.log('Admin role granted to:', deployer.address);
  console.log('Minter role granted to:', deployer.address);

  // Verify some example developers (you can add more addresses here)
  const exampleDevelopers = [
    deployer.address, // The deployer becomes a verified developer for testing
    // Add more addresses here as needed
  ];

  if (exampleDevelopers.length > 0) {
    console.log('Verifying example developers...');
    await soulboundToken.batchSetDeveloperVerification(exampleDevelopers, true);
    console.log('Verified developers:', exampleDevelopers);
  }

  // Setup ReputationToken roles
  const REP_MINTER_ROLE = await reputationToken.MINTER_ROLE();
  const REP_ADMIN_ROLE = await reputationToken.ADMIN_ROLE();
  
  console.log('Setting up ReputationToken roles...');
  console.log('REP Admin role granted to:', deployer.address);
  console.log('REP Minter role granted to:', deployer.address);

  // Check initial REP token supply
  const initialSupply = await reputationToken.totalSupply();
  const deployerBalance = await reputationToken.balanceOf(deployer.address);
  console.log('Initial REP supply:', hre.ethers.formatEther(initialSupply));
  console.log('Deployer REP balance:', hre.ethers.formatEther(deployerBalance));

  console.log('\n=== Deployment Summary ===');
  console.log('SkillTrade address:', skillTradeAddress);
  console.log('SoulboundToken address:', soulboundTokenAddress);
  console.log('ReputationToken address:', reputationTokenAddress);
  console.log('Deployer address:', deployer.address);
  console.log('Verified developers:', exampleDevelopers.length);
  console.log('Initial REP supply:', hre.ethers.formatEther(initialSupply), 'REP');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
