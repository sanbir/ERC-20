// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./erc20Token/EmergencyFundToken.sol";
import "./erc20Token/LongTermFoundationBudgetToken.sol";
import "./erc20Token/ReservedForUseByAdminToken.sol";

contract RealBToken is
    EmergencyFundToken,
    LongTermFoundationBudgetToken,
    ReservedForUseByAdminToken {

    constructor(string memory _name, string memory _symbol)
    ERC20(_name, _symbol)
        public
    {
    }
}
