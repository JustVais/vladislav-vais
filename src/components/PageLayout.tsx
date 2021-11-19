import { FC } from 'react'
import { Helmet } from 'react-helmet'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import styled from 'styled-components'
import { Header } from '../components/Header'

export const PageLayout: FC = ({ children }) => {
  const { t } = useTranslation()
  const location = useLocation()
  
  return (
    <>
      <Helmet>
        <title>{t(`titles.${location.pathname}`)}</title>
      </Helmet>
      <Container>
        <div className="ripple-bg"></div>
        <Header />
        <Wrapper>
          {children}
        </Wrapper>
      </Container>
    </>
  )
}

const Container = styled.div`
  height: 100vh;
`

const Wrapper = styled.div`
  display: grid;
  max-width: 1140px;
  margin: 0 auto;
  padding: 80px 40px;
  box-sizing: border-box;
  min-height: calc(100vh - 80px - 160px);
`