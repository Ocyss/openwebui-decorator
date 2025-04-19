import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { HeroUIProvider } from '@heroui/react'
import { ToastProvider } from '@heroui/toast'
import { useSet } from 'ahooks'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import Layout from './components/layout/Layout'
import ModelList from './components/model/ModelList'
import Settings from './components/settings'

const AppContent = () => {
  const [models, setModels] = useState<LLM[]>([])
  const [selectedModel, setSelectedModel] = useState<LLM | null>(null)
  const [patch, setPatch] = useState<Record<string, (v: LLM) => LLM>>({
    default: (v) => ({
      ...v,
      meta: {
        ...{
          profile_image_url: '/static/favicon.png',
          description: ' ',
          capabilities: { vision: true, citations: true },
          suggestion_prompts: null,
          tags: [],
        },
        ...v.meta,
      },
    }),
  })
  const [patchSet, patchSetActions] = useSet<string>(['default'])

  const patchModels = useMemo(() => {
    const patchList = Object.entries(patch)
      .map(([id, patch]) => {
        if (!patchSet.has(id)) {
          return null
        }
        return patch
      })
      .filter((v) => v != null)
    return models.map((model) => patchList.reduce((v, p) => p(v), model))
  }, [models, patch, patchSet])

  useEffect(() => {
    console.log(patchModels)
  }, [patchModels])

  const props = useMemo<GlobalProps>(
    () => ({
      models,
      setPatch,
      patchSet,
      selectedModel,
      setSelectedModel,
      patchSetActions,
      patch,
      patchModels,
    }),
    [patchSet, selectedModel, models, patchSetActions, patch, patchModels],
  )

  return (
    <Layout patchModels={patchModels} setModels={setModels} setSelectedModel={setSelectedModel}>
      <div className='h-full flex flex-row border-1 border-content2 rounded-xl'>
        <div className='h-full overflow-hidden lg:col-span-1 w-1/3 max-w-2xl'>
          <ModelList {...props} models={patchModels} />
        </div>
        <div className='h-full border-l border-content2 overflow-hidden lg:col-span-2 w-2/3'>
          <Settings {...props} />
        </div>
      </div>
    </Layout>
  )
}

const App = () => {
  return (
    <HeroUIProvider>
      <NextThemesProvider attribute='class'>
        <ToastProvider placement='top-right' toastOffset={100} />
        <AppContent />
      </NextThemesProvider>
    </HeroUIProvider>
  )
}

export default App
