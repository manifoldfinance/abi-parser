import requests
import json
from modules import constants


def read_abi_from_address(address, chain):
    config = constants.CHAINCONFIG.get(chain, {})
    a = address.lower()
    k = config.get("API_KEY")
    base_url = config.get("BASE_URL")
    url = f'{base_url}/api?module=contract&action=getabi&address={a}&apikey={k}'
    json_response = requests.get(url).json()
    return json.loads(json_response['result'])


def read_contract(contract, chain):
    if contract is not None and contract.startswith('0x'):
        config = constants.CHAINCONFIG.get(chain, {})
        a = contract.lower()
        k = config.get("API_KEY")
        base_url = config.get("BASE_URL")
        url = f'{base_url}/api?module=contract&action=getsourcecode&address={a}&apikey={k}'
        json_response = requests.get(url).json()
        contract = [x for x in json_response['result']
                    if 'ContractName' in x][0]
        return contract
    else:
        return {
            'ContractName': 'unknown'
        }
