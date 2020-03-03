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

## Development

### Scripts
- `npm run dev` : start operator locally (uses `~/.kube/config` for connecting to cluster)
- `npm run dk:build` : Build docker operator image
- `npm run clean` : remove artifacts (coverage, tmp, compiled files)
- `npm run test` : run tests (jest)
- `npm run test:watch` : run tests with watching
- `npm run lint` : check code with eslint
- `npm run build` : build (compile) operator sources files
- `npm run build:watch` : build with watching

## Deployment

```bash
# In a generated application (with at least an API)
# Register CRDs first
kubectl apply -f ./deploy/crds/*_crd.yaml

# Deploy operator (need docker image)
kubectl apply -f ./deploy/*.yaml
```

### Operator Env options running

| Variable          | Default       | Info                                                                                 |
|-------------------|---------------|--------------------------------------------------------------------------------------|
| `NODE_ENV`        | null          |                                                                                      |
| `LOGGER_LEVEL`    | `info`        | see [pino level ](https://getpino.io/#/docs/api?id=loggerlevel-string-gettersetter ) |
| `HASHER_KEY`      | `knop`        | key used to hash resource definition for tracking                                    |
| `STATUS_HASH_KEY` | `knopHashKey` | key used in resource status for tracking                                             |
| `WATCH_NAMESPACE` | null          | When deployed it take the namespace of pod                                           |
| `REGISTER_CRD`    | `0`           | Unused now, create CRD in kubernetes at startup (update if exists)                   |
