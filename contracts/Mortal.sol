pragma solidity ^0.4.4;


contract Mortal {
  address private owner;

  function Mortal() public {
    owner = msg.sender;
  }

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  /* Function to recover the funds on the contract */
  function kill() public onlyOwner {
    if (msg.sender == owner) {
      selfdestruct(owner);
    }
  }
}
