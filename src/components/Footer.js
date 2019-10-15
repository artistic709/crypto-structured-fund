import styled from 'styled-components'

const Footer = styled.footer`
  width: 100%;
  margin-top: 4.5rem;
  padding: 1.5rem 0;
  background-color: ${({ theme }) => theme.mirageBlue};

  > .footer-content {
    width: 64rem;
    margin: 0 auto;

    > *:not(:first-child) {
      display: block;
      margin-top: 0.75rem;
    }
  }
`

export default Footer
