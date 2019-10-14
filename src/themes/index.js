import React from 'react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components'

export { GlobalStyle } from './GlobalStyle'

const black = '#000000'
const white = '#FFFFFF'

const theme = {
  black,
  white,
  textColor: white,
  backgroundColor: '#2A283E',
  loblollyGray: '#B8B8B8',
  CharcoalGray: '#454545',
  codGray: '#0B0D0A',
  neonGreen: '#00FE8C',
  eucalyptusGreen: '#218C5C',
  vahallaBlue: '#2A283E',
  mirageBlue: '#1C1A29',
}

export default function ThemeProvider({ children }) {
  return (
    <StyledComponentsThemeProvider theme={theme}>
      {children}
    </StyledComponentsThemeProvider>
  )
}
