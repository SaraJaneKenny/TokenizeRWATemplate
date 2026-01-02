import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'
import { useEffect, useRef } from 'react'
import Account from './Account'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

/**
 * ConnectWallet Modal Component
 * Displays wallet connection options (Pera, Defly, Lute, KMD for LocalNet)
 * Also shows connected wallet details and network information when logged in
 */
const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Manage native dialog element's open/close state
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (openModal) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [openModal])

  const getActiveWallet = () => {
    if (!wallets) return null
    return wallets.find((w) => w.isActive)
  }

  const getWalletDisplayName = (wallet: Wallet) => {
    if (wallet.id === WalletId.KMD) return 'LocalNet Wallet'
    return wallet.metadata.name
  }

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  const activeWallet = getActiveWallet()

  return (
    <dialog
      ref={dialogRef}
      id="connect_wallet_modal"
      className="fixed inset-0 w-full max-w-lg mx-auto my-auto rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === dialogRef.current) {
          closeModal()
        }
      }}
    >
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Select wallet provider</h3>
          <button
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition text-sm"
            onClick={closeModal}
            aria-label="Close wallet modal"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          Choose the wallet you want to connect. Supported: Pera, Defly, LocalNet (KMD), and others.
        </p>

        <div className="space-y-4">
          {activeAddress && (
            <>
              <div className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 p-4">
                <Account />
              </div>

              {/* Wallet Info */}
              <div className="space-y-3 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl p-4">
                {activeWallet && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mb-1">Connected Wallet</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{getWalletDisplayName(activeWallet)}</p>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-200 dark:bg-slate-600" />
            </>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                data-test-id={`${wallet.id}-connect`}
                className={`
                  w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600
                  hover:border-indigo-200 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-600 transition
                  focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500
                `}
                key={`provider-${wallet.id}`}
                onClick={() => {
                  // Close modal before initiating wallet connection
                  closeModal()
                  wallet.connect()
                }}
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`wallet_icon_${wallet.id}`}
                    src={wallet.metadata.icon}
                    className="w-9 h-9 object-contain rounded-md border border-gray-100 dark:border-slate-600 bg-white dark:bg-slate-700"
                  />
                )}
                <span className="font-medium text-sm text-left flex-1 text-gray-900 dark:text-slate-100">
                  {isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}
                </span>
                {wallet.isActive && <span className="text-sm text-emerald-500">✓</span>}
              </button>
            ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            data-test-id="close-wallet-modal"
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-sm hover:bg-gray-100 dark:hover:bg-slate-600 transition"
            onClick={() => {
              closeModal()
            }}
          >
            Close
          </button>

          {activeAddress && (
            <button
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm transition"
              data-test-id="logout"
              onClick={async () => {
                if (wallets) {
                  const wallet = wallets.find((w) => w.isActive)
                  if (wallet) {
                    await wallet.disconnect()
                  } else {
                    localStorage.removeItem('@txnlab/use-wallet:v3')
                    window.location.reload()
                  }
                }
              }}
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}
export default ConnectWallet
