pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./crowdsale/MintedCrowdsale.sol";
import "./RealBToken.sol";

contract RealBCrowdsale is MintedCrowdsale, Ownable {
    using SafeMath for uint256;
    using SafeMath for uint;

    event RateChange(uint256 rate);
    event WalletChange(address wallet);

    mapping(address => uint256) publicInvestorPurchases;

    constructor
    (
        uint256 _rate,
        address _wallet,
        RealBToken _token
    )
        MintedCrowdsale(_rate, _wallet, _token)
        public
    {
    }

    modifier max250k(address _beneficiary) {
        uint256 tokens = _getTokenAmount(msg.value);
        require(publicInvestorPurchases[_beneficiary].add(tokens) <= 250000e18);
        _;
    }

    function changeRate(uint256 _rate) public onlyOwner {
        require(_rate > 0, "Rate should be greater than zero.");
        setRate(_rate);
        emit RateChange(_rate);
    }

    function changeWallet(address _wallet) public onlyOwner {
        require(_wallet != address(0x0), "Wallet is required.");
        setWallet(_wallet);
        emit WalletChange(_wallet);
    }

    function getTotalSupply() public view returns(uint256) {
        uint256 totalSupply = token().totalSupply();
        return totalSupply;
    }

    function returnOwnership() public onlyOwner {
        token().transferOwnership(owner());
    }

    function buyTokens(address _beneficiary)
    override
    public
    payable
    max250k(_beneficiary) {
        uint256 tokens = _getTokenAmount(msg.value);
        publicInvestorPurchases[_beneficiary] = publicInvestorPurchases[_beneficiary].add(tokens);
        super.buyTokens(_beneficiary);
    }
}
