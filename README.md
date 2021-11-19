# Karbon14 Crowdsale Contracts

[![Build Status](https://travis-ci.org/karbon14/crowdsale-contracts.svg?branch=master)](https://travis-ci.org/karbon14/crowdsale-contracts)

## How it works:

- Private round
Admin deploys ERC-20 contact and becomes its owner.

reserved_for_use_by_admin = maxSupply * 0.36
After 1 year, admin gets the right to mint (reserved_for_use_by_admin * 0.2), etc.
Long_term_foundation_budget and Emergency_and_reserve_fund admin gets the right to mint the same way

Admin can mint for private investors total_cap_for_sale = maxSupply * 0.5 right after deployment.

If private investors bought all total_cap_for_sale, no Public round will happen.

- Public round

Admin changes ownership to crowdsale contract.

Crowdsale contract receives ETH and mints the remaining total_cap_for_sale.

Admin can always stop Public round and return to Private round by changing ownership back.

Until resell the contract is paused (except owner).
- Resell
ERC-20 contract is un-paused and every holder can transfer tokens.

- Emergency
  ERC-20 contract is paused. New ERC-20 contract is developed, deployed, and token balances migrated.

## Mainnet addresses:

- Cowdsale: https://etherscan.io/address/0x8973db8731b364985ffa4d6f579e0d1a022ad6e6
- Karbon14 Token (K14): https://etherscan.io/address/0x2fb2401b7498f5467b20cebfba11acdf4fa2fdad

## Details about Karbon14 token

The token Karbon14 extend of these contracts DetailedERC20, MintableToken, BurnableToken, and PausableToken.

- **DetailedERC20 (Extends of ERC20):** An ERC20 token is a contract that keeps track of a mapping(address => uint256) that represents a user's balance. These tokens are fungible in that any one token is exactly equal to any other token; no tokens have special rights or behavior associated with them. This makes ERC20 useful for things like a medium of exchange currency, general voting rights, staking, and more.

This behavior adds extra security to the community:

- **MintableToken:** Allows users with the MinterRole to call the mint() function and mint tokens to users. Minting can also be finished, locking the mint() function's behavior. In karbon14 only the owner can execute this action or in the stage of crowdsale where the owner is the contract of the crowsale.

- **BurnableToken:** If your token can be burned (aka, it can be destroyed), include this one. In karbon14 only the owner can execute this action.

- **PausableToken:** Allows anyone with the Pauser role to pause the token, freezing transfers to and from users. This is useful if you want to stop trades until the end of a crowdsale, or if you want to have an emergency switch for freezing your tokens in the event of a large bug. Note that there are inherent decentralization tradeoffs when using a pausable token; users may not expect that their unstoppable money can be frozen by a single address!. In karbon14 only the owner can execute this action.

## Details about Crowdsale of Karbon14

The contract of the Crowdasle of Karbon14 extends of RefundableCrowdsale and MintedCrowdsale.

- **MintedCrowdsale:** The Crowdsale mints tokens when a purchase is made.

- **RefundableCrowdsale:** Offers to refund users if a minimum goal is not reached. If the goal is not reached, the users can claimRefund() to get their Ether back. RefundableCrowdsale brings another function like as TimedCrowdsale and CappedCrowdsale.

- **TimedCrowdsale:** Adds an openingTime and closingTime to your crowdsale.

- **CappedCrowdsale:** Adds a cap to your crowdsale, invalidating any purchases that would exceed that cap.

## Generating the final tokens when finalizing the crowsale

You can check the function `crowdsaleClose` in the contract `Karbon14Crowdsale`. When the `finalize` method will be executed, the total of the tokens will be launch.
 
## Development:

We used Truffle and Open Zeppelin contracts to build our crowdsale and the ERC-20 Token.

## Testing:

We have 1700+ lines of tests. There are two test files:

- One tests the wallet
- The other one tests the crowdsale token contracts


### Run the test

```
npm i
npm run ganache
npm run test
```






## Team

[![Natanael Zalazar](https://avatars.githubusercontent.com/u/11928153?s=64)](https://github.com/zalazarnatanael)  |
[![Jose Luis Casella](https://avatars2.githubusercontent.com/u/23145933?s=64)](https://github.com/visionk14) |
[![Walter Zalazar](https://avatars3.githubusercontent.com/u/5795257?s=64)](https://github.com/wolverinek14) |
|---|---|---|
Natanael Zalazar | Jose Luis Casella | Walter Zalazar |
:octocat:[@zalazarnatanael](https://github.com/zalazarnatanael) | :octocat:[@visionk14](https://github.com/visionk14) | :octocat:[@wzalazar](https://github.com/wzalazar) |


## License
[MIT](https://github.com/karbon14/crowdsale-contracts/blob/master/.github/LICENSE)
