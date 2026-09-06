type DataActionsProps = {
  onExport: () => void
  onImport: () => void
}

export function DataActions({ onExport, onImport }: DataActionsProps) {
  return (
    <div className="data-actions">
      <button type="button" onClick={onExport}>
        导出 JSON
      </button>
      <button type="button" onClick={onImport}>
        导入 JSON
      </button>
    </div>
  )
}
