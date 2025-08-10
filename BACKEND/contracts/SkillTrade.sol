// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title SkillTrade Mutual Escrow
/// @notice Both parties deposit funds. If someone cancels, cancellation distribution applies.
contract SkillTrade {
    enum Status { Pending, Active, Completed, Cancelled }

    struct Deal {
        address requester;
        address responder;
        uint256 requesterAmount;
        uint256 responderAmount;
        bool requesterDeposited;
        bool responderDeposited;
        bool requesterConfirmed;
        bool responderConfirmed;
        Status status;
    }

    address public owner; // middleman / escrow fee receiver
    uint256 public dealCounter;
    mapping(uint256 => Deal) public deals;

    event DealInitiated(uint256 indexed dealId, address indexed requester, address indexed responder);
    event DepositMade(uint256 indexed dealId, address indexed depositor, uint256 amount);
    event DealConfirmed(uint256 indexed dealId, address by);
    event DealCompleted(uint256 indexed dealId);
    event DealCancelled(uint256 indexed dealId, address canceller, uint256 refund, uint256 reward, uint256 escrowFee);

    constructor(address _owner) {
        require(_owner != address(0), "owner required");
        owner = _owner;
    }

    modifier onlyParticipant(uint256 _dealId) {
        Deal storage d = deals[_dealId];
        require(msg.sender == d.requester || msg.sender == d.responder, "not participant");
        _;
    }

    /// @notice Initiate a deal by specifying the counterparty.
    function initiateDeal(address _responder) external returns (uint256) {
        require(_responder != address(0), "responder required");
        deals[dealCounter] = Deal({
            requester: msg.sender,
            responder: _responder,
            requesterAmount: 0,
            responderAmount: 0,
            requesterDeposited: false,
            responderDeposited: false,
            requesterConfirmed: false,
            responderConfirmed: false,
            status: Status.Pending
        });

        emit DealInitiated(dealCounter, msg.sender, _responder);
        dealCounter++;
        return dealCounter - 1;
    }

    /// @notice Deposit funds as either requester or responder. Amounts do not have to match, but distribution uses the depositor's amount on cancel.
    function deposit(uint256 _dealId) external payable {
        Deal storage deal = deals[_dealId];
        require(deal.status == Status.Pending || deal.status == Status.Active, "not depositable");
        require(msg.sender == deal.requester || msg.sender == deal.responder, "not part");
        require(msg.value > 0, "send ETH");

        if (msg.sender == deal.requester) {
            require(!deal.requesterDeposited, "requester already deposited");
            deal.requesterAmount = msg.value;
            deal.requesterDeposited = true;
        } else {
            require(!deal.responderDeposited, "responder already deposited");
            deal.responderAmount = msg.value;
            deal.responderDeposited = true;
        }

        // If both have deposited become Active
        if (deal.requesterDeposited && deal.responderDeposited) {
            deal.status = Status.Active;
        }

        emit DepositMade(_dealId, msg.sender, msg.value);
    }

    /// @notice Confirm completion. When both confirm, swap counterpart deposits (fair trade).
    function confirmCompletion(uint256 _dealId) external onlyParticipant(_dealId) {
        Deal storage deal = deals[_dealId];
        require(deal.status == Status.Active, "deal not active");

        if (msg.sender == deal.requester) {
            deal.requesterConfirmed = true;
        } else {
            deal.responderConfirmed = true;
        }

        emit DealConfirmed(_dealId, msg.sender);

        if (deal.requesterConfirmed && deal.responderConfirmed) {
            deal.status = Status.Completed;

            // swap deposits
            uint256 reqAmt = deal.requesterAmount;
            uint256 resAmt = deal.responderAmount;

            // send responder the requester's deposit and vice versa
            if (resAmt > 0) payable(deal.requester).transfer(resAmt);
            if (reqAmt > 0) payable(deal.responder).transfer(reqAmt);

            emit DealCompleted(_dealId);
        }
    }

    /// @notice Cancel: canceller gets 50% of their deposit back, other gets 40% of canceller's deposit, owner gets 10% fee of canceller's deposit. If other hasn't deposited, reward goes to other only if they had deposited.
    function cancelDeal(uint256 _dealId) external onlyParticipant(_dealId) {
        Deal storage deal = deals[_dealId];
        require(deal.status == Status.Pending || deal.status == Status.Active, "cannot cancel now");

        address canceller = msg.sender;
        address other = canceller == deal.requester ? deal.responder : deal.requester;

        uint256 cancellerAmount = canceller == deal.requester ? deal.requesterAmount : deal.responderAmount;
        uint256 otherAmount = canceller == deal.requester ? deal.responderAmount : deal.requesterAmount;

        require(cancellerAmount > 0, "canceller has not deposited");

        // compute splits from canceller's deposit
        uint256 refund = (cancellerAmount * 50) / 100; // 50%
        uint256 reward = (cancellerAmount * 40) / 100; // 40%
        uint256 escrowFee = cancellerAmount - refund - reward; // 10%

        // mark cancelled
        deal.status = Status.Cancelled;

        // Refund canceller's 50%
        if (refund > 0) payable(canceller).transfer(refund);

        // Send reward to other only if other had deposited (otherwise keep reward for owner)
        if (otherAmount > 0 && reward > 0) {
            payable(other).transfer(reward);
        } else {
            // if other didn't deposit, reward is given to owner
            escrowFee += reward;
        }

        // send fee to owner
        if (escrowFee > 0) payable(owner).transfer(escrowFee);

        emit DealCancelled(_dealId, canceller, refund, reward, escrowFee);
    }

    /// @notice Owner can update owner address
    function updateOwner(address _newOwner) external {
        require(msg.sender == owner, "only owner");
        require(_newOwner != address(0), "invalid owner");
        owner = _newOwner;
    }
}