import styled from 'styled-components';

const TableWrapper = styled.div`
  .table td {
    white-space: nowrap;
    border-collapse: collapse;
  }
  .itemType {
    cursor: pointer;
    background-color: var(--accent);
    padding: 0.4rem 0.9rem;
    border-radius: var(--radius);
    transition: background-color 0.15s var(--ease);
  }
  .itemType:hover {
    background-color: var(--accent-hover);
  }
  .itemType span {
    color: #fff;
  }
  .p_items {
    padding: 0.3rem 1rem;
    cursor: pointer;
  }

  .table td,
  .table th {
    vertical-align: middle;
  }

  .table .th-checkbox {
    width: 50px;
    vertical-align: middle;
    text-align: center;
  }

  .table .th-actions,
  .table .td-actions {
    width: 230px;
    vertical-align: middle;
    text-align: right;
  }

  .table .th-actions-sm,
  .table .td-actions-sm {
    width: 100px;
    vertical-align: middle;
    text-align: right;
  }

  .table .td-actions a {
    margin-right: 8px;
  }

  .table .td-actions .btn-link {
    padding: 0.2rem 0.55rem;
    border-radius: var(--radius-sm);
  }
`;

export default TableWrapper;
