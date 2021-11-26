const HDWalletProvider = require('@truffle/hdwallet-provider')
const { ROPSTEN_MNEMONIC, INFURA_API_KEY } = process.env

module.exports = {
  migrations_directory: './migrations',
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*', // Match any network id
    },
    ropsten: {
      provider: () => new HDWalletProvider(ROPSTEN_MNEMONIC, `https://mainnet.infura.io/v3/${INFURA_API_KEY}`),
      gas: 4698712,
      network_id: '3',
    },
    live: {
      provider: () => new HDWalletProvider(ROPSTEN_MNEMONIC, `https://mainnet.infura.io/v3/${INFURA_API_KEY}`),
      gas: 4698712,
      network_id: '1',
    },
    rpc: {
      host: '127.0.0.1',
      port: 8545,
    },
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0"
    }
  }
}
