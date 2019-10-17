import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import Footer from '../../components/Footer'
import { Bold, Strong, Underline } from '../../themes/typography'
import champagneTower from '../../assets/champagne_tower.png'

const AppWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`

const HeaderWrapper = styled.div`
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

  @media screen and (min-width: 600px) {
    font-size: 1.5rem;
  }
`

const BodyWrapper = styled.div`
  flex: 1 1;
  width: 90%;
  max-width: 64rem;
  margin: 0 auto;
`

const Hero = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;

  @media screen and (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;
  }
`

const HeroContent = styled.div`
  flex-basis: 34rem;
  max-width: 34rem;
  margin-top: 4rem;
  margin-bottom: 2rem;

  > *:not(:first-child) {
    margin-top: 2.25rem;
  }

  @media screen and (min-width: 600px) {
    margin-top: 8rem;
    margin-bottom: 4rem;
  }
`

const HeroImage = styled.div`
  flex: 1;
  position: relative;
  z-index: -10;
  opacity: 0.2;

  > img {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 400px;
  }

  @media screen and (min-width: 800px) {
    opacity: 1;
  }
`

const HeroHeadline = styled.div`
  font-size: 2rem;
  font-weight: 400;

  @media screen and (min-width: 600px) {
    font-size: 2.25rem;
  }
`

const HeroTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 400;

  @media screen and (min-width: 600px) {
    font-size: 1.75rem;
  }
`

const HeroText = styled.div`
  font-size: 1.25rem;
  font-weight: 400;

  @media screen and (min-width: 600px) {
    font-size: 1.5rem;
  }
`

const HeroButton = styled.button`
  width: 8rem;
  height: 2.5rem;
  border: none;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.eucalyptusGreen};
  color: ${({ theme }) => theme.textColor};
  font-size: 1rem;
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  @media screen and (min-width: 600px) {
    width: 10rem;
    height: 3rem;
    font-size: 1.25rem;
  }
`

export default function Home() {
  const history = useHistory()

  const callToAction = () => {
    history.push('/fund')
  }

  return (
    <AppWrapper>
      <HeaderWrapper>
        <LogoLink to='/'>Structured Fund</LogoLink>
      </HeaderWrapper>
      <BodyWrapper>
        <Hero>
          <HeroContent>
            <HeroTitle>
              This Fund provides investors who desire to make more money with
              two choices:
            </HeroTitle>
            <HeroHeadline>
              <Strong>Preferred Share</Strong> or <Strong>Excess Return</Strong>
            </HeroHeadline>
            <HeroText>
              <Bold>Preferred Share</Bold> provides up to{' '}
              <Underline>20%</Underline> APR and a prior claim on distrubutions.
            </HeroText>
            <HeroText>
              <Bold>Excess Return</Bold> let you lever on the whole fund with a
              chance of winnning unlimited proftis.
            </HeroText>
            <HeroButton onClick={callToAction}>Get Started</HeroButton>
          </HeroContent>
          <HeroImage>
            <img src={champagneTower} alt='champagne_tower' />
          </HeroImage>
        </Hero>
      </BodyWrapper>
      <Footer />
    </AppWrapper>
  )
}
