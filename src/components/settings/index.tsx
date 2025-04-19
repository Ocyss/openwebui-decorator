import { Tab, Tabs } from '@heroui/react'
import { FC } from 'react'
import SettingsDesc from './SettingsDesc'
import SettingsIcon from './SettingsIcon'
import SettingsModel from './SettingsModel'

interface SettingsProps extends GlobalProps {}

const Settings: FC<SettingsProps> = (props) => {
  return (
    <div className='flex flex-col w-full h-full items-center justify-center p-4 pr-1 min-h-0'>
      <Tabs
        classNames={{
          tabList: 'gap-6 w-full relative rounded-none p-0 border-b border-divider flex justify-center',
          base: 'w-full',
          tab: 'px-0 h-12',
          panel: 'flex-1 w-full overflow-y-auto pr-3 mt-2',
          cursor: 'w-4/5',
        }}
        color='primary'
        variant='underlined'
      >
        <Tab
          key='icon'
          title={
            <div className='flex items-center space-x-1'>
              <i className='icon-[mingcute--binance-coin-bnb-fill]' />
              <span>图标</span>
            </div>
          }
        >
          <SettingsIcon {...props} />
        </Tab>
        <Tab
          key='description'
          title={
            <div className='flex items-center space-x-1'>
              <i className='icon-[mingcute--text-area-line]' />
              <span>描述/标签</span>
            </div>
          }
        >
          <SettingsDesc {...props} />
        </Tab>
        <Tab
          key='config'
          title={
            <div className='flex items-center space-x-1'>
              <i className='icon-[mingcute--settings-3-line]' />
              <span>配置</span>
            </div>
          }
        >
          {props.selectedModel ? (
            <SettingsModel {...props} />
          ) : (
            <div className='text-center'>
              <i className='icon-[mingcute--eye-close-line] mx-auto block h-12 w-12 text-neutral-300 dark:text-neutral-600' />
              <h3 className='mt-2 text-lg font-medium text-neutral-700 dark:text-neutral-300'>未选择模型</h3>
              <p className='mt-1 text-sm text-neutral-500 dark:text-neutral-400'>
                请从左侧选择一个模型以查看和编辑设置
              </p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  )
}

export default Settings
