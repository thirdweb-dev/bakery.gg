// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@thirdweb/contracts/interfaces/token/ITokenERC20.sol";
import "@thirdweb/contracts/interfaces/token/ITokenERC1155.sol";

contract Bakery is Ownable, EIP712 {
  using ECDSA for bytes32;

  bytes32 private constant TYPEHASH = keccak256(
    "Spice(address to,uint256 amount,uint256 expiryTime,uint256 salt)"
  );

  struct Spice {
    address to;
    uint256 amount;
    uint256 expiryTime;
    uint256 salt;
  }

  struct Oven {
    address token;
    uint256 tokenId;
    uint256 startBlock;
    uint256 accumulatedSpiceAmount;
  }

  error AlreadyBaking();
  error InsufficientToken();
  error NotBaking();
  error StillCooking();
  error InvalidSignature();
  error UsedSignature();
  error ExpiredSignature();

  ITokenERC20 immutable public reward = ITokenERC20(0xeF960235b91E653327d82337e9329Ff7c85c917E);
  // thirdweb community early access token (not transferable)
  ITokenERC1155 immutable public earlyaccess = ITokenERC1155(0xa9e893cC12026A2F6bD826FdB295EAc9c18A7E88);
  ITokenERC1155 immutable public character = ITokenERC1155(0x0000000000000000000000000000000000000000);
  ITokenERC1155 immutable public upgrade = ITokenERC1155(0x0000000000000000000000000000000000000000);
  ITokenERC1155 immutable public land = ITokenERC1155(0x0000000000000000000000000000000000000000);

  // capping the maximum number of blocks rewards
  uint256 constant public MAX_NUMBER_OF_BLOCK_FOR_REWARD = 3000;
  uint256 constant public MIN_WAIT_BETWEEN_BLOCK_FOR_REWARD = 1;

  // wallet => oven
  mapping (address => Oven) public ovens;
  mapping (uint256 => bool) public salt;

  // token => tokenId => multiplier bps
  mapping (address => mapping(uint256 => uint256)) public rewardMultiplierBps;

  constructor() Ownable() EIP712("Bakery", "1") {
  }

  function bake(address token, uint256 tokenId) public {
    if (ovens[msg.sender].startBlock > 0) {
      revert AlreadyBaking();
    }

    // optionally, can pass in the earlyaccess token in for boost base boost
    if (token != address(0)) {
      if (token != address(earlyaccess) || IERC1155(address(earlyaccess)).balanceOf(msg.sender, tokenId) == 0) {
        revert InsufficientToken();
      }
    }

    ovens[msg.sender] = Oven({ startBlock: block.number, tokenId: tokenId, token: token, accumulatedSpiceAmount: 0 });
  }

  function unbake() public {
    Oven memory oven = ovens[msg.sender];
    if (oven.startBlock == 0) {
      revert NotBaking();
    }

    uint256 rewardBlockCount = block.number - oven.startBlock;
    if (rewardBlockCount < MIN_WAIT_BETWEEN_BLOCK_FOR_REWARD) {
      revert StillCooking();
    }

    // TODO cap max for rewards
    if (rewardBlockCount > MAX_NUMBER_OF_BLOCK_FOR_REWARD) {
      rewardBlockCount = MAX_NUMBER_OF_BLOCK_FOR_REWARD;
    }

    delete ovens[msg.sender];

    uint256 accuredReward = rewardBlockCount * rewardPerBlock();
    uint256 multiplerBps = rewardMultiplierBps[oven.token][oven.tokenId];
    uint256 totalReward = accuredReward * (multiplerBps + 10000) / 10000;

    reward.mint(msg.sender, totalReward);
  }

  function rewardPerBlock() public pure returns (uint256) {
    // TODO
    return 0.2 ether;
  }

  function rebake(Spice calldata _spice, bytes calldata _signature) external {
    Oven memory oven = ovens[msg.sender];
    if (_signature.length > 0) {
      spice(_spice, _signature);
    }
    unbake();
    bake(oven.token, oven.tokenId);
  }

  function spice(Spice calldata _spice, bytes calldata _signature) public {
    if (ovens[msg.sender].startBlock == 0) {
      revert NotBaking();
    }

    address signer = _hashTypedDataV4(keccak256(abi.encode(TYPEHASH, _spice.to, _spice.amount, _spice.expiryTime, _spice.salt))).recover(_signature);
    if (signer != owner() || _spice.to != msg.sender) {
      revert InvalidSignature();
    }

    if (block.timestamp > _spice.expiryTime) {
      revert ExpiredSignature();
    }

    if (salt[_spice.salt]) {
      revert UsedSignature();
    }

    salt[_spice.salt] = true;
    ovens[msg.sender].accumulatedSpiceAmount += _spice.amount;
  }
}
