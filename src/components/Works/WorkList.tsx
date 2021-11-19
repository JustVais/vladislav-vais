import { FC } from 'react'
import styled from 'styled-components'
import { IWorkItemProps, WorkItem } from './WorkItem'

interface IWork {
  readonly title: string
  readonly capture: string
}

export interface IWorkListProps {
  readonly works: IWork[]
}

export const WorkList: FC<IWorkListProps> = ({ works }) => {
  return (
    <Container>
      {
        works.map((item: IWorkItemProps, index: number) =>
          <WorkItem
            title={item.title}
            capture={item.capture}
            key={index}
          />
        )
      }
    </Container>
  )
}

const Container = styled.div`
  display: grid;
  grid-row-gap: 80px;
`