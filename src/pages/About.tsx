import styled from 'styled-components'
import { PageLayout } from '../components/PageLayout'

export const About = () => {
  return (
    <PageLayout>
      <div>
        <h2>Обо мне</h2>
        <Paragraph>
          <h2>Языки программирования</h2>
          <p>JavaScript(TypeScript), PHP, Java, C#, Python</p>
        </Paragraph>
        <Paragraph>
          <h2 style={{ marginBottom: "0" }}>Технологии</h2>
          <ParagraphWrapper>
            <Paragraph>
              <h3>Использую</h3>
              <Paragraph>
                <h3>Frontend</h3>
                <ul>
                  <li>HTML/CSS/JavaScript</li>
                  <li>React</li>
                  <li>Redux</li>
                  <li>Redux-Saga</li>
                  <li>Svelte</li>
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
                <h3>Another</h3>
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
              <h3>Знаком</h3>
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
                <h3>Another</h3>
                <ul>
                  <li>urql</li>
                </ul>
              </Paragraph>
            </Paragraph>
          </ParagraphWrapper>
        </Paragraph>
        <Paragraph>
          <h2>Опыт работы</h2>
          <Paragraph>
            <h3>Freelance</h3>
            <p>2019 - 2021</p>
          </Paragraph>
        </Paragraph>
      </div>
    </PageLayout>
  )
}

const Paragraph = styled.div`
  padding-left: 20px;
`
const ParagraphWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`