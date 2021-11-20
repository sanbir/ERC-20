pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";

contract Karbon14Token is DetailedERC20, MintableToken, BurnableToken, PausableToken {

    uint256 constant public maxSupply = 1e27;
    uint256 constant public emergencyFundMintedSupply = 1e26;

    uint256 public tokenIssueDate;
    uint256 public emergencyFundReleaseDate;
    uint256 public longTermFoundationBudgetDate;
    uint256 public reservedForUseByAdminFirstDate;

    bool public isEmergencyFundMinted;

    constructor(string _name, string _symbol, uint8 _decimals)
        DetailedERC20(_name, _symbol, _decimals)
        public
    {
        tokenIssueDate = block.timestamp;
        emergencyFundReleaseDate = tokenIssueDate + 2 * 365 days;
        longTermFoundationBudgetDate = tokenIssueDate + 4 * 365 days;
        reservedForUseByAdminFirstDate = 365 days;

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
        return mint(owner, emergencyFundMintedSupply);
    }
}
