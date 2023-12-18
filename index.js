const ethers = require('ethers')
const { ChainId, UiPoolDataProvider } = require('@aave/contract-helpers')
const RPC_URL = 'https://arbitrum.llamarpc.com'

const provider = new ethers.providers.JsonRpcProvider(RPC_URL)
const markets = require('@bgd-labs/aave-address-book')
const axios = require('axios')

;(async () => {
  // Run The Command Here

  const lidoResult = await axios.get(
    'https://eth-api.lido.fi/v1/protocol/steth/apr/sma'
  )
  const lido = lidoResult.data.data.smaApr
  const poolDataProviderContract = new UiPoolDataProvider({
    uiPoolDataProviderAddress: markets.AaveV3Arbitrum.UI_POOL_DATA_PROVIDER,
    provider,
    chainId: ChainId.arbitrum_one,
  })

  const result = await poolDataProviderContract.getReservesHumanized({
    lendingPoolAddressProvider: markets.AaveV3Arbitrum.POOL_ADDRESSES_PROVIDER,
  })

  const weth = result.reservesData.find((item) => item.symbol === 'WETH')

  const wethBorrowRate = (weth.variableBorrowRate / 1e27) * 100
  const aaveBorrowRate = parseFloat(wethBorrowRate.toFixed(16))
  const threshold = 0.2
  const diff = lido - aaveBorrowRate
  const obj = {
    lido_apr: lido,
    aave_borrow_rate: aaveBorrowRate,
    difference: diff,
    threshold: 0.2,
    bad: lido - diff < threshold,
  }
  console.log(obj)
})()
