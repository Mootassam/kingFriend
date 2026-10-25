import styled from 'styled-components';

const LayoutWrapper = styled.div`
  color: var(--text);
  background-color: var(--bg);
  display: flex;
  font-size: 13px;

  button {
    font-size: 13px;
  }

  .btn {
    font-size: 13px;
  }

  h1 {
    font-size: 1.6em;
  }

  .bg-primary-light {
    background-color: var(--accent-soft);
  }

  .primary-light {
    color: var(--accent-soft);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--text);
  }

  .content {
    padding: 0px 15px 24px;
  }

  .form-group {
    margin-bottom: 0;
  }

  .form-control {
    font-size: inherit;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex: auto;
    min-width: 0;
    background: var(--bg);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Sidebar Container */
  .sidebar-container {
    background: var(--sidebar-bg);
    background-image: radial-gradient(
        120% 60% at 0% 0%,
        rgba(99, 102, 241, 0.14) 0%,
        rgba(99, 102, 241, 0) 60%
      );
    height: 100%;
    width: 256px;
    overflow-y: auto;
    overflow-x: hidden;
    z-index: 1000;
    border-right: 1px solid var(--sidebar-border);
    transition: width 0.25s var(--ease);
    padding-bottom: 20px;
    scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
  }

  .sidebar-container::-webkit-scrollbar {
    width: 6px;
  }

  .sidebar-container::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.12);
    border: 0;
    border-radius: 3px;
  }

  .sidebar-container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.24);
  }

  /* Logo */
  .sidebar-logo {
    height: 61px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--sidebar-border);
    margin-bottom: 8px;
  }

  .sidebar-logo a {
    color: var(--sidebar-text-strong);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .logo-image {
    max-width: 164px;
    max-height: 40px;
    width: auto;
    object-fit: contain;
    vertical-align: middle;
  }

  .logo-text {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--sidebar-text-strong);
  }

  /* Menu list */
  .sidebar-menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sidebar-section-header {
    padding: 16px 22px 6px;
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.09em;
    color: var(--sidebar-muted);
    font-weight: 600;
  }

  .sidebar-menu-item {
    position: relative;
    margin: 1px 10px;
    border-radius: var(--radius);
    animation: sidebarFadeIn 0.3s var(--ease) both;
  }

  .sidebar-menu-item:before {
    content: '';
    position: absolute;
    left: -10px;
    top: 8px;
    bottom: 8px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--sidebar-indicator);
    opacity: 0;
    transition: opacity 0.2s var(--ease);
  }

  .sidebar-menu-item a {
    display: flex;
    align-items: center;
    padding: 9px 12px;
    color: var(--sidebar-text);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 500;
    border-radius: var(--radius);
    transition: background-color 0.15s var(--ease), color 0.15s var(--ease);
    position: relative;
  }

  .sidebar-menu-item a:hover {
    background: var(--sidebar-hover);
    color: var(--sidebar-text-strong);
  }

  .sidebar-icon {
    margin-right: 12px;
    padding: 0;
    font-size: 15px;
    width: 20px;
    text-align: center;
    opacity: 0.85;
  }

  .sidebar-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar-unread-badge {
    margin-left: auto;
    background: var(--danger);
    color: #fff;
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 5px;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px var(--sidebar-bg);
  }

  /* Active state */
  .sidebar-menu-item.active {
    background: var(--sidebar-active);
  }

  .sidebar-menu-item.active:before {
    opacity: 1;
  }

  .sidebar-menu-item.active a {
    color: var(--sidebar-text-strong);
  }

  .sidebar-menu-item.active .sidebar-icon {
    color: var(--sidebar-indicator);
    opacity: 1;
  }

  /* Locked items */
  .sidebar-menu-item.locked {
    cursor: not-allowed;
    display: flex;
    align-items: center;
    opacity: 0.45;
    padding: 9px 12px;
    color: var(--sidebar-text);
  }

  .sidebar-item-content {
    display: flex;
    align-items: center;
  }

  .sidebar-menu-item a:focus {
    outline: none;
  }

  .sidebar-menu-item a:focus-visible {
    box-shadow: inset 0 0 0 2px var(--sidebar-indicator);
  }

  @media (max-width: 992px) {
    .sidebar-container {
      width: 232px;
    }
  }

  @keyframes sidebarFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .sidebar-container,
    .sidebar-menu-item,
    .sidebar-menu-item a {
      transition: none;
      animation: none;
    }
  }
`;

export default LayoutWrapper;
