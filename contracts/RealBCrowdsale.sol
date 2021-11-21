pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract RealBCrowdsale is MintedCrowdsale, Ownable {
    using SafeMath for uint256;
    using SafeMath for uint;

    MintableToken public token;
    uint256 rate;

    event WalletChange(address wallet);
    event RateChange(uint256 rate);

    constructor
    (
        uint256 _rate,
        address _wallet,
        MintableToken _token
    )
        Crowdsale(_rate, _wallet, _token)
        public
    {
        token = _token;
        rate = _rate;
    }

    function changeRate(uint256 _rate) public onlyOwner {
        require(_rate > 0, "Rate should be greater than zero.");
        rate = _rate;
        emit RateChange(_rate);
    }

    function changeWallet(address _wallet) public onlyOwner {
        require(_wallet != 0x0, "Wallet is required.");
        wallet = _wallet;
        emit WalletChange(_wallet);
    }

    function getTotalSupply() public view returns(uint256) {
        uint256 totalSupply = token.totalSupply();
        return totalSupply;
    }

    function returnOwnership() public onlyOwner {
        token.transferOwnership(owner);
    }
}
