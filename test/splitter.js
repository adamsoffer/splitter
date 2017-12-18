const web3 = require('../lib/web3')
const Splitter = artifacts.require('./Splitter.sol')

contract('Splitter', function(accounts) {
  let deposit = web3.utils.toWei('2', 'ether')

  let splitter

  before('should deploy Splitter', async function() {
    splitter = await Splitter.new({ from: accounts[0] })
  })

  describe('deposit()', async function() {
    it('should split deposit equally among bob and carol', async function() {
      let bobBalanceBefore = await splitter.balances.call(accounts[0])
      let carolBalanceBefore = await splitter.balances.call(accounts[1])

      await splitter.deposit(accounts[0], accounts[1], {
        from: accounts[3],
        value: deposit
      })

      let bobBalanceAfter = await splitter.balances.call(accounts[0])
      let carolBalanceAfter = await splitter.balances.call(accounts[1])
      assert.strictEqual(
        bobBalanceAfter.minus(bobBalanceBefore).toString(10),
        (deposit / 2).toString(10)
      )
      assert.strictEqual(
        carolBalanceAfter.minus(carolBalanceBefore).toString(10),
        (deposit / 2).toString(10)
      )
    })
  })

  describe('withdraw()', async function() {
    it('account value should be 0 after withdraw', async function() {
      await splitter.withdraw({
        from: accounts[0]
      })

      let bobBalanceAfter = await splitter.balances.call(accounts[0])

      assert.strictEqual(bobBalanceAfter.toString(10), '0')
    })
  })
})
