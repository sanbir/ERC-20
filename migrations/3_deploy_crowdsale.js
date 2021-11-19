const Karbon14Token = artifacts.require('Karbon14Token')
const Karbon14Crowdsale = artifacts.require('Karbon14Crowdsale')
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
  }

  const rate = TOKEN_RATE
  const wallet = wallet_address[network]

  await deployer.deploy(
    Karbon14Crowdsale,
    rate,
    wallet,
    Karbon14Token.address
  )
}
