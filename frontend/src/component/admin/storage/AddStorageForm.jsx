import React, { useState } from "react";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import StorageFormFields from "./StorageFormFields";

const AddStorageForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    type: "",
    capacity: "",
    formFactor: "",
    interface: "",
    readSpeed: "",
    writeSpeed: "",
    cache: "",
    price: "",
    stock: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, image);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <StorageFormFields data={formData} handleChange={handleChange} />

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Immagine</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Form.Group>
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Anteprima"
                style={{
                  maxWidth: "100%",
                  maxHeight: "150px",
                  objectFit: "contain",
                }}
              />
            </div>
          )}
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-3">
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
              Caricamento...
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle me-2"></i>
              Aggiungi Dispositivo
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddStorageForm;
