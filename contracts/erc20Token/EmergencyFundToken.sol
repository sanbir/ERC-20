pragma solidity ^0.8.0;

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
        require(block.timestamp >= emergencyFundReleaseDate);
        _;
    }

    function mintEmergencyFund()
    public
    onlyOwner
    canReleaseEmergencyFund
    {
        isEmergencyFundMinted = true;
        mintFund(owner(), emergencyFundSupplyToMint);
    }
}
