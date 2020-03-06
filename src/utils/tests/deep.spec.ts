import { deepKeys, deepClearEmpties } from '../deep';

test('deep keys', () => {
  expect(deepKeys({
    a: true,
    b: {
      c: true,
    },
    d: {
      e: {
        f: true,
        g: true,
      }
    }
  })).toEqual([
    "a", "b.c", "d.e.f", "d.e.g"
  ])

  expect(deepKeys({
    a: true,
    b: {
      ["c.d"]: true,
    },
    d: {
      e: {
        f: true,
        g: true,
      }
    }
  })).toEqual([
    "a", "b.c__d", "d.e.f", "d.e.g"
  ])
});


test('omit By deep', () => {
  expect(
    deepClearEmpties(
      {
        a: true,
        b: {
          c: {},
        },
        d: {
          e: {
            f: true,
            g: {},
          }
        }
      }
    )
  ).toMatchObject({
    a: true,
    d: {
      e: {
        f: true
      }
    },
  })
});
