import { FC } from 'react'
import styled from 'styled-components'

export interface IWorkItemProps {
  readonly title: string
  readonly capture: string
}

export const WorkItem: FC<IWorkItemProps> = ({ title, capture }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Capture>{capture}</Capture>
    </Container>
  )
}

const Container = styled.div`
  display: grid;
  grid-row-gap: 20px;
`

const Title = styled.span`
  display: grid;
  font-family: "OpenSans-Bold", sans-serif;
  font-size: 120px;
  line-height: 1;
`

const Capture = styled.span`
  display: grid;
  font-family: "OpenSans-Medium", sans-serif;
  color: red;
`