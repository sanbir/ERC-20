// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./InvestorAndFundsToken.sol";

abstract contract LongTermFoundationBudgetToken is InvestorAndFundsToken {
    uint256 constant public longTermFoundationBudgetSupplyToMint = 4e25;
    bool public isLongTermFoundationBudgetMinted;
    uint256 public longTermFoundationBudgetReleaseDate;

    constructor()
    {
        longTermFoundationBudgetReleaseDate = block.timestamp + 4 * 365 days;
        isLongTermFoundationBudgetMinted = false;
    }

    modifier canReleaseLongTermFoundationBudget() {
        require(block.timestamp >= longTermFoundationBudgetReleaseDate);
        _;
    }

    function mintLongTermFoundationBudget()
    public
    onlyOwner
    canReleaseLongTermFoundationBudget
    {
        isLongTermFoundationBudgetMinted = true;
        mintFund(owner(), longTermFoundationBudgetSupplyToMint);
    }
}
