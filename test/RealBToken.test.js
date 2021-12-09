const realBToken = artifacts.require('RealBToken')
const realBCrowdsale = artifacts.require('RealBCrowdsale')
const { getConfig } = require('../Helpers/getConfig')
const { latestTime } = require('../Helpers/latestTime')
const { advanceBlock } = require('../Helpers/advanceToBlock')
const { increaseTimeTo, duration } = require('../Helpers/increaseTime')
const { TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS } = getConfig('development')
const { bigNumberToString } = require('../Helpers/web3')

const getContracts = async () => {
  const RealBToken = await realBToken.deployed()
  const RealBCrowdsale = await realBCrowdsale.deployed()
  return { RealBToken, RealBCrowdsale }
}

const errorVM = 'Returned error: VM Exception while processing transaction: revert'

describe('mintEmergencyFund', () => {
  context('should not mint', () => {
    contract('RealBToken', ([owner, investor, wallet, purchaser]) => {

      it(`should not mint emergency fund until 2 year anniversary`, async () => {
        const { RealBToken } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.years(1))
        await advanceBlock()

        const actual = await RealBToken.mintEmergencyFund().catch(e => e.message)
        const expected = errorVM

        assert.isTrue(actual.includes(expected))
      })
    })
  })

  context('should mint', () => {
    contract('RealBToken', ([owner, investor, wallet, purchaser]) => {
      it(`should mint emergency fund after 2 year anniversary`, async () => {
        const { RealBToken } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.years(2))
        await advanceBlock()

        await RealBToken.mintEmergencyFund()
        const isEmergencyFundMinted = await RealBToken.isEmergencyFundMinted()
        assert.isTrue(isEmergencyFundMinted)

        const actual = bigNumberToString(await RealBToken.balanceOf(owner))

        const expected = '100000000'

        assert.deepEqual(actual, expected)
      })
    })
  })
})

describe('LongTermFoundationBudget', () => {
  context('should not mint', () => {
    contract('RealBToken', ([owner, investor, wallet, purchaser]) => {

      it(`should not mint LongTermFoundationBudget until 4 year anniversary`, async () => {
        const { RealBToken } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.years(3))
        await advanceBlock()

        const actual = await RealBToken.mintLongTermFoundationBudget().catch(e => e.message)
        const expected = errorVM

        assert.isTrue(actual.includes(expected))
      })
    })
  })

  context('should mint', () => {
    contract('RealBToken', ([owner, investor, wallet, purchaser]) => {
      it(`should mint LongTermFoundationBudget after 4 year anniversary`, async () => {
        const { RealBToken } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.years(4))
        await advanceBlock()

        await RealBToken.mintLongTermFoundationBudget()
        const isLongTermFoundationBudgetMinted = await RealBToken.isLongTermFoundationBudgetMinted()
        assert.isTrue(isLongTermFoundationBudgetMinted)

        const actual = bigNumberToString(await RealBToken.balanceOf(owner))

        const expected = '40000000'

        assert.deepEqual(actual, expected)
      })
    })
  })
})

describe('ReservedForUseByAdminToken', () => {
  context('should not mint', () => {
    contract('RealBToken', ([owner, investor, wallet, purchaser]) => {

      it(`should not mint ReservedForUseByAdminToken until 1 year anniversary`, async () => {
        const { RealBToken } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.days(30))
        await advanceBlock()

        const actual = await RealBToken.mintReservedForUseByAdmin().catch(e => e.message)
        const expected = errorVM

        assert.isTrue(actual.includes(expected))
      })
    })
  })

  context('should not mint directly without funds', () => {
    contract('RealBToken', ([owner, investor, wallet, purchaser]) => {

      it(`should not mint directly without funds`, async () => {
        const { RealBToken } = await getContracts()

        const BigNumber = web3.utils.BN
        const amount = new BigNumber(`${42}e+18`)

        try {
          await RealBToken.mintFund(investor, amount, {from: owner})
        } catch (actual) {
          assert.isTrue(actual.message.indexOf('mintFund is not a function') > 0)
        }
      })
    })
  })

  context('should mint ReservedForUseByAdminToken 20 % in 1 year', () => {
    contract('RealBToken', ([owner, investor, wallet, purchaser]) => {
      it(`should mint ReservedForUseByAdminToken after 1 year anniversary`, async () => {
        const { RealBToken } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.years(1))
        await advanceBlock()

        await RealBToken.mintReservedForUseByAdmin()

        const actual = bigNumberToString(await RealBToken.balanceOf(owner))

        const expected = '72000000'

        assert.deepEqual(actual, expected)
      })
    })
  })

  context('should mint ReservedForUseByAdminToken all', () => {
    contract('RealBToken', ([owner, investor, wallet, purchaser]) => {
      it(`should mint ReservedForUseByAdminToken after 1 year anniversary`, async () => {
        const { RealBToken } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.years(3))
        await advanceBlock()

        await RealBToken.mintReservedForUseByAdmin()
        await RealBToken.mintReservedForUseByAdmin()
        await RealBToken.mintReservedForUseByAdmin()
        await RealBToken.mintReservedForUseByAdmin()
        await RealBToken.mintReservedForUseByAdmin()

        const isReservedForUseByAdminMinted = await RealBToken.isReservedForUseByAdminMinted()
        assert.isTrue(isReservedForUseByAdminMinted)

        const actual = bigNumberToString(await RealBToken.balanceOf(owner))

        const expected = '360000000'

        assert.deepEqual(actual, expected)
      })
    })
  })
})

contract('RealBToken', ([owner, spender]) => {
  it(`should be ${TOKEN_NAME} the name of the new token`, async () => {
    const { RealBToken } = await await getContracts()
    const name = await RealBToken.name()

    assert.equal(name, TOKEN_NAME)
  })

  it(`should be ${TOKEN_TICKER} the symbol of the new token`, async () => {
    const { RealBToken } = await getContracts()
    const ticker = await RealBToken.symbol()

    assert.equal(ticker, TOKEN_TICKER)
  })

  it(`should be 18 the decimals of the new token`, async () => {
    const { RealBToken } = await getContracts()
    const decimals = await RealBToken.decimals()
    assert.equal(decimals, 18)
  })
})

describe('RealBCrowdsale allowance', () => {
  contract('RealBToken', ([owner, spender]) => {
    describe('when there was no approved amount before', function() {
      it('approves the requested amount', async function() {
        const amount = 100
        const { RealBToken } = await getContracts()
        await RealBToken.unpause({ from: owner })
        await RealBToken.approve(spender, amount, { from: owner })

        const actual = (await RealBToken.allowance(owner, spender)).toString(10)
        const expected = amount.toString()

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('RealBToken', ([owner, spender]) => {
    it('approves the requested amount and replaces the previous one', async function() {
      const amount = 100
      const { RealBToken } = await getContracts()
      await RealBToken.unpause({ from: owner })
      await RealBToken.approve(spender, 1, { from: owner })
      await RealBToken.approve(spender, amount, { from: owner })

      const actual = (await RealBToken.allowance(owner, spender)).toString(10)
      const expected = amount.toString()

      assert.deepEqual(actual, expected)
    })
  })

  contract('RealBToken', ([owner, spender]) => {
    it('emits an approval event', async function() {
      const amount = 100
      const { RealBToken } = await getContracts()

      await RealBToken.unpause({ from: owner })
      const { logs } = await RealBToken.approve(spender, amount, { from: owner })

      const actual = {
        event: logs[0].event,
        owner: logs[0].args.owner,
        spender: logs[0].args.spender,
        value: logs[0].args.value.toString(10),
      }

      const expected = {
        event: 'Approval',
        owner,
        spender,
        value: amount.toString(),
      }

      assert.deepEqual(actual, expected)
    })
  })
})
