// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title XMETX Reputation Token (REP)
/// @notice ERC-20 token for gamified reputation system with governance and utility features
/// @dev Implements task-based minting, staking, governance, and premium features
contract ReputationToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit, ERC20Votes, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    // Task Difficulty Levels
    enum TaskDifficulty { 
        EASY,       // 10 REP
        MEDIUM,     // 25 REP
        HARD,       // 50 REP
        EXPERT,     // 100 REP
        LEGENDARY   // 250 REP
    }

    // Rating-based rewards (5-star system)
    enum RatingLevel {
        ONE_STAR,    // 5 REP
        TWO_STAR,    // 10 REP
        THREE_STAR,  // 20 REP
        FOUR_STAR,   // 40 REP
        FIVE_STAR    // 80 REP
    }

    // Premium Feature Tiers
    enum PremiumTier {
        BASIC,       // 0 REP required
        SILVER,      // 1,000 REP required
        GOLD,        // 5,000 REP required
        PLATINUM,    // 15,000 REP required
        DIAMOND      // 50,000 REP required
    }

    // Staking Pool Types
    enum StakeType {
        MODERATION,  // For platform moderation rights
        FUNDING,     // For funding pool participation
        GOVERNANCE,  // For enhanced governance voting power
        BOOST        // For listing boost features
    }

    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lockPeriod;
        StakeType stakeType;
        bool active;
    }

    struct TaskReward {
        TaskDifficulty difficulty;
        uint256 baseReward;
        uint256 multiplier; // 1000 = 1x, 1500 = 1.5x
        bool active;
    }

    // State variables
    Counters.Counter private _taskCounter;
    
    mapping(TaskDifficulty => uint256) public taskRewards;
    mapping(RatingLevel => uint256) public ratingRewards;
    mapping(PremiumTier => uint256) public premiumRequirements;
    mapping(address => mapping(StakeType => StakeInfo)) public userStakes;
    mapping(address => uint256) public totalStaked;
    mapping(address => PremiumTier) public userPremiumTier;
    mapping(address => bool) public authorizedMinters;
    
    // Platform statistics
    uint256 public totalTasksCompleted;
    uint256 public totalReputationMinted;
    uint256 public totalStakedTokens;
    
    // Staking parameters
    uint256 public constant MIN_STAKE_AMOUNT = 100 * 10**18; // 100 REP minimum
    uint256 public constant MODERATION_LOCK_PERIOD = 30 days;
    uint256 public constant FUNDING_LOCK_PERIOD = 90 days;
    uint256 public constant GOVERNANCE_LOCK_PERIOD = 60 days;
    uint256 public constant BOOST_LOCK_PERIOD = 7 days;

    // Events
    event TaskCompleted(address indexed user, uint256 indexed taskId, TaskDifficulty difficulty, uint256 rewardAmount);
    event RatingReward(address indexed user, address indexed rater, RatingLevel rating, uint256 rewardAmount);
    event TokensStaked(address indexed user, StakeType stakeType, uint256 amount, uint256 lockPeriod);
    event TokensUnstaked(address indexed user, StakeType stakeType, uint256 amount);
    event PremiumTierUpdated(address indexed user, PremiumTier oldTier, PremiumTier newTier);
    event RewardParametersUpdated(TaskDifficulty difficulty, uint256 newReward);
    event BoostActivated(address indexed user, uint256 cost, uint256 duration);

    constructor() ERC20("XMETX Reputation Token", "REP") ERC20Permit("XMETX Reputation Token") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        // Initialize reward structures
        _initializeRewards();
        
        // Mint initial supply to deployer (1M tokens)
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    /// @notice Initialize default reward parameters
    function _initializeRewards() internal {
        // Task difficulty rewards (base amounts)
        taskRewards[TaskDifficulty.EASY] = 10 * 10**decimals();
        taskRewards[TaskDifficulty.MEDIUM] = 25 * 10**decimals();
        taskRewards[TaskDifficulty.HARD] = 50 * 10**decimals();
        taskRewards[TaskDifficulty.EXPERT] = 100 * 10**decimals();
        taskRewards[TaskDifficulty.LEGENDARY] = 250 * 10**decimals();

        // Rating-based rewards
        ratingRewards[RatingLevel.ONE_STAR] = 5 * 10**decimals();
        ratingRewards[RatingLevel.TWO_STAR] = 10 * 10**decimals();
        ratingRewards[RatingLevel.THREE_STAR] = 20 * 10**decimals();
        ratingRewards[RatingLevel.FOUR_STAR] = 40 * 10**decimals();
        ratingRewards[RatingLevel.FIVE_STAR] = 80 * 10**decimals();

        // Premium tier requirements
        premiumRequirements[PremiumTier.BASIC] = 0;
        premiumRequirements[PremiumTier.SILVER] = 1000 * 10**decimals();
        premiumRequirements[PremiumTier.GOLD] = 5000 * 10**decimals();
        premiumRequirements[PremiumTier.PLATINUM] = 15000 * 10**decimals();
        premiumRequirements[PremiumTier.DIAMOND] = 50000 * 10**decimals();
    }

    /// @notice Mint tokens for completing a task
    /// @param user The user who completed the task
    /// @param difficulty The difficulty level of the completed task
    /// @param multiplier Bonus multiplier (1000 = 1x, 1500 = 1.5x)
    function mintForTask(address user, TaskDifficulty difficulty, uint256 multiplier) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
    {
        require(user != address(0), "Invalid user address");
        require(multiplier >= 1000, "Multiplier must be at least 1x (1000)");
        
        uint256 baseReward = taskRewards[difficulty];
        uint256 finalReward = (baseReward * multiplier) / 1000;
        
        _mint(user, finalReward);
        
        totalTasksCompleted++;
        totalReputationMinted += finalReward;
        _taskCounter.increment();
        
        _updatePremiumTier(user);
        
        emit TaskCompleted(user, _taskCounter.current(), difficulty, finalReward);
    }

    /// @notice Mint tokens for receiving a rating
    /// @param user The user who received the rating
    /// @param rater The address of the person giving the rating
    /// @param rating The rating level (1-5 stars)
    function mintForRating(address user, address rater, RatingLevel rating) 
        external 
        onlyRole(MINTER_ROLE) 
        whenNotPaused 
    {
        require(user != address(0), "Invalid user address");
        require(rater != address(0), "Invalid rater address");
        require(user != rater, "Cannot rate yourself");
        
        uint256 rewardAmount = ratingRewards[rating];
        
        _mint(user, rewardAmount);
        totalReputationMinted += rewardAmount;
        
        _updatePremiumTier(user);
        
        emit RatingReward(user, rater, rating, rewardAmount);
    }

    /// @notice Stake tokens for specific utility purposes
    /// @param stakeType The type of staking (moderation, funding, governance, boost)
    /// @param amount The amount of tokens to stake
    function stakeTokens(StakeType stakeType, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(amount >= MIN_STAKE_AMOUNT, "Amount below minimum stake");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(!userStakes[msg.sender][stakeType].active, "Already staked for this type");
        
        uint256 lockPeriod = _getLockPeriod(stakeType);
        
        // Transfer tokens to contract
        _transfer(msg.sender, address(this), amount);
        
        userStakes[msg.sender][stakeType] = StakeInfo({
            amount: amount,
            timestamp: block.timestamp,
            lockPeriod: lockPeriod,
            stakeType: stakeType,
            active: true
        });
        
        totalStaked[msg.sender] += amount;
        totalStakedTokens += amount;
        
        emit TokensStaked(msg.sender, stakeType, amount, lockPeriod);
    }

    /// @notice Unstake tokens after lock period
    /// @param stakeType The type of stake to unstake
    function unstakeTokens(StakeType stakeType) external nonReentrant {
        StakeInfo storage stake = userStakes[msg.sender][stakeType];
        require(stake.active, "No active stake of this type");
        require(
            block.timestamp >= stake.timestamp + stake.lockPeriod, 
            "Stake still locked"
        );
        
        uint256 amount = stake.amount;
        
        // Reset stake info
        stake.active = false;
        stake.amount = 0;
        
        totalStaked[msg.sender] -= amount;
        totalStakedTokens -= amount;
        
        // Transfer tokens back to user
        _transfer(address(this), msg.sender, amount);
        
        emit TokensUnstaked(msg.sender, stakeType, amount);
    }

    /// @notice Boost listing visibility by burning tokens
    /// @param cost The amount of tokens to burn for boost
    /// @param duration The duration of boost in hours
    function boostListing(uint256 cost, uint256 duration) external {
        require(cost > 0, "Cost must be positive");
        require(duration > 0 && duration <= 168, "Duration must be 1-168 hours"); // Max 1 week
        require(balanceOf(msg.sender) >= cost, "Insufficient balance");
        
        _burn(msg.sender, cost);
        
        emit BoostActivated(msg.sender, cost, duration);
    }

    /// @notice Check if user has access to premium features
    /// @param user The user address to check
    /// @param requiredTier The minimum tier required
    /// @return True if user has access
    function hasPremiumAccess(address user, PremiumTier requiredTier) 
        external 
        view 
        returns (bool) 
    {
        return userPremiumTier[user] >= requiredTier;
    }

    /// @notice Check if user can moderate (has staked for moderation)
    /// @param user The user address to check
    /// @return True if user can moderate
    function canModerate(address user) external view returns (bool) {
        return userStakes[user][StakeType.MODERATION].active;
    }

    /// @notice Check if user can participate in funding pools
    /// @param user The user address to check
    /// @return True if user can participate in funding
    function canParticipateInFunding(address user) external view returns (bool) {
        return userStakes[user][StakeType.FUNDING].active;
    }

    /// @notice Get enhanced voting power for governance (includes staking bonus)
    /// @param user The user address
    /// @return Enhanced voting power
    function getVotingPower(address user) external view returns (uint256) {
        uint256 baseVotes = getVotes(user);
        
        // Add bonus for governance staking
        if (userStakes[user][StakeType.GOVERNANCE].active) {
            uint256 stakedAmount = userStakes[user][StakeType.GOVERNANCE].amount;
            uint256 bonus = stakedAmount / 2; // 50% bonus for staked tokens
            return baseVotes + bonus;
        }
        
        return baseVotes;
    }

    /// @notice Update reward parameters (admin only)
    /// @param difficulty The task difficulty to update
    /// @param newReward The new reward amount
    function updateTaskReward(TaskDifficulty difficulty, uint256 newReward) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        taskRewards[difficulty] = newReward;
        emit RewardParametersUpdated(difficulty, newReward);
    }

    /// @notice Update rating reward (admin only)
    /// @param rating The rating level to update
    /// @param newReward The new reward amount
    function updateRatingReward(RatingLevel rating, uint256 newReward) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        ratingRewards[rating] = newReward;
    }

    /// @notice Update premium tier requirements (admin only)
    /// @param tier The premium tier to update
    /// @param newRequirement The new token requirement
    function updatePremiumRequirement(PremiumTier tier, uint256 newRequirement) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        premiumRequirements[tier] = newRequirement;
    }

    /// @notice Get user's current premium tier
    /// @param user The user address
    /// @return The user's premium tier
    function getUserPremiumTier(address user) external view returns (PremiumTier) {
        return userPremiumTier[user];
    }

    /// @notice Get all stake information for a user
    /// @param user The user address
    /// @return Array of stake information for each stake type
    function getUserStakes(address user) external view returns (StakeInfo[4] memory) {
        return [
            userStakes[user][StakeType.MODERATION],
            userStakes[user][StakeType.FUNDING], 
            userStakes[user][StakeType.GOVERNANCE],
            userStakes[user][StakeType.BOOST]
        ];
    }

    /// @notice Get platform statistics
    /// @return totalTasks Total tasks completed
    /// @return totalMinted Total reputation tokens minted
    /// @return totalStakedAmount Total tokens currently staked
    function getPlatformStats() external view returns (uint256 totalTasks, uint256 totalMinted, uint256 totalStakedAmount) {
        return (totalTasksCompleted, totalReputationMinted, totalStakedTokens);
    }

    /// @notice Pause the contract (emergency function)
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /// @notice Unpause the contract
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Internal function to update user's premium tier
    function _updatePremiumTier(address user) internal {
        uint256 balance = balanceOf(user);
        PremiumTier oldTier = userPremiumTier[user];
        PremiumTier newTier = PremiumTier.BASIC;
        
        if (balance >= premiumRequirements[PremiumTier.DIAMOND]) {
            newTier = PremiumTier.DIAMOND;
        } else if (balance >= premiumRequirements[PremiumTier.PLATINUM]) {
            newTier = PremiumTier.PLATINUM;
        } else if (balance >= premiumRequirements[PremiumTier.GOLD]) {
            newTier = PremiumTier.GOLD;
        } else if (balance >= premiumRequirements[PremiumTier.SILVER]) {
            newTier = PremiumTier.SILVER;
        }
        
        if (newTier != oldTier) {
            userPremiumTier[user] = newTier;
            emit PremiumTierUpdated(user, oldTier, newTier);
        }
    }

    /// @notice Get lock period for stake type
    function _getLockPeriod(StakeType stakeType) internal pure returns (uint256) {
        if (stakeType == StakeType.MODERATION) return MODERATION_LOCK_PERIOD;
        if (stakeType == StakeType.FUNDING) return FUNDING_LOCK_PERIOD;
        if (stakeType == StakeType.GOVERNANCE) return GOVERNANCE_LOCK_PERIOD;
        if (stakeType == StakeType.BOOST) return BOOST_LOCK_PERIOD;
        return 0;
    }

    // Required overrides for multiple inheritance
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    function _afterTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._afterTokenTransfer(from, to, amount);
        
        // Update premium tiers for both sender and receiver
        if (from != address(0)) _updatePremiumTier(from);
        if (to != address(0)) _updatePremiumTier(to);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._burn(account, amount);
    }
}
