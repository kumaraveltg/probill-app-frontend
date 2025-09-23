import React from "react";
import { Modal } from "react-bootstrap";

const ModalOpen = ({ isOpen, onClose, title, children }) => {
   
  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};

export default ModalOpen;
