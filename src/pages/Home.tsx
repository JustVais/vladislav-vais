import styled from 'styled-components'
import { PageLayout } from '../components/PageLayout'

export const Home = () => {
  return (
    <PageLayout>
      <Wrapper>
        <Inner>
          <Name>Vladislav Vais</Name>
          <Caption>Full Stack Web Developer</Caption>
        </Inner>
      </Wrapper>
    </PageLayout>
  )
}

const Wrapper = styled.div`
  height: 100%;
  display: grid;
  align-content: center;
`

const Inner = styled.div`
  display: grid;
  justify-items: center;
  grid-row-gap: 10px;
`

const Name = styled.h1`
  font-size: 64px;
  margin: 0;
  /* font-family: 'Semibold', sans-serif; */
  font-family: "Eurostile", sans-serif;
  line-height: 1.125;
`

const Caption = styled.span`
  font-size:  20px;
  margin: 0;
  font-family: "OpenSans-Light", sans-serif;
  line-height: 1.5;
`