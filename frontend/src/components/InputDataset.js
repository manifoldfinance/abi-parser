import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Downloader from "./Downloader";

export class InputDataset extends Component {
    render() {
        const {
            tables,
            // contract,
            dataset,
            name,
            handleChangeDataset,
            handleChangeContractName,
        } = this.props;
        return (
            <div>
                <Card className="m-3" style={{ maxWidth: "100%" }}>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group>
                            <Form.Label>Dataset Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter dataset name"
                                value={dataset}
                                onChange={handleChangeDataset.bind(this)}
                                required
                            />
                            <Form.Text>
                                For{" "}
                                <a
                                    href="https://github.com/blockchain-etl/ethereum-etl-airflow"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    Blockchain-ETL
                                </a>
                            </Form.Text>
                            <Form.Label>Contract Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={name}
                                value={name}
                                onChange={handleChangeContractName.bind(this)}
                                required
                            />
                        </Form.Group>
                        <Downloader tables={tables} contract={name} dataset={dataset} />
                    </Form>
                </Card>
            </div>
        );
    }
}

export default InputDataset;
