import { FetchStateProvider } from '@/components/providers/FetchStateProvider'
import { SelectionProvider } from '@/components/providers/SelectionProvider'
import { BoardsShell } from '@/components/layout/BoardsShell'

export default function BoardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <FetchStateProvider>
      <SelectionProvider>
        <BoardsShell>{children}</BoardsShell>
      </SelectionProvider>
    </FetchStateProvider>
  )
}
