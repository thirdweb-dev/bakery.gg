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

  uint256 private constant EST_BLOCK_TIME_SECONDS = 2;
  uint256 private constant TOTAL_BAKER_COUNT = 9;

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

  ITokenERC20 immutable public cookie = ITokenERC20(0xeF960235b91E653327d82337e9329Ff7c85c917E);
  ITokenERC1155 immutable public baker = ITokenERC1155(0xaaC61B51873f226257725a49D68a28E38bbE3BA0);
  ITokenERC1155 immutable public upgrade = ITokenERC1155(0x0000000000000000000000000000000000000000);
  ITokenERC1155 immutable public land = ITokenERC1155(0xa44000cb4fAD817b92A781CDF6A1A2ceb57D945b);
  // thirdweb community early access token (not transferable)
  ITokenERC1155 immutable public earlyaccess = ITokenERC1155(0xa9e893cC12026A2F6bD826FdB295EAc9c18A7E88);

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
    earlyAccessMultiplierBps[0] = 3000; // purple => 1.3x
    earlyAccessMultiplierBps[1] = 2000; // blue => 1.2x
    earlyAccessMultiplierBps[2] = 1000; // silver => 1.1x
    earlyAccessMultiplierBps[3] = 5000; // gold => 1.5x
    earlyAccessMultiplierBps[4] = 5000; // cookie => 1.5x

    characterRewardPerBlock[0] = EST_BLOCK_TIME_SECONDS * 0.1 ether; // foxes (cps: 0.1)
    characterRewardPerBlock[1] = EST_BLOCK_TIME_SECONDS * 1 ether; // mfers (1)
    characterRewardPerBlock[2] = EST_BLOCK_TIME_SECONDS * 8 ether; // crypto (8)
    characterRewardPerBlock[3] = EST_BLOCK_TIME_SECONDS * 47 ether; // cool cats (47)
    characterRewardPerBlock[4] = EST_BLOCK_TIME_SECONDS * 260 ether; // crypto toadz (260)
    characterRewardPerBlock[5] = EST_BLOCK_TIME_SECONDS * 1400 ether; // azuki (1400)
    characterRewardPerBlock[6] = EST_BLOCK_TIME_SECONDS * 7800 ether; // clone x (7800)
    characterRewardPerBlock[7] = EST_BLOCK_TIME_SECONDS * 44000 ether; // bored ape (44000)
    characterRewardPerBlock[8] = EST_BLOCK_TIME_SECONDS * 260000 ether; // crypto punk (260000)
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

    // baker reward + boost
    (uint256[] memory boostRewardPerBlock,,) = bakerReward(msg.sender);

    for (uint256 i = 0; i < boostRewardPerBlock.length; i++) {
      totalReward += rewardBlockCount * boostRewardPerBlock[i];
    }

    cookie.mint(msg.sender, totalReward);
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

  function rewardPerBlock() public pure returns (uint256) {
    return 1 ether * EST_BLOCK_TIME_SECONDS;
  }

  function rewardPerSpice() public pure returns (uint256) {
    return 1 ether;
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
      boostRewardPerBlock[i] = characterRewardPerBlock[i] * balances[i] * ((multiplierBps + 10000) / 10000);
      j += 1;
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
    if (_spice.amount > 0) {
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
