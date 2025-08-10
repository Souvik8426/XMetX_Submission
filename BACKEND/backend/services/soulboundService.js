require('dotenv').config();
const { wallet } = require('../config');
const sbtABI = require('../contracts/SoulboundToken.json').abi;
const sbt = new ethers.Contract(process.env.SBT_ADDRESS, sbtABI, wallet);

module.exports = {
  verifyDeveloper: async (address, verified) => {
    const tx = await sbt.setDeveloperVerification(address, verified);
    return await tx.wait();
  },

  mintAchievement: async (to, type, title, description, metadata) => {
    const tx = await sbt.mintAchievement(to, type, title, description, metadata);
    return await tx.wait();
  },

  getAchievements: async (user) => {
    return await sbt.getUserAchievements(user);
  }
};
