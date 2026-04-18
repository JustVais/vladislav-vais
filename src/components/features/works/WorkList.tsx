import { WorkItem } from './WorkItem'

interface Work {
  title: string
  capture: string
}

interface WorkListProps {
  works: Work[]
}

export function WorkList({ works }: WorkListProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {works.map((item, index) => (
        <WorkItem key={item.title} index={index} title={item.title} capture={item.capture} />
      ))}
    </div>
  )
}
