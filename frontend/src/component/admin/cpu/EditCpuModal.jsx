import React from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import CpuFormFields from "./CpuFormFields";

const EditCpuModal = ({
  show,
  onHide,
  cpu,
  onChange,
  onImageChange,
  onSubmit,
  loading,
}) => {
  if (!cpu) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Modifica CPU</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <CpuFormFields
            data={cpu}
            handleChange={onChange}
            imagePreview={cpu.imagePreview || cpu.imageUrl}
            handleImageChange={onImageChange}
            editing={true}
          />

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Annulla
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Salvataggio...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>
                  Salva Modifiche
                </>
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditCpuModal;
