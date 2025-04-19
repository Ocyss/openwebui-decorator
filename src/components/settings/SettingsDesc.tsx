import {
  Avatar,
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
  Textarea,
} from '@heroui/react'
import * as changeCase from 'change-case'
import { FC, useCallback, useMemo, useRef, useState } from 'react'

interface NamingConvention {
  id: string
  name: string
  transform: (str: string) => string
}

interface SettingsDescProps extends GlobalProps {}

const SelectableCard: FC<{
  models: LLM[]
  selected: Record<string, boolean>
  setSelected: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}> = ({ models, selected, setSelected }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  // TODO: const { DragSelection } = useSelectionContainer()

  const handleSelection = useCallback(
    (id: string) => {
      setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
    },
    [setSelected],
  )

  return (
    <div className='flex flex-wrap gap-2 rounded-lg relative' ref={containerRef}>
      {models.map((model) => (
        <Button
          data-item={model.id}
          key={model.id}
          color={selected[model.id] ? 'primary' : 'default'}
          variant='flat'
          onPress={() => handleSelection(model.id)}
        >
          <div className='flex flex-row items-center gap-1'>
            <Avatar
              src={model.meta?.profile_image_url ?? '/static/favicon.png'}
              alt={model.name}
              name={model.name}
              showFallback
              className={`llm-avatar size-5 bg-transparent border-default-200`}
            />
            <div className='text-sm'>{model.name}</div>
          </div>
        </Button>
      ))}
    </div>
  )
}

function genPromptText(llm: LLM[]) {
  return llm.map((model) => `${model.name}: ${model.meta?.description}`).join('\n')
}

function genPromptCsv(llm: LLM[]) {
  return (
    `|id|name|desc|tags|
|---|---|---|---|` +
    llm
      .map(
        (model) => `|${model.id}|${model.name}|${model.meta?.description ?? ''}|${model.meta?.tags?.join(',') ?? ''}|`,
      )
      .join('\n')
  )
}

const SettingsDesc: FC<SettingsDescProps> = ({ models, patchModels }) => {
  const [openAIKey, setOpenAIKey] = useState('')
  const [genNamePrompt, setGenNamePrompt] = useState(
    `根据LLM model的id，name，desc生成对应的模型名称，生成的名称要参考示例。
<示例>
{{examples}}
</示例

<待处理>
{{models}}
</待处理>

## 输出csv格式

|id|name|
|------|------|
`,
  )
  const [genDescPrompt, setGenDescPrompt] = useState(
    `请为人工智能模型生成一段简短的描述，描述应该包含模型的特点、能力和用途。
<示例>
{{examples}}
</示例

<待处理>
{{models}}
</待处理>

## 输出csv格式

|id|desc|
|------|------|
    `,
  )
  const [genTagsPrompt, setGenTagsPrompt] = useState(
    `请基于模型的特点和用途生成3-5个标签，每个标签应该是单个词或短语。
<示例>
{{examples}}
</示例

<待处理>
{{models}}
</待处理>

<可选tags>
{{tags}}
</可选tags>

## 输出csv格式
tags 使用逗号分割
|id|tags|
|------|------|
`,
  )
  const [selectedExamples, setSelectedExamples] = useState<Record<string, boolean>>({})
  const [namingConvention, setNamingConvention] = useState<string>('camel')
  const [operationMode, setOperationMode] = useState<'all' | 'selected'>('all')
  const [selectedOperations, setSelectedOperations] = useState<Record<string, boolean>>({})

  const allTags = useMemo(() => {
    // 从所有模型中收集标签
    const tags = new Set<string>()
    models.forEach((model) => {
      model.tags?.forEach((tag) => {
        if (tag.name) tags.add(tag.name)
      })
    })
    return Array.from(tags)
  }, [models])

  const namingConventions: NamingConvention[] = [
    { id: 'camel', name: '小驼峰 (camelCase)', transform: changeCase.camelCase },
    { id: 'pascal', name: '大驼峰 (PascalCase)', transform: changeCase.pascalCase },
    { id: 'snake', name: '蛇形 (snake_case)', transform: changeCase.snakeCase },
    { id: 'kebab', name: '短横线 (kebab-case)', transform: changeCase.kebabCase },
    { id: 'constant', name: '常量 (CONSTANT_CASE)', transform: changeCase.constantCase },
  ]

  const selectedConvention = namingConventions.find((c) => c.id === namingConvention)

  const exampleModels = useMemo(() => {
    return patchModels.filter((model) => selectedExamples[model.id])
  }, [patchModels, selectedExamples])

  const operationsModels = useMemo(() => {
    return patchModels.filter((model) => !selectedExamples[model.id])
  }, [patchModels, selectedExamples])

  const promptReplace = (v: string) => {
    return v
      .replace('{{examples}}', genPromptText(exampleModels))
      .replace(
        '{{models}}',
        genPromptCsv(
          operationMode === 'all' ? operationsModels : operationsModels.filter((model) => selectedOperations[model.id]),
        ),
      )
      .replace('{{tags}}', allTags.join(', '))
  }

  const handleGenerateName = () => {
    console.log('生成名称', promptReplace(genNamePrompt))
  }

  const handleGenerateDesc = () => {
    console.log('生成描述', promptReplace(genDescPrompt))
  }

  const handleGenerateTags = () => {
    console.log('生成标签', promptReplace(genTagsPrompt))
  }

  return (
    <div className='flex flex-col'>
      <div className='mt-5 flex flex-col gap-4'>
        {/* 示例选择 */}
        <div className='mb-2'>
          <div className='flex flex-row justify-between'>
            <div>
              <div className='text-lg font-medium mb-2'>选择示例模型</div>
              <div className='text-sm text-neutral-500 mb-4'>这些模型将作为示例，用于GPT生成新的命名、描述和标签</div>
            </div>
            <Popover placement='bottom'>
              <PopoverTrigger>
                <Button color='primary' variant='flat' size='md'>
                  配置GPT
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className='p-4 w-80'>
                  <div className='mb-4'>
                    <Input
                      label='OpenAI API Key'
                      type='password'
                      value={openAIKey}
                      onChange={(e) => setOpenAIKey(e.target.value)}
                      placeholder='sk-...'
                    />
                  </div>
                  <div className='flex justify-end'>
                    <Button color='primary' size='sm'>
                      保存
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <SelectableCard models={patchModels} selected={selectedExamples} setSelected={setSelectedExamples} />
        </div>

        <Divider />

        {/* 操作范围 */}
        <div className='mb-4'>
          <div className='text-lg font-medium mb-2'>操作范围</div>
          <RadioGroup orientation='horizontal' value={operationMode} onValueChange={setOperationMode as never}>
            <Radio value='all'>所有模型（排除示例）</Radio>
            <Radio value='selected'>选择的模型</Radio>
          </RadioGroup>

          {operationMode === 'selected' && (
            <div className='mt-4'>
              <div className='text-sm text-neutral-500 mb-2'>选择要操作的模型</div>
              <SelectableCard
                models={operationsModels}
                selected={selectedOperations}
                setSelected={setSelectedOperations}
              />
            </div>
          )}
        </div>

        <Divider />

        {/* 命名生成 */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <div className='text-lg font-medium'>名称生成</div>
            <div className='flex flex-row gap-2'>
              <Dropdown>
                <DropdownTrigger>
                  <Button size='sm' variant='ghost'>
                    {selectedConvention?.name || '选择命名规范'}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label='命名规范选择' onAction={(key) => setNamingConvention(key as string)}>
                  {namingConventions.map((convention) => (
                    <DropdownItem key={convention.id}>{convention.name}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              <Button
                variant='flat'
                size='sm'
                color='success'
                startContent={<i className='icon-[mingcute--look-up-fill] text-xl' />}
              >
                预览
              </Button>
            </div>
          </div>
          <Textarea
            label='名称生成提示'
            placeholder='输入用于生成模型名称的提示'
            value={genNamePrompt}
            onChange={(e) => setGenNamePrompt(e.target.value)}
            rows={3}
            className='mb-2'
          />
          <div className='flex justify-end'>
            <Button color='primary' onPress={handleGenerateName} size='sm'>
              生成名称
            </Button>
          </div>
        </div>

        {/* 描述生成 */}
        <div className='mb-4'>
          <div className='text-lg font-medium mb-2'>描述生成</div>
          <Textarea
            label='描述生成提示'
            placeholder='输入用于生成模型描述的提示'
            value={genDescPrompt}
            onChange={(e) => setGenDescPrompt(e.target.value)}
            rows={3}
            className='mb-2'
          />
          <div className='flex justify-end'>
            <Button color='primary' onPress={handleGenerateDesc} size='sm'>
              生成描述
            </Button>
          </div>
        </div>

        {/* 标签生成 */}
        <div className='mb-4'>
          <div className='text-lg font-medium mb-2'>标签生成</div>
          <Textarea
            label='标签生成提示'
            placeholder='输入用于生成模型标签的提示'
            value={genTagsPrompt}
            onChange={(e) => setGenTagsPrompt(e.target.value)}
            rows={3}
            className='mb-2'
          />
          <div className='text-sm text-neutral-500 mb-2'>现有标签</div>
          <div className='flex flex-wrap gap-2 mb-2'>
            {allTags.map((tag) => (
              <Chip key={tag}>{tag}</Chip>
            ))}
          </div>
          <div className='flex justify-end'>
            <Button color='primary' onPress={handleGenerateTags} size='sm'>
              生成标签
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsDesc
