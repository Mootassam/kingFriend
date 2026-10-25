import styled from 'styled-components';

const I18nFlagsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 24px;

  img {
    margin-right: 8px;
    cursor: pointer;
    border-radius: 4px;
    opacity: 0.85;
    transition: opacity 0.15s var(--ease), transform 0.15s var(--ease);
  }

  img:hover {
    opacity: 1;
    transform: translateY(-1px);
  }
`;

export default I18nFlagsWrapper;
