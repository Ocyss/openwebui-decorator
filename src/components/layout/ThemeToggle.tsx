import { Button } from '@heroui/react'
import { useTheme } from 'next-themes'
import { FC, useCallback } from 'react'

const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const checkTheme = useCallback(() => {
    if (!document.startViewTransition) {
      setTheme(isDark ? 'light' : 'dark')
      return
    }
    document.startViewTransition(() => setTheme(isDark ? 'light' : 'dark'))
  }, [isDark, setTheme])

  return (
    <Button isIconOnly variant='light' aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'} onPress={checkTheme}>
      <i className={isDark ? 'icon-[mingcute--sun-line] text-xl' : 'icon-[mingcute--moon-line] text-xl'} />
    </Button>
  )
}

export default ThemeToggle
