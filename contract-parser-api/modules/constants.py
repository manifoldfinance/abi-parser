import os
from dotenv import load_dotenv
load_dotenv()

PORT = int(os.getenv("PORT")) if os.getenv("PORT") else 3000
ETHERSCAN_API_KEY = os.environ.get("ETHERSCAN_API_KEY")
POLYGONSCAN_API_KEY = os.environ.get("POLYGONSCAN_API_KEY")
BSCSCAN_API_KEY = os.environ.get("BSCSCAN_API_KEY")
FTMSCAN_API_KEY = os.environ.get('FTMSCAN_API_KEY')
ARBISCAN_API_KEY = os.environ.get('ARBISCAN_API_KEY')
OPTIMISMSCAN_API_KEY = os.environ.get('OPTIMISMSCAN_API_KEY')
AVALANCHESNOWTRACE_API_KEY = os.environ.get('AVALANCHESNOWTRACE_API_KEY')


ETHERSCAN_BASE_URL = 'https://api.etherscan.io'
POLYGONSCAN_BASE_URL = 'https://api.polygonscan.com'
BSCSCAN_BASE_URL = 'https://api.bscscan.com'
FTMSCAN_BASE_URL = 'https://api.ftmscan.com'
ARBISCAN_BASE_URL = 'https://api.arbiscan.io'
OPTIMISMSCAN_BASE_URL = 'https://api-optimistic.etherscan.io'
AVALANCHESNOWTRACE_BASE_URL = 'https://api.snowtrace.io'


# Note this is for Contract Tools , and depends on if we have the underlying tables built
# for the different chains
SUPPORTED_BQ_CHAINS = ['ethereum', 'polygon']

CHAINCONFIG = {'ethereum': {'API_KEY': ETHERSCAN_API_KEY, "BASE_URL": ETHERSCAN_BASE_URL},
               'polygon': {'API_KEY': POLYGONSCAN_API_KEY, "BASE_URL": POLYGONSCAN_BASE_URL},
               'binance-smart-chain': {'API_KEY': BSCSCAN_API_KEY, "BASE_URL": BSCSCAN_BASE_URL},
               'fantom': {'API_KEY': FTMSCAN_API_KEY, "BASE_URL": FTMSCAN_BASE_URL},
               'arbitrum': {'API_KEY': ARBISCAN_API_KEY, "BASE_URL": ARBISCAN_BASE_URL},
               'optimism': {'API_KEY': OPTIMISMSCAN_API_KEY, "BASE_URL": OPTIMISMSCAN_BASE_URL},
               'avalanche': {'API_KEY': AVALANCHESNOWTRACE_API_KEY, "BASE_URL": AVALANCHESNOWTRACE_BASE_URL}
            }


SOLIDITY_TO_BQ_TYPES = {
    'address': 'STRING',
}
SQL_TEMPLATE_FOR_EVENT = '''
CREATE TEMP FUNCTION
  PARSE_LOG(data STRING, topics ARRAY<STRING>)
  RETURNS STRUCT<{{struct_fields}}>
  LANGUAGE js AS """
    var parsedEvent = {{abi}}
    return abi.decodeEvent(parsedEvent, data, topics, false);
"""
OPTIONS
  ( library="https://storage.googleapis.com/ethlab-183014.appspot.com/ethjs-abi.js" );

WITH parsed_logs AS
(SELECT
    logs.block_timestamp AS block_timestamp
    ,logs.block_number AS block_number
    ,logs.transaction_hash AS transaction_hash
    ,logs.log_index AS log_index
    ,PARSE_LOG(logs.data, logs.topics) AS parsed
FROM `bigquery-public-data.crypto_ethereum.logs` AS logs
WHERE address = '{{contract_address}}'
  AND topics[SAFE_OFFSET(0)] = '{{selector}}'
)
SELECT
     block_timestamp
     ,block_number
     ,transaction_hash
     ,log_index{% for column in columns %}
    ,parsed.{{ column }} AS `{{ column }}`{% endfor %}
FROM parsed_logs
'''

SQL_TEMPLATE_FOR_FUNCTION = '''
CREATE TEMP FUNCTION
    PARSE_TRACE(data STRING)
    RETURNS STRUCT<{{struct_fields}}, error STRING>
    LANGUAGE js AS """
    var abi = {{abi}};
    var interface_instance = new ethers.utils.Interface([abi]);

    var result = {};
    try {
        var parsedTransaction = interface_instance.parseTransaction({data: data});
        var parsedArgs = parsedTransaction.args;

        if (parsedArgs && parsedArgs.length >= abi.inputs.length) {
            for (var i = 0; i < abi.inputs.length; i++) {
                var paramName = abi.inputs[i].name;
                var paramValue = parsedArgs[i];
                if (abi.inputs[i].type === 'address' && typeof paramValue === 'string') {
                    // For consistency all addresses are lowercase.
                    paramValue = paramValue.toLowerCase();
                }
                result[paramName] = paramValue;
            }
        } else {
            result['error'] = 'Parsed transaction args is empty or has too few values.';
        }
    } catch (e) {
        result['error'] = e.message;
    }

    return result;
"""
OPTIONS
  ( library="gs://blockchain-etl-bigquery/ethers.js" );

WITH parsed_traces AS
(SELECT
    traces.block_timestamp AS block_timestamp
    ,traces.block_number AS block_number
    ,traces.transaction_hash AS transaction_hash
    ,traces.trace_address AS trace_address
    ,PARSE_TRACE(traces.input) AS parsed
FROM `bigquery-public-data.crypto_ethereum.traces` AS traces
WHERE to_address = '{{contract_address}}'
  AND STARTS_WITH(traces.input, '{{selector}}')
  )
SELECT
     block_timestamp
     ,block_number
     ,transaction_hash
     ,trace_address
     ,parsed.error AS error
     {% for column in columns %}
    ,parsed.{{ column }} AS `{{ column }}`
    {% endfor %}
FROM parsed_traces
'''

SQL_DEPLOYMENT_INFORMATION = '''

WITH
    deployment_info AS (
        SELECT 
            deployer, 
            creator 
        FROM 
            `nansen-datasets-prod.core_contracts.contract_deployments_enriched_for_contract_on_{{chain}}` 
        WHERE 
            _address_partition = `nansen-datasets-prod.udfs.ADDRESS_INT_PARTITION`('{{contract_address}}')
        AND 
            contract = '{{contract_address}}'
    )

SELECT  * FROM deployment_info 
'''

SQL_DEPLOYED_CONTRACTS = '''

WITH 
    other_contracts AS (
        SELECT  
            d.contract,
            d.deployer,
            d.creator,
            d.transaction_hash
        FROM 
            `nansen-datasets-prod.core_contracts.contract_deployments_enriched_for_deployer_on_{{chain}}` AS d
        WHERE 
            d._address_partition = `nansen-datasets-prod.udfs.ADDRESS_INT_PARTITION`('{{deployer_address}}')
        AND 
            d.deployer = '{{deployer_address}}'
       
)

SELECT * FROM other_contracts

'''
