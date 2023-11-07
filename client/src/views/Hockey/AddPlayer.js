import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Navbar from '../../components/Navbar';

function AddPlayer() {
  const [formData, setFormData] = useState({});

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
          <Row className="row">
            <Col className="column">
              <Form.Group
                controlId="formGridFirstName"
                id="first-name-input-box"
                className="form-input-box left-column"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="First Name"
                  className="mb-3"
                >
                  <Form.Control
                    placeholder="First Name"
                    id="first-name-input"
                    className="form-inputs"
                    onChange={handleSubmit}
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>

            <Col className="column">
              <Form.Group
                controlId="formGridLastName"
                className="form-input-box right-column"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="Last Name"
                  className="mb-3"
                >
                  <Form.Control
                    placeholder="Last Name"
                    className="form-inputs"
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
          </Row>

          <div id="form-date-container">
            <Form.Group
              as={Col}
              controlId="formGridDateOfBirth"
              className="form-input-box"
              id="form-date-container"
            >
              <Form.Label id="date-label">Date of Birth</Form.Label>
              <LocalizationProvider dateAdapter={AdapterDayjs} id="date-input">
                <DatePicker />
              </LocalizationProvider>
            </Form.Group>
          </div>

          <Row className="row">
            <Col className="column">
              <Form.Group
                as={Col}
                controlId="formGridHeight"
                className="form-input-box left-column"
              >
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
            </Col>

            <Col className="column">
              <Form.Group
                as={Col}
                controlId="formGridWeight"
                className="form-input-box left-column"
              >
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
            </Col>
          </Row>

          <Form.Group
            as={Col}
            controlId="formGridGender"
            className="form-input-box"
          >
            <Form.Select aria-label="gender-selection">
              <option>Select Hand</option>
              <option value="1">Right</option>
              <option value="2">Left</option>
            </Form.Select>
          </Form.Group>

          <Form.Group
            as={Col}
            controlId="formGridGender"
            className="form-input-box"
          >
            <Form.Select aria-label="gender-selection">
              <option>Select Gender</option>
              <option value="1">Male</option>
              <option value="2">Female</option>
            </Form.Select>
          </Form.Group>

          <Form.Group
            as={Col}
            controlId="formGridShareContact"
            className="form-input-box"
          >
            <Form.Select aria-label="gender-selection">
              <Form.Label>Share Contact</Form.Label>
              <option>Share Contact?</option>
              <option value="1">Yes</option>
              <option value="2">No</option>
            </Form.Select>
          </Form.Group>

          <Row className="row">
            <Form.Group
              as={Col}
              controlId="formGridEmail"
              className="form-input-box left-column"
            >
              <Form.Label>Dad - Email</Form.Label>
              <Form.Control type="email" placeholder="name@yahoo.com" />
            </Form.Group>

            <Form.Group
              as={Col}
              controlId="formGridEmail"
              className="form-input-box right-column"
            >
              <Form.Label>Mother - Email</Form.Label>
              <Form.Control type="email" placeholder="name@yahoo.com" />
            </Form.Group>
          </Row>

          <Row className="row">
            <Col className="column">
              <Form.Group
                as={Col}
                controlId="formGridPhoneNumber"
                className="form-input-box left-column"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="Phone Number"
                  className="mb-3"
                >
                  <Form.Control placeholder="Phone Number" />
                </FloatingLabel>
              </Form.Group>
            </Col>

            <Col className="column">
              <Form.Group
                as={Col}
                controlId="formGridPhoneNumber"
                className="form-input-box right-column"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="Phone Number"
                  className="mb-3"
                >
                  <Form.Control placeholder="Phone Number" />
                </FloatingLabel>
              </Form.Group>
            </Col>
          </Row>

          <Row className="row">
            <Col className="column">
              <Form.Group
                controlId="formGridFirstName"
                id="first-name-input-box"
                className="form-input-box left-column"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="Father - First Name"
                  className="mb-3"
                >
                  <Form.Control
                    placeholder="Father - First Name"
                    id="first-name-input"
                    className="form-inputs"
                    onChange={handleSubmit}
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>

            <Col className="column">
              <Form.Group
                controlId="formGridFirstName"
                id="first-name-input-box"
                className="form-input-box right-column"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="Father - Last Name"
                  className="mb-3"
                >
                  <Form.Control
                    placeholder="Father - Last Name"
                    id="first-name-input"
                    className="form-inputs"
                    onChange={handleSubmit}
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
          </Row>

          <Row className="row">
            <Col className="column">
              <Form.Group
                controlId="formGridFirstName"
                id="first-name-input-box"
                className="form-input-box left-column"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="Mother - First Name"
                  className="mb-3"
                >
                  <Form.Control
                    placeholder="Mother - First Name"
                    id="first-name-input"
                    className="form-inputs"
                    onChange={handleSubmit}
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>

            <Col className="column">
              <Form.Group
                controlId="formGridFirstName"
                id="first-name-input-box"
                className="form-input-box right-column"
              >
                <FloatingLabel
                  controlId="floatingInput"
                  label="Mother - Last Name"
                  className="mb-3"
                >
                  <Form.Control
                    placeholder="Mother - Last Name"
                    id="first-name-input"
                    className="form-inputs"
                    onChange={handleSubmit}
                  />
                </FloatingLabel>
              </Form.Group>
            </Col>
          </Row>

          <Button variant="primary" type="submit" id="submit-button">
            Submit
          </Button>
        </Form>
      </div>
      <div className="empty-row"></div>
    </div>
  );
}
export default AddPlayer;
