// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/// @title TimeLock-contract
/// @author OMKAR N CHOUDHARI
/// @notice You can use this contract for only the most basic simulation
/// @dev All function calls are currently implemented without side effects
/// @custom:experimental This is an experimental contract.

contract Timelock is TimelockController {
    /// @notice every proposals need to go through the TimeLock contract
    /// @dev If "null" address is given in executors param then all addresses are set as executors
    /// @param minDelay min amount of delay
    /// @param proposers list of addresses that can propose
    /// @param executors list of addresses who can execute when a proposal passes ,

    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors
    ) TimelockController(minDelay, proposers, executors) {}
}
