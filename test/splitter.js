const web3 = global.web3;
const Splitter = artifacts.require('./Splitter.sol')

contract('Splitter', function(accounts) {
  let deposit = web3.toWei(4, 'ether')

  const bobAddress = '0x8B578b413186cD75590372ACacB6FaC64e9EAD12'
  const carolAddress = '0xcd8148C45ABFF4b3F01faE5aD31bC96AD6425054'

  let splitter

  before('should deploy Splitter', async function() {
    splitter = await Splitter.new({ from: accounts[0] })
  })

  it('should split deposited amount equally between two accounts', async function() {
    await splitter.deposit(bobAddress, carolAddress, {
      from: accounts[0],
      value: deposit
    })
    let bobBalance = await splitter.balances.call(bobAddress)
    let carolBalance = await splitter.balances.call(carolAddress)
    assert.strictEqual(
      web3.fromWei(bobBalance.toString(), 'ether'),
      web3.fromWei(carolBalance.toString(), 'ether')
    )
  })
})
