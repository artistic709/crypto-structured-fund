import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Web3Status from './Web3Status'

const HeaderWrapper = styled.header`
  width: 100%;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media screen and (min-width: 600px) {
    padding: 1.5rem 3rem;
  }
`

const LogoLink = styled(Link)`
  font-size: 1.25rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-decoration: none;
  color: ${({ theme }) => theme.neonGreen};
  cursor: pointer;

  @media screen and (min-width: 600px) {
    font-size: 1.5rem;
  }
`

export default function Header() {
  return (
    <HeaderWrapper>
      <LogoLink to='/'>Structured Fund</LogoLink>
      <Web3Status />
    </HeaderWrapper>
  )
}
