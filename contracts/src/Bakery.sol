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
  ITokenERC1155 immutable public cursor = ITokenERC1155(0x0000000000000000000000000000000000000000);
  ITokenERC1155 immutable public character = ITokenERC1155(0x0000000000000000000000000000000000000000);
  ITokenERC1155 immutable public upgrade = ITokenERC1155(0x0000000000000000000000000000000000000000);
  ITokenERC1155 immutable public land = ITokenERC1155(0x0000000000000000000000000000000000000000);

  // capping the maximum number of blocks rewards
  uint256 constant public MAX_NUMBER_OF_BLOCK_FOR_REWARD = 3000;
  uint256 constant public MIN_WAIT_BETWEEN_BLOCK_FOR_REWARD = 1;

  // wallet => oven
  mapping (address => Oven) public ovens;
  mapping (uint256 => bool) public salt;

  // early access: tokenId => multiplier bps
  mapping (uint256 => uint256) private earlyAccessMultiplierBps;
  mapping (uint256 => uint256) private characterRewardPerBlock;

  constructor() Ownable() EIP712("Bakery", "1") {
    earlyAccessMultiplierBps[0] = 300; // purple => 1.3x
    earlyAccessMultiplierBps[1] = 200; // blue => 1.2x
    earlyAccessMultiplierBps[2] = 100; // silver => 1.1x
    earlyAccessMultiplierBps[3] = 500; // gold => 1.5x
    earlyAccessMultiplierBps[4] = 500; // cookie => 1.5x

    characterRewardPerBlock[0] = 0.1 ether; // foxes (cps: 0.1)
    characterRewardPerBlock[1] = 1 ether; // mfers (1)
    characterRewardPerBlock[2] = 8 ether; // crypto (8)
    characterRewardPerBlock[3] = 47 ether; // cool cats (47)
    characterRewardPerBlock[4] = 260 ether; // crypto toadz (260)
    characterRewardPerBlock[5] = 1400 ether; // azuki (1400)
    characterRewardPerBlock[6] = 7800 ether; // clone x (7800)
    characterRewardPerBlock[7] = 44000 ether; // bored ape (44000)
    characterRewardPerBlock[8] = 260000 ether; // crypto punk (260000)
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

    if (rewardBlockCount > MAX_NUMBER_OF_BLOCK_FOR_REWARD) {
      rewardBlockCount = MAX_NUMBER_OF_BLOCK_FOR_REWARD;
    }

    delete ovens[msg.sender];

    uint256 totalReward = 0;

    // base reward
    uint256 accuredReward = rewardBlockCount * rewardPerBlock();
    uint256 eaMultiplierBps = oven.token == address(earlyaccess) ? earlyAccessMultiplierBps[oven.tokenId] : 0;
    totalReward += accuredReward * (eaMultiplierBps + 10000) / 10000;

    // spice reward
    if (oven.accumulatedSpiceAmount > 0) {
      totalReward += (oven.accumulatedSpiceAmount + spiceBoost(msg.sender)) * rewardPerSpice();
    }

    // character reward + boost
    (uint256[] memory balances, uint256 nonZeroBalanceCount) = characterReward(msg.sender);
    uint256[] memory boostBalances = characterBoost(msg.sender, balances, nonZeroBalanceCount);

    // i = token id (character)
    // j = upgrade start index
    uint256 j = 0;
    for (uint256 i = 0; i < balances.length; i++) {
      if (balances[i] == 0) {
        continue;
      }
      uint256 multiplierBps = 0;
      if (boostBalances[j] > 0) {
        multiplierBps += 2500; // 1.25x
      }
      if (boostBalances[j+1] > 0) {
        multiplierBps += 5000; // 1.5x
      }
      if (boostBalances[j+2] > 0) {
        multiplierBps += 7500; // 1.75x
      }
      if (boostBalances[j+3] > 0) {
        multiplierBps += 10000; // 2x
      }
      totalReward += (rewardBlockCount * characterRewardPerBlock[i]) * balances[i] * (multiplierBps + 10000) / 10000;
      j += 1;
    }

    reward.mint(msg.sender, totalReward);
  }

  function rewardPerBlock() public pure returns (uint256) {
    // TODO
    return 0.2 ether;
  }

  function rewardPerSpice() public pure returns (uint256) {
    // TODO
    return 0.1 ether;
  }

  function spiceBoost(address _to) public view returns (uint256) {
    if (address(cursor) == address(0)) {
      return 0;
    }
    uint256 cursorBoostCount = IERC1155(address(cursor)).balanceOf(_to, 0);
    uint256 cursorBoostMultiplier = 1;
    return cursorBoostCount * cursorBoostMultiplier;
  }

  function characterReward(address _to) public view returns (uint256[] memory, uint256) {
    if (address(character) == address(0)) {
      return (new uint256[](9), 0);
    }

    address[] memory to = new address[](9);
    uint256[] memory tokenIds = new uint256[](9);
    for (uint256 i = 0; i < 9; i++) {
      to[i] = _to;
      tokenIds[i] = i;
    }

    uint256[] memory balances = IERC1155(address(character)).balanceOfBatch(to, tokenIds);

    uint256 nonZeroBalanceCount = 0;
    for (uint256 i = 0; i < 9; i++) {
      if (balances[i] > 0) {
        nonZeroBalanceCount += 1;
      }
    }
    return (balances, nonZeroBalanceCount);
  }

  /// @dev only fetch boost for characters that are not zero
  function characterBoost(address _to, uint256[] memory _tokenBalances, uint256 nonZeroBalanceCount) public view returns (uint256[] memory) {
    uint256 len = nonZeroBalanceCount * 4;

    if (address(upgrade) == address(0) || address(character) == address(0)) {
      return new uint256[](len);
    }

    address[] memory to = new address[](len);
    uint256[] memory tokenIds = new uint256[](len);
    uint256 j = 0;
    for (uint256 i = 0; i < _tokenBalances.length; i += 4) {
      if (_tokenBalances[i] == 0) {
        continue;
      }
      to[j] = _to;
      to[j+1] = _to;
      to[j+2] = _to;
      to[j+3] = _to;
      tokenIds[j] = i;
      tokenIds[j+1] = i + 1;
      tokenIds[j+2] = i + 2;
      tokenIds[j+3] = i + 3;
      j += 4;
    }

    return IERC1155(address(upgrade)).balanceOfBatch(to, tokenIds);
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
