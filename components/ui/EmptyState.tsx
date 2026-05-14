import { Button } from '@/components/ui/button'

type Props = {
  emoji: string
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ emoji, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-2xl">{emoji}</p>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-1">
          {action.label}
        </Button>
      )}
    </div>
  )
}
