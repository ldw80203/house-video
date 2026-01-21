import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) {
          setError('登入失敗：' + error.message)
        } else {
          navigate('/')
        }
      } else {
        if (!displayName.trim()) {
          setError('請輸入顯示名稱')
          setIsLoading(false)
          return
        }
        const { error } = await signUp(email, password, displayName)
        if (error) {
          setError('註冊失敗：' + error.message)
        } else {
          setError('註冊成功！請查看信箱確認帳號')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 via-white to-brand-accent/10 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">影音看房</h1>
          <p className="text-gray-600 mt-2">{isLogin ? '登入你的帳號' : '建立新帳號'}</p>
        </div>

        {/* 表單 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  顯示名稱
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl
                           focus:ring-2 focus:ring-brand-primary focus:border-transparent
                           transition-all"
                  placeholder="輸入您的名稱"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電子郵件
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:ring-2 focus:ring-brand-primary focus:border-transparent
                         transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密碼
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:ring-2 focus:ring-brand-primary focus:border-transparent
                         transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">密碼至少需要 6 個字元</p>
              )}
            </div>

            {error && (
              <div className={`p-3 rounded-lg text-sm ${
                error.includes('成功')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-brand-primary text-white font-bold
                       rounded-xl shadow-lg hover:shadow-xl
                       transition-all duration-300 hover:scale-105 active:scale-95
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? '處理中...' : isLogin ? '登入' : '註冊'}
            </button>
          </form>

          {/* 切換登入/註冊 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
              }}
              className="text-brand-accent hover:underline font-medium"
            >
              {isLogin ? '還沒有帳號？立即註冊' : '已有帳號？返回登入'}
            </button>
          </div>

          {/* 訪客瀏覽 */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              以訪客身份瀏覽
            </button>
          </div>
        </div>

        {/* 功能說明 */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>登入後可以使用聊天室功能</p>
          <p>與房仲即時溝通，預約看房</p>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
