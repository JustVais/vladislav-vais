import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { PageLayout } from '../components/PageLayout'

export const About = () => {
  const { t } = useTranslation()
  
  return (
    <PageLayout>
      <div>
        <h2>{t('about.about_me')}</h2>
        <ParagraphWithMargin>
          <h2>{t('about.prog_lang')}</h2>
          <p>JavaScript(TypeScript), PHP, Java, C#, Python</p>
        </ParagraphWithMargin>
        <ParagraphWithMargin>
          <h2 style={{ marginBottom: "0" }}>{t('about.technologies')}</h2>
          <ParagraphWrapper>
            <Paragraph>
              <h3>{t('about.use')}</h3>
              <Paragraph>
                <h3>Frontend</h3>
                <ul>
                  <li>HTML/CSS/JavaScript</li>
                  <li>React</li>
                  <li>Redux</li>
                  <li>Redux-Saga</li>
                  <li>Svelte</li>
                  <li>Webpack</li>
                  <li>Next.JS</li>
                </ul>
                <h3>Backend</h3>
                <ul>
                  <li>NodeJS + Express</li>
                  <li>Nest.JS</li>
                </ul>
                <h3>Storage</h3>
                <ul>
                  <li>MySQL</li>
                  <li>MongoDB</li>
                </ul>
                <h3>{t('about.another')}</h3>
                <ul>
                  <li>Git</li>
                  <li>Docker + docker-compose</li>
                  <li>gRPC</li>
                  <li>Apollo GraphQL</li>
                  <li>WebSocket</li>
                  <li>Ubuntu/Debian</li>
                </ul>
              </Paragraph>
            </Paragraph>
            <Paragraph>
              <h3>{t('about.familiar')}</h3>
              <Paragraph>
                <h3>Frontend</h3>
                <ul>
                  <li>React Native</li>
                  <li>Vue</li>
                  <li>MobX</li>
                  <li>RxJS</li>
                </ul>
                <h3>Backend</h3>
                <ul>
                  <li>Java Spring</li>
                </ul>
                <h3>{t('about.another')}</h3>
                <ul>
                  <li>urql</li>
                </ul>
              </Paragraph>
            </Paragraph>
          </ParagraphWrapper>
        </ParagraphWithMargin>
        <ParagraphWithMargin>
          <h2>{t('about.experience')}</h2>
          <Paragraph>
            <h3>Freelance</h3>
            <p>2019 - 2021</p>
          </Paragraph>
          <Paragraph>
            <h3>Стартап</h3>
            <p>2022.01 - 2022.07</p>
          </Paragraph>
          <Paragraph>
            <h3>Собственный проект</h3>
            <p>2022.08 - ...</p>
          </Paragraph>
        </ParagraphWithMargin>
      </div>
    </PageLayout>
  )
}

const Paragraph = styled.div`
  padding-left: 20px;
`

const ParagraphWithMargin = styled(Paragraph)`
  margin-top: 40px;
`

const ParagraphWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`