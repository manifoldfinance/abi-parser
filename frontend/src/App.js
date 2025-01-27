import React, { Component } from "react";
import Web3 from 'web3';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import Input from "./components/Input";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Spinner from "react-bootstrap/Spinner";
import Query from "./components/Query";
import TableDefinitions from "./components/TableDefinitions";
import ContractHelper from "./components/ContractHelper";
import ChainSelector from "./components/ChainSelector";
import { API_ENDPOINT } from "./constants/endpoints";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contractAddress: "",
            isAbi: false,
            dataset: "",
            name: "",
            chain: "ethereum",
            isLoading: false,
            isDeployerLoading: false,
            isDeployedLoading: false,
            deployer: "",
            creator: "",
            otherContracts: [],
            supportedBqChains: [],
        };
    }

    handleChainSubmit(e) {
        this.setState({
            chain: e,
        });
    }
    handleChange(e) {

        const input = e.target.value;
        let isAddress = Web3.utils.isAddress(input)

        if (isAddress) {
            console.log(`Address detected!`)
            this.setState({
                isAbi: false,
            })
        }
        // probably ABI 
        else {
            console.log(`Abi detected!`)
            this.setState({
                isAbi: true,
            })
        }
        this.setState({
            contractAddress: input,
        });


    }

    handleChangeContractName(e) {
        this.setState({
            name: e.target.value,
        });
        const clone = JSON.parse(JSON.stringify(this.state.contract));
        console.log(clone)
        clone.ContractName = e.target.value;
        this.setState({
            contract: clone,
        });
    }

    handleChangeDataset(e) {
        console.log(e.target.value)
        this.setState({
            dataset: e.target.value,
        });
    }

    async handleContractSelected(e) {
        this.setState({
            contractAddress: e.target.value,
        });
    }
    async handleDeployedSearch(e) {
        this.setState({
            isDeployedLoading: true,
        });
        await this.fetchDeployed();
    }
    async handleDeployerSearch(e) {
        this.setState({
            isDeployerLoading: true,
        });

        await this.fetchDeployer();
    }
    async fetchSupportedContractHelperChains() {
        const bqApi = `${API_ENDPOINT}supported_bq_chains`;
        const bqRes = await fetch(bqApi);
        const data = await bqRes.json();
        this.setState({
            supportedBqChains: data["chains"],
        });
        console.log(data);
    }
    async fetchDeployed() {
        const deployer = this.state.deployer;
        const chain = this.state.chain;

        const msgBody = { "deployer": deployer.toLowerCase() }
        const deployedApi = `${API_ENDPOINT}deployed/${chain}`;
        const deployedRes = await axios.post(deployedApi, msgBody);
        const otherContracts = await deployedRes.data;
        this.setState({
            otherContracts,
            isDeployedLoading: false,
        });
    }

    async fetchDeployer() {
        const contractAddress = this.state.contractAddress;
        const chain = this.state.chain;
        const msgBody = { "contract": contractAddress.toLowerCase() }
        const deployerApi = `${API_ENDPOINT}deployer/${chain}`;
        const deployerRes = await axios.post(deployerApi, msgBody);
        const data = deployerRes.data;
        const deployer = data["deployer"];
        const creator = data["creator"];

        this.setState({
            deployer,
            creator,
            isDeployerLoading: false,
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({
            isLoading: true,
        });
        await this.fetchData();
    }

    async fetchData() {
        const chain = this.state.chain;
        const contractAddress = this.state.contractAddress;
        const msgBody = { "contract": contractAddress }
        const queriesApi = `${API_ENDPOINT}queries/${chain}`;
        const queriesRes = await axios.post(queriesApi, msgBody);
        const queries = await queriesRes.data;
        const tablesApi = `${API_ENDPOINT}tables/${chain}`;
        const tablesRes = await axios.post(tablesApi, msgBody);
        const tables = await tablesRes.data;
        const contractApi = `${API_ENDPOINT}contract/${chain}`;
        const contractRes = await axios.post(contractApi, msgBody);
        const contract = await contractRes.data;
        const name = contract.ContractName;
        this.setState({
            name,
            queries,
            tables,
            contract,
            isLoading: false,
        });
    }

    async componentDidMount() {
        this.fetchSupportedContractHelperChains();
    }

    render() {
        const {
            queries,
            tables,
            isDeployerLoading,
            isDeployedLoading,
            contractAddress,
            dataset,
            name,
            isLoading,
            chain,
            deployer,
            creator,
            otherContracts,
            supportedBqChains,
        } = this.state;
        return (
            <div className="App">
                <Container>
                    <ChainSelector
                        handleChainSubmit={this.handleChainSubmit.bind(this)}
                        chain={chain}
                    />

                    <Input
                        handleChange={this.handleChange.bind(this)}
                        handleSubmit={this.handleSubmit.bind(this)}
                        address={contractAddress}
                        isLoading={isLoading}
                    />
                    <ContractHelper
                        handleDeployerSearch={this.handleDeployerSearch.bind(this)}
                        handleDeployedSearch={this.handleDeployedSearch.bind(this)}
                        handleContractSelected={this.handleContractSelected.bind(this)}
                        contract={contractAddress}
                        deployer={deployer}
                        creator={creator}
                        otherContracts={otherContracts}
                        isDeployerLoading={isDeployerLoading}
                        isDeployedLoading={isDeployedLoading}
                        supportedBqChains={supportedBqChains}
                    />
                    {isLoading && (
                        <Card className="m-3" style={{ maxWidth: "100%" }}>
                            <Spinner animation="border" />
                        </Card>
                    )}
                    {!isLoading && queries && (
                        <TableDefinitions
                            tables={tables}
                            contract={contractAddress}
                            queries={queries}
                            dataset={dataset}
                            name={name}
                            handleChangeDataset={this.handleChangeDataset.bind(this)}
                            handleChangeContractName={this.handleChangeContractName.bind(
                                this
                            )}
                        />
                    )}
                    {!isLoading &&
                        queries &&
                        tables &&
                        Object.entries(queries).map((obj) => (
                            <Query
                                title={obj[0]}
                                query={obj[1]}
                                key={obj[0]}
                                table={tables[obj[0]]}
                            ></Query>
                        ))}
                </Container>
            </div>
        );
    }
}

export default App;
