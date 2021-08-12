import json
from jinja2 import Template
from eth_utils import event_abi_to_log_topic, function_abi_to_4byte_selector
from requests import get
from modules import constants
from modules import scanapi

dataset_name = '<INSERT_DATASET_NAME>'
table_prefix = '<TABLE_PREFIX>'
table_description = ''


def create_table_name(abi):
    return table_prefix + '_event_' + abi['name']


def abi_to_table_definition(abi, contract_address, parser_type):
    table_name = create_table_name(abi)
    result = {}
    result['parser'] = {
        'type': parser_type,
        'contract_address': contract_address,
        'abi': abi,
        'field_mapping': {}
    }

    def transform_params(params):
        transformed_params = []
        for param in params:
            if param.get('type') == 'tuple' and param.get('components') is not None:
                transformed_params.append({
                    'name': param.get('name'),
                    'description': '',
                    'type': 'RECORD',
                    'fields': transform_params(param.get('components'))
                })
            else:
                transformed_params.append({
                    'name': param.get('name'),
                    'description': '',
                    'type': 'STRING'  # we sometimes get parsing errors, so safest to make all STRING
                })
        return transformed_params

    result['table'] = {
        'dataset_name': dataset_name,
        'table_name': table_name,
        'table_description': table_description,
        'schema': transform_params(abi['inputs'])
    }
    return result


def contract_to_table_definitions(contract, chain):
    if contract is not None and contract.startswith('0x'):
        contract_address = contract.lower()
        abi = scanapi.read_abi_from_address(contract, chain)
    else:
        contract_address = 'unknown'
        abi = json.loads(contract)

    result = {}
    for a in filter_by_type(abi, 'event'):
        result[a['name']] = abi_to_table_definition(a, contract_address, 'log')
    for a in filter_by_type(abi, 'function'):
        result[a['name']] = abi_to_table_definition(
            a, contract_address, 'trace')
    return result


def s2bq_type(type):
    return constants.SOLIDITY_TO_BQ_TYPES.get(type, 'STRING')


def filter_by_type(abi, type):
    for a in abi:
        if a['type'] == type:
            yield a


def get_columns_from_event_abi(event_abi):
    return [a.get('name') for a in event_abi['inputs']]


def create_struct_fields_from_event_abi(event_abi):
    return ', '.join(['`' + a.get('name') + '` ' + s2bq_type(a.get('type')) for a in event_abi['inputs']])


def abi_to_sql(abi, template, contract_address):
    if abi['type'] == 'event':
        selector = '0x' + event_abi_to_log_topic(abi).hex()
    else:
        selector = '0x' + function_abi_to_4byte_selector(abi).hex()

    struct_fields = create_struct_fields_from_event_abi(abi)
    columns = get_columns_from_event_abi(abi)
    return template.render(
        abi=json.dumps(abi),
        contract_address=contract_address.lower(),
        selector=selector,
        struct_fields=struct_fields,
        columns=columns
    )


def contract_to_sqls(contract, chain):
    if contract is not None and contract.startswith('0x'):
        contract_address = contract.lower()
        abi = scanapi.read_abi_from_address(contract_address, chain)
    else:
        contract_address = 'unknown'
        abi = json.loads(contract)

    event_tpl = Template(constants.SQL_TEMPLATE_FOR_EVENT)
    function_tpl = Template(constants.SQL_TEMPLATE_FOR_FUNCTION)

    result = {}
    for a in filter_by_type(abi, 'event'):
        result[a['name']] = abi_to_sql(a, event_tpl, contract_address)
    for a in filter_by_type(abi, 'function'):
        result[a['name']] = abi_to_sql(a, function_tpl, contract_address)
    return result
