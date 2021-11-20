pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ReservedForUseByAdminToken is CappedToken {
    uint256 constant public reservedForUseByAdminSupplyToMint = 36e25;
    uint256 constant public amountToMint = 72e24;

    bool public isReservedForUseByAdminMinted;
    uint256 reservedForUseByAdminReleaseDate;

    uint256 public reservedForUseByAdminSupplyMinted = 0;

    constructor() public
    {
        reservedForUseByAdminReleaseDate = block.timestamp + 365 days;
        isReservedForUseByAdminMinted = false;
    }

    modifier canReleaseReservedForUseByAdmin() {
        require(block.timestamp >= reservedForUseByAdminReleaseDate);
        _;
    }

    /**
   * @dev Function to mint tokens for ReservedForUseByAdmin Fund
   * @return A boolean that indicates if the operation was successful.
   */
    function mintReservedForUseByAdmin()
    public
    onlyOwner
    canReleaseReservedForUseByAdmin
    returns (bool)
    {
        reservedForUseByAdminReleaseDate = reservedForUseByAdminReleaseDate + 182 days;

        bool mintResult = mint(owner, amountToMint);

        reservedForUseByAdminSupplyMinted = reservedForUseByAdminSupplyMinted.add(amountToMint);

        require(reservedForUseByAdminSupplyMinted <= reservedForUseByAdminSupplyToMint);

        if (reservedForUseByAdminSupplyMinted == reservedForUseByAdminSupplyToMint) {
            isReservedForUseByAdminMinted = true;
        }

        return mintResult;
    }
}
