import {
  Accordion,
  AccordionItem,
  Autocomplete,
  AutocompleteItem,
  addToast,
  Button,
  Divider,
  Link,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Switch,
  Textarea,
} from '@heroui/react'
import { highlightText } from '@speed-highlight/core'
import { useToggle } from 'ahooks'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useAsyncMemo } from 'use-async-memo'
import icons from '../../utils/icons.json'

const CDN_OPTIONS = [
  { label: 'npmmirror', value: 'registry.npmmirror.com' },
  { label: 'unpkg', value: 'unpkg.com' },
]

const FORMAT_OPTIONS = [
  { label: 'SVG', value: 'svg' },
  { label: 'PNG', value: 'png' },
]

function isIconName(name: string): name is keyof typeof icons {
  return name in icons
}

function isIconColor(name: string): boolean {
  if (!isIconName(name)) return false
  const icon = icons[name]
  if (!('color' in icon)) return false
  return icon.color
}

const previewUrlHandler = ({
  format,
  name,
  useColor,
  cdn,
}: {
  format: string
  name: string
  useColor: boolean
  cdn: string
}) => {
  const packageName = '@lobehub/icons-static-' + format
  const iconPath = format === 'png' ? 'light' : 'icons'
  const colorSuffix = useColor ? (isIconColor(name) ? '-color' : '') : ''
  const path = `${iconPath}/${name}${colorSuffix}.${format}`

  switch (cdn) {
    case 'registry.npmmirror.com':
      return `https://${cdn}/${packageName}/latest/files/${path}`
    case 'unpkg.com':
      return `https://${cdn}/${packageName}@latest/${path}`
  }
}

const defaultMatchingRules = `gpt:openai
pplx|sonar:perplexity
`

function getMatchingRulesMap(matchingRules: string) {
  return matchingRules.split('\n').reduce(
    (acc, rule) => {
      if (!rule) return acc
      let [key, value] = rule.trim().split(':')
      key = key.trim()
      value = value.trim()
      if (!key || !value) return acc
      key.split('|').forEach((k) => {
        acc[value] ??= []
        acc[value].push(k)
      })
      return acc
    },
    {} as Record<string, string[]>,
  )
}

function matchingLLM(key: string, llm: LLM) {
  return llm.id.includes(key) || llm.name.includes(key)
}

function getIconName(v: LLM, matchingRulesMap: Record<string, string[]>): string | undefined {
  const iconMeta = Object.entries(icons).find(([key]) => {
    const matchingRules = matchingRulesMap[key]
    if (!matchingRules) return matchingLLM(key, v)
    return matchingRules.some((item) => matchingLLM(item, v)) || matchingLLM(key, v)
  })
  const name = iconMeta?.[0]
  return name
}

const SettingsIcon: FC<GlobalProps> = ({ patch, setPatch, patchSetActions, selectedModel }) => {
  const [cdn, setCdn] = useState<string>(CDN_OPTIONS[0].value)
  const [format, setFormat] = useState<string>(FORMAT_OPTIONS[0].value)
  const [useColor, setUseColor] = useState<boolean>(false)
  const [matchingRules, setMatchingRules] = useState<string>(defaultMatchingRules)
  const [iconName, setIconName] = useState<string | number | null | undefined>('deepseek')

  useEffect(() => {
    if (selectedModel) {
      const matchingRulesMap = getMatchingRulesMap(matchingRules)
      const name = getIconName(selectedModel, matchingRulesMap)
      if (name) {
        setIconName(name)
      }
    }
  }, [selectedModel, matchingRules])

  const AutocompleteItems = useMemo(() => {
    return Object.keys(icons).map((icon) => ({
      key: icon,
      label: icon,
    }))
  }, [])

  const previewUrl = useMemo(() => {
    if (!iconName || typeof iconName !== 'string') return ''
    return previewUrlHandler({ format, name: iconName, useColor, cdn })
  }, [cdn, format, iconName, useColor])

  const cssCode = useMemo(() => {
    return `
img[src*="@lobehub/icons-static-"] {
  transition: filter 0.3s ease;
}

${
  format === 'png'
    ? `html img[src*="@lobehub/icons-static-png"][src*="dark"]:not([src$="-color.png"]),
html.dark img[src*="@lobehub/icons-static-png"][src*="light"]:not([src$="-color.png"])`
    : `html.dark img[src*="@lobehub/icons-static-svg"]:not([src$="-color.svg"])`
} {
  filter: invert(1);
}
`
  }, [format])

  const cssStyle = useAsyncMemo(() => highlightText(cssCode, 'css', true), [cssCode])

  const [isThemeReverse, { toggle: toggleIsThemeReverse }] = useToggle(false)

  const onSave = useCallback(() => {
    const matchingRulesMap = getMatchingRulesMap(matchingRules)
    setPatch({
      ...patch,
      'icon/preview': (v) => {
        const name = getIconName(v, matchingRulesMap)
        if (!name) return v
        return {
          ...v,
          meta: {
            ...v.meta,
            profile_image_url: previewUrlHandler({ format, name, useColor, cdn }) || v.meta?.profile_image_url || '',
          },
        }
      },
    })
    patchSetActions.add('icon/preview')
  }, [patchSetActions, patch, setPatch, cdn, format, useColor, matchingRules])

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col gap-4 flex-1'>
        <Accordion itemClasses={{ content: 'flex flex-col gap-4' }}>
          <AccordionItem key='preview-config' title='预览配置'>
            <div>
              <Select label='CDN服务商' selectedKeys={[cdn]} onChange={(e) => setCdn(e.target.value)}>
                {CDN_OPTIONS.map((option) => (
                  <SelectItem key={option.value}>{option.label}</SelectItem>
                ))}
              </Select>
              <div className='text-xs text-neutral-500 mt-1'>选择用于加载图标的NPM包CDN服务商</div>
            </div>

            <div>
              <RadioGroup label='图标格式' value={format} onValueChange={setFormat} orientation='horizontal'>
                {FORMAT_OPTIONS.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
              <div className='text-xs text-neutral-500 mt-1'>推荐使用SVG格式，加载快，体积小</div>
            </div>

            <div>
              <Autocomplete
                className='max-w-xs'
                defaultItems={AutocompleteItems}
                label='图标名称'
                isVirtualized
                selectedKey={iconName}
                onSelectionChange={setIconName}
              >
                {(item) => <AutocompleteItem key={item.key}>{item.label}</AutocompleteItem>}
              </Autocomplete>
            </div>
          </AccordionItem>
        </Accordion>

        <div className='flex items-center justify-between'>
          <div>
            <span>使用彩色图标</span>
            <div className='text-xs text-neutral-500'>仅部分图标支持彩色选项</div>
          </div>
          <Switch isSelected={useColor} onValueChange={setUseColor} />
        </div>

        <div className='mt-4'>
          <div className='flex flex-col gap-2'>
            <div className='text-sm font-medium flex items-center gap-2'>
              预览
              <Button isIconOnly variant='ghost' aria-label='反色' onPress={toggleIsThemeReverse} size='sm'>
                <i className='icon-[mingcute--moonlight-fill] text-xl' />
              </Button>
            </div>
            <div
              className='flex items-center justify-center border border-dashed p-4 rounded-lg
                data-[theme-reverse]:dark dark:data-[theme-reverse]:light bg-background'
              data-theme-reverse={isThemeReverse ? true : undefined}
            >
              <img
                src={previewUrl}
                alt='Icon Preview'
                className='w-16 h-16'
                data-theme-reverse={isThemeReverse ? true : undefined}
              />
            </div>
            <div className='text-xs text-neutral-500 mt-2 break-all'>{previewUrl}</div>
          </div>
        </div>
        <div className='mt-4'>
          <div className='flex flex-col gap-2'>
            <div className='text-sm font-medium flex items-center gap-2'>
              CSS样式代码
              <Button
                isIconOnly
                variant='ghost'
                aria-label='复制'
                onPress={() =>
                  navigator.clipboard.writeText(cssCode).then(() => {
                    addToast({
                      title: '复制成功',
                      color: 'success',
                    })
                  })
                }
                size='sm'
              >
                <i className='icon-[mingcute--copy-3-fill] text-xl' />
              </Button>
            </div>
            {/** biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
            {cssStyle && <div className='!my-1 shj-lang-css' dangerouslySetInnerHTML={{ __html: cssStyle }} />}
            <div className='text-sm text-neutral-500 break-all'>
              粘贴到自定义styles中实现 暗黑亮色自动切换
              <br />
              参考:
              <Link size='sm' href='https://linux.do/t/topic/440439'>
                https://linux.do/t/topic/440439
              </Link>
              <br />
              docker可参考:
              <Link size='sm' href='https://linux.do/t/topic/484479'>
                https://linux.do/t/topic/484479
              </Link>
            </div>
          </div>
        </div>

        <Accordion className='mt-4'>
          <AccordionItem key='matching-rules' title='匹配规则表'>
            <div className='p-2'>
              <Textarea
                label='每行一个匹配规则'
                placeholder='输入匹配规则，每行一个'
                value={matchingRules}
                onChange={(e) => setMatchingRules(e.target.value)}
                minRows={5}
              />
              <div className='text-xs text-neutral-500 mt-2'>
                填写匹配规则，每行一个规则。
                <br />
                格式示例：模型ID=图标名称
                <br />
                例如：gpt-4=openai, claude-3=anthropic
              </div>
            </div>
          </AccordionItem>
        </Accordion>
      </div>
      <Divider className='my-5' />
      <div className='flex flex-row gap-2'>
        <Button
          variant='shadow'
          color='primary'
          className='w-full'
          startContent={<i className='icon-[mingcute--save-fill] text-xl' />}
          onPress={onSave}
        >
          保存更改
        </Button>
      </div>
    </div>
  )
}

export default SettingsIcon
