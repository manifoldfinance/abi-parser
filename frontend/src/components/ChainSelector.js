import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export class ChainSelector extends Component {
    render() {
        return (
            <div>
                <Card className="m-3" style={{ maxWidth: "100%" }}>
                    <Card.Body>
                        <Card.Title>Select the Chain</Card.Title>
                    </Card.Body>

                    <Card.Footer style={{ textTransform: "capitalize" }}>
                        <Row>
                            <Col>
                                <DropdownButton
                                    title="Chain"
                                    variant="primary"
                                    onSelect={this.props.handleChainSubmit.bind(this)}
                                >
                                    <Dropdown.Item eventKey="ethereum">Ethereum</Dropdown.Item>

                                    <Dropdown.Item eventKey="polygon">Polygon</Dropdown.Item>
                                    <Dropdown.Item eventKey="binance-smart-chain">
                                        Binance Smart Chain
                                    </Dropdown.Item>
                                    <Dropdown.Item eventKey="fantom">Fantom</Dropdown.Item>
                                    <Dropdown.Item eventKey="avalanche">Avalanche</Dropdown.Item>
                                    <Dropdown.Item eventKey="arbitrum">Arbitrum</Dropdown.Item>
                                    <Dropdown.Item eventKey="optimism">Optimism</Dropdown.Item>
                                </DropdownButton>
                            </Col>
                            <Col>{this.props.chain}</Col>
                        </Row>
                    </Card.Footer>
                </Card>
            </div>
        );
    }
}

export default ChainSelector;
