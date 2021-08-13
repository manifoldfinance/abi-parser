from flask import Flask, jsonify
from flask_cors import CORS
from modules import bq
from modules import utils
from modules import constants
from modules import scanapi

app = Flask(__name__)
CORS(app)


# WEB SERVER


@app.route('/api/')
def index():
    return jsonify({'status': 'alive'})


@app.route('/api/test')
def test():
    return jsonify({'status': 'test'})


@app.route('/api/queries/<contract>/<chain>')
def queries(contract, chain):
    queries = utils.contract_to_sqls(contract, chain)
    return jsonify(queries)


@app.route('/api/tables/<contract>/<chain>')
def tables(contract, chain):
    tables = utils.contract_to_table_definitions(contract, chain)
    return jsonify(tables)


@app.route('/api/contract/<contract>/<chain>')
def contract(contract, chain):
    c = scanapi.read_contract(contract, chain)
    return jsonify(c)


@app.route('/api/deployer/<contract>/<chain>')
def deployer(contract, chain):
    info = bq.get_deployment_info(contract, chain)
    return jsonify(info)


@app.route('/api/deployed/<contract>/<chain>')
def deployed(contract, chain):
    info = bq.get_deployed_contracts(contract, chain)
    return jsonify(info)


if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=constants.PORT)
