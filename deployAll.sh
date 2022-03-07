#!/bin/sh

# SET-UP

ENVIRONMENT="$1"
ETH_API_KEY=$ETHERSCAN_API_KEY
BSC_API_KEY=$BSCSCAN_API_KEY
POLYGON_API_KEY=$POLYGONSCAN_API_KEY
FTMSCAN_API_KEY=$FTMSCAN_API_KEY
ARBISCAN_API_KEY=$ARBISCAN_API_KEY
OPTIMISMSCAN_API_KEY=$OPTIMISMSCAN_API_KEY
AVALANCHESNOWTRACE_API_KEY=$AVALANCHESNOWTRACE_API_KEY



if [ "$ENVIRONMENT" == "dev" ]; then
    PROJECT_ID="nansen-contract-parser-dev"
    FIREBASE_PROJECT_ID="nansen-contract-parser-dev"
 
elif [ "$ENVIRONMENT" == "prod" ]; then
    PROJECT_ID="nansen-contract-parser-prod"
    FIREBASE_PROJECT_ID="nansen-contract-parser-prod"
  
else
    echo "Unknown environment"
    exit 1
fi

# Deploy Backend 

gcloud builds submit contract-parser-api \
  --project ${PROJECT_ID} \
  --tag gcr.io/${PROJECT_ID}/contract-parser-api && \
gcloud run deploy contract-parser-api \
  --project ${PROJECT_ID} \
  --image gcr.io/${PROJECT_ID}/contract-parser-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --service-account="contract-parser-api@${PROJECT_ID}.iam.gserviceaccount.com" \
  --set-env-vars "PROJECT_ID=${PROJECT_ID},FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID},ETHERSCAN_API_KEY=${ETH_API_KEY},POLYGONSCAN_API_KEY=${POLYGON_API_KEY},BSCSCAN_API_KEY=${BSC_API_KEY},FTMSCAN_API_KEY=${FTMSCAN_API_KEY},ARBISCAN_API_KEY=${ARBISCAN_API_KEY},OPTIMISMSCAN_API_KEY=${OPTIMISMSCAN_API_KEY},AVALANCHESNOWTRACE_API_KEY=${AVALANCHESNOWTRACE_API_KEY}"

# Deploy Frontend
cd frontend
firebase use $ENVIRONMENT
yarn build:$ENVIRONMENT
yarn deploy:$ENVIRONMENT
