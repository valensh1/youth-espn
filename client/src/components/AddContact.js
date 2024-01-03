import React from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { TiDelete } from 'react-icons/ti';

function AddContact({ contactNum, deleteIcon, showContact }) {
  const deleteContact = () => {
    showContact(false);
  };

  return (
    <div className="contact-information">
      <div id="contact-heading-delete-icon">
        <h3>Contact {contactNum}</h3>
        {deleteIcon ? (
          <TiDelete id="react-delete" onClick={deleteContact} />
        ) : (
          ''
        )}
      </div>
      <div className="row flex">
        <Form.Group controlId="formGridFirstName" className="form-input-box">
          <FloatingLabel
            controlId="floatingInput"
            label="* First Name"
            className="mb-3"
          >
            <Form.Control placeholder="First Name" className="form-inputs" />
          </FloatingLabel>
        </Form.Group>

        <Form.Group controlId="formGridLastName" className="form-input-box">
          <FloatingLabel
            controlId="floatingInput"
            label="* Last Name"
            className="mb-3"
          >
            <Form.Control placeholder="Last Name" className="form-inputs" />
          </FloatingLabel>
        </Form.Group>
      </div>

      <div className="row flex">
        <Form.Group controlId="formGridEmail" className="form-input-box">
          <FloatingLabel
            controlId="floatingInput"
            label="* Email"
            className="mb-3"
          >
            <Form.Control
              placeholder="name@example.com"
              className="form-inputs"
            />
          </FloatingLabel>
        </Form.Group>

        <Form.Group controlId="formGridPhone" className="form-input-box">
          <FloatingLabel
            controlId="floatingInput"
            label="* Phone"
            className="mb-3"
          >
            <Form.Control
              placeholder="(XXX) XXX-XXXX"
              className="form-inputs"
            />
          </FloatingLabel>
        </Form.Group>
      </div>

      <div id="relationship-contactShare">
        <div>
          <Form.Select id="relationship-dropdown">
            <option>* Relationship To Player</option>
            <option value="mom">Mother</option>
            <option value="dad">Father</option>
            <option value="grandparent">Grandparent</option>
            <option value="aunt">Aunt</option>
            <option value="uncle">Uncle</option>
            <option value="brother">Brother</option>
            <option value="sister">Sister</option>
            <option value="other">Other</option>
          </Form.Select>
        </div>

        <div id="share-contact">
          <Form.Label className="radio-button-heading">
            * Share Contact
          </Form.Label>
          <Form.Check
            type="radio"
            label="Yes"
            name="formRadios"
            id="formRadios1"
            checked
          />
          <Form.Check
            type="radio"
            label="No"
            name="formRadios"
            id="formRadios1"
          />
        </div>
      </div>
    </div>
  );
}

export default AddContact;
