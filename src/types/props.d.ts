interface GlobalProps {
  models: LLM[]
  patchModels: LLM[]
  selectedModel: LLM | null
  setSelectedModel: (model: LLM | null) => void
  patch: Record<string, (v: LLM) => LLM>
  setPatch: (patch: Record<string, (v: LLM) => LLM>) => void
  patchSet: Set<string>
  patchSetActions: {
    readonly add: (key: string) => void
    readonly remove: (key: string) => void
    readonly reset: () => void
  }
}
