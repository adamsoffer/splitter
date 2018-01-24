const web3 = require('../lib/web3')
const Splitter = artifacts.require('./Splitter.sol')

contract('Splitter', function(accounts) {
  let splitter
  let deposit = web3.utils.toWei('2', 'ether')
  let carolContractBalanceBefore
  let carolContractBalanceAfter
  let bobContractBalanceBefore
  let bobContractBalanceAfter

  before('should deploy Splitter', async function() {
    splitter = await Splitter.new({ from: accounts[0] })
    bobContractBalanceBefore = await splitter.balances.call(accounts[0])
    carolContractBalanceBefore = await splitter.balances.call(accounts[1])
  })

  describe('deposit()', async function() {
    it('should split deposit equally among bob and carol', async function() {
      await splitter.deposit(accounts[0], accounts[1], {
        from: accounts[3],
        value: deposit
      })

      bobContractBalanceAfter = await splitter.balances.call(accounts[0])
      carolContractBalanceAfter = await splitter.balances.call(accounts[1])

      assert.strictEqual(
        bobContractBalanceAfter.minus(bobContractBalanceBefore).toString(10),
        web3.utils
          .toBN(deposit)
          .div(web3.utils.toBN(2))
          .toString(10)
      )

      assert.strictEqual(
        carolContractBalanceAfter.sub(carolContractBalanceBefore).toString(10),
        web3.utils
          .toBN(deposit)
          .div(web3.utils.toBN(2))
          .toString(10)
      )
    })
  })

  describe('withdraw()', async function() {
    it('bobs contract balance should be 0 after withdrawal', async function() {
      await splitter.withdraw({
        from: accounts[0]
      })

      bobContractBalanceAfter = await splitter.balances.call(accounts[0])

      assert.strictEqual(bobContractBalanceAfter.toString(10), '0')
    })
  })
})
