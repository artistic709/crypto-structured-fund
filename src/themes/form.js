import styled from 'styled-components'

export const PurchaseForm = styled.div`
  height: 3rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ theme }) => theme.white};
  display: flex;
`

export const PurchaseInputField = styled.div`
  flex: 1;
  padding: 0 1rem;
  display: flex;
  align-items: center;

  > input {
    flex: 1
    width: 100%;
    border: none;
    background-color: transparent;
    color: ${({ theme }) => theme.textColor};
    font-size: 1rem;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: ${({ theme }) => theme.loblollyGray};
    }
  }
`

export const PurchaseButton = styled.button`
  height: calc(3rem - 2px);
  padding: 0 1rem;
  border: none;
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  background-color: ${({ theme }) => theme.eucalyptusGreen};
  color: ${({ theme }) => theme.white};
  font-size: 1rem;
  line-height: 3rem;
  outline: none;

  &:focus {
    outline: none;
  }

  &[disabled] {
    background-color: ${({ theme }) => theme.loblollyGray};
  }
`

export const USDInput = styled.input`
  width: 3.5rem;
  margin: 0 0.25rem;
  padding: 0 0.5rem;
  border: none;
  border-bottom: 2px solid ${({ theme }) => theme.eucalyptusGreen};
  background-color: transparent;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.textColor};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.loblollyGray};
  }

  @media screen and (min-width: 600px) {
    width: 4rem;
    font-size: 1.5rem;
  }
`
