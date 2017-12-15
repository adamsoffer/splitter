import React from 'react'
import { default as contract } from 'truffle-contract'
import Promise from 'bluebird'
import splitterArtifacts from '../build/contracts/Splitter.json'
import web3 from '../lib/web3'
import Main from '../lib/layout'
import Button from '../components/Button'
import Textfield from '../components/Textfield'

const bobAddress = '0x8B578b413186cD75590372ACacB6FaC64e9EAD12'
const carolAddress = '0xcd8148C45ABFF4b3F01faE5aD31bC96AD6425054'
const Splitter = contract(splitterArtifacts)

if (typeof web3.eth.getBlockPromise !== 'function') {
  Promise.promisifyAll(web3.eth, { suffix: 'Promise' })
}

Splitter.setProvider(web3.currentProvider)

Promise.promisifyAll(Splitter, { suffix: 'Promise' })

// hack for web3@1.0.0 async/await support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
if (typeof Splitter.currentProvider.sendAsync !== 'function') {
  Splitter.currentProvider.sendAsync = function() {
    return Splitter.currentProvider.send.apply(
      Splitter.currentProvider,
      arguments
    )
  }
}

export default class extends React.Component {
  static async getInitialProps({ pathname }) {
    const account = await getAccount()
    const instance = await Splitter.deployed()
    const contractBalance = await web3.eth.getBalance(instance.address)
    const bobBalance = await instance.balances.call(bobAddress)
    const carolBalance = await instance.balances.call(carolAddress)
    return {
      account,
      contractBalance,
      bobBalance,
      carolBalance
    }
  }

  componentDidMount() {
    this.onDeposit()
  }

  handleSubmit(event) {
    event.preventDefault()
    let deposit = window.web3.toWei(event.target.deposit.value, 'ether')
    let bob = event.target.bob.value
    let carol = event.target.carol.value
    Splitter.deployed()
      .then(instance => {
        return instance.deposit(bob, carol, {
          from: this.props.account,
          value: deposit
        })
      })
      .then(response => {
        console.log(response)
      })
      .catch(e => {
        console.log(e)
      })
  }

  onDeposit() {
    let event
    let deposit
    Splitter.deployed().then(instance => {
      event = instance.LogDeposit()
      // watch for changes
      event.watch((error, event) => {
        if (!error) {
          deposit = web3.fromWei(event.args.deposit.toString(), 'ether')
          // TODO: Use a state manager to update UI on deposit
          console.log(deposit)
        } else {
          console.log(error)
        }
      })
    })
  }

  render() {
    return (
      <Main>
        <div style={{ maxWidth: '500px', margin: '50px auto 0 auto' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Splitter</h1>
          <div style={{ lineHeight: 1.5, marginBottom: '30px' }}>
            <div>
              Contract Balance:
              {web3.utils.fromWei(this.props.contractBalance, 'ether')}
            </div>
            <div>
              Bob's Balance:
              {web3.utils.fromWei(this.props.bobBalance, 'ether')}
            </div>
            <div>
              Carol's Balance:
              {web3.utils.fromWei(this.props.carolBalance, 'ether')}
            </div>
          </div>
          <form onSubmit={this.handleSubmit.bind(this)}>
            <input type="hidden" name="bob" value={bobAddress} />
            <input type="hidden" name="carol" value={carolAddress} />
            <Textfield
              placeholder="ex: 10"
              step="any"
              label="Deposit Amount"
              type="number"
              name="deposit"
            />
            <Button type="submit">Deposit</Button>
          </form>
        </div>
      </Main>
    )
  }
}

function getAccount() {
  return new Promise(function(resolve, reject) {
    web3.eth.getAccounts((err, accounts) => {
      if (err != null) {
        reject('There was an error fetching your accounts.')
      }
      if (accounts.length === 0) {
        reject(
          'Could not get any accounts! Make sure your Ethereum client is configured correctly.'
        )
        return
      }
      resolve(accounts[0])
    })
  })
}
