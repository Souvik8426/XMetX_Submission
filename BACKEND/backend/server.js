const express = require('express');
const cors = require('cors');
require('dotenv').config();

const skillTradeService = require('./services/skillTradeService');
const reputationService = require('./services/reputationService');
const soulboundService = require('./services/soulboundService');

const app = express();
app.use(cors());
app.use(express.json());

// SkillTrade APIs
app.post('/deal/initiate', async (req, res) => {
  try {
    const result = await skillTradeService.initiateDeal(req.body.responder);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/deal/deposit', async (req, res) => {
  const { dealId, amount } = req.body;
  try {
    const result = await skillTradeService.deposit(dealId, amount);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/deal/confirm', async (req, res) => {
  try {
    const result = await skillTradeService.confirmCompletion(req.body.dealId);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/deal/cancel', async (req, res) => {
  try {
    const result = await skillTradeService.cancelDeal(req.body.dealId);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/deal/:id', async (req, res) => {
  try {
    const deal = await skillTradeService.getDeal(req.params.id);
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ReputationToken APIs
app.post('/rep/mint/task', async (req, res) => {
  const { user, difficulty, multiplier } = req.body;
  try {
    const result = await reputationService.mintForTask(user, difficulty, multiplier);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rep/mint/rating', async (req, res) => {
  const { user, rater, rating } = req.body;
  try {
    const result = await reputationService.mintForRating(user, rater, rating);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rep/stake', async (req, res) => {
  const { stakeType, amount } = req.body;
  try {
    const result = await reputationService.stakeTokens(stakeType, amount);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/rep/unstake', async (req, res) => {
  const { stakeType } = req.body;
  try {
    const result = await reputationService.unstakeTokens(stakeType);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/rep/balance/:address', async (req, res) => {
  try {
    const balance = await reputationService.getBalance(req.params.address);
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SoulboundToken APIs
app.post('/sbt/verify', async (req, res) => {
  const { address, verified } = req.body;
  try {
    const result = await soulboundService.verifyDeveloper(address, verified);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/sbt/mint', async (req, res) => {
  const { to, type, title, description, metadata } = req.body;
  try {
    const result = await soulboundService.mintAchievement(to, type, title, description, metadata);
    res.json({ txHash: result.transactionHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/sbt/achievements/:address', async (req, res) => {
  try {
    const achievements = await soulboundService.getAchievements(req.params.address);
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`xmetx backend running on port ${PORT}`);
});
