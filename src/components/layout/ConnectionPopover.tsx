import { addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react'
import { FC, useState } from 'react'
import { ApiConfig, fetchModels } from '../../utils/apiUtils'

interface ConnectionPopoverProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (data: { list: LLM[]; missing: LLM[] }) => void
  initialConfig?: ApiConfig
}

const ConnectionPopover: FC<ConnectionPopoverProps> = ({ isOpen, onClose, onConnect, initialConfig }) => {
  const [config, setConfig] = useState<ApiConfig>(
    initialConfig || {
      baseUrl: '',
      token: '',
    },
  )
  const [loading, setLoading] = useState(false)

  const handleChange = (key: keyof ApiConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [key]: e.target.value })
  }

  const handleConnect = async () => {
    if (!config.baseUrl || !config.token) {
      addToast({ title: '请输入完整的连接信息', color: 'warning' })
      return
    }

    setLoading(true)
    try {
      const models = await fetchModels(config)

      // 保存配置到本地存储
      localStorage.setItem('openwebui_config', JSON.stringify(config))
      localStorage.setItem('openwebui_connected', 'true')

      onConnect(models)
      addToast({ title: `成功连接，获取了 ${models.list.length} 个模型`, color: 'success' })
      onClose()
    } catch (error) {
      addToast({ title: (error as Error).message || '连接失败', color: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>连接到 OpenWebUI</ModalHeader>
        <ModalBody>
          <div className='flex flex-col gap-4'>
            <Input
              label='基础URL'
              placeholder='例如: https://openwebui.com'
              value={config.baseUrl}
              onChange={handleChange('baseUrl')}
            />
            <Input
              label='API Token'
              placeholder='例如: sk-123123'
              value={config.token}
              onChange={handleChange('token')}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            取消
          </Button>
          <Button color='primary' isLoading={loading} onPress={handleConnect}>
            连接
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ConnectionPopover
