import { useMemo, useState } from 'react'
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
  const [copied, setCopied] = useState(false)

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (e) {
      console.error('Failed to copy address', e)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <a
          href={loraUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xl text-gray-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition font-mono"
        >
          Address: {ellipseAddress(address)}
        </a>

        {/* Copy button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleCopy()
          }}
          className="inline-flex items-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title={copied ? 'Copied!' : 'Copy address'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="text-xl text-gray-900 dark:text-slate-100 mt-2">Network: {networkName}</div>
    </div>
  )
}

export default Account
