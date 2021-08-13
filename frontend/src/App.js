import React, { Component } from "react";

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
      dataset: "",
      name: "",
      chain: "ethereum",
      isLoading: false,
      isDeployerLoading: false,
      isDeployedLoading: false,
      deployer: "",
      creator: "",
      otherContracts: [],
    };
  }
  handleChainSubmit(e) {
    this.setState({
      chain: e,
    });
  }
  handleChange(e) {
    this.setState({
      contractAddress: e.target.value,
    });
  }

  handleChangeContractName(e) {
    this.setState({
      name: e.target.value,
    });
    const clone = JSON.parse(JSON.stringify(this.state.contract));
    clone.ContractName = e.target.value;
    this.setState({
      contract: clone,
    });
  }

  handleChangeDataset(e) {
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
  async fetchDeployed() {
    const deployer = this.state.deployer;
    const chain = this.state.chain;

    const deployedApi = `${API_ENDPOINT}deployed/${deployer.toLowerCase()}/${chain}`;
    const deployedRes = await fetch(deployedApi);
    const otherContracts = await deployedRes.json();
    this.setState({
      otherContracts,
      isDeployedLoading: false,
    });
  }

  async fetchDeployer() {
    const contractAddress = this.state.contractAddress;
    const chain = this.state.chain;

    const deployerApi = `${API_ENDPOINT}deployer/${contractAddress.toLowerCase()}/${chain}`;
    const deployerRes = await fetch(deployerApi);
    const data = await deployerRes.json();
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
    const contractAddress = this.state.contractAddress;
    const chain = this.state.chain;
    const queriesApi = `${API_ENDPOINT}queries/${contractAddress}/${chain}`;
    const queriesRes = await fetch(queriesApi);
    const queries = await queriesRes.json();
    const tablesApi = `${API_ENDPOINT}tables/${contractAddress}/${chain}`;
    const tablesRes = await fetch(tablesApi);
    const tables = await tablesRes.json();
    const contractApi = `${API_ENDPOINT}contract/${contractAddress}/${chain}`;
    const contractRes = await fetch(contractApi);
    const contract = await contractRes.json();
    const name = contract.ContractName;
    this.setState({
      name,
      queries,
      tables,
      contract,
      isLoading: false,
    });
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
