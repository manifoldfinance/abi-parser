import React, { Component } from "react";
import Card from "react-bootstrap/Card";
// import TableLink from "./TableLink";
import InputDataset from "./InputDataset";

export class TableDefinitions extends Component {
    render() {
        const {
            tables,
            contract,
            //   queries,
            dataset,
            name,
            handleChangeDataset,
            handleChangeContractName,
        } = this.props;
        const events = Object.entries(tables).filter(
            (q) => q[1].parser.type === "log"
        );
        const functions = Object.entries(tables).filter(
            (q) => q[1].parser.type === "trace"
        );
        return (
            <Card className="m-3" style={{ maxWidth: "100%" }}>
                <Card.Title>
                    {" "}
                    Contract Details for:{" "}
                    {contract.ContractName ? contract.ContractName : contract}
                </Card.Title>
                <Card.Body>
                    <p>{`${events.length} events found in contract:`}</p>
                    <ol>
                        {events.map((obj) => (
                            <li>{obj[0]}</li>
                        ))}
                    </ol>
                    <p>{`${functions.length} functions found in contract ${contract.ContractName}:`}</p>
                    <ol>
                        {functions.map((obj) => (
                            <li>{obj[0]}</li>
                        ))}
                    </ol>
                    <InputDataset
                        tables={tables}
                        contract={contract}
                        dataset={dataset}
                        name={name}
                        handleChangeContractName={handleChangeContractName}
                        handleChangeDataset={handleChangeDataset}
                    />
                </Card.Body>
            </Card>
        );
    }
}

export default TableDefinitions;
