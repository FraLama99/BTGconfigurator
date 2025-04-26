import React, { useState } from "react";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import CaseFormFields from "./CaseFormFields";

const AddCaseForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    formFactor: "",
    height: "",
    width: "",
    depth: "",
    maxGpuLength: "",
    maxCpuCoolerHeight: "",
    includedFans: "",
    panelType: "",
    rgb: false,
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
      <CaseFormFields data={formData} handleChange={handleChange} />

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

      <Form.Group className="mb-3">
        <Form.Label>Formati Supportati *</Form.Label>
        <Form.Control
          type="text"
          name="formFactor"
          value={formData.formFactor || ""}
          onChange={handleChange}
          placeholder="Formati separati da virgola (es. ATX, Micro-ATX, Mini-ITX)"
          required
        />
        <Form.Text className="text-muted">
          Inserisci i formati separati da virgola. Es: "ATX, Micro-ATX,
          Mini-ITX"
        </Form.Text>
      </Form.Group>

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
              Aggiungi Case
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddCaseForm;
