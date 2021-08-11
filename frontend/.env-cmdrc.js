// NOTE: In order for these variables to be read by the react app you need to prefix them with "REACT_APP_"
const PROD = {
  REACT_APP_ENVIRONMENT: "Production",
  REACT_APP_API_ENDPOINT:
    "https://contract-parser-api-7s4aptchzq-uc.a.run.app/api/",
};

const DEV = {
  REACT_APP_ENVIRONMENT: "Development",
  REACT_APP_API_ENDPOINT:
    "https://contract-parser-api-s27o6wzppa-uc.a.run.app/api/",
};
const LOCAL = {
  REACT_APP_ENVIRONMENT: "Local",
  REACT_APP_API_ENDPOINT: "http://localhost:3000/api/",
};

module.exports = {
  prod: PROD,
  dev: DEV,
  local: LOCAL,
};
