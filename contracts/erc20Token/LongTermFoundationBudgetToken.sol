pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol";

contract LongTermFoundationBudgetToken is CappedToken {
    uint256 constant public longTermFoundationBudgetSupplyToMint = 4e25;
    bool public isLongTermFoundationBudgetMinted;
    uint256 public longTermFoundationBudgetReleaseDate;

    constructor() public
    {
        longTermFoundationBudgetReleaseDate = block.timestamp + 4 * 365 days;
        isLongTermFoundationBudgetMinted = false;
    }

    modifier canReleaseLongTermFoundationBudget() {
        require(block.timestamp >= longTermFoundationBudgetReleaseDate);
        _;
    }

    /**
   * @dev Function to mint tokens for Long Term Foundation Budget
   * @return A boolean that indicates if the operation was successful.
   */
    function mintLongTermFoundationBudget()
    public
    onlyOwner
    canReleaseLongTermFoundationBudget
    returns (bool)
    {
        isLongTermFoundationBudgetMinted = true;
        return mint(owner, longTermFoundationBudgetSupplyToMint);
    }
}
