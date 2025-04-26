import React, { useState } from "react";
import { Row, Col, Form, Button, Spinner } from "react-bootstrap";
import CpuFormFields from "./CpuFormFields";

const AddCpuForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    series: "",
    model: "",
    socket: "",
    cores: "",
    threads: "",
    baseFrequency: "",
    boostFrequency: "",
    tdp: "",
    architecture: "",
    cache: "",
    integratedGraphics: false,
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
      <CpuFormFields
        data={formData}
        handleChange={handleChange}
        imagePreview={imagePreview}
        handleImageChange={handleImageChange}
      />

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
              Aggiungi CPU
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AddCpuForm;
