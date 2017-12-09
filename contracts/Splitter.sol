pragma solidity ^0.4.4;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./Mortal.sol";


contract Splitter is Mortal {
  using SafeMath for uint;
  mapping(address => uint) public balances;

  event LogDeposit(
    address indexed from,
    address indexed bob,
    address indexed carol,
    uint deposit
  );

  // Using bob and carol as named arguments but this function is a utility
  // that anyone can use.
  function deposit(address bob, address carol) public payable returns (bool success) {
    // Make sure there is in fact ether being sent
    require(msg.value > 0);

    // Check for empty/incorrect addresses
    require(bob != address(0));
    require(carol != address(0));

    uint bobBalance = msg.value.div(2);
    
    // accounts for the fact that odd values may leave 1 wei in the contact
    uint carolBalance = msg.value.sub(bobBalance);
  
    balances[bob] = balances[bob].add(bobBalance);
    balances[carol] = balances[carol].add(carolBalance);

    LogDeposit(msg.sender, msg.value, bob, carol);
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
