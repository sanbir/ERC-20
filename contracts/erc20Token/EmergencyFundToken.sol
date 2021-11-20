pragma solidity ^0.4.24;

import "./InvestorAndFundsToken.sol";

contract EmergencyFundToken is InvestorAndFundsToken {
    uint256 constant public emergencyFundSupplyToMint = 10e25;
    bool public isEmergencyFundMinted;
    uint256 emergencyFundReleaseDate;

    constructor() public
    {
        emergencyFundReleaseDate = block.timestamp + 2 * 365 days;
        isEmergencyFundMinted = false;
    }

    modifier canReleaseEmergencyFund() {
        require(block.timestamp >= emergencyFundReleaseDate);
        _;
    }

    /**
   * @dev Function to mint tokens for Emergency Fund
   * @return A boolean that indicates if the operation was successful.
   */
    function mintEmergencyFund()
    public
    onlyOwner
    canReleaseEmergencyFund
    returns (bool)
    {
        isEmergencyFundMinted = true;
        return mintFund(owner, emergencyFundSupplyToMint);
    }
}
