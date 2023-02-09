//SPDX-License-Identifier: MIT

//pragma
pragma solidity 0.8.8;

//impoorts

import "./PriceConverter.sol";

//Error Codes

error FundMe__NotOwner();

// interfaces, libraries, contracts

/**
 * @title  a contract for crowd funding
 * @author deepak
 * @notice this contract is to demo a samle funding contract
 * @dev This implements price feeds as our libarry
 */

contract FundMe {
   //Type Declarations
   using PriceConverter for uint256;
   //State Variables
   mapping(address => uint256) private s_addressToAmountFunded;
   address[] private s_funders;

   /* should we make it immutable ? hint " no you should not */
   address private immutable i_owner;
   //address public owner;

   uint256 public constant MIN_USD = 50 * 10 ** 18;

   AggregatorV3Interface private s_priceFeed;

   //Modifiers

   modifier onlyOwner() {
      /* require(msg.sender == i_owner,"You cannot perform this call");
        _;*/
      if (msg.sender != i_owner) revert FundMe__NotOwner();
      _;
   }

   constructor(address priceFeedAddress) {
      i_owner = msg.sender;
      s_priceFeed = AggregatorV3Interface(priceFeedAddress);
   }

   receive() external payable {
      fund();
   }

   fallback() external payable {
      fund();
   }

   function fund() public payable {
      require(
         msg.value.getConversionRate(s_priceFeed) >= MIN_USD,
         "You Don't have enough funds to donate"
      );
      //1e18 == 1*10**18=100000000000000000
      s_addressToAmountFunded[msg.sender] += msg.value;
      s_funders.push(msg.sender);
   }

   function withdraw() public payable onlyOwner {
      /*starting index , ending index,step amount*/
      for (
         uint256 funderIndex = 0;
         funderIndex < s_funders.length;
         funderIndex++
      ) {
         address funder = s_funders[funderIndex];
         s_addressToAmountFunded[funder] = 0;
      }

      //reset the array
      s_funders = new address[](0);

      // withdrawing ether
      // // transfer
      // payable(msg.sender).transfer(address(this).balance);
      // // send
      // bool sendSuccess = payable(msg.sender).send(address(this).balance);
      // require(sendSuccess, "Send failed");
      // call

      (bool callSuccess, ) = payable(msg.sender).call{
         value: address(this).balance
      }("");
      require(callSuccess, "callFailed");
   }

   function cheaperWithdraw() public payable onlyOwner {
      address[] memory funders = s_funders;

      // mappings can't be in memory
      for (
         uint256 funderIndex = 0;
         funderIndex < funders.length;
         funderIndex++
      ) {
         address funder = funders[funderIndex];
         s_addressToAmountFunded[funder] = 0;
      }
      s_funders = new address[](0);
      (bool success, ) = i_owner.call{value: address(this).balance}("");
      require(success);
   }

   // Explainer from: https://solidity-by-example.org/fallback/
   // Ether is sent to contract
   //      is msg.data empty?
   //          /   \
   //         yes  no
   //         /     \
   //    receive()?  fallback()
   //     /   \
   //   yes   no
   //  /        \
   //receive()  fallback()
   function getOwner() public view returns (address) {
      return i_owner;
   }

   function getFunder(uint256 index) public view returns (address) {
      return s_funders[index];
   }

   function getAddressToAmountFunded(
      address funder
   ) public view returns (uint256) {
      return s_addressToAmountFunded[funder];
   }

   function getPriceFeed() public view returns (AggregatorV3Interface) {
      return s_priceFeed;
   }
}
