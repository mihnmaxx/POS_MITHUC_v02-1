import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Khởi tạo state với giá trị từ localStorage hoặc initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  // Cập nhật localStorage khi state thay đổi
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.log('Error saving to localStorage:', error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue] as const
}
