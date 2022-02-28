// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@thirdweb/contracts/interfaces/token/ITokenERC1155.sol";
import "@prb-math/contracts/PRBMathUD60x18.sol";

contract BakerMarket is AccessControl {
  using PRBMathUD60x18 for uint256;

  error InvalidToken();

  // keccak256(wallet_address || tokenId) -> count
  mapping (bytes32 => uint256) public buyCount;
  mapping (uint256 => uint256) public tokenBaseCost;

  IERC20 constant private cookie = IERC20(0xeF960235b91E653327d82337e9329Ff7c85c917E);
  ITokenERC1155 constant private baker = ITokenERC1155(0xDEc98C282c50b95cB2525A56874BBf37055F5F92);

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

    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
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
    // COST * ((1.15 ^ Mwant) - (1.15 ^ Nhas)) / 0.15
    require(want == 1 || want == 10 || want == 100, "want == 1,10,100");
    uint256 multiplier = 1 ether;
    if (want == 10) {
      multiplier = 20.303718238 ether;
    } else if (want == 100) {
      multiplier = 7828749.671335256 ether;
    }
    return PRBMathUD60x18.fromUint(1.15 ether).toUint().pow(PRBMathUD60x18.fromUint(has)).mul(multiplier).mul(cost);
  }

  function withdraw(IERC20 token) external onlyRole(DEFAULT_ADMIN_ROLE) {
    token.transfer(msg.sender, token.balanceOf(address(this)));
  }
}
