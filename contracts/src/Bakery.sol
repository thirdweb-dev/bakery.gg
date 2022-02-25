// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@thirdweb/contracts/interfaces/token/ITokenERC20.sol";
import "@thirdweb/contracts/interfaces/token/ITokenERC1155.sol";

contract Bakery is AccessControl, EIP712 {
  using ECDSA for bytes32;

  bytes32 private constant SPICE_ROLE = keccak256("SPICE_ROLE");

  uint256 private constant EST_BLOCK_TIME_SECONDS = 2;
  uint256 private constant TOTAL_BAKER_COUNT = 9;

  uint256 public constant REWARD_PER_BLOCK = 1 ether * EST_BLOCK_TIME_SECONDS;
  uint256 public constant REWARD_PER_SPICE = 1 ether;
  uint256 public constant MAX_SPICE_PER_BLOCK = 15 * EST_BLOCK_TIME_SECONDS;

  bytes32 private constant TYPEHASH = keccak256(
    "Spice(address to,uint256 amount,uint256 startBlock)"
  );

  struct Spice {
    address to;
    uint256 amount;
    uint256 startBlock;
  }

  struct Oven {
    address token;
    uint256 tokenId;
    uint256 startBlock;
    uint256 accumulatedSpiceAmount;
  }

  // "0x8baa579f"
  error AlreadyBaking();
  error InsufficientToken();
  error NotBaking();
  error StillCooking();
  error InvalidSignature();
  error UsedSignature();
  error InvalidSender();

  ITokenERC20 immutable public cookie = ITokenERC20(0xeF960235b91E653327d82337e9329Ff7c85c917E);
  ITokenERC1155 immutable public baker = ITokenERC1155(0xF4A6BAda61996fEFDCf7a8027fdEA54B5086517e);
  ITokenERC1155 immutable public upgrade = ITokenERC1155(0x02B5904Eb879A6912B0b28e128f1328AA32b7823);
  ITokenERC1155 immutable public land = ITokenERC1155(0xa44000cb4fAD817b92A781CDF6A1A2ceb57D945b);
  // thirdweb community early access token (not transferable)
  ITokenERC1155 immutable public earlyaccess = ITokenERC1155(0xa9e893cC12026A2F6bD826FdB295EAc9c18A7E88);

  // capping the maximum number of blocks rewards
  uint256 constant public MAX_NUMBER_OF_BLOCK_FOR_REWARD = 3000;
  uint256 constant public MIN_WAIT_BETWEEN_BLOCK_FOR_REWARD = 1;

  // wallet => oven
  mapping (address => Oven) public ovens;
  mapping (bytes32 => bool) public salts;

  // early access: tokenId => multiplier bps
  mapping (uint256 => uint256) private earlyAccessMultiplierBps;
  mapping (uint256 => uint256) private bakerRewardPerBlock;

  constructor() AccessControl() EIP712("Bakery", "1") {
    earlyAccessMultiplierBps[0] = 3000; // purple => 1.3x
    earlyAccessMultiplierBps[1] = 2000; // blue => 1.2x
    earlyAccessMultiplierBps[2] = 1000; // silver => 1.1x
    earlyAccessMultiplierBps[3] = 5000; // gold => 1.5x
    earlyAccessMultiplierBps[4] = 5000; // cookie => 1.5x

    bakerRewardPerBlock[0] = EST_BLOCK_TIME_SECONDS * 0.1 ether; // foxes (cps: 0.1)
    bakerRewardPerBlock[1] = EST_BLOCK_TIME_SECONDS * 1 ether; // mfers (1)
    bakerRewardPerBlock[2] = EST_BLOCK_TIME_SECONDS * 8 ether; // crypto (8)
    bakerRewardPerBlock[3] = EST_BLOCK_TIME_SECONDS * 47 ether; // cool cats (47)
    bakerRewardPerBlock[4] = EST_BLOCK_TIME_SECONDS * 260 ether; // crypto toadz (260)
    bakerRewardPerBlock[5] = EST_BLOCK_TIME_SECONDS * 1400 ether; // azuki (1400)
    bakerRewardPerBlock[6] = EST_BLOCK_TIME_SECONDS * 7800 ether; // clone x (7800)
    bakerRewardPerBlock[7] = EST_BLOCK_TIME_SECONDS * 44000 ether; // bored ape (44000)
    bakerRewardPerBlock[8] = EST_BLOCK_TIME_SECONDS * 260000 ether; // crypto punk (260000)

    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(SPICE_ROLE, msg.sender);
  }

  function bake(address token, uint256 tokenId) public {
    if (msg.sender != tx.origin) {
      revert InvalidSender();
    }

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

    uint256 reward = totalReward(msg.sender, rewardBlockCount);

    delete ovens[msg.sender];

    cookie.mint(msg.sender, reward);
  }

  function totalReward(address to, uint256 blockCount) public view returns (uint256) {
    // we don't need to protect it since it's a view and there's no effect
    uint256 reward = 0;
    Oven memory oven = ovens[to];

    // base reward
    uint256 blockReward = blockCount * REWARD_PER_BLOCK;
    uint256 eaMultiplierBps = oven.token == address(earlyaccess) ? earlyAccessMultiplierBps[oven.tokenId] : 0;
    reward += blockReward * (eaMultiplierBps + 10000) / 10000;

    // spice reward
    if (oven.accumulatedSpiceAmount > 0) {
      reward += (oven.accumulatedSpiceAmount + spiceBoost(to)) * REWARD_PER_SPICE;
    }

    // baker reward + boost
    (uint256[] memory boostRewardPerBlock,,) = bakerReward(to);

    for (uint256 i = 0; i < boostRewardPerBlock.length; i++) {
      reward += blockCount * boostRewardPerBlock[i];
    }

    return reward;
  }

  function rewardPerSpice(address) public pure returns (uint256) {
    return REWARD_PER_SPICE;
  }

  function bakerBoostMultiplier(uint256 tokenId) public pure returns (uint256) {
    uint256 mod = tokenId % 4;
    if (mod == 0) {
      return 2500; // 1.25x
    } else if (mod == 1) {
      return 5000; // 1.5x
    } else if (mod == 2) {
      return 7500; // 1.75x
    } else {
      return 10000; // 2x
    }
  }

  function spiceBoost(address _to) public view returns (uint256) {
    if (address(baker) == address(0)) {
      return 0;
    }
    return IERC1155(address(baker)).balanceOf(_to, 0);
  }

  function bakerReward(address _to) public view returns (uint256[] memory, uint256[] memory, uint256[] memory) {
    if (address(baker) == address(0)) {
      return (new uint256[](TOTAL_BAKER_COUNT), new uint256[](TOTAL_BAKER_COUNT), new uint256[](TOTAL_BAKER_COUNT * 4));
    }

    address[] memory to = new address[](TOTAL_BAKER_COUNT);
    uint256[] memory tokenIds = new uint256[](TOTAL_BAKER_COUNT);
    for (uint256 i = 0; i < TOTAL_BAKER_COUNT; i++) {
      to[i] = _to;
      tokenIds[i] = i;
    }

    uint256[] memory balances = IERC1155(address(baker)).balanceOfBatch(to, tokenIds);

    uint256 nonZeroBalanceCount = 0;
    for (uint256 i = 0; i < TOTAL_BAKER_COUNT; i++) {
      if (balances[i] > 0) {
        nonZeroBalanceCount += 1;
      }
    }

    uint256[] memory boostBalances = bakerBoost(msg.sender, balances, nonZeroBalanceCount);
    uint256[] memory boostRewardPerBlock = new uint256[](TOTAL_BAKER_COUNT);
    uint256 j = 0;
    for (uint256 i = 0; i < balances.length; i++) {
      if (balances[i] == 0) {
        continue;
      }
      uint256 multiplierBps = 0;
      if (boostBalances[j] > 0) {
        multiplierBps += bakerBoostMultiplier(0); // 1.25x
      }
      if (boostBalances[j+1] > 0) {
        multiplierBps += bakerBoostMultiplier(1); // 1.5x
      }
      if (boostBalances[j+2] > 0) {
        multiplierBps += bakerBoostMultiplier(2); // 1.75x
      }
      if (boostBalances[j+3] > 0) {
        multiplierBps += bakerBoostMultiplier(3); // 2x
      }
      boostRewardPerBlock[i] = bakerRewardPerBlock[i] * balances[i] * ((multiplierBps + 10000) / 10000);
      j += 4;
    }

    return (boostRewardPerBlock, balances, boostBalances);
  }

  /// @dev only fetch boost for characters that are not zero
  function bakerBoost(address _to, uint256[] memory _tokenBalances, uint256 nonZeroBalanceCount) public view returns (uint256[] memory) {
    if (nonZeroBalanceCount == 0) {
      return new uint256[](0);
    }

    uint256 len = nonZeroBalanceCount * 4;

    if (address(upgrade) == address(0) || address(baker) == address(0)) {
      return new uint256[](len);
    }

    address[] memory to = new address[](len);
    uint256[] memory tokenIds = new uint256[](len);
    uint256 j = 0;
    for (uint256 i = 0; i < _tokenBalances.length; i += 1) {
      if (_tokenBalances[i] == 0) {
        continue;
      }
      to[j] = _to;
      to[j+1] = _to;
      to[j+2] = _to;
      to[j+3] = _to;
      tokenIds[j] = i * 4;
      tokenIds[j+1] = (i * 4) + 1;
      tokenIds[j+2] = (i * 4) + 2;
      tokenIds[j+3] = (i * 4) + 3;
      j += 4;
    }

    return IERC1155(address(upgrade)).balanceOfBatch(to, tokenIds);
  }

  function rebake(Spice calldata _spice, bytes calldata _signature) external {
    Oven memory oven = ovens[msg.sender];
    if (_spice.amount > 0) {
      spice(_spice, _signature);
    }
    unbake();
    bake(oven.token, oven.tokenId);
  }

  function spice(Spice calldata _spice, bytes calldata _signature) private {
    uint256 startBlock = ovens[msg.sender].startBlock;
    if (startBlock == 0) {
      revert NotBaking();
    }

    address signer = _hashTypedDataV4(keccak256(abi.encode(TYPEHASH, _spice.to, _spice.amount, _spice.startBlock))).recover(_signature);
    if (!hasRole(SPICE_ROLE, signer) || _spice.to != msg.sender) {
      revert InvalidSignature();
    }

    if (_spice.startBlock != startBlock) {
      revert InvalidSignature();
    }

    bytes32 salt = keccak256(abi.encodePacked(_spice.to, _spice.startBlock));
    if (salts[salt]) {
      revert UsedSignature();
    }

    uint256 diffBlock = block.number - startBlock;
    uint256 spiceAmount = _spice.amount;
    if (spiceAmount > diffBlock * MAX_SPICE_PER_BLOCK) {
      spiceAmount = diffBlock * MAX_SPICE_PER_BLOCK;
    }

    salts[salt] = true;
    ovens[msg.sender].accumulatedSpiceAmount += spiceAmount;
  }
}
