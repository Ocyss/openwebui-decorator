import { FC, ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
  patchModels: LLM[]
  setModels: React.Dispatch<React.SetStateAction<LLM[]>>
  setSelectedModel: (model: LLM | null) => void
}

const Layout: FC<LayoutProps> = ({ children, patchModels, setModels, setSelectedModel }) => {
  return (
    <div className='flex min-h-screen flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white h-[calc(100vh-10rem)] overflow-hidden'>
      <Header patchModels={patchModels} setModels={setModels} setSelectedModel={setSelectedModel} />
      <main className='container mx-auto flex-1 overflow-hidden py-4'>{children}</main>
    </div>
  )
}

export default Layout
