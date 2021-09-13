from flask import Flask, jsonify, request
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


@app.route('/api/queries/<chain>', methods=['POST'])
def queries(chain):
    data = request.get_json()    
    contract = data.get('contract')
    queries = utils.contract_to_sqls(contract, chain)
    return jsonify(queries)


@app.route('/api/tables/<chain>', methods=['POST'])
def tables(chain):
    data = request.json
    contract = data.get('contract')
    tables = utils.contract_to_table_definitions(contract, chain)
    return jsonify(tables)


@app.route('/api/contract/<chain>', methods=['POST'])
def contract(chain):
    data = request.json
    contract = data.get('contract')
    c = scanapi.read_contract(contract, chain)
    return jsonify(c)


@app.route('/api/deployer/<chain>', methods=['POST'])
def deployer( chain):
    data = request.json
    contract = data.get('contract')
    info = bq.get_deployment_info(contract, chain)
    return jsonify(info)


@app.route('/api/deployed/<chain>', methods=['POST'])
def deployed(chain):
    data = request.json
    deployer = data.get('deployer')
    info = bq.get_deployed_contracts(deployer, chain)
    return jsonify(info)


@app.route('/api/supported_bq_chains')
def supported_bq_chains():
    supported_bq_chains = constants.SUPPORTED_BQ_CHAINS
    return jsonify({'chains': supported_bq_chains})


if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=constants.PORT)
