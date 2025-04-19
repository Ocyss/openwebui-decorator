/**
 * 获取OpenWebUI模型列表
 */
export interface ApiConfig {
  baseUrl: string
  token: string
}

/**
 * 从OpenWebUI API获取模型列表
 */
export const fetchModels = async (config: ApiConfig): Promise<{ list: LLM[]; missing: LLM[] }> => {
  try {
    // 并发请求两个API端点
    const [modelsResponse, baseResponse] = await Promise.all([
      fetch(`${config.baseUrl}/api/v1/models/base`, {
        headers: {
          authorization: `Bearer ${config.token}`,
        },
      }),
      fetch(`${config.baseUrl}/api/models/base`, {
        headers: {
          authorization: `Bearer ${config.token}`,
        },
      }),
    ])

    // 检查响应状态
    if (!baseResponse.ok) {
      throw new Error(`基础模型请求失败: ${baseResponse.status} ${baseResponse.statusText}`)
    }
    if (!modelsResponse.ok) {
      throw new Error(`模型列表请求失败: ${modelsResponse.status} ${modelsResponse.statusText}`)
    }

    // 解析响应数据
    const baseData = ((await baseResponse.json()) as { data: LLM[] }).data
    const models = (await modelsResponse.json()) as LLM[]

    // 创建基础模型ID的集合用于快速查找
    const baseModelIds = new Set(baseData.map((model) => model.id))

    // 筛选出只在base中存在的模型
    const filteredModels = models.filter((model) => baseModelIds.has(model.id))

    // 检查base中有但models中没有的模型
    const missingModels = baseData.filter((baseModel) => !models.some((model) => model.id === baseModel.id))

    // 打印缺失的模型信息
    if (missingModels.length > 0) {
      console.warn(`发现 ${missingModels.length} 个在base中存在但在models中缺失的模型:`, missingModels)
    }

    return { list: filteredModels, missing: missingModels }
  } catch (error) {
    console.error('获取模型列表失败:', error)
    throw error
  }
}

/**
 * 保存单个模型
 */
export const saveModel = async (model: LLM, config: ApiConfig): Promise<void> => {
  try {
    const response = await fetch(`${config.baseUrl}/api/v1/models/model/update?id=${model.id}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(model),
    })

    if (!response.ok) {
      throw new Error(`保存模型失败: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error(`保存模型 ${model.id} 失败:`, error)
    throw error
  }
}

/**
 * 批量保存模型
 */
export const saveModels = async (
  models: LLM[],
  config: ApiConfig,
): Promise<{ success: number; failed: number; errors: Record<string, string> }> => {
  const results = {
    success: 0,
    failed: 0,
    errors: {} as Record<string, string>,
  }

  // 在会话存储中保存一份带时间戳的备份
  try {
    const timestamp = new Date().toISOString()
    sessionStorage.setItem(`models_backup_${timestamp}`, JSON.stringify(models))
  } catch (error) {
    console.error('保存到会话存储失败:', error)
  }

  // 在本地存储中保存一份最新版本
  try {
    localStorage.setItem('models_latest', JSON.stringify(models))
  } catch (error) {
    console.error('保存到本地存储失败:', error)
  }

  // 异步保存所有模型
  await Promise.all(
    models.map(async (model) => {
      try {
        await saveModel(model, config)
        results.success++
        console.log(`模型 ${model.id} 保存成功`)
      } catch (error) {
        results.failed++
        results.errors[model.id] = (error as Error).message
        console.error(`模型 ${model.id} 保存失败:`, error)
      }
    }),
  )

  return results
}

/**
 * 创建新模型
 */
export const createModel = async (model: LLM, config: ApiConfig): Promise<LLM> => {
  try {
    const response = await fetch(`${config.baseUrl}/api/v1/models/create`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...{
          base_model_id: null,
          meta: {
            profile_image_url: '/static/favicon.png',
            description: '1',
            suggestion_prompts: null,
            tags: [],
            capabilities: {
              vision: true,
              citations: true,
            },
          },
          params: {},
          is_active: true,
          access_control: {
            read: {
              group_ids: [],
              user_ids: [],
            },
            write: {
              group_ids: [],
              user_ids: [],
            },
          },
        },
        ...model,
      }),
    })

    if (!response.ok) {
      throw new Error(`创建模型失败: ${response.status} ${response.statusText}`)
    }

    const createdModel = await response.json()
    return createdModel as LLM
  } catch (error) {
    console.error(`创建模型失败:`, error)
    throw error
  }
}
