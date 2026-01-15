import { IProvider } from '@web3auth/base'
import { Web3Auth } from '@web3auth/modal'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { AlgorandAccountFromWeb3Auth, getAlgorandAccount } from '../utils/web3auth/algorandAdapter'
import { getWeb3AuthUserInfo, initWeb3Auth, logoutFromWeb3Auth, Web3AuthUserInfo } from '../utils/web3auth/web3authConfig'

interface Web3AuthContextType {
  isConnected: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  provider: IProvider | null
  web3AuthInstance: Web3Auth | null
  algorandAccount: AlgorandAccountFromWeb3Auth | null
  userInfo: Web3AuthUserInfo | null
  /**
   * login handles both modal and direct social login.
   * Passing arguments bypasses the Web3Auth modal.
   */
  login: (adapter?: string, provider?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUserInfo: () => Promise<void>
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined)

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [provider, setProvider] = useState<IProvider | null>(null)
  const [web3AuthInstance, setWeb3AuthInstance] = useState<Web3Auth | null>(null)
  const [algorandAccount, setAlgorandAccount] = useState<AlgorandAccountFromWeb3Auth | null>(null)
  const [userInfo, setUserInfo] = useState<Web3AuthUserInfo | null>(null)

  // Initialization logic
  useEffect(() => {
    const initializeWeb3Auth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const web3auth = await initWeb3Auth()
        setWeb3AuthInstance(web3auth)

        if (web3auth.status === 'connected' && web3auth.provider) {
          setProvider(web3auth.provider)
          setIsConnected(true)

          try {
            const account = await getAlgorandAccount(web3auth.provider)
            setAlgorandAccount(account)
          } catch (err) {
            console.error('🎯 Account derivation error:', err)
            setError('Failed to derive Algorand account. Please reconnect.')
          }

          try {
            const userInformation = await getWeb3AuthUserInfo()
            if (userInformation) setUserInfo(userInformation)
          } catch (err) {
            console.error('🎯 Failed to fetch user info:', err)
          }
        }

        setIsInitialized(true)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Web3Auth'
        console.error('🎯 WEB3AUTHPROVIDER: Initialization error:', err)
        setError(errorMessage)
        setIsInitialized(true)
      } finally {
        setIsLoading(false)
      }
    }

    initializeWeb3Auth()
  }, [])

  /**
   * Unified Login Function
   * @param adapter - (Optional) e.g., WALLET_ADAPTERS.AUTH
   * @param loginProvider - (Optional) e.g., 'google'
   */
  const login = async (adapter?: string, loginProvider?: string) => {
    if (!web3AuthInstance) {
      setError('Web3Auth not initialized')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      let web3authProvider: IProvider | null

      // Check if we are triggering a specific social login (bypasses modal)
      if (adapter && loginProvider) {
        web3authProvider = await web3AuthInstance.connectTo(adapter, {
          loginProvider: loginProvider,
        })
      } else {
        // Fallback to showing the default Web3Auth Modal
        web3authProvider = await web3AuthInstance.connect()
      }

      if (!web3authProvider) {
        throw new Error('Failed to connect Web3Auth provider')
      }

      setProvider(web3authProvider)
      setIsConnected(true)

      // Post-connection: Derive Algorand Address and Fetch Profile
      const account = await getAlgorandAccount(web3authProvider)
      setAlgorandAccount(account)

      const userInformation = await getWeb3AuthUserInfo()
      if (userInformation) setUserInfo(userInformation)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      console.error('🎯 LOGIN: Error:', err)
      setError(errorMessage)
      setIsConnected(false)
      setProvider(null)
      setAlgorandAccount(null)
      setUserInfo(null)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await logoutFromWeb3Auth()

      // Clear React state
      setProvider(null)
      setIsConnected(false)
      setAlgorandAccount(null)
      setUserInfo(null)

      /**
       * ✅ Fix A (most reliable for templates):
       * Force a full refresh after logout so Web3Auth doesn't get stuck
       * in an in-between cached state (e.g. button stuck on "Connecting...").
       */
      window.location.reload()
    } catch (err) {
      console.error('🎯 LOGOUT: Error:', err)
      setError(err instanceof Error ? err.message : 'Logout failed')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUserInfo = async () => {
    try {
      const userInformation = await getWeb3AuthUserInfo()
      if (userInformation) setUserInfo(userInformation)
    } catch (err) {
      console.error('🎯 REFRESH: Failed:', err)
    }
  }

  const value: Web3AuthContextType = {
    isConnected,
    isLoading,
    isInitialized,
    error,
    provider,
    web3AuthInstance,
    algorandAccount,
    userInfo,
    login,
    logout,
    refreshUserInfo,
  }

  return <Web3AuthContext.Provider value={value}>{children}</Web3AuthContext.Provider>
}

export function useWeb3Auth(): Web3AuthContextType {
  const context = useContext(Web3AuthContext)
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider')
  }
  return context
}
