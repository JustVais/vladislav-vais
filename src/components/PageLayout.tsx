import { FC } from 'react'
import styled from 'styled-components'
import { Header } from '../components/Header'

export const PageLayout: FC = ({ children }) => {
  return (
    <Container>
      <div className="ripple-bg"></div>
      <Header />
      <Wrapper>
        {children}
      </Wrapper>
    </Container>
  )
}

const Container = styled.div`
  height: 100vh;
`

const Wrapper = styled.div`
  display: grid;
  width: 1140px;
  margin: 0 auto;
  padding: 80px 0;
  min-height: calc(100vh - 80px - 160px);
`