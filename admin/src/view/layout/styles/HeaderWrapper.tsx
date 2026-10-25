import styled from 'styled-components';

const HeaderWrapper = styled.div`
  height: 61px;
  padding: 0 1rem;
  background-color: var(--surface);
  border-bottom: 1px solid var(--border);
  z-index: 1000;

  @supports (backdrop-filter: blur(8px)) {
    background-color: color-mix(in srgb, var(--surface) 82%, transparent);
    backdrop-filter: saturate(180%) blur(10px);
  }

  @media (max-width: 576px) {
    .i18n-select {
      display: none;
    }
  }

  .i18n-select select {
    border-radius: var(--radius);
    height: 34px;
    cursor: pointer;
  }

  .dropdown {
    display: inline-block;
  }

  .user-dropdown {
    padding: 4px 10px 4px 4px;
    cursor: pointer;
    display: inline-block;
    border-radius: 999px;
    border: 1px solid transparent;
    transition: background-color 0.15s var(--ease),
      border-color 0.15s var(--ease);

    &:hover {
      background: var(--hover);
      border-color: var(--border);
    }
  }

  .show > .user-dropdown {
    background: var(--hover);
    border-color: var(--border);
  }

  .user-dropdown-content {
    display: flex;
    line-height: 16px;
    align-items: center;
  }

  .user-dropdown-avatar {
    margin-right: 8px;
    display: inline-flex;
  }

  .user-dropdown-text {
    display: flex;
    flex-direction: column;
    color: var(--text);
    font-weight: 500;
    font-size: 13px;
  }

  .user-dropdown-text-tenant {
    font-weight: 500;
    font-size: 11.5px;
    color: var(--text-muted);
  }

  .header-right {
    display: flex;
  }

  @media (max-width: 576px) {
    .user-dropdown-text {
      display: none;
    }
  }

  .dropdown-menu {
    margin-top: 6px;
    min-width: 200px;
  }

  .dropdown-item i {
    padding-right: 10px;
  }

  .menu-toggle-button {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: var(--radius);
    background-color: transparent;
    font-size: 16px;
    color: var(--text-2);
    transition: background-color 0.15s var(--ease), color 0.15s var(--ease);

    i {
      padding: 0;
    }

    &:hover {
      background-color: var(--hover);
      color: var(--text);
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      box-shadow: var(--focus-ring);
    }
  }
`;

export default HeaderWrapper;
