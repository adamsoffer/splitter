import React from 'react'
import { default as contract } from 'truffle-contract'
import Promise from 'bluebird'
import { Div, Span, H1, Form } from 'glamorous'
import splitterArtifacts from '../build/contracts/Splitter.json'
import web3 from '../lib/web3'
import Main from '../lib/layout'
import Button from '../components/Button'
import Textfield from '../components/Textfield'

const Splitter = contract(splitterArtifacts)

web3.eth.getTransactionReceiptMined = require('../lib/getTransactionReceiptMined.js')

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
    const accounts = await web3.eth.getAccounts()
    const instance = await Splitter.deployed()
    const contractBalance = await web3.eth.getBalance(instance.address)
    const aliceBalance = await web3.eth.getBalance(accounts[0])
    const bobBalance = await instance.balances.call(accounts[1])
    const carolBalance = await instance.balances.call(accounts[2])
    return {
      accounts,
      aliceBalance,
      contractBalance,
      bobBalance,
      carolBalance
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      contractBalance: props.contractBalance,
      aliceBalance: props.aliceBalance,
      bobBalance: props.bobBalance,
      carolBalance: props.carolBalance
    }
  }

  componentDidMount() {
    this.onDeposit()
    this.onWithdraw()
  }

  handleDepositSubmission(event) {
    event.preventDefault()
    let deposit = web3.utils.toWei(event.target.deposit.value, 'ether')
    let bob = event.target.bob.value
    let carol = event.target.carol.value
    return Splitter.deployed()
      .then(instance => {
        return instance.deposit.sendTransaction(bob, carol, {
          from: this.props.accounts[0],
          value: deposit
        })
      })
      .then(function(txHashes) {
        console.log('pending confirmation...')
        return web3.eth.getTransactionReceiptMined(txHashes)
      })
      .then(function(receipts) {
        console.log('confirmed')
      })
      .catch(e => {
        console.log(e)
      })
  }

  handleWithDrawalSubmission(event) {
    event.preventDefault()
    return Splitter.deployed()
      .then(instance => {
        return instance.withdraw.sendTransaction({
          from: this.props.accounts[0]
        })
      })
      .then(function(txHashes) {
        console.log('pending confirmation...')
        return web3.eth.getTransactionReceiptMined(txHashes)
      })
      .then(function(receipts) {
        console.log('confirmed')
      })
      .catch(e => {
        console.log(e)
      })
  }

  onDeposit() {
    return Splitter.deployed().then(instance => {
      // watch for changes
      instance.LogDeposit().watch((error, e) => {
        if (!error) {
          this.setState({
            contractBalance: this.state.contractBalance + e.args.deposit,
            aliceBalance: this.state.aliceBalance - deposit,
            bobBalance: this.state.bobBalance + e.args.deposit / 2,
            carolBalance:
              this.state.carolBalance + (e.args.deposit - e.args.deposit / 2)
          })
        } else {
          console.log(error)
        }
      })
    })
  }

  onWithdraw() {
    return Splitter.deployed().then(instance => {
      instance.LogWithdraw().watch((error, e) => {
        if (!error) {
          if (e.args.from === accounts[1]) {
            this.setState({
              bobBalance: this.state.bobBalance - e.args.withdrawnAmount
            })
          } else {
            this.setState({
              carolBalance: this.state.carolBalance - e.args.withdrawnAmount
            })
          }
        } else {
          console.log(error)
        }
      })
    })
  }

  render() {
    return (
      <Main>
        <Div maxWidth="500px" margin="50px auto 0 auto">
          <H1 fontSize="32px" marginBottom="20px">
            Splitter
          </H1>
          <Div lineHeight="1.5" marginBottom="30px">
            <Div>
              <Span marginRight="5px">Contract Balance:</Span>
              {web3.utils.fromWei(
                this.state.contractBalance.toString(),
                'ether'
              )}
            </Div>
            <Div>
              <Span marginRight="5px">Alice's Balance:</Span>
              {web3.utils.fromWei(this.state.aliceBalance.toString(), 'ether')}
            </Div>
            <Div>
              <Span marginRight="5px">Bob's Balance:</Span>
              {web3.utils.fromWei(this.state.bobBalance.toString(), 'ether')}
            </Div>
            <Div>
              <Span marginRight="5px">Carol's Balance:</Span>
              {web3.utils.fromWei(this.state.carolBalance.toString(), 'ether')}
            </Div>
          </Div>
          <Form onSubmit={this.handleDepositSubmission.bind(this)}>
            <Textfield
              readonly
              disabled
              value={this.props.accounts[1]}
              label="Bob Address"
              type="text"
              name="bob"
            />
            <Textfield
              readonly
              disabled
              value={this.props.accounts[2]}
              label="Carol Address"
              type="text"
              name="carol"
            />
            <Textfield
              placeholder="ex: 10"
              step="any"
              label="Deposit Amount"
              type="number"
              name="deposit"
            />
            <Button type="submit">Deposit</Button>
          </Form>

          <Form onSubmit={this.handleWithdrawalSubmission.bind(this)}>
            <Button type="submit">Deposit</Button>
          </Form>
        </Div>
      </Main>
    )
  }
}
