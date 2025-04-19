import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Navbar,
  NavbarBrand,
  NavbarContent,
  useDisclosure,
} from '@heroui/react'
import { useLocalStorageState } from 'ahooks'
import { FC, useState } from 'react'
import { ApiConfig, createModel, fetchModels, saveModels } from '../../utils/apiUtils'
import { exportModels, importModels } from '../../utils/modelUtils'
import ConnectionPopover from './ConnectionPopover'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  patchModels: LLM[]
  setModels: React.Dispatch<React.SetStateAction<LLM[]>>
  setSelectedModel: (model: LLM | null) => void
}

const Header: FC<HeaderProps> = ({ patchModels, setModels, setSelectedModel }) => {
  // 连接状态和配置
  const [connected, setConnected] = useState<boolean>(false)
  const [apiConfig, setApiConfig] = useLocalStorageState<ApiConfig>('openwebui_config')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isMissingOpen, onOpen: missingOpen, onClose: missingClose } = useDisclosure()
  const [missingModels, setMissingModels] = useState<LLM[]>([])

  const missingHandler = (models: LLM[]) => {
    if (models.length > 0) {
      setMissingModels(models)
      missingOpen()
    }
  }

  const handleCreateMissing = async () => {
    if (!connected || !apiConfig) {
      addToast({ title: '未连接到服务器', color: 'warning' })
      return
    }
    const res = await Promise.all(missingModels.map((model) => createModel(model, apiConfig)))
    missingClose()
    addToast({ title: `成功创建 ${missingModels.length} 个模型`, color: 'success' })
    setModels((p) => [...p, ...res])
  }

  // 断开连接
  const handleDisconnect = () => {
    setConnected(false)
    setApiConfig(undefined)
    setModels([])
    setSelectedModel(null)
    addToast({ title: '已断开连接', color: 'success' })
  }

  // 更新模型列表
  const handleRefresh = async () => {
    if (!connected || !apiConfig) {
      addToast({ title: '未连接到服务器', color: 'warning' })
      return
    }

    try {
      const data = await fetchModels(apiConfig)
      missingHandler(data.missing)
      setModels(data.list)
      setSelectedModel(null)
      addToast({ title: `成功更新 ${data.list.length} 个模型`, color: 'success' })
    } catch (error) {
      addToast({ title: (error as Error).message || '更新失败', color: 'danger' })
    }
  }

  // 连接到API
  const handleConnect = (data: { list: LLM[]; missing: LLM[] }) => {
    // 重新从localStorage读取配置，因为ConnectionPopover会直接更新localStorage
    const configStr = localStorage.getItem('openwebui_config')
    if (configStr) {
      try {
        const config = JSON.parse(configStr) as ApiConfig
        setApiConfig(config)
      } catch (error) {
        console.error('解析配置失败:', error)
      }
    }
    missingHandler(data.missing)
    setConnected(true)
    setModels(data.list)
    setSelectedModel(null)
  }

  // 保存模型
  const handleSave = async () => {
    if (!connected || !apiConfig) {
      addToast({ title: '未连接到服务器', color: 'warning' })
      return
    }

    if (patchModels.length === 0) {
      addToast({ title: '没有可保存的模型', color: 'warning' })
      return
    }

    try {
      const results = await saveModels(patchModels, apiConfig)
      if (results.failed === 0) {
        addToast({ title: `成功保存 ${results.success} 个模型`, color: 'success' })
      } else {
        addToast({
          title: `保存了 ${results.success} 个模型，${results.failed} 个失败`,
          color: 'warning',
        })
        console.error('保存失败的模型:', results.errors)
      }
    } catch (error) {
      addToast({ title: (error as Error).message || '保存失败', color: 'danger' })
    }
  }

  // 文件导入
  const handleImport = async () => {
    try {
      const importedModels = await importModels()
      setModels(importedModels)
      setSelectedModel(null)
      addToast({ title: `成功导入 ${importedModels.length} 个模型`, color: 'success' })
    } catch (error) {
      addToast({ title: (error as Error).message || '导入失败', color: 'danger' })
    }
  }

  // 文件导出
  const handleExport = () => {
    if (patchModels.length === 0) {
      addToast({ title: '没有可导出的模型', color: 'warning' })
      return
    }

    try {
      exportModels(patchModels)
      addToast({ title: '模型导出成功', color: 'success' })
    } catch (error) {
      addToast({ title: (error as Error).message || '导出失败', color: 'danger' })
    }
  }

  return (
    <>
      <Navbar
        className='border-b border-neutral-200 bg-white/75 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/75'
        classNames={{
          wrapper: 'max-w-7xl',
        }}
      >
        <NavbarBrand>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white'>
            <i className='icon-[mingcute--book-6-fill] text-xl' />
          </div>
          <p className='ml-2 text-xl font-bold dark:text-white'>OpenWebUI Decorator</p>
        </NavbarBrand>

        <NavbarContent justify='end' className='gap-2'>
          <ThemeToggle />

          {connected ? (
            <>
              <Button
                color='danger'
                variant='shadow'
                onPress={handleDisconnect}
                startContent={<i className='text-xl icon-[mingcute--link-unlink-line]' />}
              >
                断开
              </Button>
              <Button
                color='primary'
                variant='shadow'
                onPress={handleRefresh}
                startContent={<i className='icon-[mingcute--refresh-3-line]' />}
              >
                更新
              </Button>
              <Button
                color='success'
                variant='shadow'
                onPress={handleSave}
                startContent={<i className='text-xl icon-[mingcute--save-2-line]' />}
              >
                保存
              </Button>
              <Button
                variant='shadow'
                onPress={handleExport}
                startContent={<i className='text-xl icon-[mingcute--file-export-line]' />}
              >
                导出
              </Button>
            </>
          ) : (
            <>
              <Button
                color='warning'
                variant='shadow'
                onPress={onOpen}
                startContent={<i className='text-xl icon-[mingcute--link-line]' />}
              >
                连接
              </Button>
              <Button
                color='primary'
                variant='shadow'
                onPress={handleImport}
                startContent={<i className='text-xl icon-[mingcute--file-import-line]' />}
              >
                导入
              </Button>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <ConnectionPopover
        isOpen={isOpen}
        onClose={onClose}
        onConnect={handleConnect}
        initialConfig={apiConfig || undefined}
      />
      <Modal isOpen={isMissingOpen} onClose={missingClose}>
        <ModalContent>
          <ModalHeader>缺失的模型</ModalHeader>
          <ModalBody>
            <div className='text-sm text-neutral-500'>缺失的模型将无法保存信息</div>
            <div className='flex flex-col gap-2'>
              {missingModels.map((model) => (
                <div key={model.id}>{model.name}</div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={missingClose}>关闭</Button>
            <Button onPress={handleCreateMissing}>一键创建</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Header
