#!/bin/bash

docker build -t lexplatform.azurecr.io/fusion:prod-sprint-terms-10.2.0 .

echo "docker build is completed !!!! Starting docker push"

docker push lexplatform.azurecr.io/fusion:prod-sprint-terms-10.2.0

