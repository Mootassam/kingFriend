import React from 'react';
import styled from 'styled-components';
import ThemeToggle from 'src/view/layout/ThemeToggle';

const StyledWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  height: 100vh;
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  position: relative;
  background-color: var(--sidebar-bg);
  background-size: cover;
  background-position: center;

  &:before {
    content: '';
    width: 100%;
    height: 100%;
    display: flex;
    background: linear-gradient(
        135deg,
        rgba(15, 17, 32, 0.55) 0%,
        rgba(49, 46, 129, 0.45) 100%
      );
    position: absolute;
    z-index: 1;
    top: 0;
  }

  .auth-theme-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 2;
  }
`;

function Wrapper(props) {
  const { children, ...rest } = props;

  return (
    <StyledWrapper {...rest}>
      <ThemeToggle className="auth-theme-toggle" />
      {children}
    </StyledWrapper>
  );
}

export default Wrapper;
