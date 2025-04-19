/**
 * 导入模型数据
 */
export const importModels = async (): Promise<LLM[]> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('未选择文件'))
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const models = JSON.parse(event.target?.result as string) as LLM[]
          resolve(models)
        } catch (error) {
          reject(new Error('解析JSON文件失败'))
        }
      }

      reader.onerror = () => reject(new Error('读取文件失败'))
      reader.readAsText(file)
    }

    input.click()
  })
}

/**
 * 导出模型数据
 */
export const exportModels = (models: LLM[]): void => {
  const json = JSON.stringify(models, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `openwebui-models-${new Date().toISOString().split('T')[0]}.json`
  a.click()

  URL.revokeObjectURL(url)
}

/**
 * 根据名称自动填充模型图标URL
 * 这里可以实现根据模型名称返回常见模型的图标URL的逻辑
 */
export const getModelIconByName = (name: string): string | null => {
  const lowerName = name.toLowerCase()

  // 一些常见模型的图标URL映射
  const iconMap: Record<string, string> = {
    'gpt-3.5': 'https://cdn.oaistatic.com/_next/static/media/favicon-32x32.543aa831.png',
    'gpt-4': 'https://cdn.oaistatic.com/_next/static/media/favicon-32x32.543aa831.png',
    claude: 'https://www.anthropic.com/images/favicon.ico',
    llama: 'https://raw.githubusercontent.com/facebookresearch/llama/main/docs/favicon.png',
    mixtral: 'https://mistral.ai/favicon.ico',
    gemma: 'https://www.gstatic.com/lamda/images/gemma_logo_v1.svg',
    gemini: 'https://www.gstatic.com/lamda/images/favicon.ico',
  }

  // 检查模型名称是否包含任何已知的模型关键字
  for (const [key, url] of Object.entries(iconMap)) {
    if (lowerName.includes(key)) {
      return url
    }
  }

  return null
}
