import { useMemo } from 'react'
import { useUnifiedWallet } from '../hooks/useUnifiedWallet'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

/**
 * Account Component
 *
 * Displays the connected Algorand address (shortened)
 * and current network.
 *
 * Works for BOTH:
 * - Web3Auth (Google login)
 * - Traditional wallets (Pera / Defly / etc)
 *
 * Address links to Lora explorer.
 */
const Account = () => {
  const { activeAddress } = useUnifiedWallet()
  const algoConfig = getAlgodConfigFromViteEnvironment()

  // Normalize network name for Lora
  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLowerCase()
  }, [algoConfig.network])

  // Normalize address to string (VERY IMPORTANT)
  const address = typeof activeAddress === 'string' ? activeAddress : activeAddress ? String(activeAddress) : null

  if (!address) {
    return null
  }

  const loraUrl = `https://lora.algokit.io/${networkName}/account/${address}/`

  return (
    <div>
      <a
        href={loraUrl}
        target="_blank"
        rel="noreferrer"
        className="text-xl text-gray-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition font-mono"
      >
        Address: {ellipseAddress(address)}
      </a>

      <div className="text-xl text-gray-900 dark:text-slate-100 mt-2">Network: {networkName}</div>
    </div>
  )
}

export default Account
