import { useWallet } from '@txnlab/use-wallet-react'
import { useMemo } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

/**
 * Account Component
 * Displays the connected wallet address (shortened) and current network
 * Address links to Lora explorer for easy account tracking
 */
const Account = () => {
  const { activeAddress } = useWallet()
  const algoConfig = getAlgodConfigFromViteEnvironment()

  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLocaleLowerCase()
  }, [algoConfig.network])

  return (
    <div>
      <a
        className="text-xl text-gray-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition"
        target="_blank"
        href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
      >
        Address: {ellipseAddress(activeAddress)}
      </a>
      <div className="text-xl text-gray-900 dark:text-slate-100 mt-2">Network: {networkName}</div>
    </div>
  )
}

export default Account
