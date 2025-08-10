// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/// @title SoulboundToken - Non-transferable NFTs for Web3 Reputation
/// @notice Implements Soulbound Tokens (SBTs) that are permanently bound to recipient wallets
/// @dev Based on ERC721 but with all transfer functionality disabled
contract SoulboundToken is ERC721, AccessControl, Pausable {
    using Counters for Counters.Counter;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Achievement Types
    enum AchievementType {
        PROJECT_COMPLETION,
        FIVE_STAR_REVIEW,
        DAO_PROPOSAL_PASSED,
        SKILL_VERIFICATION,
        COLLABORATION_BADGE,
        MENTOR_ACHIEVEMENT,
        COMMUNITY_CONTRIBUTION
    }

    struct Achievement {
        AchievementType achievementType;
        string title;
        string description;
        string metadata; // JSON metadata string
        uint256 timestamp;
        address issuer;
        bool verified;
    }

    // State variables
    Counters.Counter private _tokenIdCounter;
    mapping(uint256 => Achievement) public achievements;
    mapping(address => uint256[]) public userAchievements;
    mapping(address => bool) public verifiedDevelopers;
    mapping(AchievementType => uint256) public achievementCounts;
    
    // Events
    event AchievementMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        AchievementType indexed achievementType,
        string title,
        string description
    );
    
    event DeveloperVerified(address indexed developer, bool verified);
    event AchievementVerified(uint256 indexed tokenId, address indexed verifier);

    constructor() ERC721("XMETX Reputation SBT", "XREP") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /// @notice Mint a new Soulbound Token to a verified developer
    /// @param to The address of the verified developer
    /// @param achievementType The type of achievement being awarded
    /// @param title Short title of the achievement
    /// @param description Detailed description of the achievement
    /// @param metadata JSON metadata string containing additional details
    function mintAchievement(
        address to,
        AchievementType achievementType,
        string memory title,
        string memory description,
        string memory metadata
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        require(verifiedDevelopers[to], "Recipient must be a verified developer");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        achievements[tokenId] = Achievement({
            achievementType: achievementType,
            title: title,
            description: description,
            metadata: metadata,
            timestamp: block.timestamp,
            issuer: msg.sender,
            verified: true
        });

        userAchievements[to].push(tokenId);
        achievementCounts[achievementType]++;

        _safeMint(to, tokenId);

        emit AchievementMinted(to, tokenId, achievementType, title, description);
        
        return tokenId;
    }

    /// @notice Verify or unverify a developer address
    /// @param developer The developer address to verify/unverify
    /// @param verified True to verify, false to unverify
    function setDeveloperVerification(address developer, bool verified) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(developer != address(0), "Invalid developer address");
        verifiedDevelopers[developer] = verified;
        emit DeveloperVerified(developer, verified);
    }

    /// @notice Batch verify multiple developers
    /// @param developers Array of developer addresses
    /// @param verified True to verify, false to unverify
    function batchSetDeveloperVerification(address[] memory developers, bool verified)
        external
        onlyRole(ADMIN_ROLE)
    {
        for (uint256 i = 0; i < developers.length; i++) {
            require(developers[i] != address(0), "Invalid developer address");
            verifiedDevelopers[developers[i]] = verified;
            emit DeveloperVerified(developers[i], verified);
        }
    }

    /// @notice Get all achievement token IDs for a user
    /// @param user The user address
    /// @return Array of token IDs
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        return userAchievements[user];
    }

    /// @notice Get achievement details by token ID
    /// @param tokenId The token ID
    /// @return Achievement struct containing all details
    function getAchievement(uint256 tokenId) external view returns (Achievement memory) {
        require(_exists(tokenId), "Achievement does not exist");
        return achievements[tokenId];
    }

    /// @notice Get count of specific achievement type for a user
    /// @param user The user address
    /// @param achievementType The achievement type to count
    /// @return Number of achievements of the specified type
    function getUserAchievementCount(address user, AchievementType achievementType) 
        external 
        view 
        returns (uint256) 
    {
        uint256 count = 0;
        uint256[] memory userTokens = userAchievements[user];
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (achievements[userTokens[i]].achievementType == achievementType) {
                count++;
            }
        }
        
        return count;
    }

    /// @notice Get reputation score for a user based on weighted achievements
    /// @param user The user address
    /// @return Calculated reputation score
    function getReputationScore(address user) external view returns (uint256) {
        if (!verifiedDeveloper(user)) return 0;
        
        uint256 score = 0;
        uint256[] memory userTokens = userAchievements[user];
        
        for (uint256 i = 0; i < userTokens.length; i++) {
            AchievementType aType = achievements[userTokens[i]].achievementType;
            
            // Weight different achievement types
            if (aType == AchievementType.PROJECT_COMPLETION) {
                score += 100;
            } else if (aType == AchievementType.FIVE_STAR_REVIEW) {
                score += 150;
            } else if (aType == AchievementType.DAO_PROPOSAL_PASSED) {
                score += 200;
            } else if (aType == AchievementType.SKILL_VERIFICATION) {
                score += 75;
            } else if (aType == AchievementType.COLLABORATION_BADGE) {
                score += 80;
            } else if (aType == AchievementType.MENTOR_ACHIEVEMENT) {
                score += 120;
            } else if (aType == AchievementType.COMMUNITY_CONTRIBUTION) {
                score += 90;
            }
        }
        
        return score;
    }

    /// @notice Check if an address is a verified developer
    /// @param developer The address to check
    /// @return True if the address is verified
    function verifiedDeveloper(address developer) public view returns (bool) {
        return verifiedDevelopers[developer];
    }

    /// @notice Get total number of minted achievements
    /// @return Total count of achievements
    function totalAchievements() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /// @notice Get count of specific achievement type across all users
    /// @param achievementType The achievement type
    /// @return Count of achievements of this type
    function getGlobalAchievementCount(AchievementType achievementType) 
        external 
        view 
        returns (uint256) 
    {
        return achievementCounts[achievementType];
    }

    /// @notice Pause the contract (emergency function)
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /// @notice Unpause the contract
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    // Override transfer functions to make tokens non-transferable (Soulbound)
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        require(from == address(0), "Soulbound tokens cannot be transferred");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function approve(address, uint256) public pure override {
        revert("Soulbound tokens cannot be approved for transfer");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound tokens cannot be approved for transfer");
    }

    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound tokens cannot be transferred");
    }

    function safeTransferFrom(address, address, uint256) public pure override {
        revert("Soulbound tokens cannot be transferred");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Soulbound tokens cannot be transferred");
    }

    // Required overrides for AccessControl
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @notice Get token URI for metadata (can be overridden to return IPFS/HTTP URLs)
    /// @param tokenId The token ID
    /// @return JSON metadata string
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "URI query for nonexistent token");
        
        Achievement memory achievement = achievements[tokenId];
        
        // Return the stored metadata or construct basic JSON
        if (bytes(achievement.metadata).length > 0) {
            return achievement.metadata;
        }
        
        // Fallback to basic JSON construction
        return string(abi.encodePacked(
            '{"name":"', achievement.title, '",',
            '"description":"', achievement.description, '",',
            '"achievement_type":"', _achievementTypeToString(achievement.achievementType), '",',
            '"timestamp":', _toString(achievement.timestamp), ',',
            '"verified":', achievement.verified ? 'true' : 'false',
            '}'
        ));
    }

    /// @notice Convert achievement type enum to string
    function _achievementTypeToString(AchievementType aType) internal pure returns (string memory) {
        if (aType == AchievementType.PROJECT_COMPLETION) return "Project Completion";
        if (aType == AchievementType.FIVE_STAR_REVIEW) return "5-Star Review";
        if (aType == AchievementType.DAO_PROPOSAL_PASSED) return "DAO Proposal Passed";
        if (aType == AchievementType.SKILL_VERIFICATION) return "Skill Verification";
        if (aType == AchievementType.COLLABORATION_BADGE) return "Collaboration Badge";
        if (aType == AchievementType.MENTOR_ACHIEVEMENT) return "Mentor Achievement";
        if (aType == AchievementType.COMMUNITY_CONTRIBUTION) return "Community Contribution";
        return "Unknown";
    }

    /// @notice Convert uint256 to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
