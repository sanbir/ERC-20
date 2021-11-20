pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/CappedToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/PausableToken.sol";
import "./erc20Token/EmergencyFundToken.sol";
import "./erc20Token/LongTermFoundationBudgetToken.sol";
import "./erc20Token/ReservedForUseByAdminToken.sol";

contract RealBToken is
    DetailedERC20,
    BurnableToken,
    PausableToken,
    EmergencyFundToken,
    LongTermFoundationBudgetToken,
    ReservedForUseByAdminToken {

    constructor(string _name, string _symbol, uint8 _decimals)
        DetailedERC20(_name, _symbol, _decimals)
        public
    {
        pause();
    }
}
