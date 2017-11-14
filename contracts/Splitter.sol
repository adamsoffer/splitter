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

    // Check for empty/incorrect addresses
    require(bob != address(0));
    require(carol != address(0));

    // TODO: account for the fact that odd values may leave 1 wei in the
    // contract balance
    balances[bob] += msg.value / 2;
    balances[carol] += msg.value / 2;

    LogDeposit(this.balance, balances[bob], balances[carol]);
    return true;
  }

  // Fallback function
  function() public {
    revert();
  }

  function withdraw() public returns (bool success) {
    require(balances[msg.sender] > 0);
    uint balace = balances[msg.sender];

    // Set user's balance to zero before transfering funds
    balace[msg.sender] = 0;

    msg.sender.transfer(balace);
    return true;
  }
}
