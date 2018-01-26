const web3 = require('../lib/web3')
const Splitter = artifacts.require('./Splitter.sol')

contract('Splitter', function(accounts) {
  let splitter
  let deposit = web3.utils.toWei('2', 'ether')
  let carolContractBalanceBefore
  let carolContractBalanceAfter
  let bobContractBalanceBefore
  let bobContractBalanceAfter
  let bobAccountBalanceBefore
  let bobAccountBalanceAfter
  let gasCost

  before('should deploy Splitter', async function() {
    splitter = await Splitter.new({
      from: accounts[3]
    })
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
        bobContractBalanceAfter.sub(bobContractBalanceBefore).toString(10),
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
    it("bob's contract balance should be 0 after withdrawal", async function() {
      bobAccountBalanceBefore = await web3.eth.getBalance(accounts[0])
      let gasPrice = await web3.eth.getGasPrice()
      let tx = await splitter.withdraw({
        from: accounts[0],
        gas: '1500000',
        gasPrice
      })

      gasCost = web3.utils
        .toBN(gasPrice)
        .mul(web3.utils.toBN(tx.receipt.gasUsed))
      bobContractBalanceAfter = await splitter.balances.call(accounts[0])
      assert.strictEqual(bobContractBalanceAfter.toString(10), '0')
    })

    it("bob's account balance should increase by the expected amount", async function() {
      let bobsShare = web3.utils.toBN(deposit).div(web3.utils.toBN(2))
      bobAccountBalanceAfter = await web3.eth.getBalance(accounts[0])

      assert.strictEqual(
        web3.utils
          .toBN(bobAccountBalanceAfter)
          .sub(web3.utils.toBN(bobAccountBalanceBefore))
          .toString(10),
        bobsShare.sub(gasCost).toString(10)
      )
    })
  })
})
