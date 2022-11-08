const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAO", () => {
  let owner, proposer, executor, addr1, addr2, addr3;

  let MYTOKEN, token;
  let MYNFT, nft;

  let TIMELOCK, timeLock;
  let MYGOVERNOR, myGovernor;
  let TREASURY, treasury;

  beforeEach(async () => {
    [owner, proposer, executor, addr1, addr2, addr3] =
      await ethers.getSigners();

    // ERC20 Token contract
    MYTOKEN = await ethers.getContractFactory("MyToken");
    token = await MYTOKEN.deploy();
    await token.deployed();
    const tokenAddr = token.address;

    // ERC721 Token contract
    MYNFT = await ethers.getContractFactory("MyNFT");
    nft = await MYNFT.deploy("MyNFT", "FakeURI");
    await nft.deployed();
    const nftAddr = nft.address;

    // TimeLock contract
    TIMELOCK = await ethers.getContractFactory("Timelock");
    timeLock = await TIMELOCK.deploy(1, [], [executor.address]);

    await timeLock.deployed();

    // MultiTokenDAO Contract
    MYGOVERNOR = await ethers.getContractFactory("MyGovernor");

    const quorumPercentage = 1;
    const votingPeriod = 7;
    const votingDelay = 0;

    myGovernor = await MYGOVERNOR.deploy(
      [tokenAddr, nftAddr],
      timeLock.address,
      votingDelay,
      votingPeriod,
      quorumPercentage
    );

    await myGovernor.deployed();

    TREASURY = await ethers.getContractFactory("Treasury");
    treasury = await TREASURY.deploy();

    await treasury.deployed();
    await treasury.transferOwnership(timeLock.address);

    await token.mint(executor.address, 100000000);
    await token.mint(executor.address, 100000000);
    await token.mint(executor.address, 100000000);
    await token.mint(executor.address, 100000000);
    await token.mint(executor.address, 100000000);
    await token.mint(executor.address, 100000000);

    await nft.connect(executor).delegate(executor.address);
    await nft.connect(addr1).delegate(addr1.address);
    await nft.connect(addr2).delegate(addr2.address);
    await nft.connect(addr3).delegate(addr3.address);

    await token.connect(executor).delegate(executor.address);
    await token.connect(addr1).delegate(addr1.address);
    await token.connect(addr2).delegate(addr2.address);
    await token.connect(addr3).delegate(addr3.address);

    const proposal = await myGovernor
      .connect(addr1)
      .propose(
        [treasury.address],
        [0],
        [
          await treasury.interface.encodeFunctionData("transferERC20Tokens", [
            token.address,
            addr1.address,
            10000,
          ]),
        ],
        "im broke send me money dear DAO"
      );

    const txn = await proposal.wait();

    propId = await txn.events[0].args.proposalId;
    console.log(propId);

    await timeLock.grantRole(
      await timeLock.PROPOSER_ROLE(),
      myGovernor.address
    );
  });

  it("anyone should be able to propose ", async function () {
    const proposal = await myGovernor
      .connect(addr1)
      .propose(
        [treasury.address],
        [0],
        [
          await treasury.interface.encodeFunctionData("transferERC20Tokens", [
            token.address,
            addr1.address,
            100,
          ]),
        ],
        "im broke send me money dear DAO00000000"
      );
  });

  it("only executor should be able to execute ", async function () {
    console.log(propId, "propID in thissssss");
    await network.provider.send("evm_mine");
    await myGovernor.connect(executor).castVote(propId, 1);
    await myGovernor.connect(addr1).castVote(propId, 1);
    await myGovernor.connect(addr2).castVote(propId, 1);
    await myGovernor.connect(addr3).castVote(propId, 1);

    const descriptionHash = ethers.utils.id("im broke send me money dear DAO");

    await network.provider.send("evm_mine");
    console.log(executor.address, "executor addr");
    console.log(proposer.address, "proposer addr");
    console.log(owner.address, "owner adrr");
    console.log(timeLock.address, "timelock addr");
    console.log(addr1.address, "1 addr");
    console.log(addr2.address, "2  addr");
    console.log(myGovernor.address, "governor addr");
    console.log(treasury.address, "tresury addr");

    // cannot propose same proposal multiple times
    await expect(
      myGovernor
        .connect(addr1)
        .propose(
          [treasury.address],
          [0],
          [
            await treasury.interface.encodeFunctionData("transferERC20Tokens", [
              token.address,
              addr1.address,
              10000,
            ]),
          ],
          "im broke send me money dear DAO"
        )
    ).to.be.reverted;

    await network.provider.send("evm_mine");

    await myGovernor.queue(
      [treasury.address],
      [0],
      [
        await treasury.interface.encodeFunctionData("transferERC20Tokens", [
          token.address,
          addr1.address,
          10000,
        ]),
      ],
      descriptionHash
    );
    console.log("queue success");
    const propState = await myGovernor.state(propId);
    console.log(propState, "current state");

    await myGovernor
      .connect(executor)
      .execute(
        [treasury.address],
        [0],
        [
          treasury.interface.encodeFunctionData("transferERC20Tokens", [
            token.address,
            addr1.address,
            10000,
          ]),
        ],
        descriptionHash
      );
    console.log("executed");
    const propState2 = await myGovernor.state(propId);
    console.log(propState2, "current state");
  });
});
