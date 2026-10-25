import styled from 'styled-components';

const SocialButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 24px;

  i {
    margin-left: 16px;
    margin-right: 16px;
    font-size: 36px;
    cursor: pointer;
    color: var(--text-2);
    transition: color 0.15s var(--ease);
  }

  i:hover {
    color: var(--text);
  }
`;

export default SocialButtons;
