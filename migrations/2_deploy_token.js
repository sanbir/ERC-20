const RealBToken = artifacts.require('RealBToken')
const { getConfig } = require('../Helpers/getConfig')

module.exports = async (deployer, network) => {
  const { TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS } = getConfig(network)
  await deployer.deploy(RealBToken, TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS)
}
