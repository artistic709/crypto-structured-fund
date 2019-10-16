import styled from 'styled-components'

export const PurchaseBlock = styled.div`
  width: 100%;
  padding: 1.25rem 2rem;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.mirageBlue};
`

export const PurchaseBlockTop = styled.div`
  display: flex;
  flex-direction: column;

  > *:not(:first-child) {
    margin-top: 0.75rem;
  }

  @media screen and (min-width: 600px) {
    flex-direction: row;
    justify-content: space-between;

    > * {
      margin: 0;
    }
  }
`

export const PurchaseBlockBottom = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
`

export const PurchaseInfo = styled.div`
  > *:not(:first-child) {
    margin-top: 0.75rem;
  }
`

export const PurchaseDate = styled.div`
  display: flex;
  flex-direction: column;

  > *:not(:first-child) {
    margin-top: 0.75rem;
  }

  > .item {
    display: flex;
    align-items: center;
  }
`

export const DataBlock = styled.div`
  flex: 1;
  padding: 1.25rem 0;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.mirageBlue};
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  > *:not(:first-child) {
    margin-top: 0.5rem;
  }

  ${({ strong, theme }) =>
    strong &&
    `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 2rem;
      height: 2rem;
      background: linear-gradient(135deg, transparent 0% 30%, ${theme.eucalyptusGreen} 30% 50%, transparent 50%);
    }
  `}
`

export const DateBlock = styled.div`
  flex: 1;
  padding: 1.25rem;
  border-radius: 0.5rem;
  background-color: ${({ theme }) => theme.mirageBlue};
  display: flex;
  align-items: center;

  > *:not(:first-child) {
    border-left: 1px solid ${({ theme }) => theme.white};
  }

  > .date-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    > *:not(:first-child) {
      margin-top: 0.75rem;
    }
  }
`
