pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol";

contract EmergencyFundToken is CappedToken {
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
        return mint(owner, emergencyFundSupplyToMint);
    }
}
