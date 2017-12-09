const web3 = global.web3;
const Splitter = artifacts.require('./Splitter.sol')

contract('Splitter', function(accounts) {
  let deposit = web3.toWei(2, 'ether')

  const bobAddress = '0x8B578b413186cD75590372ACacB6FaC64e9EAD12'
  const carolAddress = '0xcd8148C45ABFF4b3F01faE5aD31bC96AD6425054'

  let splitter

  before('should deploy Splitter', async function() {
    splitter = await Splitter.new({ from: accounts[0] })
  })

  describe('deposit()', async function() {
    it('should split deposited amount equally between bob and carol', async function() {
      let bobBalanceBefore = await splitter.balances.call(bobAddress)
      let carolBalanceBefore = await splitter.balances.call(carolAddress)
      
      await splitter.deposit(bobAddress, carolAddress, {
        from: accounts[0],
        value: deposit
      })

      let bobBalanceAfter = await splitter.balances.call(bobAddress)
      let carolBalanceAfter = await splitter.balances.call(carolAddress)

      assert.strictEqual(
        parseInt(bobBalanceBefore.toString()),
        0
      )

      assert.strictEqual(
        parseInt(carolBalanceBefore.toString()),
        0
      )

      assert.strictEqual(
        parseInt(bobBalanceAfter.toString()),
        deposit / 2
      )

      assert.strictEqual(
        parseInt(carolBalanceAfter.toString()),
        deposit / 2
      )
    })
  });
})
