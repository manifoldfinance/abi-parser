import React, { Component } from "react";

import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export class Input extends Component {
  render() {
    return (
      <div>
        <Card className="m-3" style={{ maxWidth: "100%" }}>
          <Card.Body>
            <Card.Title>Generate Table Definitions and SQLs</Card.Title>

            <Form onSubmit={this.props.handleSubmit.bind(this)}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Enter Contract Address"
                  value={this.props.address}
                  onChange={this.props.handleChange.bind(this)}
                />
              </Form.Group>
              <Card.Footer>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Card.Footer>
            </Form>
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default Input;
