import re
from modules import constants


def validate_bq_args(address, chain):
    valid_address, data = validate_address(address)
    if valid_address:
        valid_chain, data = validate_bq_chain(chain)
        if valid_chain:
            return True, data
    return False, data


def validate_address(address):
    pattern = "^0x[a-fA-F0-9]{40}$"
    # Checks whether the whole string matches the re.pattern or not
    if re.match(pattern, address):
        return (True, {})
    else:
        return (False, {"error": f"{address} is not a valid ethereum address!"})


def validate_bq_chain(chain):
    supported_chains = constants.SUPPORTED_BQ_CHAINS
    if chain in supported_chains:
        return True, {}
    else:
        return False, {
            "error": f"Chain: '{chain}' not supported! Currently only the following chains are supported {supported_chains}"}


def validate_chain(chain):
    supported_chains = constants.CHAINCONFIG.keys()
    if chain in supported_chains:
        return True, {}
    else:
        return False, {
            "error": f"Chain: '{chain}' not supported! Currently only the following chains are supported {supported_chains}"
        }
