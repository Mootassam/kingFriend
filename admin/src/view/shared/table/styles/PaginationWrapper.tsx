import styled from 'styled-components';

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;

  .rc-pagination {
    font-size: 12px;
    font-family: var(--font-sans);
    font-variant-numeric: tabular-nums;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    padding: 0;

    margin-bottom: 0;
  }
  .rc-pagination > li {
    list-style: none;
  }
  .rc-pagination-total-text {
    color: var(--text-muted);
    float: left;
    height: 30px;
    line-height: 30px;
    list-style: none;
    padding: 0;
    margin: 0 8px 0 0;
  }
  .rc-pagination:after {
    content: ' ';
    display: block;
    height: 0;
    clear: both;
    overflow: hidden;
    visibility: hidden;
  }
  .rc-pagination-item {
    cursor: pointer;
    border-radius: var(--radius);
    min-width: 31px;
    height: 31px;
    line-height: 31px;
    text-align: center;
    list-style: none;
    float: left;
    border: 1px solid var(--border);
    background-color: var(--surface);
    margin-right: 6px;
    transition: border-color 0.15s var(--ease), background-color 0.15s var(--ease);
  }
  .rc-pagination-item a {
    text-decoration: none;
    color: var(--text-2);
    font-weight: 500;
  }
  .rc-pagination-item:hover {
    border-color: var(--accent);
  }
  .rc-pagination-item:hover a {
    color: var(--accent-text);
  }
  .rc-pagination-item-disabled {
    cursor: not-allowed;
  }
  .rc-pagination-item-disabled:hover {
    border-color: var(--border);
  }
  .rc-pagination-item-disabled:hover a {
    color: var(--text-muted);
  }
  .rc-pagination-item-active {
    background-color: var(--accent);
    border-color: var(--accent);
  }
  .rc-pagination-item-active a {
    color: #fff !important;
    font-weight: 600;
  }
  .rc-pagination-item-active:hover a {
    color: #fff !important;
  }
  .rc-pagination-jump-prev:after,
  .rc-pagination-jump-next:after {
    content: '•••';
    display: block;
    letter-spacing: 2px;
    color: var(--text-muted);
    font-size: 12px;
    margin-top: 1px;
  }
  .rc-pagination-jump-prev:hover:after,
  .rc-pagination-jump-next:hover:after {
    color: var(--accent);
  }
  .rc-pagination-jump-prev:hover:after {
    content: '«';
  }
  .rc-pagination-jump-next:hover:after {
    content: '»';
  }
  .rc-pagination-jump-prev-adherent-icon,
  .rc-pagination-jump-next-adherent-icon {
    position: relative;
  }
  .rc-pagination-jump-prev-adherent-icon:after,
  .rc-pagination-jump-next-adherent-icon:after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    transition: all 0.2s;
    content: '•••';
    opacity: 1;
    display: block;
    letter-spacing: 2px;
    color: var(--text-muted);
    font-size: 12px;
    margin-top: 1px;
  }
  .rc-pagination-jump-prev-adherent-icon
    .adherent-icon-jump-prev,
  .rc-pagination-jump-next-adherent-icon
    .adherent-icon-jump-prev,
  .rc-pagination-jump-prev-adherent-icon
    .adherent-icon-jump-next,
  .rc-pagination-jump-next-adherent-icon
    .adherent-icon-jump-next {
    opacity: 0;
    transition: all 0.2s;
  }
  .rc-pagination-jump-prev-adherent-icon:hover:after,
  .rc-pagination-jump-next-adherent-icon:hover:after {
    opacity: 0;
    color: var(--text-muted);
  }
  .rc-pagination-jump-prev-adherent-icon:hover
    .adherent-icon-jump-prev,
  .rc-pagination-jump-next-adherent-icon:hover
    .adherent-icon-jump-prev,
  .rc-pagination-jump-prev-adherent-icon:hover
    .adherent-icon-jump-next,
  .rc-pagination-jump-next-adherent-icon:hover
    .adherent-icon-jump-next {
    opacity: 1;
    color: var(--accent);
  }
  .rc-pagination-prev,
  .rc-pagination-jump-prev,
  .rc-pagination-jump-next {
    margin-right: 8px;
  }
  .rc-pagination-prev,
  .rc-pagination-next,
  .rc-pagination-jump-prev,
  .rc-pagination-jump-next {
    cursor: pointer;
    color: var(--text-2);
    font-size: 10px;
    border-radius: var(--radius);
    list-style: none;
    min-width: 31px;
    height: 31px;
    line-height: 31px;
    float: left;
    text-align: center;
  }
  .rc-pagination-prev a:after {
    content: '‹';
    display: block;
  }
  .rc-pagination-next a:after {
    content: '›';
    display: block;
  }
  .rc-pagination-prev,
  .rc-pagination-next {
    border: 1px solid var(--border);
    font-size: 18px;
  }
  .rc-pagination-prev a,
  .rc-pagination-next a {
    color: var(--text-2);
  }
  .rc-pagination-prev:not(.rc-pagination-disabled):hover,
  .rc-pagination-next:not(.rc-pagination-disabled):hover {
    border-color: var(--accent);
  }
  .rc-pagination-prev a:after,
  .rc-pagination-next a:after {
    margin-top: -1px;
  }
  .rc-pagination-disabled {
    cursor: not-allowed;
  }
  .rc-pagination-disabled a {
    color: var(--text-muted);
  }
  .rc-pagination-disabled .rc-pagination-item,
  .rc-pagination-disabled .rc-pagination-prev,
  .rc-pagination-disabled .rc-pagination-next {
    cursor: not-allowed;
  }
  .rc-pagination-disabled .rc-pagination-item:hover,
  .rc-pagination-disabled .rc-pagination-prev:hover,
  .rc-pagination-disabled .rc-pagination-next:hover {
    border-color: var(--border);
  }
  .rc-pagination-disabled .rc-pagination-item:hover a,
  .rc-pagination-disabled .rc-pagination-prev:hover a,
  .rc-pagination-disabled .rc-pagination-next:hover a {
    color: var(--text-muted);
  }
  .rc-pagination-disabled .rc-pagination-jump-prev,
  .rc-pagination-disabled .rc-pagination-jump-next {
    pointer-events: none;
  }
  .rc-pagination-options {
    float: left;
    margin-left: 15px;
  }
  .rc-pagination-options-size-changer {
    float: left;
    width: 80px;
  }
  .rc-pagination-options-quick-jumper {
    float: left;
    margin-left: 16px;
    height: 31px;
    line-height: 31px;
  }
  .rc-pagination-options-quick-jumper input {
    margin: 0 8px;
    box-sizing: border-box;
    background-color: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    outline: none;
    padding: 3px 12px;
    width: 50px;
    height: 31px;
  }
  .rc-pagination-options-quick-jumper input:hover {
    border-color: var(--accent);
  }
  .rc-pagination-options-quick-jumper button {
    display: inline-block;
    margin: 0 8px;
    font-weight: 500;
    text-align: center;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    background-image: none;
    border: 1px solid transparent;
    white-space: nowrap;
    padding: 0 15px;
    font-size: 12px;
    border-radius: var(--radius);
    height: 31px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    transition: all 0.3s
      cubic-bezier(0.645, 0.045, 0.355, 1);
    position: relative;
    color: var(--text);
    background-color: var(--surface);
    border-color: var(--border);
  }
  .rc-pagination-options-quick-jumper button:hover,
  .rc-pagination-options-quick-jumper button:active,
  .rc-pagination-options-quick-jumper button:focus {
    color: var(--accent);
    background-color: var(--surface);
    border-color: var(--accent);
  }
  .rc-pagination-simple .rc-pagination-prev,
  .rc-pagination-simple .rc-pagination-next {
    border: none;
    height: 24px;
    line-height: 24px;
    margin: 0;
    font-size: 18px;
  }
  .rc-pagination-simple .rc-pagination-simple-pager {
    float: left;
    margin-right: 8px;
    list-style: none;
  }
  .rc-pagination-simple
    .rc-pagination-simple-pager
    .rc-pagination-slash {
    margin: 0 10px;
  }
  .rc-pagination-simple .rc-pagination-simple-pager input {
    margin: 0 8px;
    box-sizing: border-box;
    background-color: var(--surface);
    border-radius: var(--radius);
    border: 1px solid var(--border);
    outline: none;
    padding: 5px 8px;
    min-height: 20px;
  }
  .rc-pagination-simple
    .rc-pagination-simple-pager
    input:hover {
    border-color: var(--accent);
  }
  .rc-pagination-simple .rc-pagination-simple-pager button {
    display: inline-block;
    margin: 0 8px;
    font-weight: 500;
    text-align: center;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    background-image: none;
    border: 1px solid transparent;
    white-space: nowrap;
    padding: 0 8px;
    font-size: 12px;
    border-radius: var(--radius);
    height: 26px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    transition: all 0.3s
      cubic-bezier(0.645, 0.045, 0.355, 1);
    position: relative;
    color: var(--text);
    background-color: var(--surface);
    border-color: var(--border);
  }
  .rc-pagination-simple
    .rc-pagination-simple-pager
    button:hover,
  .rc-pagination-simple
    .rc-pagination-simple-pager
    button:active,
  .rc-pagination-simple
    .rc-pagination-simple-pager
    button:focus {
    color: var(--accent);
    background-color: var(--surface);
    border-color: var(--accent);
  }
  @media only screen and (max-width: 1024px) {
    .rc-pagination-item-after-jump-prev,
    .rc-pagination-item-before-jump-next {
      display: none;
    }
  }
`;

export default PaginationWrapper;
