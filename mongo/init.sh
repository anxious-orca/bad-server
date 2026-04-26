#!/bin/bash
mongoimport \
  --username root \
  --password example \
  --authenticationDatabase admin \
  --db weblarek \
  --collection products \
  --file /docker-entrypoint-initdb.d/dump/weblarek.products.json \
  --jsonArray

mongoimport \
  --username root \
  --password example \
  --authenticationDatabase admin \
  --db weblarek \
  --collection users \
  --file /docker-entrypoint-initdb.d/dump/weblarek.users.json \
  --jsonArray