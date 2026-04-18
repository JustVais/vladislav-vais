export interface WorkItemProps {
  index: number
  title: string
  capture: string
}

export function WorkItem({ index, title, capture }: WorkItemProps) {
  return (
    <div className="group flex items-center gap-4 md:gap-8 px-5 md:px-8 py-5 md:py-6
                    border-b border-gray-100 last:border-0
                    hover:bg-gray-50 transition-colors duration-150 cursor-default">
      <span className="text-xs text-gray-300 font-open-sans w-6 shrink-0 select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      <span className="font-eurostile text-xl sm:text-2xl md:text-3xl flex-1 leading-tight">
        {title}
      </span>

      <span className="hidden sm:block font-open-sans text-sm text-gray-400 max-w-xs text-right">
        {capture}
      </span>

      <span className="text-gray-200 group-hover:text-black group-hover:translate-x-1
                       transition-all duration-200 text-lg shrink-0">
        →
      </span>
    </div>
  )
}
