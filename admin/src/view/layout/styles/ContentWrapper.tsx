import styled from 'styled-components';

const ContentWrapper = styled.div`
  margin-top: 12px;
  padding: 24px;
  background-color: var(--surface);
  color: var(--text);
  width: 100%;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border) !important;
  box-shadow: var(--shadow-xs);

  .card-stats .card-body {
    padding: 15px !important;
  }
  .text-center {
    text-align: center !important;
  }
  .card-stats .icon-big {
    width: 100%;
    height: 100%;
    font-size: 2.2em;
    min-height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
  }
  .card-stats .icon-big i {
    color: #fff !important;
  }
  .card-stats .icon-big.icon-primary {
    background: var(--accent);
  }
  .pb-3,
  .py-3 {
    padding-bottom: 1rem !important;
  }
  .pt-3,
  .py-3 {
    padding-top: 1rem !important;
  }
  .mt-3,
  .my-3 {
    margin-top: 1rem !important;
  }
  .d-inline-block {
    display: inline-block !important;
  }
  .pl-3,
  .px-3 {
    padding-left: 1rem !important;
  }
  .bubble-shadow-small {
    position: relative;
  }
  .card-title {
    margin: 0;
    color: var(--text-2);
    font-size: 18px;
    font-weight: 500;
    line-height: 1.6;
  }
`;

export default ContentWrapper;
