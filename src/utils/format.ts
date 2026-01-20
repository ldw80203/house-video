/**
 * 格式化工具函數
 */

// 格式化價格（萬元）
export function formatPrice(price: number): string {
  if (price >= 10000) {
    return `${(price / 10000).toFixed(1)} 億`
  }
  return `${price} 萬`
}

// 格式化單坪價格
export function formatPricePerPing(price: number): string {
  return `${price.toFixed(1)} 萬/坪`
}

// 格式化坪數
export function formatSize(size: number): string {
  return `${size} 坪`
}

// 格式化電話（加入分隔符）
export function formatPhone(phone: string): string {
  // 移除所有非數字字符
  const digits = phone.replace(/\D/g, '')

  // 手機號碼格式：0912-345-678
  if (digits.length === 10 && digits.startsWith('09')) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }

  // 市話格式：02-1234-5678
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  // 其他情況直接返回
  return phone
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 相對時間（如：3 天前）
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays} 天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`
  return `${Math.floor(diffDays / 365)} 年前`
}
