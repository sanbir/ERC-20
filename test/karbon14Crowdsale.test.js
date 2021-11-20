const Karbon14Token = artifacts.require('Karbon14Token')
const Karbon14Crowdsale = artifacts.require('Karbon14Crowdsale')
const { ether, bigNumberToString } = require('../Helpers/web3')
const { getConfig } = require('../Helpers/getConfig')

const {
  TOKEN_RATE,
  TOKEN_TICKER,
  TOKEN_NAME
} = getConfig('development')

const getContracts = async () => {
  const karbon14Token = await Karbon14Token.deployed()
  const karbon14Crowdsale = await Karbon14Crowdsale.deployed()
  return { karbon14Token, karbon14Crowdsale }
}

const errorVM = 'VM Exception while processing transaction: revert'

describe('karbon14Crowdsale', () => {
  contract('karbon14Crowdsale', async ([owner, investor, wallet]) => {
    it('should log purchase', async function() {
      const { karbon14Crowdsale, karbon14Token } = await getContracts()

      const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
      await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

      const value = ether(1)
      const { logs } = await karbon14Crowdsale.sendTransaction({ value, from: investor })
      const event = logs.find(e => e.event === 'TokenPurchase')

      const actual = {
        event: event.event,
        value: bigNumberToString(event.args.value),
        purchaser: event.args.purchaser,
        beneficiary: event.args.beneficiary,
        amount: bigNumberToString(value) * TOKEN_RATE,
      }

      const expected = {
        event: 'TokenPurchase',
        value: bigNumberToString(value),
        purchaser: investor,
        beneficiary: investor,
        amount: bigNumberToString(value) * TOKEN_RATE,
      }

      assert.deepEqual(actual, expected)
    })

    it('should return wallet', async function() {
      const { karbon14Crowdsale } = await getContracts()

      const actual = await karbon14Crowdsale.wallet()
      const expected = wallet

      assert.deepEqual(actual, expected)
    })
  })

  contract('karbon14Crowdsale', async ([owner, investor, wallet, purchaser]) => {
    it('should return total found during the crowdsale', async function() {
      const { karbon14Crowdsale, karbon14Token } = await getContracts()
      const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
      await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

      const value = ether(1)

      const foundInEth1 = await karbon14Crowdsale.weiRaised()
      assert.deepEqual(bigNumberToString(foundInEth1), '0')

      await karbon14Crowdsale.sendTransaction({ value, from: investor })
      const foundInEth2 = await karbon14Crowdsale.weiRaised()

      assert.deepEqual(bigNumberToString(foundInEth2), '1')

      await karbon14Crowdsale.sendTransaction({ value, from: investor })
      const foundInEth3 = await karbon14Crowdsale.weiRaised()

      assert.deepEqual(bigNumberToString(foundInEth3), '2')
    })
  })
})

describe('karbon14Crowdsale MintableToken', () => {
  contract('karbon14Crowdsale', async ([owner, investor, wallet, purchaser]) => {
    it(`should buy ${TOKEN_RATE} tokens ${TOKEN_TICKER} with 1ETH`, async () => {
      const { karbon14Crowdsale, karbon14Token } = await getContracts()
      const value = ether(1)

      await karbon14Crowdsale.buyTokens(investor, { value: value, from: purchaser })
      const tokens = await karbon14Token.balanceOf(investor)

      const actual = bigNumberToString(tokens)
      const expected = TOKEN_RATE.toString()

      assert.deepEqual(actual, expected)
    })

    it('should the address token equals to address token in the crowdsale', async () => {
      const { karbon14Token, karbon14Crowdsale } = await getContracts()
      const actual = await karbon14Token.address
      const expected = await karbon14Crowdsale.token()

      assert.deepEqual(actual, expected)
    })
  })

  contract('karbon14Crowdsale', async ([owner, investor, wallet, purchaser]) => {
    it(`should be the owner of the token ${TOKEN_NAME} the contract of ${TOKEN_NAME} Crowdsale`, async () => {
      const { karbon14Token, karbon14Crowdsale } = await getContracts()

      const actual = await karbon14Token.owner()
      const expected = karbon14Crowdsale.address

      assert.deepEqual(actual, expected)
    })
  })
})

describe('karbon14Crowdsale changeWallet', () => {
  contract('karbon14Crowdsale', ([owner, investor, wallet, newWallet]) => {
    it('should return the new wallet', async () => {
      const { karbon14Crowdsale } = await getContracts()

      await karbon14Crowdsale.changeWallet(newWallet)

      const actual = await karbon14Crowdsale.wallet()
      const expected = newWallet

      assert.deepEqual(actual, expected)
    })

    it('should return event WalletChange', async () => {
      const { karbon14Crowdsale } = await getContracts()

      const { logs } = await karbon14Crowdsale.changeWallet(newWallet)
      const { event } = logs.find(e => e.event === 'WalletChange')

      const actual = event
      const expected = 'WalletChange'

      assert.deepEqual(actual, expected)
    })

    it('should revert if is not owner', async () => {
      const { karbon14Crowdsale } = await getContracts()

      const actual = await karbon14Crowdsale.changeWallet(newWallet, { from: investor }).catch(e => e.message)
      const expected = errorVM

      assert.deepEqual(actual, expected)
    })

    it('should return an error when is an empty Wallet', async () => {
      const { karbon14Crowdsale } = await getContracts()

      const actual = await karbon14Crowdsale.changeWallet().catch(e => e.message)
      const expected = 'Invalid number of arguments to Solidity function'

      assert.deepEqual(actual, expected)
    })
  })
})

describe('karbon14Crowdsale Mintable Token', () => {
  context('when the crowdsale is open', () => {
    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('should can not mint by the owner', async () => {
        const { karbon14Token } = await getContracts()

        const BigNumber = web3.BigNumber
        const amount = new BigNumber(`${1}e+18`)
        const owner = await karbon14Token.owner()

        const actual = await karbon14Token.mint(purchaser, amount, { from: owner }).catch(e => e.message)
        const expected = 'sender account not recognized'

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('should can not mint by the wallet', async () => {
        const { karbon14Token } = await getContracts()

        const BigNumber = web3.BigNumber
        const amount = new BigNumber(`${1}e+18`)

        const actual = await karbon14Token.mint(purchaser, amount, { from: wallet }).catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('should can not finishMinting by the owner', async () => {
        const { karbon14Token } = await getContracts()

        const owner = await karbon14Token.owner()

        const actual = await karbon14Token.finishMinting({ from: owner }).catch(e => e.message)
        const expected = 'sender account not recognized'

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('should can not finishMinting by the wallet', async () => {
        const { karbon14Token } = await getContracts()

        const actual = await karbon14Token.finishMinting({ from: wallet }).catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })

})

describe('karbon14Crowdsale Pausable Token', () => {
  describe('pause', function() {
    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused', () => {
        it('pauses the token', async () => {
          const { karbon14Token } = await getContracts()

          await karbon14Token.pause({ from: wallet })
          const actual = await karbon14Token.paused()
          const expected = true

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused', () => {
        it('emits a Pause event', async function() {
          const { karbon14Token } = await getContracts()

          const { logs } = await karbon14Token.pause({ from: wallet })

          const actual = logs[0].event
          const expected = 'Pause'

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused twice', () => {
        it('reverts', async function() {
          const { karbon14Token } = await getContracts()

          await karbon14Token.pause({ from: wallet })

          const actual = await karbon14Token.pause({ from: wallet }).catch(e => e.message)
          const expected = errorVM

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the sender is not the owner', () => {
        it('reverts', async function() {
          const { karbon14Token } = await getContracts()

          const actual = await karbon14Token.pause({ from: investor }).catch(e => e.message)
          const expected = errorVM

          assert.deepEqual(actual, expected)
        })
      })
    })
  })

  describe('unpause', function() {
    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the sender is not the owner', () => {
        it('reverts', async function() {
          const { karbon14Token } = await getContracts()

          await karbon14Token.pause({ from: wallet })

          const actual = await karbon14Token.unpause({ from: investor }).catch(e => e.message)
          const expected = errorVM

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is unpause', () => {
        it('emits a Unpause event', async function() {
          const { karbon14Token } = await getContracts()

          await karbon14Token.pause({ from: wallet })
          const { logs } = await karbon14Token.unpause({ from: wallet })

          const actual = logs[0].event
          const expected = 'Unpause'

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is unpause twice', () => {
        it('reverts', async function() {
          const { karbon14Token } = await getContracts()

          await karbon14Token.pause({ from: wallet })
          await karbon14Token.unpause({ from: wallet })

          const actual = await karbon14Token.unpause({ from: wallet }).catch(e => e.message)
          const expected = errorVM

          assert.deepEqual(actual, expected)
        })
      })
    })
  })

  describe('pausable token', function() {
    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('default', () => {
        it('is not paused by default', async () => {
          const { karbon14Token } = await getContracts()

          await karbon14Token.pause({ from: wallet })
          const actual = await karbon14Token.paused()
          const expected = true

          assert.deepEqual(actual, expected)
        })
      })
    })
  })

  describe('transfer', function() {
    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is unpaused', () => {
        it('allows to transfer', async () => {
          const { karbon14Token } = await getContracts()
          const BigNumber = web3.BigNumber

          await karbon14Token.transfer(purchaser, new BigNumber(`${100}e+18`), { from: wallet })

          const actual = bigNumberToString(await karbon14Token.balanceOf(purchaser))
          const expected = '100'

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused and unpaused', () => {
        it('allows to transfer', async () => {
          const { karbon14Token } = await getContracts()
          const BigNumber = web3.BigNumber

          await karbon14Token.pause({ from: wallet })
          await karbon14Token.unpause({ from: wallet })

          await karbon14Token.transfer(purchaser, new BigNumber(`${100}e+18`), { from: wallet })

          const actual = bigNumberToString(await karbon14Token.balanceOf(purchaser))
          const expected = '100'

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused', () => {
        it('deny to transfer', async () => {
          const { karbon14Token } = await getContracts()

          await karbon14Token.pause({ from: wallet })

          const actual = await karbon14Token.transfer(purchaser, 1, { from: wallet }).catch(e => e.message)
          const expected = errorVM

          assert.deepEqual(actual, expected)
        })
      })
    })
  })

  describe('approve', function() {
    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to approve when unpaused', async () => {
        const { karbon14Token } = await getContracts()
        const BigNumber = web3.BigNumber

        const tokens = new BigNumber(`${100}e+18`)

        await karbon14Token.approve(purchaser, tokens, { from: wallet })

        const actual = bigNumberToString(await karbon14Token.allowance(wallet, purchaser))
        const expected = '100'

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to transfer when paused and then unpaused', async () => {
        const { karbon14Token, karbon14Crowdsale } = await getContracts()
        const BigNumber = web3.BigNumber

        const tokens = new BigNumber(`${100}e+1`)

        const value = ether(1)

        await karbon14Crowdsale.buyTokens(purchaser, { value: value, from: investor })

        await karbon14Token.pause({ from: wallet })
        await karbon14Token.unpause({ from: wallet })

        await karbon14Token.approve(purchaser, tokens, { from: wallet })

        const actual = bigNumberToString(await karbon14Token.allowance(wallet, purchaser))
        const expected = '100'

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('reverts when trying to transfer when paused', async () => {
        const { karbon14Crowdsale, karbon14Token } = await getContracts()

        const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
        await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

        const BigNumber = web3.BigNumber
        const value = ether(42)
        await karbon14Crowdsale.buyTokens(owner, { value: value, from: investor })

        const tokens = new BigNumber(`${100}e+18`)

        await karbon14Crowdsale.returnOwnership()
        await karbon14Token.pause({ from: wallet })

        const actual = await karbon14Token.approve(purchaser, tokens, { from: wallet }).catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })

  describe('transfer from', function() {
    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to transfer from when unpaused', async () => {
        const { karbon14Crowdsale, karbon14Token } = await getContracts()

        const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
        await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

        const BigNumber = web3.BigNumber
        const value = ether(42)
        await karbon14Crowdsale.buyTokens(owner, { value: value, from: investor })

        const tokens = new BigNumber(`${42}e+18`)
        await karbon14Token.approve(wallet, tokens, { from: owner })

        const tokensTransfer = new BigNumber(`${1}e+18`)

        const oldOwnerTokens = parseInt(bigNumberToString(await karbon14Token.balanceOf(owner)))

        await karbon14Token.transferFrom(owner, purchaser, tokensTransfer, { from: wallet })

        const actualOwner = bigNumberToString(await karbon14Token.balanceOf(owner))
        const expectedOwner = (oldOwnerTokens - parseInt(bigNumberToString(tokensTransfer))).toString()

        const actualPurchaser = bigNumberToString(await karbon14Token.balanceOf(purchaser))
        const expectedPurchaser = bigNumberToString(tokensTransfer)

        assert.deepEqual(actualOwner, expectedOwner)
        assert.deepEqual(actualPurchaser, expectedPurchaser)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to transfer when paused and then unpaused', async () => {
        const { karbon14Crowdsale, karbon14Token } = await getContracts()

        const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
        await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

        const BigNumber = web3.BigNumber
        const value = ether(2)
        await karbon14Crowdsale.buyTokens(owner, { value: value, from: investor })

        const tokens = new BigNumber(`${42}e+18`)
        const tokensTransfer = new BigNumber(`${1}e+18`)

        await karbon14Token.approve(wallet, tokens, { from: owner })

        await karbon14Crowdsale.returnOwnership()

        await karbon14Token.pause({ from: wallet })
        await karbon14Token.unpause({ from: wallet })

        const oldOwnerTokens = parseInt(bigNumberToString(await karbon14Token.balanceOf(owner)))

        await karbon14Token.transferFrom(owner, purchaser, tokensTransfer, { from: wallet })

        const actualOwner = bigNumberToString(await karbon14Token.balanceOf(owner))
        const expectedOwner = (oldOwnerTokens - parseInt(bigNumberToString(tokensTransfer))).toString()

        const actualPurchaser = bigNumberToString(await karbon14Token.balanceOf(purchaser))
        const expectedPurchaser = bigNumberToString(tokensTransfer)

        assert.deepEqual(actualOwner, expectedOwner)
        assert.deepEqual(actualPurchaser, expectedPurchaser)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('reverts when trying to transfer from when paused', async () => {
        const { karbon14Crowdsale, karbon14Token } = await getContracts()

        const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
        await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

        const BigNumber = web3.BigNumber

        const value = ether(42)

        await karbon14Crowdsale.buyTokens(owner, { value: value, from: investor })

        const tokens = new BigNumber(`${42}e+1`)
        const tokensTransfer = new BigNumber(`${1}e+1`)

        await karbon14Token.approve(wallet, tokens, { from: owner })

        await karbon14Crowdsale.returnOwnership()
        await karbon14Token.pause({ from: wallet })

        const actual = await karbon14Token
          .transferFrom(owner, purchaser, tokensTransfer, { from: wallet })
          .catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })

  describe('increase approval', function() {
    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to increase approval when unpaused', async () => {
        const { karbon14Crowdsale, karbon14Token } = await getContracts()

        const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
        await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

        const BigNumber = web3.BigNumber

        const value = ether(42)

        await karbon14Crowdsale.buyTokens(purchaser, { value: value, from: investor })

        const tokensApprove = new BigNumber(`${40}e+18`)

        await karbon14Crowdsale.returnOwnership()
        await karbon14Token.increaseApproval(purchaser, tokensApprove, { from: wallet })

        const actual = bigNumberToString(await karbon14Token.allowance(wallet, purchaser))
        const expected = '40'

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('reverts when trying to increase approval when paused', async () => {
        const { karbon14Crowdsale, karbon14Token } = await getContracts()

        const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
        await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

        const BigNumber = web3.BigNumber

        const value = ether(42)

        await karbon14Crowdsale.buyTokens(purchaser, { value: value, from: investor })

        const tokensApprove = new BigNumber(`${40}e+18`)

        await karbon14Crowdsale.returnOwnership()
        await karbon14Token.pause({ from: wallet })

        const actual = await karbon14Token
          .increaseApproval(purchaser, tokensApprove, { from: wallet })
          .catch(e => e.message)

        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })

    contract('karbon14Crowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to increase approval when paused and then unpaused', async () => {
        const { karbon14Crowdsale, karbon14Token } = await getContracts()

        const karbon14CrowdsaleAddress = await karbon14Crowdsale.address
        await karbon14Token.transferOwnership(karbon14CrowdsaleAddress)

        const BigNumber = web3.BigNumber

        const value = ether(1)

        await karbon14Crowdsale.buyTokens(purchaser, { value: value, from: investor })

        const tokensApprove = new BigNumber(`${100}e+18`)

        await karbon14Crowdsale.returnOwnership()

        await karbon14Token.pause({ from: wallet })
        await karbon14Token.unpause({ from: wallet })

        await karbon14Token.increaseApproval(purchaser, tokensApprove, { from: wallet })

        const actual = bigNumberToString(await karbon14Token.allowance(wallet, purchaser))
        const expected = '100'

        assert.deepEqual(actual, expected)
      })
    })
  })
})

