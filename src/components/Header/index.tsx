import styled from 'styled-components'
import { useNavigate, useLocation } from "react-router-dom"

export const Header = () => {
  let navigate = useNavigate()
  let location = useLocation()

  const onClickRedirectHandler = (href: string) => () => {
    navigate(href)
  }
  
  return (
    <Container>
      {
        location.pathname !== '/' && <Brand onClick={onClickRedirectHandler('/')}>vladislav.</Brand>
      }
      <Navigation>
        <NavItem onClick={onClickRedirectHandler('/about')}>About</NavItem>
        <NavItem onClick={onClickRedirectHandler('/work')}>Work</NavItem>
        <NavItem onClick={onClickRedirectHandler('/contact')}>Contact</NavItem>
      </Navigation>
    </Container>
  )
}

const Container = styled.nav`
  display: grid;
  height: 80px;
  display: grid;
  justify-content: center;
  position: relative;
`

const Navigation = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  grid-column-gap: 40px;
`

const NavItem = styled.li`
  cursor: pointer;
  font-family: "OpenSans-Light", sans-serif;

  &:hover {
    text-decoration: underline;
  }
`

const Brand = styled.span`
  position: absolute;
  left: 40px;
  top: 0;
  bottom: 0;
  margin: auto 0;
  cursor: pointer;
  height: max-content;
  font-size: 24px;
  font-family: "Eurostile", sans-serif;

  &::after {
    display: inline-block;
    content: 'vais';
    transform: translateX(-50px);
    opacity: 0;
    transition: .1s;
  }
  
  &:hover::after {
    content: 'vais';
    opacity: 1;
    transform: translateX(0);
  }
`