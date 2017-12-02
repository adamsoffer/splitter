pragma solidity ^0.4.4;

import "./Mortal.sol";


contract Splitter is Mortal {
  mapping(address => uint) public balances;

  event LogDeposit(
    address indexed _from,
    uint indexed _value
  );

  // Using bob and carol as named arguments but this function is a utility
  // that anyone can use.
  function deposit(address bob, address carol) public payable returns (bool success) {
    // Make sure there is in fact ether being sent
    require(msg.value > 0);

    // Check for empty/incorrect addresses
    require(bob != address(0));
    require(carol != address(0));

    uint bobBalance = msg.value / 2;
    uint carolBalance = msg.value - bobBalance; // accounts for the fact that odd values may leave 1 wei in the contact
    balances[bob] += bobBalance;
    balances[carol] += carolBalance;

    LogDeposit(msg.sender, msg.value);
    return true;
  }

  // Fallback function
  function() public {
    revert();
  }

  // Allow bob and carol to withdraw balance
  function withdraw() public returns (bool success) {
    uint balance = balances[msg.sender];
    require(balance > 0);

    // Update state before transfering
    balances[msg.sender] = 0;

    msg.sender.transfer(balance);
    return true;
  }
}
