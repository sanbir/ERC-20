const Karbon14Token = artifacts.require('Karbon14Token')
const Karbon14Crowdsale = artifacts.require('Karbon14Crowdsale')
const { getConfig } = require('../Helpers/getConfig')
const { latestTime } = require('../Helpers/latestTime')
const { advanceBlock } = require('../Helpers/advanceToBlock')
const { increaseTimeTo, duration } = require('../Helpers/increaseTime')
const { TOKEN_NAME, TOKEN_TICKER, TOKEN_DECIMALS } = getConfig('development')
const { bigNumberToString } = require('../Helpers/web3')

const getContracts = async () => {
  const karbon14Token = await Karbon14Token.deployed()
  const karbon14Crowdsale = await Karbon14Crowdsale.deployed()
  return { karbon14Token, karbon14Crowdsale }
}

const errorVM = 'VM Exception while processing transaction: revert'

describe('mintEmergencyFund', () => {
  context('should not mint', () => {
    contract('karbon14Token', ([owner, investor, wallet, purchaser]) => {
      // it(`should TEST`, async () => {
      //   console.log('TIME BEFORE')
      //   console.log(await latestTime())
      //   await increaseTimeTo(await latestTime() + duration.years(1))
      //   await advanceBlock()
      //
      //   console.log('TIME AFTER')
      //   console.log(await latestTime())
      //
      //   const { karbon14Token } = await getContracts()
      //   console.log(await karbon14Token.emergencyFundReleaseDate())
      // })

      it(`should not mint emergency fund until 2 year anniversary`, async () => {
        const { karbon14Token } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.years(1))
        await advanceBlock()

        console.log('TIME should not mint')
        console.log(await latestTime())

        const actual = await karbon14Token.mintEmergencyFund().catch(e => e.message)
        const expected = errorVM

        assert.deepEqual(actual, expected)
      })
    })
  })

  context('should mint', () => {
    contract('karbon14Token', ([owner, investor, wallet, purchaser]) => {
      it(`should mint emergency fund after 2 year anniversary`, async () => {
        const { karbon14Token } = await getContracts()

        await increaseTimeTo(await latestTime() + duration.years(2))
        await advanceBlock()

        await karbon14Token.mintEmergencyFund()
        const isEmergencyFundMinted = await karbon14Token.isEmergencyFundMinted()
        assert.isTrue(isEmergencyFundMinted)

        const actual = bigNumberToString(await karbon14Token.balanceOf(owner))

        const expected = '100000000'

        assert.deepEqual(actual, expected)
      })
    })
  })
})


contract('karbon14Token', ([owner, spender]) => {
  it(`should be ${TOKEN_NAME} the name of the new token`, async () => {
    const { karbon14Token } = await await getContracts()
    const name = await karbon14Token.name()

    assert.equal(name, TOKEN_NAME)
  })

  it(`should be ${TOKEN_TICKER} the symbol of the new token`, async () => {
    const { karbon14Token } = await getContracts()
    const ticker = await karbon14Token.symbol()

    assert.equal(ticker, TOKEN_TICKER)
  })

  it(`should be ${TOKEN_DECIMALS} the decimals of the new token`, async () => {
    const { karbon14Token } = await getContracts()
    const decimals = await karbon14Token.decimals()
    assert.equal(decimals, TOKEN_DECIMALS)
  })
})

describe('karbon14Crowdsale allowance', () => {
  contract('karbon14Token', ([owner, spender]) => {
    describe('when there was no approved amount before', function() {
      it('approves the requested amount', async function() {
        const amount = 100
        const { karbon14Token } = await getContracts()
        await karbon14Token.approve(spender, amount, { from: owner })

        const actual = (await karbon14Token.allowance(owner, spender)).toString(10)
        const expected = amount.toString()

        assert.deepEqual(actual, expected)
      })
    })
  })

  contract('karbon14Token', ([owner, spender]) => {
    it('approves the requested amount and replaces the previous one', async function() {
      const amount = 100
      const { karbon14Token } = await getContracts()
      await karbon14Token.approve(spender, 1, { from: owner })
      await karbon14Token.approve(spender, amount, { from: owner })

      const actual = (await karbon14Token.allowance(owner, spender)).toString(10)
      const expected = amount.toString()

      assert.deepEqual(actual, expected)
    })
  })

  contract('karbon14Token', ([owner, spender]) => {
    it('emits an approval event', async function() {
      const amount = 100
      const { karbon14Token } = await getContracts()
      const { logs } = await karbon14Token.approve(spender, amount, { from: owner })

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
