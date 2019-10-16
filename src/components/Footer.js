import React from 'react'
import styled from 'styled-components'
import { Title, SubText } from '../themes/typography'

const FooterBackground = styled.footer`
  width: 100%;
  padding: 1.5rem 0;
  background-color: ${({ theme }) => theme.mirageBlue};
`

const FooterContainer = styled.div`
  max-width: 64rem;
  width: 90%;
  margin: 0 auto;

  > *:not(:first-child) {
    display: block;
    margin-top: 0.5rem;
  }
`

export default function Footer() {
  return (
    <FooterBackground>
      <FooterContainer>
        <Title>Disclaimer</Title>
        <SubText>
          Structured Fund is not a licensed bank, broker-dealer, investment
          advisor or an exchange.
        </SubText>
        <SubText>This Project is in beta. Use at your own risk.</SubText>
        <SubText>
          Structured Fund use Kyber Network to power its own service.
        </SubText>
      </FooterContainer>
    </FooterBackground>
  )
}
