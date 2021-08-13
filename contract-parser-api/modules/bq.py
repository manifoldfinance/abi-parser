import json
from google.cloud import bigquery
from modules import constants
from jinja2 import Template
from modules import validation

# Construct a BigQuery client object.
client = bigquery.Client()


def run_bq_query(query):
    query_job = client.query(query)
    records = [dict(row) for row in query_job]
    data = json.loads(json.dumps((records)))
    return data


def get_deployment_info(address, chain):
    valid, data = validation.validate_bq_args(address, chain)
    if valid:
        query_template = Template(constants.SQL_DEPLOYMENT_INFORMATION)
        query = query_template.render(
            contract_address=address.lower(), chain=chain)
        data = run_bq_query(query)[0]

    return data


def get_deployed_contracts(address, chain):

    valid, data = validation.validate_bq_args(address, chain)
    print(valid, data)
    if valid:
        query_template = Template(constants.SQL_DEPLOYED_CONTRACTS)
        query = query_template.render(
            deployer_address=address.lower(), chain=chain)
        data = run_bq_query(query)

    return data
