const realBToken = artifacts.require('RealBToken')
const realBCrowdsale = artifacts.require('RealBCrowdsale')
const { ether, bigNumberToString} = require('../Helpers/web3')
const { getConfig } = require('../Helpers/getConfig')

const {
  TOKEN_RATE,
  TOKEN_TICKER,
  TOKEN_NAME
} = getConfig('development')

const getContracts = async () => {
  const RealBToken = await realBToken.deployed()
  const RealBCrowdsale = await realBCrowdsale.deployed()
  return { RealBToken, RealBCrowdsale }
}

const errorVM = 'Returned error: VM Exception while processing transaction: revert'

describe('RealBCrowdsale', () => {
  contract('RealBCrowdsale', async ([owner, investor, wallet]) => {
    it('should log purchase', async function() {
      const { RealBCrowdsale, RealBToken } = await getContracts()

      const RealBCrowdsaleAddress = await RealBCrowdsale.address
      await RealBToken.transferOwnership(RealBCrowdsaleAddress)

      const value = ether('1')
      const { logs } = await RealBCrowdsale.sendTransaction({ value, from: investor })

      const event = logs.find(e => e.event === 'TokensPurchased')

      const actual = {
        event: event.event,
        value: bigNumberToString(event.args.value),
        purchaser: event.args.purchaser,
        beneficiary: event.args.beneficiary,
        amount: bigNumberToString(value) * TOKEN_RATE,
      }

      const expected = {
        event: 'TokensPurchased',
        value: bigNumberToString(value),
        purchaser: investor,
        beneficiary: investor,
        amount: bigNumberToString(value) * TOKEN_RATE,
      }

      assert.deepEqual(actual, expected)
    })

    it('should return wallet', async function() {
      const { RealBCrowdsale } = await getContracts()

      const actual = await RealBCrowdsale.wallet()
      const expected = wallet

      assert.deepEqual(actual, expected)
    })
  })

  contract('RealBCrowdsale', async ([owner, investor, wallet, purchaser]) => {
    it('should return total found during the crowdsale', async function() {
      const { RealBCrowdsale, RealBToken } = await getContracts()
      const RealBCrowdsaleAddress = await RealBCrowdsale.address
      await RealBToken.transferOwnership(RealBCrowdsaleAddress)

      const value = ether('1')

      const foundInEth1 = await RealBCrowdsale.weiRaised()
      assert.deepEqual(bigNumberToString(foundInEth1), '0')

      await RealBCrowdsale.sendTransaction({ value, from: investor })
      const foundInEth2 = await RealBCrowdsale.weiRaised()

      assert.deepEqual(bigNumberToString(foundInEth2), '1')

      await RealBCrowdsale.sendTransaction({ value, from: investor })
      const foundInEth3 = await RealBCrowdsale.weiRaised()

      assert.deepEqual(bigNumberToString(foundInEth3), '2')
    })
  })
})

describe('RealBCrowdsale MintableToken', () => {
  contract('RealBCrowdsale', async ([owner, investor, wallet, purchaser]) => {
    it(`should buy ${TOKEN_RATE} tokens ${TOKEN_TICKER} with 1ETH`, async () => {
      const { RealBToken, RealBCrowdsale } = await getContracts()
      const RealBCrowdsaleAddress = await RealBCrowdsale.address
      await RealBToken.transferOwnership(RealBCrowdsaleAddress)
      const value = ether('1')

      await RealBCrowdsale.buyTokens(investor, { value: value, from: purchaser })
      const tokens = await RealBToken.balanceOf(investor)

      const actual = bigNumberToString(tokens)
      const expected = TOKEN_RATE.toString()

      assert.deepEqual(actual, expected)
    })

    it('should the address token equals to address token in the crowdsale', async () => {
      const { RealBToken, RealBCrowdsale } = await getContracts()
      const actual = await RealBToken.address
      const expected = await RealBCrowdsale.token()

      assert.deepEqual(actual, expected)
    })
  })

  contract('RealBCrowdsale', async ([owner, investor, wallet, purchaser]) => {
    it(`should be the owner of the token ${TOKEN_NAME} the owner`, async () => {
      const { RealBToken } = await getContracts()

      const actual = await RealBToken.owner()
      const expected = owner

      assert.deepEqual(actual, expected)
    })
  })
})

describe('RealBCrowdsale changeWallet', () => {
  contract('RealBCrowdsale', ([owner, investor, wallet, newWallet]) => {
    it('should return the new wallet', async () => {
      const { RealBCrowdsale } = await getContracts()

      await RealBCrowdsale.changeWallet(newWallet)

      const actual = await RealBCrowdsale.wallet()
      const expected = newWallet

      assert.deepEqual(actual, expected)
    })

    it('should return event WalletChange', async () => {
      const { RealBCrowdsale } = await getContracts()

      const { logs } = await RealBCrowdsale.changeWallet(newWallet)
      const { event } = logs.find(e => e.event === 'WalletChange')

      const actual = event
      const expected = 'WalletChange'

      assert.deepEqual(actual, expected)
    })

    it('should revert if is not owner', async () => {
      const { RealBCrowdsale } = await getContracts()

      const actual = await RealBCrowdsale.changeWallet(newWallet, { from: investor }).catch(e => e.message)
      const expected = errorVM

      assert.isTrue(actual.includes(expected))
    })

    it('should return an error when is an empty Wallet', async () => {
      const { RealBCrowdsale } = await getContracts()

      const actual = await RealBCrowdsale.changeWallet().catch(e => e.message)
      const expected = 'Invalid number of parameters for "changeWallet". Got 0 expected 1!'

      assert.deepEqual(actual, expected)
    })
  })
})

describe('RealBCrowdsale Mintable Token', () => {
  context('when the crowdsale is open', () => {
    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      it('should can not mint by the owner', async () => {
        const { RealBToken, RealBCrowdsale } = await getContracts()
        const RealBCrowdsaleAddress = await RealBCrowdsale.address
        await RealBToken.transferOwnership(RealBCrowdsaleAddress)

        const BigNumber = web3.utils.BN
        const amount = new BigNumber(`${1}e+18`)
        const owner = await RealBToken.owner()

        const actual = await RealBToken.mint(purchaser, amount, { from: owner }).catch(e => e.message)
        const expected = 'sender account not recognized'

        assert.isTrue(actual.includes(expected))
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      it('should can not mint by the wallet', async () => {
        const { RealBToken } = await getContracts()
        const amount = 1e18.toString()

        const actual = await RealBToken.mint(purchaser, amount, { from: wallet }).catch(e => e.message)
        const expected = errorVM

        assert.isTrue(actual.includes(expected))
      })
    })


  })

})

describe('RealBCrowdsale Pausable Token', () => {
  describe('pause', function() {
    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused', () => {
        it('pauses the token', async () => {
          const { RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          await RealBToken.pause({ from: owner })
          const actual = await RealBToken.paused()
          const expected = true

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused', () => {
        it('emits a Pause event', async function() {
          const { RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          const { logs } = await RealBToken.pause({ from: owner })

          const actual = logs[0].event
          const expected = 'Paused'

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused twice', () => {
        it('reverts', async function() {
          const { RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          await RealBToken.pause({ from: owner })

          const actual = await RealBToken.pause({ from: owner }).catch(e => e.message)
          const expected = errorVM

          assert.isTrue(actual.includes(expected))
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the sender is not the owner', () => {
        it('reverts', async function() {
          const { RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          const actual = await RealBToken.pause({ from: investor }).catch(e => e.message)
          const expected = errorVM

          assert.isTrue(actual.includes(expected))
        })
      })
    })
  })

  describe('unpause', function() {
    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the sender is not the owner', () => {
        it('reverts', async function() {
          const { RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          await RealBToken.pause({ from: owner })

          const actual = await RealBToken.unpause({ from: investor }).catch(e => e.message)
          const expected = errorVM

          assert.isTrue(actual.includes(expected))
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is unpause', () => {
        it('emits a Unpause event', async function() {
          const { RealBCrowdsale, RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          const RealBCrowdsaleAddress = await RealBCrowdsale.address
          await RealBToken.transferOwnership(RealBCrowdsaleAddress)

          const value = ether('1')

          await RealBCrowdsale.buyTokens(investor, { value: value, from: investor })
          await RealBCrowdsale.returnOwnership()

          await RealBToken.pause({ from: owner })
          const { logs } = await RealBToken.unpause({ from: owner })

          const actual = logs[0].event
          const expected = 'Unpaused'

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is unpause twice', () => {
        it('reverts', async function() {
          const { RealBCrowdsale, RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          const RealBCrowdsaleAddress = await RealBCrowdsale.address
          await RealBToken.transferOwnership(RealBCrowdsaleAddress)

          const value = ether('1')

          await RealBCrowdsale.buyTokens(investor, { value: value, from: investor })

          await RealBCrowdsale.returnOwnership()

          await RealBToken.pause({ from: owner })
          await RealBToken.unpause({ from: owner })

          const actual = await RealBToken.unpause({ from: owner }).catch(e => e.message)
          const expected = errorVM

          assert.isTrue(actual.includes(expected))
        })
      })
    })
  })

  describe('pausable token', function() {
    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('default', () => {
        it('is not paused by default', async () => {
          const { RealBCrowdsale, RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          const RealBCrowdsaleAddress = await RealBCrowdsale.address
          await RealBToken.transferOwnership(RealBCrowdsaleAddress)

          const value = ether('1')

          await RealBCrowdsale.buyTokens(purchaser, { value: value, from: investor })

          await RealBCrowdsale.returnOwnership()

          await RealBToken.pause({ from: owner })
          const actual = await RealBToken.paused()
          const expected = true

          assert.deepEqual(actual, expected)
        })
      })
    })
  })

  describe('transfer', function() {
    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is unpaused', () => {
        it('allows to transfer', async () => {
          const { RealBCrowdsale, RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          const RealBCrowdsaleAddress = await RealBCrowdsale.address
          await RealBToken.transferOwnership(RealBCrowdsaleAddress)

          const value = ether('1')

          await RealBCrowdsale.buyTokens(wallet, { value: value, from: investor })

          await RealBCrowdsale.returnOwnership()
          await RealBToken.transfer(purchaser, 100e18.toString(), { from: wallet })

          const actual = bigNumberToString(await RealBToken.balanceOf(purchaser))
          const expected = '100'

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused and unpaused', () => {
        it('allows to transfer', async () => {
          const { RealBCrowdsale, RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          const RealBCrowdsaleAddress = await RealBCrowdsale.address
          await RealBToken.transferOwnership(RealBCrowdsaleAddress)

          const value = ether('1')

          await RealBCrowdsale.buyTokens(wallet, { value: value, from: investor })
          await RealBCrowdsale.returnOwnership()

          await RealBToken.pause({ from: owner })
          await RealBToken.unpause({ from: owner })

          await RealBToken.transfer(purchaser, 100e18.toString(), { from: wallet })

          const actual = bigNumberToString(await RealBToken.balanceOf(purchaser))
          const expected = '100'

          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('when the token is paused', () => {
        it('deny to transfer', async () => {
          const { RealBCrowdsale, RealBToken } = await getContracts()
          await RealBToken.unpause({ from: owner })

          const RealBCrowdsaleAddress = await RealBCrowdsale.address
          await RealBToken.transferOwnership(RealBCrowdsaleAddress)

          const value = ether('1')

          await RealBCrowdsale.buyTokens(purchaser, { value: value, from: investor })

          await RealBCrowdsale.returnOwnership()

          await RealBToken.pause({ from: owner })

          const actual = await RealBToken.transfer(purchaser, 1, { from: wallet }).catch(e => e.message)
          const expected = errorVM

          assert.isTrue(actual.includes(expected))
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('private investment', () => {
        it('private investors can buy', async () => {
          const { RealBToken } = await getContracts()

          const isPaused = await RealBToken.paused()
          assert.isTrue(isPaused)

          const amount = 42e18.toString()
          await RealBToken.mint(investor, amount, { from: owner })

          const actual = bigNumberToString(await RealBToken.balanceOf(investor))
          const expected = '42'
          assert.deepEqual(actual, expected)
        })

        it('private investors cannot buy more than total cap for sale (50% of total cap)', async () => {
          const { RealBToken } = await getContracts()

          const isPaused = await RealBToken.paused()
          assert.isTrue(isPaused)

          const amount = '600000000000000000000000000'

          const actual = await RealBToken.mint(investor, amount, { from: owner }).catch(e => e.message)
          const expected = errorVM

          assert.deepEqual(actual, expected)
        })

        it('public investors can buy', async () => {
          const { RealBCrowdsale, RealBToken } = await getContracts()

          const RealBCrowdsaleAddress = await RealBCrowdsale.address
          await RealBToken.transferOwnership(RealBCrowdsaleAddress)

          const isPaused = await RealBToken.paused()
          assert.isTrue(isPaused)

          const value = ether('1')

          await RealBCrowdsale.buyTokens(purchaser, { value: value, from: purchaser })

          const actual = bigNumberToString(await RealBToken.balanceOf(purchaser))
          const expected = '30000'
          assert.deepEqual(actual, expected)
        })

        it('public investors cannot buy more than total cap for sale (50% of total cap)', async () => {
          const { RealBCrowdsale } = await getContracts()

          const value = ether('20000')

          const actual = await RealBCrowdsale.buyTokens(purchaser, { value: value, from: purchaser }).catch(e => e.message)
          const expected = errorVM
          assert.deepEqual(actual, expected)
        })
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      context('cannot buy more than 250k tokens', () => {
        it('1 public investor cannot buy more than 250k tokens', async () => {
          const { RealBCrowdsale, RealBToken } = await getContracts()
          const RealBCrowdsaleAddress = await RealBCrowdsale.address
          await RealBToken.transferOwnership(RealBCrowdsaleAddress)

          const value1 = ether('8')

          await RealBCrowdsale.buyTokens(purchaser, { value: value1, from: purchaser })

          const actual1 = bigNumberToString(await RealBToken.balanceOf(purchaser))
          const expected1 = '240000'
          assert.deepEqual(actual1, expected1)

          const value2 = ether('1')

          const actual2 = await RealBCrowdsale.buyTokens(purchaser, { value: value2, from: purchaser }).catch(e => e.message)
          const expected2 = errorVM
          assert.deepEqual(actual2, expected2)
        })
      })
    })
  })

  describe('approve', function() {
    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to approve when unpaused', async () => {
        const { RealBToken } = await getContracts()
        await RealBToken.unpause({ from: owner })

        const BigNumber = web3.utils.BN

        const tokens = 100e18.toString()

        await RealBToken.approve(purchaser, tokens, { from: wallet })

        const actual = bigNumberToString(await RealBToken.allowance(wallet, purchaser))
        const expected = '100'

        assert.deepEqual(actual, expected)
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to transfer when paused and then unpaused', async () => {
        const { RealBCrowdsale, RealBToken } = await getContracts()
        await RealBToken.unpause({ from: owner })

        const RealBCrowdsaleAddress = await RealBCrowdsale.address
        await RealBToken.transferOwnership(RealBCrowdsaleAddress)

        const tokens = 100e18.toString()

        const value = ether('1')

        await RealBCrowdsale.buyTokens(purchaser, { value: value, from: investor })

        await RealBCrowdsale.returnOwnership()
        await RealBToken.pause({ from: owner })
        await RealBToken.unpause({ from: owner })

        await RealBToken.approve(purchaser, tokens, { from: owner })

        const actual = bigNumberToString(await RealBToken.allowance(owner, purchaser))
        const expected = '100'

        assert.deepEqual(actual, expected)
      })
    })

  })

  describe('transfer from', function() {
    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to transfer from when unpaused', async () => {
        const { RealBCrowdsale, RealBToken } = await getContracts()
        await RealBToken.unpause({ from: owner })

        const RealBCrowdsaleAddress = await RealBCrowdsale.address
        await RealBToken.transferOwnership(RealBCrowdsaleAddress)

        const value = ether('4')
        await RealBCrowdsale.buyTokens(owner, { value: value, from: investor })

        const tokens = 42e18.toString()
        await RealBToken.approve(wallet, tokens, { from: owner })

        const tokensTransfer = 1e18.toString()

        const oldOwnerTokens = parseInt(bigNumberToString(await RealBToken.balanceOf(owner)))

        await RealBToken.transferFrom(owner, purchaser, tokensTransfer, { from: wallet })

        const actualOwner = bigNumberToString(await RealBToken.balanceOf(owner))
        const expectedOwner = (oldOwnerTokens - parseInt(bigNumberToString(tokensTransfer))).toString()

        const actualPurchaser = bigNumberToString(await RealBToken.balanceOf(purchaser))
        const expectedPurchaser = bigNumberToString(tokensTransfer)

        assert.deepEqual(actualOwner, expectedOwner)
        assert.deepEqual(actualPurchaser, expectedPurchaser)
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to transfer when paused and then unpaused', async () => {
        const { RealBCrowdsale, RealBToken } = await getContracts()
        await RealBToken.unpause({ from: owner })

        const RealBCrowdsaleAddress = await RealBCrowdsale.address
        await RealBToken.transferOwnership(RealBCrowdsaleAddress)

        const value = ether('2')
        await RealBCrowdsale.buyTokens(owner, { value: value, from: investor })

        const tokens = '42000000000000000000'
        const tokensTransfer = '1000000000000000000'

        await RealBToken.approve(wallet, tokens, { from: owner })

        await RealBCrowdsale.returnOwnership()

        await RealBToken.pause({ from: owner })
        await RealBToken.unpause({ from: owner })

        const oldOwnerTokens = parseInt(bigNumberToString(await RealBToken.balanceOf(owner)))

        await RealBToken.transferFrom(owner, purchaser, tokensTransfer, { from: wallet })

        const actualOwner = bigNumberToString(await RealBToken.balanceOf(owner))
        const expectedOwner = (oldOwnerTokens - parseInt(bigNumberToString(tokensTransfer))).toString()

        const actualPurchaser = bigNumberToString(await RealBToken.balanceOf(purchaser))
        const expectedPurchaser = bigNumberToString(tokensTransfer)

        assert.deepEqual(actualOwner, expectedOwner)
        assert.deepEqual(actualPurchaser, expectedPurchaser)
      })
    })

    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      it('reverts when trying to transfer from when paused', async () => {
        const { RealBCrowdsale, RealBToken } = await getContracts()
        await RealBToken.unpause({ from: owner })

        const RealBCrowdsaleAddress = await RealBCrowdsale.address
        await RealBToken.transferOwnership(RealBCrowdsaleAddress)

        const value = ether('4')

        await RealBCrowdsale.buyTokens(owner, { value: value, from: investor })

        const tokens = 42e18.toString()
        const tokensTransfer = 1e18.toString()

        await RealBToken.approve(wallet, tokens, { from: owner })

        await RealBCrowdsale.returnOwnership()
        await RealBToken.pause({ from: owner })

        const actual = await RealBToken
          .transferFrom(owner, purchaser, tokensTransfer, { from: owner })
          .catch(e => e.message)
        const expected = errorVM

        assert.isTrue(actual.includes(expected))
      })
    })
  })

  describe('increase approval', function() {
    contract('RealBCrowdsale', ([owner, investor, wallet, purchaser]) => {
      it('allows to increase approval', async () => {
        const { RealBCrowdsale, RealBToken } = await getContracts()
        await RealBToken.unpause({ from: owner })

        const RealBCrowdsaleAddress = await RealBCrowdsale.address
        await RealBToken.transferOwnership(RealBCrowdsaleAddress)

        const BigNumber = web3.utils.BN

        const value = ether('4')

        await RealBCrowdsale.buyTokens(purchaser, { value: value, from: investor })

        const tokensApprove = '40000000000000000000'

        await RealBCrowdsale.returnOwnership()
        await RealBToken.increaseAllowance(purchaser, tokensApprove, { from: wallet })

        const actual = bigNumberToString(await RealBToken.allowance(wallet, purchaser))
        const expected = '40'

        assert.deepEqual(actual, expected)
      })
    })
  })
})

