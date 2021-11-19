const Migrations = artifacts.require('Migrations')
const { getConfig } = require('../Helpers/getConfig')

module.exports = async function(deployer, network) {
  const {
    TOKEN_RATE,
    WALLET_ADDRESS,
  } = getConfig(network)

  /* eslint-disable no-console */
  console.log('TOKEN_RATE: ', TOKEN_RATE)
  console.log('WALLET_ADDRESS: ', WALLET_ADDRESS)
  /* eslint-enable no-console */
  await deployer.deploy(Migrations)
}
