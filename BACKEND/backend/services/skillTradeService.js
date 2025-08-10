require('dotenv').config();
const { wallet } = require('../config');
const { ethers } = require('ethers');
const skillTradeABI = require('../contracts/SkillTrade.json').abi;

const skillTrade = new ethers.Contract(process.env.SKILLTRADE_ADDRESS, skillTradeABI, wallet);

module.exports = {
  initiateDeal: async (responder) => {
    const tx = await skillTrade.initiateDeal(responder);
    return await tx.wait();
  },

  deposit: async (dealId, amount) => {
    const value = ethers.parseEther(amount.toString()); // Convert ETH amount to BigNumber Wei
    const tx = await skillTrade.deposit(dealId, { value });
    return await tx.wait();
  },

  confirmCompletion: async (dealId) => {
    const tx = await skillTrade.confirmCompletion(dealId);
    return await tx.wait();
  },

  cancelDeal: async (dealId) => {
    const tx = await skillTrade.cancelDeal(dealId);
    return await tx.wait();
  },

  getDeal: async (dealId) => {
    return await skillTrade.deals(dealId);
  }
};
