async function main() {

  ///// COPY and PASTE previous deployment addresses here:
  const SwapUtilsAddress = "0xb29eD75776e13cB02fF19D9052E25b52C9f55088";
  const AmpUtilsAddress = "0x332e6FcF7A287516DE84F60439D58FA38535785E";
  const SwapFlashLoanAddress = "0x64ac63b51469aa9184b5bf7e6e36c02ea23039ec";
  const LPTokenAddress = "0x512fA21de99d27672f05CE7b4932907Ecae71675";
  const FakeDAIAddress = "0x6594d141A5F06c5A93908BF147283F53D152377e";
  const FakeUSDCAddress = "0x0f6329Ac2660aF062C5AC18B9BC09F810277A959";
  const FakeUSDTAddress = "0xF0b030A3150eE0a21e42a23194fF218c3191A41F";
  /////////////////////////////////////////////////////////



  ////// general setup for one of these here scrips //////////
  const timeout = 25000;

  const owner = await ethers.getSigners();
  /////////////////////////////////////////////////////////////



  // let the uer know it's running...
  console.log("Starting test script");



  /////// instantiate contracts and attach them to their respective addresses //////////  
  const swaputils = await ethers.getContractFactory("SwapUtilsV1");
  const SwapUtils = await swaputils.attach(SwapUtilsAddress);

  const amputils = await ethers.getContractFactory("AmplificationUtilsV1");
  const AmplificationUtils = await amputils.attach(AmpUtilsAddress);

  const swapflashloan = await ethers.getContractFactory("SwapFlashLoanV1", { libraries: {SwapUtilsV1: SwapUtilsAddress, AmplificationUtilsV1: AmpUtilsAddress},});
  const SwapFlashLoan = await swapflashloan.attach(SwapFlashLoanAddress);

  const lptoken = await ethers.getContractFactory("LPTokenV1");
  const LPToken = await lptoken.attach(LPTokenAddress);

  const fakedai = await ethers.getContractFactory("MockDAIMintable");
  const FakeDAI = await fakedai.attach(FakeDAIAddress);

  const fakeusdc = await ethers.getContractFactory("MockUSDCMintable");
  const FakeUSDC = await fakeusdc.attach(FakeUSDCAddress);

  const fakeusdt = await ethers.getContractFactory("MockUSDTMintable");
  const FakeUSDT = await fakeusdt.attach(FakeUSDTAddress);
  //////////////////////////////////////////////////////////////////////////////////////////


  //////////////////////// mint preset and approve tokens for transfer to swap instance //////////
  // mint preset for each token (1K of each token)
  console.log("Minting fake DAI");
  const fakeDaiMint = await FakeDAI.mintPreset();
  await new Promise(r => setTimeout(r, timeout));

  console.log("Minting fake USDC");
  const fakeUsdcMint = await FakeUSDC.mintPreset();
  await new Promise(r => setTimeout(r, timeout));

  console.log("Minting fake USDT");
  const fakeUsdtMint = await FakeUSDT.mintPreset();  
  await new Promise(r => setTimeout(r, timeout));
  
  // approve tokens for pool
  console.log("approving fake DAI");
  const fakeDaiApprove = await FakeDAI.approve(SwapFlashLoanAddress,"10000000000000000000000"); //10k dai
  await new Promise(r => setTimeout(r, timeout));

  console.log("approving fake USDC");
  const fakeUsdcApprove = await FakeUSDC.approve(SwapFlashLoanAddress,10000000000);  //10k USDC
  await new Promise(r => setTimeout(r, timeout));

  console.log("approving fake USDT");
  const fakeUsdtApprove = await FakeUSDT.approve(SwapFlashLoanAddress,10000000000); //10K USDT
  await new Promise(r => setTimeout(r, timeout));
  /////////////////////////////////////////////////////////////////////////////////////////////////



  //////////////////////////// add liquidity balanced and unbalanced //////////////////////////////
  // add liquidity of 100 of each token
  const liquidityAddedReturn = await SwapFlashLoan.addLiquidity(["100000000000000000000",100000000,100000000],1,1659586065);
  console.log("calling addLiquidity");
  await new Promise(r => setTimeout(r, timeout));
  
  // add liquidity of 1,1,100
  await SwapFlashLoan.addLiquidity(["1000000000000000000","1000000","100000000"],1,1659586065);
  console.log("calling addliquidity imblanced");
  await new Promise(r => setTimeout(r, timeout));
  //////////////////////////////////////////////////////////////////////////////////////////////////////


  
  ///////////////////////// removing liquidity balanced, as one token, and unbalanced //////////////////////////////
  // We need to approve the LP token to be transferred before removing liquidity
  LPToken.approve(SwapFlashLoan.address, "999999999999999999999999999");  // approves 999999999 LP Tokens for transfer
  console.log("approving lp tokens for burn");
  await new Promise(r => setTimeout(r, timeout));
  
  // remove liquidity regular
  await SwapFlashLoan.removeLiquidity("1000000000000000000", [1,1,1], 1659586065);
  console.log("calling removeLiquidity");
  await new Promise(r => setTimeout(r, timeout));
  
  // remove liquidity one token
  // (tokenAmount, index, minAmount, deadline)
  // input param "tokenAmount" is in LPToken terms
  // input param "minAmount" is in "token you are withdrawing" terms
  await SwapFlashLoan.removeLiquidityOneToken("1000000000000000000",1,1,1659586065);
  console.log("calling removeLiquidityOneToken");
  await new Promise(r => setTimeout(r, timeout));
  
  // remove liquidity imbalanced'ly
  // [1,2,3] are the token proportions
  // we say max burn amount is 10 lp tokens so 10e18 - see contract for details 
  await SwapFlashLoan.removeLiquidityImbalance(["1000000000000000000",2000000,3000000],"10000000000000000000",1659586065);
  console.log("calling removeLiquidityImbalance");
  await new Promise(r => setTimeout(r, timeout)); 
  ///////////////////////////////////////////////////////////////////////////////////////////



  //////////////// test swaps /////////////////////////////////////////////////////////
  // swap 5 dai for USDC
  const swapDAIUSDC = await SwapFlashLoan.swap(0,1,"5000000000000000000",1,1659586065);
  console.log("calling swap 5 DAI -> USDC");
    await new Promise(r => setTimeout(r, timeout)); 

  // swap 5 dai for USDT
  const swapDAIUSDT = await SwapFlashLoan.swap(0,2,"5000000000000000000",1,1659586065);
  console.log("calling swap 5 DAI -> USDT");
    await new Promise(r => setTimeout(r, timeout)); 

  // swap 5 USDT to USDC
  const swapUSDTUSDC = await SwapFlashLoan.swap(2,1,"5000000",1,1659586065);
  console.log("calling swap 5 USDT -> USDC");
    await new Promise(r => setTimeout(r, timeout)); 
  ///////////////////////////////////////////////////////////////////////////////////////
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
