import styled from 'styled-components';

const Content = styled.div`
  width: 480px;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  z-index: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 56px 48px;
  background-color: var(--surface);
  color: var(--text);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-lg);

  > * {
    flex-shrink: 0;
  }

  /* Center vertically, but stay scrollable when the form is taller. */
  > :first-child {
    margin-top: auto;
  }

  > :last-child {
    margin-bottom: auto;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--text);
  }

  h4 {
    font-size: 1.25em;
  }

  a,
  a:hover {
    color: var(--accent-text);
  }

  .btn-link,
  .btn-link:hover {
    color: var(--accent-text);
  }

  .form-control {
    height: 42px;
  }

  .btn-block {
    height: 42px;
    font-weight: 600;
  }

  .form-check-label {
    color: var(--text-2);
  }

  .invalid-feedback {
    display: block;
  }

  @media only screen and (max-width: 767px) {
    width: 100%;
    padding: 56px 24px;
    border-left: 0;
  }
`;

export default Content;
