import { Button, Divider, Input, Textarea } from '@heroui/react'
import { FC, useCallback } from 'react'

interface SettingsModelProps extends GlobalProps {}

const SettingsModel: FC<SettingsModelProps> = ({ selectedModel, setSelectedModel }) => {
  const onBack = useCallback(() => {
    setSelectedModel(null)
  }, [setSelectedModel])

  if (!selectedModel) {
    return <div></div>
  }

  return (
    <div className='flex h-full flex-col overflow-y-auto'>
      <div className='flex items-center gap-2 border-b border-content2 pb-4'>
        <div className='flex flex-row items-center justify-center gap-2'>
          <div className='text-xl font-semibold dark:text-white'>模型设置</div>
          <div className='mt-1 text-sm text-neutral-500 dark:text-neutral-400'>"{selectedModel.id}"</div>
        </div>
      </div>

      <div className='mt-5 flex gap-4 flex-col flex-1'>
        <div className='flex flex-col gap-2 flex-1'>
          <div>
            <Input label='模型名称' type='text' defaultValue={selectedModel.name} />
          </div>

          <div>
            <Textarea label='模型描述' rows={3} defaultValue={selectedModel.meta?.description || ''} />
          </div>

          <div>
            <Input label='模型图标' type='text' defaultValue={selectedModel.meta?.profile_image_url || ''} />
          </div>

          <div>
            <Input
              label='模型标签'
              type='text'
              placeholder='输入标签，用逗号分隔'
              defaultValue={selectedModel.tags?.map((tag) => tag.name).join(', ') || ''}
            />
          </div>
        </div>
        <Divider className='my-5' />
        <div className='flex flex-row gap-2'>
          <Button
            variant='shadow'
            color='danger'
            startContent={<i className='icon-[mingcute--close-fill]' />}
            onPress={onBack}
          >
            取消
          </Button>
          <Button
            variant='shadow'
            color='primary'
            className='w-full'
            onPress={onBack}
            startContent={<i className='icon-[mingcute--save-fill]' />}
          >
            保存更改
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModel
