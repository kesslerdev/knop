# Knop, Kubernetes Nodejs OPerators made easy

## Getting started

```bash
# install cli
npm install -g knop-cli

# or using knop-cli with npx
npx -p knop-cli knop

# create an operator projet into my-operator directory (package name)
npx -p knop-cli knop new operator --name MyOperator

# add a controlled crd (api)
npx -p knop-cli knop new api --api-version svc.docaposte.cloud/v1alpha1 --kind Elasticsearch

# add the corresponding crd controller (api)
npx -p knop-cli knop new crd-controller --api-version svc.docaposte.cloud/v1alpha1 --kind Elasticsearch

# run operator in dev mode
npm run dev
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

### Generators

#### Operator

Generate a new node project for an operator
```bash
knop new operator --name "MyOperator"
```

only name is required.

|parameter|value|
|-|-|
|name| Humanized operator name, (underscore + dash for package name)|
|orgName | Humanized Organization name |
|org| npm organization|
| repo | git repository |
|dockerRepo | docker repository|

#### Api (CRD)

Generate a new CRD (yaml files & types)
```bash
knop new api --api-version svc.docaposte.cloud/v1alpha1 --kind Elasticsearch
```

api-version & kind are required

|parameter|value|
|-|-|
|api-version| kubernetes api version with group (ex svc.docaposte.cloud/v1alpha1) |
|kind | kubernetes kind |

#### CRD Controller
Generate a new CRD Controller, handle CR create/update/delete with deduplication (dosent fire if CR doesn't change)
```bash
knop new crd-controller --api-version svc.docaposte.cloud/v1alpha1 --kind Elasticsearch
```

api-version & kind are required (refers to managed CRD)

|parameter|value|
|-|-|
|api-version| kubernetes api version with group (ex svc.docaposte.cloud/v1alpha1) |
|kind | kubernetes kind |

## Deployment

```bash
# In a generated application (with at least an API)
# Register CRDs first
kubectl apply -f ./deploy/crds/*_crd.yaml

# Deploy operator (need docker image)
kubectl apply -f ./deploy/*.yaml
```

### Operator runtime Env options

| Variable          | Default       | Info                                                                                 |
|-------------------|---------------|--------------------------------------------------------------------------------------|
| `NODE_ENV`        | null          |                                                                                      |
| `LOGGER_LEVEL`    | `info`        | see [pino level ](https://getpino.io/#/docs/api?id=loggerlevel-string-gettersetter ) |
| `LAST_CONFIG_ANNOTATION` | `knop.skimia.org/last-applied-configuration` | annotation used in resource for storing changes                                             |
| `WATCH_NAMESPACE` | null          | When deployed it take the namespace of pod                                           |
| `REGISTER_CRD`    | `0`           | Unused now, create CRD in kubernetes at startup (update if exists)                   |
