#!/bin/bash

docker build -t 708570229439.dkr.ecr.us-east-1.amazonaws.com/fusion:prod-sprint-7.0.1 .

echo "docker build is completed !!!! Starting docker push"

docker push 708570229439.dkr.ecr.us-east-1.amazonaws.com/fusion:prod-sprint-7.0.1

