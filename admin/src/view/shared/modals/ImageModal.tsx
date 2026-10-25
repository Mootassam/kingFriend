import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ImageModalWrapper = styled.div`
  /* The Modal (background) */
  .modal {
    display: block;
    position: fixed; /* Stay in place */
    z-index: 9999; /* Sit on top */
    padding-top: 100px; /* Location of the box */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgba(5, 6, 12, 0.88);
    backdrop-filter: blur(6px);
  }

  /* Modal Content (Image). Doubled selector outranks the global .modal-content theme. */
  && .modal-content {
    margin: auto;
    display: block;
    width: 80%;
    max-width: 700px;
    background: transparent;
    border: 0;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
  }

  /* Caption of Modal Image (Image Text) - Same Width as the Image */
  #caption {
    margin: auto;
    display: block;
    width: 80%;
    max-width: 700px;
    text-align: center;
    color: #ccc;
    padding: 10px 0;
    height: 150px;
  }

  /* Add Animation - Zoom in the Modal */
  .modal-content,
  #caption {
    animation-name: zoom;
    animation-duration: 0.6s;
  }

  @keyframes zoom {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  /* The Close Button */
  && .close {
    position: absolute;
    top: 15px;
    right: 35px;
    color: #f1f1f1;
    opacity: 0.85;
    font-size: 40px;
    font-weight: 300;
    transition: 0.3s;
  }

  && .close:hover,
  && .close:focus {
    color: #fff;
    opacity: 1;
    text-decoration: none;
    cursor: pointer;
  }

  /* 100% Image Width on Smaller Screens */
  @media only screen and (max-width: 700px) {
    && .modal-content {
      width: 100%;
    }
  }
`;

function ImageModal(props) {
  return (
    <ImageModalWrapper>
      <div className="modal">
        <span className="close" onClick={props.onClose}>
          &times;
        </span>

        <img
          className="modal-content"
          src={props.src}
          alt={props.alt}
        />
      </div>
    </ImageModalWrapper>
  );
}

ImageModal.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ImageModal;
