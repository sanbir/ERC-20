pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "./erc20Token/EmergencyFundToken.sol";
import "./erc20Token/LongTermFoundationBudgetToken.sol";
import "./erc20Token/ReservedForUseByAdminToken.sol";

contract Karbon14Token is
    DetailedERC20,
    CappedToken,
    BurnableToken,
    PausableToken,
    EmergencyFundToken,
    LongTermFoundationBudgetToken,
    ReservedForUseByAdminToken {

    uint256 public reservedForUseByAdminFirstDate;

    constructor(string _name, string _symbol, uint8 _decimals)
        DetailedERC20(_name, _symbol, _decimals)
        CappedToken(1e27)
        public
    {
        pause();
        reservedForUseByAdminFirstDate = 365 days;
    }
}
