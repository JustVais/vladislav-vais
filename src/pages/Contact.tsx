import { FC } from 'react'
import styled from 'styled-components'
import { PageLayout } from '../components/PageLayout'

interface IContact {
  logo: string
  link: string
}

const contacts: IContact[] = [
  {
    logo: '/images/github.png',
    link: 'https://github.com/JustVais'
  },
  {
    logo: '/images/telegram.png',
    link: 'https://t.me/JustVais'
  },
]

export const Contact: FC = () => {
  return (
    <PageLayout>
      <Container>
        {
          contacts.map((item, index) =>
            <Link href={item.link} target="_blank" key={index}>
              <ContactImg src={item.logo} />
            </Link>
          )
        }
      </Container>
    </PageLayout>
  )
}

const Container = styled.div`
  display: grid;
  align-self: center;
  justify-self: center;
  grid-template-columns: repeat(2, max-content);
  grid-column-gap: 40px;
`

const ContactImg = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 100%;
  cursor: pointer;
  `

const Link = styled.a`
  border-radius: 100%;
`