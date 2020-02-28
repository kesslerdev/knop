# Knop, Kubernetes Nodejs OPerators made easy

## Getting started

```bash
# install cli
npm install -g knop-cli

# or using knop-cli with npx
npx -p knop-cli knop
```

```bash
# create an operator projet into my-operator directory (package name)
npx -p knop-cli knop new operator --name MyOperator
```

```bash
# add a controlled crd (api)
npx -p knop-cli knop new api --api-version svc.docaposte.cloud/v1alpha1 --kind Elasticsearch
```
```bash
# add the corresponding crd controller (api)
npx -p knop-cli knop new crd-controller --api-version svc.docaposte.cloud/v1alpha1 --kind Elasticsearch
```

### Env options

- `LOGGER_LEVEL` see [pino level](https://getpino.io/#/docs/api?id=loggerlevel-string-gettersetter), default: `info`
- `HASHER_KEY` key used to hash resource definition for tracking, default: `knop`
- `STATUS_HASH_KEY` key used in resource status for tracking, default: `knopHashKey`
- `WATCH_NAMESPACE` namespaces to watch, if omited watch all namespaces
- `REGISTER_CRD` create CRD in kubernetes at startup (update if exists): `0`
