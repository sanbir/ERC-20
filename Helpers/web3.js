const pify = require('pify')

const ethAsync = pify(web3.eth)

const ether = n => new web3.utils.BN(web3.utils.toWei(n, 'ether'))
const bigNumberToString = bigNumber => web3.utils.fromWei(bigNumber.toString(), 'ether')
const { getBalance, sendTransaction, getBlock } = ethAsync

module.exports = {
  getBalance,
  sendTransaction,
  getBlock,
  ether,
  bigNumberToString
}
