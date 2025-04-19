import { Input } from '@heroui/react'
import { FC } from 'react'
import ModelCard from './ModelCard'

interface ModelListProps extends GlobalProps {}

const ModelList: FC<ModelListProps> = ({ models, selectedModel, setSelectedModel }) => {
  const handleSelectModel = (model: LLM) => {
    setSelectedModel(model)
  }

  if (models.length === 0) {
    return (
      <div className='flex h-full items-center justify-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800'>
        <div className='text-center p-6'>
          <i className='icon-[mingcute--book-3-line] mx-auto block h-12 w-12 text-neutral-300 dark:text-neutral-600' />
          <h3 className='mt-2 text-lg font-medium text-neutral-700 dark:text-neutral-300'>没有模型</h3>
          <p className='mt-1 text-sm text-neutral-500 dark:text-neutral-400'>请点击"导入"按钮导入模型列表</p>
        </div>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col p-4 pr-1'>
      <div className='sticky top-0 z-10 pr-4'>
        <div className='mb-2 flex items-center justify-between'>
          <h2 className='text-lg font-medium dark:text-white'>模型列表</h2>
          <span className='rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800 dark:text-neutral-300'>
            {models.length} 个模型
          </span>
        </div>
        <Input
          type='text'
          placeholder='搜索模型...'
          size='sm'
          startContent={<i className='icon-[mingcute--search-line]' />}
        />
      </div>
      <div className='flex-1 overflow-y-auto space-y-3 mt-2 pr-3'>
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            selected={selectedModel ? model.id === selectedModel.id : undefined}
            onClick={() => handleSelectModel(model)}
          />
        ))}
      </div>
    </div>
  )
}

export default ModelList
