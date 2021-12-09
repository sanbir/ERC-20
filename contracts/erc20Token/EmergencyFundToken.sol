// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./InvestorAndFundsToken.sol";

abstract contract EmergencyFundToken is InvestorAndFundsToken {
    uint256 constant public emergencyFundSupplyToMint = 10e25;
    bool public isEmergencyFundMinted;
    uint256 emergencyFundReleaseDate;

    constructor()
    {
        emergencyFundReleaseDate = block.timestamp + 2 * 365 days;
        isEmergencyFundMinted = false;
    }

    modifier canReleaseEmergencyFund() {
        require(block.timestamp >= emergencyFundReleaseDate, "Emergency fund can't be released yet");
        _;
    }

    function mintEmergencyFund()
    public
    onlyOwner
    canReleaseEmergencyFund
    {
        require(!isEmergencyFundMinted, "Emergency fund has been minted");

        isEmergencyFundMinted = true;
        mintFund(owner(), emergencyFundSupplyToMint);
    }
}
