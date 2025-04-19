/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/complexity/noBannedTypes: <explanation> */

interface LLM {
  id: string
  name: string
  object?: string
  created?: number
  owned_by: string
  pipe?: {
    type: string
  }
  user_id?: string
  base_model_id: any
  params?: {}
  meta?: {
    profile_image_url?: string
    description?: string
    capabilities?: {
      vision: boolean
      citations: boolean
    }
    suggestion_prompts?: null | any
    tags?: Array<any>
  }
  access_control?: {
    read?: {
      group_ids: Array<any>
      user_ids: Array<any>
    }
    write?: {
      group_ids: Array<any>
      user_ids: Array<any>
    }
  }
  is_active: boolean
  updated_at?: number
  created_at?: number
  openai?: {
    id: string
    name: string
    owned_by: string
    openai: {
      id: string
    }
    urlIdx: number
    tags?: Array<{
      name: string
    }>
  }
  urlIdx?: number
  tags?: Array<{
    name: string
  }>
}
