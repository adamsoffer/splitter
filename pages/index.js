import React from 'react'
import { default as contract } from 'truffle-contract'
import splitterArtifacts from '../build/contracts/Splitter.json'
import web3 from '../lib/web3'
import Main from '../lib/layout'
import Button from '../components/Button'
import Textfield from '../components/Textfield'
import 'isomorphic-fetch'

const bobAddress = '0x8B578b413186cD75590372ACacB6FaC64e9EAD12'
const carolAddress = '0xcd8148C45ABFF4b3F01faE5aD31bC96AD6425054'
const Splitter = contract(splitterArtifacts)

Splitter.setProvider(web3.currentProvider)

export default class extends React.Component {
  static async getInitialProps({ pathname }) {
    const account = await getAccount()
    return {
      account
    }
  }

  state = {}

  componentDidMount() {
    Splitter.deployed().then(instance => {
      this.setBalances(instance)
    })
    this.onDeposit()
  }

  setBalances(instance) {
    // Get Contract Balance
    web3.eth.getBalance(instance.address, (error, result) => {
      if (!error) {
        this.setState({
          contractBalance: window.web3.fromWei(result.toString(), 'ether')
        })
      } else {
        reject(error)
      }
    })

    // Get Bob's Balance
    instance.balances.call(bobAddress).then(instance => {
      this.setState({
        bobBalance: window.web3.fromWei(instance.toString(), 'ether')
      })
    })

    // Get Carol's Balance
    instance.balances.call(bobAddress).then(instance => {
      this.setState({
        carolBalance: window.web3.fromWei(instance.toString(), 'ether')
      })
    })
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
      .then(instance => {})
      .catch(e => {
        console.log(e)
      })
  }

  onDeposit() {
    let contractBalance
    let bobBalance
    let carolBalance

    Splitter.deployed().then(instance => {
      let event = instance.LogDeposit()

      // watch for changes
      event.watch((error, event) => {
        if (!error) {
          contractBalance = window.web3.fromWei(
            event.args.contractBalance.toString(),
            'ether'
          )
          bobBalance = window.web3.fromWei(
            event.args.bobBalance.toString(),
            'ether'
          )
          carolBalance = window.web3.fromWei(
            event.args.carolBalance.toString(),
            'ether'
          )
          this.setState({
            contractBalance,
            bobBalance,
            carolBalance
          })
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
            <div>Contract Balance: {this.state.contractBalance}</div>
            <div>Bob's Balance: {this.state.bobBalance}</div>
            <div>Carol's Balance: {this.state.carolBalance}</div>
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
