require('dotenv').config();
const { wallet } = require('../config');
const { ethers } = require('ethers');
const repABI = require('../contracts/ReputationToken.json').abi;

const rep = new ethers.Contract(process.env.REP_ADDRESS, repABI, wallet);

module.exports = {
  mintForTask: async (user, difficulty, multiplier) => {
    const tx = await rep.mintForTask(user, difficulty, multiplier);
    return await tx.wait();
  },

  mintForRating: async (user, rater, rating) => {
    const tx = await rep.mintForRating(user, rater, rating);
    return await tx.wait();
  },

  stakeTokens: async (stakeType, amount) => {
    const val = ethers.parseEther(amount.toString());
    const tx = await rep.stakeTokens(stakeType, val);
    return await tx.wait();
  },

  unstakeTokens: async (stakeType) => {
    const tx = await rep.unstakeTokens(stakeType);
    return await tx.wait();
  },

  getBalance: async (user) => {
    const balance = await rep.balanceOf(user);
    return ethers.formatEther(balance);
  }
};
