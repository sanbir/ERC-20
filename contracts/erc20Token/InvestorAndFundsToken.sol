pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol";

contract InvestorAndFundsToken is CappedToken {
    uint256 constant public investorSupplyToMint = 50e25;
    uint256 public investorSupplyMinted = 0;

    constructor()
    CappedToken(1e27)
    {
    }

    /**
     * @dev Function to mint tokens for investors
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint(
        address _to,
        uint256 _amount
    )
    public
    returns (bool)
    {
        uint256 newInvestorSupplyMinted = investorSupplyMinted.add(_amount);
        require(newInvestorSupplyMinted <= investorSupplyToMint);
        investorSupplyMinted = newInvestorSupplyMinted;

        return super.mint(_to, _amount);
    }

    /**
     * @dev Function to mint reserved tokens for funds
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintFund(
        address _to,
        uint256 _amount
    )
    internal
    returns (bool)
    {
        return super.mint(_to, _amount);
    }
}
