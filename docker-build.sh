#!/bin/bash

docker build -t lexplatform.azurecr.io/fusion:prod-sprint-9.0.3 .

echo "docker build is completed !!!! Starting docker push"

docker push lexplatform.azurecr.io/fusion:prod-sprint-9.0.3

