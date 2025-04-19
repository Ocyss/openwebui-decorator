import { Avatar, Card, Chip, Image } from '@heroui/react'
import { FC } from 'react'

interface ModelCardProps {
  model: LLM
  selected?: boolean
  onClick?: () => void
}

const ModelCard: FC<ModelCardProps> = ({ model, selected = false, onClick }) => {
  return (
    <Card
      isPressable
      onPress={onClick}
      className={`border-1 w-full p-3 h-26 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
        selected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
          : 'border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900'
      }`}
    >
      <div className='flex items-start gap-3'>
        <div className='h-full flex items-center justify-center'>
          <Avatar
            src={model.meta?.profile_image_url ?? '/static/favicon.png'}
            alt={model.name}
            name={model.name}
            size='md'
            showFallback
            className='llm-avatar bg-transparent border-default-200'
          />
        </div>

        <div className='flex-1 flex min-w-0 flex-col'>
          <h3 className='truncate text-base font-medium text-left'>{model.name}</h3>
          <p className='line-clamp-2 text-sm text-left text-neutral-500 dark:text-neutral-400'>
            {model.meta?.description || ``}
          </p>
          {model.tags && model.tags.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {model.tags.map((tag) => (
                <Chip key={tag.name} size='sm' variant='flat' className='text-xs'>
                  {tag.name}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default ModelCard
