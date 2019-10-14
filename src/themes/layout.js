import styled from 'styled-components'

export const Container = styled.div`
  width: 100%;
  max-width: 42.5rem;
  padding: 0 0.75rem;

  @media screen and (min-width: 600px) {
    padding: 0;
  }
`

export const Row = styled.div`
  margin-top: 1.5rem;
  display: flex;

  > *:not(:first-child) {
    margin-left: 1.25rem;
  }

  @media screen and (min-width: 600px) {
    margin-top: 3rem;

    > *:not(:first-child) {
      margin-left: 2.5rem;
    }
  }
`

export const SubRow = styled(Row)`
  margin-top: 0.75rem;

  @media screen and (min-width: 600px) {
    margin-top: 1.5rem;
  }
`

export const Spacer = styled.div`
  flex: 1;
`
