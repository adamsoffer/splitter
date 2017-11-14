pragma solidity ^0.4.4;

import "./Mortal.sol";


contract Splitter is Mortal {
  mapping(address => uint) public balances;
  event LogDeposit(
    uint contractBalance,
    uint bobBalance,
    uint carolBalance
  );

  function deposit(address bob, address carol) public payable returns (bool success) {
    // Make sure there is in fact ether being sent
    require(msg.value > 0);

    // check for empty/incorrect addresses
    require(bob != address(0));
    require(carol != address(0));

    // Split value between bob and carol
    balances[bob] += msg.value / 2;
    balances[carol] += msg.value / 2;

    LogDeposit(this.balance, balances[bob], balances[carol]);
    return true;
  }

  function() public {
    revert();
  }
}
