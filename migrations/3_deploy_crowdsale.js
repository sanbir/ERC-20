const RealBToken = artifacts.require('RealBToken')
const RealBCrowdsale = artifacts.require('RealBCrowdsale')
const { getConfig } = require('../Helpers/getConfig')

module.exports = async (deployer, network, accounts) => {
  const {
    TOKEN_RATE,
    WALLET_ADDRESS,
  } = getConfig(network)

  const wallet_address = {
    development: accounts[2],
    ropsten: accounts[0],
    live: WALLET_ADDRESS,
    'ropsten-fork': accounts[0]
  }

  const rate = TOKEN_RATE
  const wallet = wallet_address[network]

  await deployer.deploy(
    RealBCrowdsale,
    rate,
    wallet,
    RealBToken.address
  )
}
