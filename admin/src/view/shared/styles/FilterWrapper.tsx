import styled from 'styled-components';

const FilterWrapper = styled.div`
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background-color: var(--surface);
  margin-bottom: 12px;
  transition: border-color 0.15s var(--ease);

  &:hover {
    border-color: var(--border-strong);
  }

  .filter-preview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 12px 15px;
    color: var(--text-2);
    font-weight: 500;
    user-select: none;
  }

  .filter-preview-left {
    display: flex;
    align-items: center;
  }

  .filter-preview-left:before {
    content: '\f0b0';
    font-family: 'Font Awesome 5 Free', 'Font Awesome 6 Free';
    font-weight: 900;
    font-size: 11px;
    margin-right: 8px;
    color: var(--text-muted);
  }

  .filter-preview-right {
    color: var(--text-muted);
    font-size: 12px;
  }

  .filter-preview-values {
    margin-left: 8px;
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .filter-preview-values .badge {
    margin: 2px 4px;
    padding: 0.45em 0.6em;
    font-weight: 500;
  }

  .filter-preview.is-expanded {
    border-bottom: 1px solid var(--border);
  }

  .react-datepicker-wrapper {
    width: 100%;
  }

  .invalid-feedback {
    display: block;
  }

  .filter-buttons {
    padding-top: 8px;
    padding-bottom: 8px;
    text-align: right;

    .btn {
      margin-left: 8px;
      margin-bottom: 8px;
    }
  }
`;

export default FilterWrapper;
