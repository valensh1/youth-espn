import { useState } from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Navbar from '../../components/Navbar';
import AddContact from '../../components/AddContact';

function AddPlayer() {
  const [formData, setFormData] = useState({});
  const [addAnotherContact, setAddAnotherContact] = useState(false);

  const showContact = (boolean) => {
    setAddAnotherContact(boolean);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormData({ ...formData, firstName: event.target.value });
    console.log(formData);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    console.log(`Submitted Form`);

    // const data = formData;
    const data = {
      firstName: 'Automation',
      lastName: 'Guru',
      hand: 'Right',
      dateOfBirth: '09/06/2010',
    };

    try {
      const response = await fetch('/api/player/new-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(responseData); // Handle the response data
    } catch (error) {
      console.error('Error:', error); // Handle errors
    }
  };

  return (
    <div id="form-container">
      <Navbar />
      <div id="new-player-form">
        <div id="form-heading">
          <h1>ADD NEW PLAYER</h1>
        </div>
        <img src="https://i.imgur.com/CAsVwce.png" alt="" />
        <Form onSubmit={submitForm} id="add-player">
          <div id="player-information">
            <div className="row flex">
              <Form.Group
                controlId="formGridFirstName"
                className="form-input-box"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="* First Name"
                  className="mb-3"
                >
                  <Form.Control
                    placeholder="First Name"
                    className="form-inputs"
                    onChange={handleSubmit}
                  />
                </FloatingLabel>
              </Form.Group>

              <Form.Group
                controlId="formGridLastName"
                className="form-input-box"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="* Last Name"
                  className="mb-3"
                >
                  <Form.Control
                    placeholder="Last Name"
                    className="form-inputs"
                  />
                </FloatingLabel>
              </Form.Group>
            </div>

            <div id="date-row">
              <div id="form-date-container">
                <Form.Group
                  controlId="formGridDateOfBirth"
                  className="form-input-box"
                  id="form-date-container"
                >
                  <Form.Label id="date-label">* Date of Birth</Form.Label>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    id="date-input"
                  >
                    <DatePicker />
                  </LocalizationProvider>
                </Form.Group>
              </div>

              <div id="height-weight">
                <div>
                  <Form.Group controlId="formGridHeight">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Height (Inches)"
                      className="mb-3"
                    >
                      <Form.Control
                        placeholder="Height (Inches)"
                        className="form-inputs"
                      />
                    </FloatingLabel>
                  </Form.Group>
                </div>

                <div>
                  <Form.Group controlId="formGridWeight">
                    <FloatingLabel
                      controlId="floatingInput"
                      label="Weight (lbs)"
                      className="mb-3"
                    >
                      <Form.Control
                        placeholder="Weight (lbs)"
                        className="form-inputs"
                      />
                    </FloatingLabel>
                  </Form.Group>
                </div>
              </div>
            </div>

            <div className="radio-buttons ">
              <div id="radio-left">
                <Form.Label className="radio-button-heading">
                  * Gender
                </Form.Label>
                <Form.Check
                  type="radio"
                  label="Male"
                  name="formRadios"
                  id="formRadios1"
                />
                <Form.Check
                  type="radio"
                  label="Female"
                  name="formRadios"
                  id="formRadios2"
                />
              </div>

              <div id="radio-right">
                <Form.Label className="radio-button-heading">* Hand</Form.Label>
                <Form.Check
                  type="radio"
                  label="Right"
                  name="formRadios2"
                  id="formRadios3"
                />
                <Form.Check
                  type="radio"
                  label="Left"
                  name="formRadios2"
                  id="formRadios4"
                />
              </div>
            </div>

            <div className="row flex">
              <Form.Group
                controlId="formGridAddress"
                className="form-input-box long-input"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="* Address"
                  className="mb-3"
                >
                  <Form.Control placeholder="Address" className="form-inputs" />
                </FloatingLabel>
              </Form.Group>
            </div>

            <div className="row flex">
              <div id="city-state-zip">
                <div>
                  <Form.Group
                    controlId="formGridCity"
                    id="city-input-box"
                    className="three-row-input"
                  >
                    <FloatingLabel
                      controlId="floatingInput"
                      label="* City"
                      className="mb-3"
                    >
                      <Form.Control
                        placeholder="City"
                        id="city-input"
                        className="form-inputs"
                        onChange={handleSubmit}
                      />
                    </FloatingLabel>
                  </Form.Group>
                </div>

                <div>
                  <Form.Group
                    controlId="formGridState"
                    id="state-input-box"
                    className="three-row-input"
                  >
                    <FloatingLabel
                      controlId="floatingInput"
                      label="* State"
                      className="mb-3"
                    >
                      <Form.Control
                        placeholder="State"
                        id="state-input"
                        className="form-inputs"
                        onChange={handleSubmit}
                      />
                    </FloatingLabel>
                  </Form.Group>
                </div>

                <div>
                  <Form.Group
                    controlId="formGridZip"
                    id="zip-input-box"
                    className="three-row-input"
                  >
                    <FloatingLabel
                      controlId="floatingInput"
                      label="* Zip Code"
                      className="mb-3"
                    >
                      <Form.Control
                        placeholder="Zip Code"
                        id="zip-code-input"
                        className="form-inputs"
                        onChange={handleSubmit}
                      />
                    </FloatingLabel>
                  </Form.Group>
                </div>
              </div>
            </div>
          </div>

          <AddContact contactNum={1} />
          {addAnotherContact ? (
            <AddContact
              contactNum={2}
              deleteIcon={true}
              showContact={showContact}
            />
          ) : (
            ''
          )}
          {addAnotherContact ? (
            ''
          ) : (
            <button id="add-contact-button" onClick={(el) => showContact(true)}>
              Add Another Contact
            </button>
          )}
        </Form>

        <div id="submit-button-container">
          <Button variant="primary" type="submit" id="submit-button">
            Submit
          </Button>
        </div>
      </div>
      <div className="empty-row"></div>
    </div>
  );
}
export default AddPlayer;
