import requests
import json
from modules import constants


def read_abi_from_address(address, chain):
    config = constants.CHAINCONFIG.get(chain, {})
    a = address.lower()
    k = config.get("API_KEY")
    base_url = config.get("BASE_URL")
    url = f'{base_url}/api'
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36'} # This is chrome, you can set whatever browser you like

    params = (
        ('module', 'contract'),
        ('action', 'getabi'),
        ('address', address),
        ('apikey', k),
    )    
    json_response = requests.get(url,params=params, headers=headers)
    print(json_response.url)
    if json_response.status_code == 200:
        try:
            json_response = json_response.json()
            return json.loads(json_response['result'])
        except Exception as e:
            print(e)
    else:
        return {}

def read_contract(contract, chain):
    if contract is not None and contract.startswith('0x'):
        config = constants.CHAINCONFIG.get(chain, {})
        a = contract.lower()
        k = config.get("API_KEY")
        base_url = config.get("BASE_URL")
        
        url = f'{base_url}/api'
    
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.76 Safari/537.36'} # This is chrome, you can set whatever browser you like

        params = (
            ('module', 'contract'),
            ('action', 'getsourcecode'),
            ('address', a),
            ('apikey', k),
        )
        
        json_response = requests.get(url,params=params, headers=headers)
        print(json_response.url)
        if json_response.status_code == 200:
            try:
                json_response = json_response.json()
                contract = [x for x in json_response['result'] if 'ContractName' in x][0]
                return contract
            except Exception as e:
                print(e)
        else:
            return {
            'ContractName': 'unknown'
        }
    else:
        return {
            'ContractName': 'unknown'
        }
        
        
        