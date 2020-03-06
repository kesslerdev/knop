import { flatDiff, fullDiff, inferLastConfig, kubeDifferences, isLastConfig, lastConfigAnnotation, kubectlLastConfigAnnotation } from "../lastConfig";
import { KubeObject } from '../../types';

const baseObject = { a: false };

const kubeObject: KubeObject = {
  metadata: {
    labels: undefined,
    annotations: {
      [kubectlLastConfigAnnotation]: "kubectl",
      [lastConfigAnnotation]: '{"metadata":{"name":"a","namespace":"b"},"spec":{"size":30}}',
      test: "test"
    },
    name: "a",
    namespace: "b"
  },
  spec: {
    size: 20
  },
  status: {
    size: 30,
    another: false
  }
}

const kubeObjectEmptyAnnotations: KubeObject = {
  ...kubeObject,
  metadata: {
    ...kubeObject.metadata,
    annotations: {}
  }
}

const kubeObjectSameAnnotations: KubeObject = {
  ...kubeObject,
  metadata: {
    ...kubeObject.metadata,
    annotations: {
      ...kubeObject.metadata.annotations,
      [lastConfigAnnotation]: JSON.stringify(inferLastConfig(kubeObject))
    }
  }
}

describe('flatDiff method', () => {
  test('return nothing in same object', () => {
    expect(Object.keys(flatDiff({ a: "ddd" }, { a: "ddd" })).length).toBe(0);
  });

  test('dont output removed keys only new', () => {
    expect(Object.keys(flatDiff({}, baseObject)).length).toBe(0);
  });

  test('output changed keys', () => {
    const obj = { a: true };
    expect(flatDiff(obj, baseObject)).toMatchObject(obj);
  });

  test('output changed keys recursively', () => {
    const obj = {
      a: {
        b: true
      }
    };
    expect(flatDiff(obj, {
      a: {
        b: false
      }
    })).toMatchObject(obj);
  });
});

describe('fullDiff method', () => {
  test('isChanged = false, same object', () => {
    expect(fullDiff(baseObject, baseObject).isChanged).toBe(false);
  });

  test('isChanged = true, removed props', () => {
    expect(fullDiff({}, baseObject)).toMatchObject({
      isChanged: true,
      removed: baseObject,
    })
  });

  test('isChanged = true, changed keys', () => {
    const obj = { a: true };
    expect(fullDiff(obj, baseObject)).toMatchObject({
      isChanged: true,
      changed: obj,
      removed: {},
      paths: ['a']
    })
    expect(Object.keys(fullDiff(obj, baseObject).removed).length).toBe(0);
  });

  test('isChanged = true, changed keys recursively', () => {
    const obj = {
      a: {
        b: true
      }
    };
    expect(fullDiff(obj, {
      a: {
        b: false
      }
    })).toMatchObject({
      isChanged: true,
      changed: obj,
      paths: ['a.b']
    });

    expect(fullDiff(
      {
        a: {
          c: true
        }
      },
      {
        a: {
          b: false
        }
      }
    )).toMatchObject({
      isChanged: true,
      changed: {
        a: {
          c: true
        }
      },
      removed: {
        a: {
          b: false
        }
      },
      paths: ['a.c', 'a.b']
    });
  });
})

describe('inferLastConfig method, clean unused fields in kube object', () => {
  const cleanedObject = inferLastConfig(kubeObject);
  test('remove kubectl & knop annotations', () => {
    expect(Object.keys(cleanedObject.metadata.annotations).length).toBe(1);
    expect(cleanedObject.metadata.annotations.test).toBe("test");
  })

  test('remove status & undefined metadata', () => {
    expect(cleanedObject.status).toBeUndefined();
    expect(Object.keys(cleanedObject.metadata).length).toBe(3);
  })

  test('dont output annotations if empty object', () => {
    expect(inferLastConfig(kubeObjectEmptyAnnotations).metadata.annotations).toBeUndefined();
  })
})

describe('kubeDifferences, check diff with previous applied manifest', () => {
  test('return all as diff if no annotation', () => {
    expect(kubeDifferences(kubeObjectEmptyAnnotations).changed).toMatchObject(inferLastConfig(kubeObjectEmptyAnnotations));
  })

  test('return diffs with annotation, added annotation & change spec', () => {
    expect(kubeDifferences(kubeObject).changed).toMatchObject({
      metadata: {
        annotations: {
          test: "test"
        }
      },
      spec: {
        size: 20
      }
    });
  })
})


describe('isLastConfig', () => {
  test('return false if no diff annotation', () => {
    expect(isLastConfig(kubeObjectEmptyAnnotations)).toBe(false);
  })

  test('return true if no diff', () => {
    expect(isLastConfig(kubeObjectSameAnnotations)).toBe(true);
  })

  test('return false on empty object', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    expect(isLastConfig({})).toBe(false);
    expect(isLastConfig(null)).toBe(false);
  })
})
