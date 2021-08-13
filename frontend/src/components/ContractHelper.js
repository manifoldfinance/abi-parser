import React, { Component } from "react";
import Spinner from "react-bootstrap/esm/Spinner";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import web3 from "web3";

function checkIfShouldColour(currentValue, stateValue) {
  let variant = "secondary";
  if (currentValue.toLowerCase() === stateValue.toLowerCase()) {
    variant = "primary";
  }
  return variant;
}
export class ContractHelper extends Component {
  render() {
    const isAddress = web3.utils.isAddress(this.props.contract);
    let otherContractDetails = "";
    if (
      isAddress &&
      this.props.deployer &&
      this.props.otherContracts.length > 0 &&
      !this.props.isDeployedLoading
    ) {
      otherContractDetails = (
        <div>
          <Card>
            <Card.Body>
              <Card.Title>
                {" "}
                Deployed Contracts : {this.props.otherContracts.length}{" "}
              </Card.Title>
              <ListGroup
                style={{
                  maxHeight: "100px",
                  marginBottom: "10px",
                  overflow: "scroll",
                }}
              >
                {this.props.otherContracts.map((item) => {
                  return (
                    <ListGroup.Item
                      action
                      variant={checkIfShouldColour(
                        item.contract,
                        this.props.contract
                      )}
                      value={item.contract}
                      disabled={
                        checkIfShouldColour(
                          item.contract,
                          this.props.contract
                        ) === "primary"
                          ? true
                          : false
                      }
                      key={item.contract}
                      onClick={this.props.handleContractSelected.bind(this)}
                    >
                      {item.contract}
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
      );
    } else {
      if (this.props.isDeployedLoading) {
        otherContractDetails = (
          <Card className="m-3" style={{ maxWidth: "100%" }}>
            <Spinner animation="border" />
          </Card>
        );
      } else {
        otherContractDetails = "";
      }
    }

    let deployerCreatorDetails = "";
    if (isAddress && this.props.deployer && !this.props.isDeployerLoading) {
      deployerCreatorDetails = (
        <div>
          <Card>
            <Card.Body>
              <Card.Title> Deployer</Card.Title>

              {this.props.deployer}
              {otherContractDetails}
              <Card.Footer>
                <Button onClick={this.props.handleDeployedSearch.bind(this)}>
                  Get Deployed Contracts
                </Button>
              </Card.Footer>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <Card.Title> Creator </Card.Title>
              <Card.Text> {this.props.creator}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      );
    } else {
      if (this.props.isDeployerLoading) {
        deployerCreatorDetails = (
          <Card className="m-3" style={{ maxWidth: "100%" }}>
            <Spinner animation="border" />
          </Card>
        );
      } else {
        deployerCreatorDetails = ``;
      }
    }
    return (
      <div>
        <Card className="m-3" style={{ maxWidth: "100%" }}>
          <Card.Body>
            <Card.Title>Extra: Contract Tools</Card.Title>
            {deployerCreatorDetails}
          </Card.Body>
          <Card.Footer>
            <Button
              onClick={this.props.handleDeployerSearch.bind(this)}
              disabled={!isAddress}
            >
              Get Deployer
            </Button>
          </Card.Footer>
        </Card>
      </div>
    );
  }
}

export default ContractHelper;
