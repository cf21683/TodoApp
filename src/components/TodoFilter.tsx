import type { Filter } from '../shared/types.ts'

type TodoFilterProps = {
  filter: Filter
  onChange: (filter: Filter) => void
}

const OPTIONS: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'active', label: '进行中' },
  { id: 'completed', label: '已完成' },
]

export function TodoFilter({ filter, onChange }: TodoFilterProps) {
  return (
    <div className="filters" role="tablist" aria-label="筛选待办">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={filter === option.id}
          className={filter === option.id ? 'active' : ''}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
