import styled from 'styled-components'
import { Header } from '../components/Header'

export const Home = () => {
  return (
    <>
      <Container>
        <Header />
        <Wrapper>
          <Inner>
            <Name>Vladislav Vais</Name>
            <Caption>Full Stack Web Developer</Caption>
          </Inner>
        </Wrapper>
      </Container>
    </>
  )
}

const Container = styled.div`
  height: 100vh;
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

const Wrapper = styled.div`
  display: grid;
  justify-content: center;
  align-content: center;
  height: calc(100vh - 80px);
`