import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  width: 100%;
  max-width: 42.5rem;
`

const NavWrapper = styled.div`
  height: 3rem;
  display: flex;
  align-items: center;
`

const activeClassName = 'ACTIVE'

const StyledNavLink = styled(NavLink).attrs({ activeClassName })`
  height: 3rem;
  flex: 1;
  font-size: 1rem;
  font-weight: 400;
  text-align: center;
  text-decoration: none;
  line-height: 3rem;
  color: ${({ theme }) => theme.loblollyGray};
  border-bottom: 2px solid ${({ theme }) => theme.codGray};

  &.${activeClassName} {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    background-color: ${({ theme }) => theme.mirageBlue};
    color: ${({ theme }) => theme.neonGreen};
    border-bottom: 2px solid ${({ theme }) => theme.neonGreen};
  }

  @media screen and (min-width: 600px) {
    font-size: 1.25rem;
  }
`

export default function NavigationTabs() {
  return (
    <Container>
      <NavWrapper>
        <StyledNavLink to='/target-return'>Preferred Return</StyledNavLink>
        <StyledNavLink to='/risk-return'>Excess Return</StyledNavLink>
      </NavWrapper>
    </Container>
  )
}
