#!/bin/bash

docker build -t lexplatform.azurecr.io/fusion:space-v3-sprint-4.6 .

echo "docker build is completed !!!! Starting docker push"

docker push lexplatform.azurecr.io/fusion:space-v3-sprint-4.6

