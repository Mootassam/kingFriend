import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const BreadcrumbNav = styled.nav`
  .breadcrumb {
    font-size: 12.5px;
    margin: 0px;
    padding: 14px 0 0;
    background-color: transparent;
  }

  .breadcrumb-item:not(.active) a {
    color: var(--text-muted);
    text-decoration: none;
  }

  .breadcrumb-item:not(.active) a:hover {
    color: var(--text);
  }

  .breadcrumb-item.active {
    color: var(--text);
    font-weight: 500;
  }
`;

function Breadcrumb(props) {
  const isLink = (item) => {
    return item.length > 1;
  };
  return (
    <BreadcrumbNav>
      <ol className="breadcrumb">
        {props.items.map((item, index) => (
          <li
            key={item[0]}
            className={`breadcrumb-item ${
              props.items.length - 1 === index
                ? 'active'
                : ''
            }`}
          >
            {isLink(item) ? (
              <Link to={item[1]}>{item[0]}</Link>
            ) : (
              item[0]
            )}
          </li>
        ))}
      </ol>
    </BreadcrumbNav>
  );
}

export default Breadcrumb;
