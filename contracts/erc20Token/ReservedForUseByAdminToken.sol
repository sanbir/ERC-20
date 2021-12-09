// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "./InvestorAndFundsToken.sol";

abstract contract ReservedForUseByAdminToken is InvestorAndFundsToken {
    uint256 constant public reservedForUseByAdminSupplyToMint = 36e25;
    uint256 constant public amountToMint = 72e24;

    bool public isReservedForUseByAdminMinted;
    uint256 reservedForUseByAdminReleaseDate;

    uint256 public reservedForUseByAdminSupplyMinted = 0;

    constructor()
    {
        reservedForUseByAdminReleaseDate = block.timestamp + 365 days;
        isReservedForUseByAdminMinted = false;
    }

    modifier canReleaseReservedForUseByAdmin() {
        require(block.timestamp >= reservedForUseByAdminReleaseDate, "Tokens Reserved For Use By Admin can't be released yet");
        _;
    }

    function mintReservedForUseByAdmin()
    public
    onlyOwner
    canReleaseReservedForUseByAdmin
    {
        reservedForUseByAdminReleaseDate = reservedForUseByAdminReleaseDate + 182 days;

        mintFund(owner(), amountToMint);

        reservedForUseByAdminSupplyMinted = reservedForUseByAdminSupplyMinted + amountToMint;

        require(reservedForUseByAdminSupplyMinted <= reservedForUseByAdminSupplyToMint, "Exceeded Reserved For Use By Admin Supply To Mint");

        if (reservedForUseByAdminSupplyMinted == reservedForUseByAdminSupplyToMint) {
            isReservedForUseByAdminMinted = true;
        }
    }
}
