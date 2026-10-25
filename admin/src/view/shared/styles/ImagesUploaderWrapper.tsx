import styled from 'styled-components';

const ImagesUploaderWrapper = styled.div`
  .img-card:hover .img-buttons {
    display: block;
  }

  .img-buttons {
    display: none;
    position: relative;
    bottom: 2.1rem;
    width: calc(100px);
    text-align: center;
    background-color: rgba(10, 12, 20, 0.6);
    border-radius: 0 0 var(--radius) var(--radius);
    backdrop-filter: blur(4px);
  }

  .img-buttons * {
    color: #fff;
  }
`;

export default ImagesUploaderWrapper;
