import { useWallet, WalletId, type BaseWallet } from '@txnlab/use-wallet-react'
import { useMemo, useState } from 'react'
import { ellipseAddress } from '../utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface ConnectWalletProps {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletProps) => {
  const { wallets, activeWallet, activeAddress, isReady, isActive, disconnect } = useWallet()

  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [lastError, setLastError] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // Get network config for Lora link
  const algoConfig = getAlgodConfigFromViteEnvironment()
  const networkName = useMemo(() => {
    return algoConfig.network === '' ? 'localnet' : algoConfig.network.toLowerCase()
  }, [algoConfig.network])

  // Get all registered wallets
  const visibleWallets = useMemo(() => {
    return (wallets ?? []).filter(Boolean)
  }, [wallets])

  // Handle wallet connection
  const handleConnect = async (wallet: BaseWallet) => {
    setLastError('')
    setConnectingId(wallet.id)

    try {
      if (typeof wallet.connect !== 'function') {
        throw new Error(`Wallet "${wallet.id}" is missing connect().`)
      }

      // For Web3Auth, try to access and manually initialize if needed
      if (wallet.id === WalletId.WEB3AUTH) {
        const walletAny = wallet as any

        // Check if we can access the internal Web3Auth instance
        const web3AuthInstance = walletAny.web3Auth || walletAny._web3Auth || walletAny.instance

        if (web3AuthInstance) {
          // If not initialized, try to initialize
          if (web3AuthInstance.status !== 'ready' && typeof web3AuthInstance.init === 'function') {
            try {
              await web3AuthInstance.init()
            } catch (initError) {
              setLastError(`Web3Auth initialization failed: ${initError}`)
              return
            }
          }

          // If initialized but not connected, try direct connect
          if (web3AuthInstance.status === 'ready' && !web3AuthInstance.connected) {
            try {
              await web3AuthInstance.connect()
              // Don't call wallet.connect() if we already connected directly
              closeModal()
              return
            } catch (directConnectError) {
              // Fall through to try wallet.connect()
            }
          }
        }
      }

      // Call connect - this should open the Web3Auth modal
      const connectPromise = wallet.connect()

      // Add timeout for Web3Auth to detect if it hangs
      if (wallet.id === WalletId.WEB3AUTH) {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                'Web3Auth connection timed out after 30 seconds. The modal may not have opened. Check browser console for Web3Auth initialization errors.',
              ),
            )
          }, 30000)
        })

        await Promise.race([connectPromise, timeoutPromise])
      } else {
        await connectPromise
      }

      // For Web3Auth, verify the address was set
      if (wallet.id === WalletId.WEB3AUTH) {
        // Wait a bit to see if state updates
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if address was set
        const hasAddress = activeAddress && activeAddress.length > 0

        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (!hasAddress) {
          return
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      closeModal()
    } catch (e: any) {
      const msg = e?.message ? String(e.message) : String(e)

      // Provide more helpful error messages for Web3Auth
      if (wallet.id === WalletId.WEB3AUTH) {
        if (msg.includes('clientId') || msg.includes('Client ID')) {
          setLastError('Web3Auth Client ID is missing or invalid. Check your .env file.')
        } else if (msg.includes('network') || msg.includes('Network')) {
          setLastError('Web3Auth network configuration error. Check your network settings.')
        } else if (msg.includes('timeout')) {
          setLastError('Web3Auth connection timed out. The login modal may not have opened. Check browser console for Web3Auth errors.')
        } else {
          setLastError(`Web3Auth connection failed: ${msg}`)
        }
      } else {
        setLastError(`Failed to connect ${wallet.id}: ${msg}`)
      }
    } finally {
      setConnectingId(null)
    }
  }

  // Handle disconnect
  const handleDisconnect = async () => {
    setLastError('')
    try {
      // For Web3Auth, we might need to use the wallet's disconnect method directly
      if (activeWallet) {
        // Try the wallet's disconnect method first
        if (typeof (activeWallet as any).disconnect === 'function') {
          await (activeWallet as any).disconnect()
        }
        // Fall back to hook's disconnect if available
        else if (typeof disconnect === 'function') {
          await disconnect()
        }
      } else if (typeof disconnect === 'function') {
        await disconnect()
      }
      closeModal()
    } catch (e: any) {
      // Silently handle disconnect errors
      closeModal()
    }
  }

  // Don't render if modal is closed
  if (!openModal) return null

  // Check if wallet is connected - activeAddress is the primary indicator
  // isActive might be undefined for Web3Auth, so we check activeAddress
  const connected = Boolean(activeAddress)

  // Separate Web3Auth from traditional wallets for better UX
  const web3AuthWallet = visibleWallets.find((w) => w.id === WalletId.WEB3AUTH)
  const traditionalWallets = visibleWallets.filter((w) => w.id !== WalletId.WEB3AUTH)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{connected ? 'Account' : 'Sign in'}</h3>
          <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
            <span className="text-xl text-slate-500">✕</span>
          </button>
        </div>

        {/* Error display */}
        {lastError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-3 text-sm text-red-700 dark:text-red-400">
            {lastError}
          </div>
        )}

        {/* Connected state */}
        {connected ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Connected</div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </div>
              </div>

              {/* Address with copy button */}
              <div className="flex items-center gap-2 mb-3">
                <div className="font-mono text-sm break-all text-slate-900 dark:text-white flex-1">
                  {ellipseAddress(activeAddress || '', 8)}
                </div>
                <button
                  onClick={async () => {
                    if (activeAddress) {
                      try {
                        await navigator.clipboard.writeText(activeAddress)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      } catch (e) {
                        // Silently handle copy errors
                      }
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition"
                  title={copied ? 'Copied!' : 'Copy address'}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Full address (collapsible) */}
              <details className="mb-3">
                <summary className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                  Show full address
                </summary>
                <div className="mt-2 font-mono text-xs break-all text-slate-600 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-900 rounded">
                  {activeAddress}
                </div>
              </details>

              {/* Wallet type and Lora link */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="text-sm text-slate-700 dark:text-slate-200">
                  Wallet: <span className="font-semibold">{activeWallet?.metadata?.name ?? activeWallet?.id}</span>
                </div>
                {activeAddress && (
                  <a
                    href={`https://lora.algokit.io/${networkName}/account/${activeAddress}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition flex items-center gap-1"
                  >
                    View on Lora
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="w-full py-3 rounded-xl font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google Sign In (Web3Auth) */}
            {web3AuthWallet && (
              <div className="space-y-3">
                <button
                  onClick={() => handleConnect(web3AuthWallet)}
                  disabled={!!connectingId}
                  className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition disabled:opacity-60 shadow-sm"
                >
                  {/* Google Icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {connectingId === web3AuthWallet.id ? 'Connecting…' : 'Continue with Google'}
                  </span>
                </button>
              </div>
            )}

            {/* Divider */}
            {web3AuthWallet && traditionalWallets.length > 0 && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>
            )}

            {/* Traditional Wallets */}
            {traditionalWallets.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">Algorand Wallets</div>
                {traditionalWallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleConnect(w)}
                    disabled={!!connectingId}
                    className="w-full flex items-center justify-between gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-50/30 dark:hover:border-teal-500 dark:hover:bg-teal-900/10 transition disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      {w.metadata?.icon ? (
                        <img src={w.metadata.icon} alt={w.id} className="w-8 h-8 rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                      )}
                      <span className="font-semibold text-slate-900 dark:text-white">{w.metadata?.name ?? w.id}</span>
                    </div>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{connectingId === w.id ? 'Connecting…' : 'Connect'}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Warning if Web3Auth didn't register */}
            {!web3AuthWallet && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Google sign-in is not available. Check console for Web3Auth errors.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectWallet
