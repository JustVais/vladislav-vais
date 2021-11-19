import styled from 'styled-components'
import { useNavigate } from "react-router-dom"

export const Header = () => {
  let navigate = useNavigate()

  const onClickNavItemHandler = (href: string) => () => {
    navigate(href)
  }

  return (
    <Container>
      <Navigation>
        <NavItem onClick={onClickNavItemHandler('/about')}>About</NavItem>
        <NavItem onClick={onClickNavItemHandler('/work')}>Work</NavItem>
        <NavItem onClick={onClickNavItemHandler('/contact')}>Contact</NavItem>
      </Navigation>
    </Container>
  )
}

const Container = styled.nav`
  display: grid;
  height: 80px;
  display: grid;
  justify-content: center;
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
  font-family: "OpenSans-Medium", sans-serif;

  &:hover {
    text-decoration: underline;
  }
`