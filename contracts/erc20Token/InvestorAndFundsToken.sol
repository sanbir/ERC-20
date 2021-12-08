// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract InvestorAndFundsToken is ERC20Capped, ERC20Pausable, Ownable {
    uint256 constant public investorSupplyToMint = 50e25;
    uint256 public investorSupplyMinted = 0;

    constructor()
    ERC20Capped(1e27)
    {
        _pause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20Pausable, ERC20) {
        if (msg.sender != owner()) {
            ERC20Pausable._beforeTokenTransfer(from, to, amount);
        }
    }

    function _mint(address account, uint256 amount
    ) internal override(ERC20Capped, ERC20) {
        ERC20Capped._mint(account, amount);
    }

    function mint(
        address _to,
        uint256 _amount
    )
    public
    onlyOwner
    {
        uint256 newInvestorSupplyMinted = investorSupplyMinted + _amount;
        require(newInvestorSupplyMinted <= investorSupplyToMint);
        investorSupplyMinted = newInvestorSupplyMinted;

        _mint(_to, _amount);
    }

    function mintFund(
        address _to,
        uint256 _amount
    )
    internal
    onlyOwner
    {
        _mint(_to, _amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}
