import styled from 'styled-components'

import { PageLayout } from '../components/PageLayout'
import { WorkList } from '../components/Works'

export const Work = () => {
  return (
    <PageLayout>
      <WorkList />
      <AndMore>И МНОГОЕ МНОГОЕ ДРУГОЕ</AndMore>
    </PageLayout >
  )
}

const AndMore = styled.span`
  margin-top: 80px;
  font-size: 32px;
  text-align: center;
  font-family: "Eurostile", sans-serif;
`