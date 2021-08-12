from google.cloud import bigquery
from modules import constants
from jinja2 import Template
from modules import validation

# Construct a BigQuery client object.
client = bigquery.Client()


def get_deployment_info(address, chain):
    valid_address, data = validation.validate_address(address)
    if valid_address:
        valid_chain, data = validation.validate_bq_chain(chain)
        if valid_chain:
            query_template = Template(constants.SQL_DEPLOYMENT_INFORMATION)
            query = query_template.render(
                contract_address=address.lower(), chain=chain)
            query_job = client.query(query)
            print(query)
            for row in query_job:
                # Row values can be accessed by field name or index.
                deployer = row["deployer"]
                creator = row["creator"]
                data = {"deployer": deployer, "creator": creator}
                print(row)
    return data
