// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@thirdweb/contracts/interfaces/token/ITokenERC1155.sol";

contract BakerMarket is AccessControl {
  error InvalidToken();

  // keccak256(wallet_address || tokenId) -> count
  mapping (bytes32 => uint256) public buyCount;
  mapping (uint256 => uint256) public tokenBaseCost;

  IERC20 constant private cookie = IERC20(0xeF960235b91E653327d82337e9329Ff7c85c917E);
  ITokenERC1155 constant private baker = ITokenERC1155(0xF4A6BAda61996fEFDCf7a8027fdEA54B5086517e);

  constructor() {
    tokenBaseCost[0] = 15 ether;
    tokenBaseCost[1] = 100 ether;
    tokenBaseCost[2] = 1100 ether;
    tokenBaseCost[3] = 12000 ether;
    tokenBaseCost[4] = 130000 ether;
    tokenBaseCost[5] = 1400000 ether;
    tokenBaseCost[6] = 20000000 ether;
    tokenBaseCost[7] = 330000000 ether;
    tokenBaseCost[8] = 5100000000 ether;
  }

  function buy(uint256 tokenId, uint256 want) public {
    if (tokenBaseCost[tokenId] == 0) {
      revert InvalidToken();
    }

    bytes32 key = keccak256(abi.encodePacked(msg.sender, tokenId));
    uint256 has = buyCount[key];
    uint256 cost = price(tokenBaseCost[tokenId], has, want);

    buyCount[key] += want;

    cookie.transferFrom(msg.sender, address(this), cost);
    baker.mintTo(msg.sender, tokenId, "", want);
  }

  function price(uint256 cost, uint256 has, uint256 want) public pure returns (uint256) {
    return ((cost * ((11500 ** want) - (11500 ** has))) / 1500) / 10000;
  }

  function withdraw(IERC20 token) external onlyRole(DEFAULT_ADMIN_ROLE) {
    token.transfer(msg.sender, token.balanceOf(address(this)));
  }
}
