import React from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function AddPlayer() {
  const submitForm = (event) => {
    event.preventDefault();
    console.log(`Submitted Form`);
  };

  return (
    <Form onSubmit={submitForm}>
      <Form.Group as={Col} controlId="formGridFirstName">
        <FloatingLabel
          controlId="floatingInput"
          label="First Name"
          className="mb-3"
        >
          <Form.Control placeholder="First Name" />
        </FloatingLabel>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridLastName">
        <FloatingLabel
          controlId="floatingInput"
          label="Last Name"
          className="mb-3"
        >
          <Form.Control placeholder="Last Name" />
        </FloatingLabel>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridDateOfBirth">
        <FloatingLabel
          controlId="floatingInput"
          label="Date of Birth"
          className="mb-3"
        >
          <Form.Control placeholder="Date of Birth" />
        </FloatingLabel>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridHeight">
        <FloatingLabel
          controlId="floatingInput"
          label="Height (Inches)"
          className="mb-3"
        >
          <Form.Control placeholder="Height (Inches)" />
        </FloatingLabel>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridWeight">
        <FloatingLabel
          controlId="floatingInput"
          label="Weight (lbs)"
          className="mb-3"
        >
          <Form.Control placeholder="Weight (lbs)" />
        </FloatingLabel>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridHand">
        <FloatingLabel controlId="floatingInput" label="Hand" className="mb-3">
          <Form.Control placeholder="Hand" />
        </FloatingLabel>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridGender">
        <Form.Select aria-label="gender-selection">
          <option>Select Gender</option>
          <option value="1">Male</option>
          <option value="2">Female</option>
        </Form.Select>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridShareContact">
        <Form.Select aria-label="gender-selection">
          <Form.Label>Share Contact</Form.Label>
          <option>Share Contact?</option>
          <option value="1">Yes</option>
          <option value="2">No</option>
        </Form.Select>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridEmail">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" placeholder="name@yahoo.com" />
      </Form.Group>

      <Form.Group as={Col} controlId="formGridPhoneNumber">
        <FloatingLabel
          controlId="floatingInput"
          label="Phone Number"
          className="mb-3"
        >
          <Form.Control placeholder="Phone Number" />
        </FloatingLabel>
      </Form.Group>

      <Form.Group as={Col} controlId="formGridContactNames">
        <FloatingLabel
          controlId="floatingInput"
          label="Contact Names"
          className="mb-3"
        >
          <Form.Control placeholder="Contact Names" />
        </FloatingLabel>
      </Form.Group>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker />
      </LocalizationProvider>

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
}
export default AddPlayer;
