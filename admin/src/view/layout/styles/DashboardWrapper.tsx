import styled from 'styled-components';
const DashboardWrapper = styled.div`
  display: flex !important;
  padding: 43px 30px;
  width: 100%;
  align-items: start;
  justify-content: center;
  gap: 4rem;
  .icon,
  .text {
    flex-basis: 50%;
  }
  i {
    font-size: 74px;
    width: 100%;
    color: var(--accent-text);
  }
  .icon {
    width: 60px;
    height: 60px;
    flex-basis: 60px;
    text-align: right;
  }
  .text {
    display: flex !important;
    flex-direction: column;
  }
  h3 {
    font-size: 45px;
    margin-bottom: 0;
    font-weight: 700;
    letter-spacing: -0.03em;
    transition: 0.5s;
    color: var(--text);
    font-family: var(--font-sans);
    line-height: 1;
  }
  p {
    transition: 0.5s;
    font-size: 17px;
    font-weight: 500;
    color: var(--text-muted);
    font-family: var(--font-sans);
    line-height: 1.2;
  }
`;

export default DashboardWrapper;
