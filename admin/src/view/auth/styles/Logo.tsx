import styled from 'styled-components';

const Logo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 40px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  color: var(--text);

  img {
    max-width: 100%;
    height: auto;
  }

  h1 {
    margin-bottom: 0;
    font-weight: 700;
    letter-spacing: -0.03em;
  }
`;

export default Logo;
