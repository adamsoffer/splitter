import React from 'react'
import { default as contract } from 'truffle-contract'
import Promise from 'bluebird'
import { Div, Span, H1, H2, Form } from 'glamorous'
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
    const instance = await Splitter.deployed()
    return {}
  }

  constructor(props) {
    super(props)
    this.state = {
      contractBalance: 0,
      balances: {}
    }
  }

  componentDidMount() {
    this.setAccount()
    this.onDeposit()
    this.onWithdraw()
    this.getBalances()
  }

  async getBalances() {
    let instance = await Splitter.deployed()
    let transferEvent = instance.LogDeposit(
      {},
      { fromBlock: 0, toBlock: 'latest' }
    )
    transferEvent.get((error, logs) => {})
  }

  async setAccount() {
    let accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
  }

  handleDepositSubmission(event) {
    event.preventDefault()
    let deposit = web3.utils.toWei(event.target.deposit.value, 'ether')
    let bob = event.target.bob.value
    let carol = event.target.carol.value
    return Splitter.deployed()
      .then(instance => {
        return instance.deposit.sendTransaction(bob, carol, {
          from: this.state.account,
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

  handleWithdrawalSubmission(event) {
    event.preventDefault()
    return Splitter.deployed()
      .then(async instance => {
        let gasPrice = await web3.eth.getGasPrice()
        return instance.withdraw.sendTransaction({
          from: this.state.account,
          gas: '1500000',
          gasPrice
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
    return Splitter.deployed().then(async instance => {
      let event = instance.LogDeposit({}, { fromBlock: 0, toBlock: 'latest' })
      event.watch(async (error, e) => {
        if (!error) {
          let bobBalance = await instance.balances.call(e.args.bob)
          let carolBalance = await instance.balances.call(e.args.carol)
          let contractBalance = await web3.eth.getBalance(instance.address)

          let newBalances = {
            [e.args.bob]: bobBalance,
            [e.args.carol]: carolBalance
          }

          this.setState({
            contractBalance: contractBalance,
            balances: { ...this.state.balances, ...newBalances }
          })
        } else {
          console.log(error)
        }
      })
    })
  }

  onWithdraw() {
    console.log('test')
    return Splitter.deployed().then(instance => {
      let event = instance.LogWithdraw()
      event.watch(async (error, e) => {
        if (!error) {
          let from = await instance.balances.call(e.args.from)
          let contractBalance = await web3.eth.getBalance(instance.address)
          console.log('withdraw')
          let newBalances = {
            [e.args.from]: from
          }

          this.setState({
            contractBalance: contractBalance,
            balances: { ...this.state.balances, ...newBalances }
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
        <Div maxWidth="500px" margin="50px auto 0 auto">
          <H1 fontSize="32px" marginBottom="20px">
            Splitter
          </H1>
          <Div lineHeight="1.5" marginBottom="30px">
            <Div>
              <Span marginRight="5px">Contract Balance:</Span>
              <Span fontWeight="bold">
                {web3.utils.fromWei(
                  this.state.contractBalance.toString(),
                  'ether'
                )}
              </Span>
            </Div>
            {Object.keys(this.state.balances).map((address, keyIndex) => {
              return (
                <Div key={keyIndex}>
                  <Span marginRight="5px">{address}:</Span>
                  <Span fontWeight="bold">
                    {web3.utils.fromWei(
                      this.state.balances[address].toString(),
                      'ether'
                    )}
                  </Span>
                </Div>
              )
            })}

            {/* <Div>
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
            </Div> */}
          </Div>
          <Div lineHeight="1.5" marginBottom="30px">
            <Form onSubmit={this.handleDepositSubmission.bind(this)}>
              <Textfield label="Bob Address" type="text" name="bob" />
              <Textfield label="Carol Address" type="text" name="carol" />
              <Textfield
                placeholder="ex: 10"
                step="any"
                label="Deposit Amount"
                type="number"
                name="deposit"
              />
              <Button type="submit">Deposit</Button>
            </Form>
          </Div>
          <Div lineHeight="1.5" marginBottom="30px">
            <H2 fontSize="24px" marginBottom="20px">
              Withdraw your funds.
            </H2>
            <Form onSubmit={this.handleWithdrawalSubmission.bind(this)}>
              <Button type="submit">Withdraw</Button>
            </Form>
          </Div>
        </Div>
      </Main>
    )
  }
}
