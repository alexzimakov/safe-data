import { describe, expect, test } from 'vitest';
import { StringType } from '../string-type.js';
import { RapidCheckError } from '../error.js';
import { format } from './test-util.js';

describe('positive cases', () => {
  const valid = ['', '1', ' ', 'abc', 'multi\nline'];
  const schema = StringType.create();
  valid.forEach((value) => {
    test(
      `should return ${format(value)} when value is ${format(value)}`,
      () => expect(schema.parse(value)).toBe(value)
    );
  });
});

describe('negative cases', () => {
  const invalid = [true, 1, 1n, Symbol('test'), [], {}];
  const schema = StringType.create();
  invalid.forEach((value) => {
    test(`should throw an error when value is ${format(value)}`, () => {
      expect(() => schema.parse(value)).toThrow(RapidCheckError);
    });
  });
});

test('casts to string a passed value', () => {
  const schema = StringType.create({ cast: true });
  expect(schema.parse(null)).toBe('');
  expect(schema.parse(undefined)).toBe('');
  expect(schema.parse(0)).toBe('0');
});

test('trims a passed value', () => {
  const schema = StringType.create({ trim: true });
  expect(schema.parse('  ')).toBe('');
  expect(schema.parse('\n')).toBe('');
  expect(schema.parse('\t')).toBe('');
  expect(schema.parse(' abc ')).toBe('abc');
});

test('throws errors with custom messages', () => {
  const requiredError = 'is required';
  const typeError = 'must be string';
  const schema = StringType.create({ requiredError, typeError });
  expect(() => schema.parse(null)).toThrow(requiredError);
  expect(() => schema.parse(1)).toThrow(typeError);
});

describe('optional()', () => {
  const schema = StringType.create().optional();
  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(RapidCheckError);
  });
});

describe('nullable()', () => {
  const schema = StringType.create().nullable();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(null)).toBe(null);
  });

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(RapidCheckError);
  });
});

describe('nullish()', () => {
  const schema = StringType.create().nullish();

  test('returns null when a passed value is null', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });

  test('returns undefined when a passed value is undefined', () => {
    expect(schema.parse(undefined)).toBe(undefined);
  });
});

describe('required()', () => {
  const optionalSchema = StringType.create().optional().nullable();
  const schema = optionalSchema.required();

  test('throws an error when a passed value is undefined', () => {
    expect(() => schema.parse(undefined)).toThrow(RapidCheckError);
  });

  test('throws an error when a passed value is null', () => {
    expect(() => schema.parse(null)).toThrow(RapidCheckError);
  });
});

describe('map()', () => {
  test('returns a value from the `mapper` function', () => {
    const schema = StringType.create().map((value) => parseInt(value, 10));
    expect(schema.parse('105')).toBe(105);
  });

  test('rethrows any error from the `mapper` function', () => {
    const error = new RapidCheckError('integer', 'Must be an integer.');
    const schema = StringType.create().map((value) => {
      const int = parseInt(value, 10);
      if (Number.isNaN(int)) {
        throw error;
      }
      return int;
    });
    expect(() => schema.parse('abc')).toThrow(error);
  });
});

describe('notEmpty()', () => {
  test("returns a passed value when it isn't an empty string", () => {
    const schema = StringType.create().notEmpty();
    const value = 'lorem ipsum';
    expect(schema.parse(value)).toBe(value);
  });

  test('throws an error when a passed value is an empty string', () => {
    const schema = StringType.create().notEmpty();
    expect(() => schema.parse('')).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'is required';
    const schema = StringType.create().notEmpty({ message });
    expect(() => schema.parse('')).toThrow(message);
  });
});

describe('minLength()', () => {
  test(
    'returns a passed value when its length is greater than or equal to limit',
    () => {
      const schema = StringType.create().minLength(3);
      const values = [
        'abc',
        '1234',
      ];
      for (const value of values) {
        expect(schema.parse(value)).toBe(value);
      }
    }
  );

  test(
    'throws an error when the length of a passed value is less than limit',
    () => {
      const schema = StringType.create().minLength(3);
      expect(() => schema.parse('12')).toThrow(RapidCheckError);
    }
  );

  test('throws an error with custom error message', () => {
    const message = 'invalid length';
    expect(
      () => StringType.create()
        .minLength(4, { message })
        .parse('')
    ).toThrow(message);
    expect(
      () => StringType.create()
        .minLength(4, { message: () => message })
        .parse('')
    ).toThrow(message);
  });
});

describe('maxLength()', () => {
  test(
    'returns a passed value when its length is less than or equal to limit',
    () => {
      const schema = StringType.create().maxLength(2);
      const values = [
        '',
        'a',
        'ab',
      ];
      for (const value of values) {
        expect(schema.parse(value)).toBe(value);
      }
    }
  );

  test(
    'throws an error when the length of a passed value is greater than limit',
    () => {
      const schema = StringType.create().maxLength(2);
      expect(() => schema.parse('123')).toThrow(RapidCheckError);
    }
  );

  test('throws an error with custom error message', () => {
    const message = 'invalid length';
    expect(
      () => StringType.create()
        .maxLength(2, { message })
        .parse('abc')
    ).toThrow(message);
    expect(
      () => StringType.create()
        .maxLength(2, { message: () => message })
        .parse('abc')
    ).toThrow(message);
  });
});

describe('pattern()', () => {
  test('returns a passed value when it matches to pattern', () => {
    const schema = StringType.create().pattern(/^test$/);
    const value = 'test';
    expect(schema.parse(value)).toBe(value);
  });

  test("throws an error when a passed value doesn't matches to pattern", () => {
    const schema = StringType.create().pattern(/^test$/);
    expect(() => schema.parse('foo')).toThrow(RapidCheckError);
  });

  test('throws an error with custom error message', () => {
    const message = 'invalid value';
    expect(
      () => StringType.create()
        .pattern(/^test$/, { message })
        .parse('foo')
    ).toThrow(message);
    expect(
      () => StringType.create()
        .pattern(/^test$/, { message: () => message })
        .parse('foo')
    ).toThrow(message);
  });
});

describe('custom()', () => {
  const weakPasswordError = new RapidCheckError(
    'weakPassword',
    'Password must contain at least 10 characters.'
  );
  const validatePassword = (value: string) => {
    if (value.length < 10) {
      throw weakPasswordError;
    }
    return value;
  };
  test('returns a value from custom validator', () => {
    const schema = StringType.create().custom(validatePassword);
    const value = 'Qwerty12345';
    expect(schema.parse(value)).toBe(value);
  });

  test(
    "throws an error when a passed value doesn't pass custom validator",
    () => {
      const schema = StringType.create().custom(validatePassword);
      expect(() => schema.parse('Qwerty123')).toThrow(weakPasswordError);
    }
  );
});

describe('patterns', () => {
  describe('alphanumeric', () => {
    const schema = StringType.create().pattern(
      StringType.Patterns.alphanumeric
    );

    describe('valid:', () => {
      const values = ['0', 'a', 'a0', 'abc123xyz456'];
      for (const value of values) {
        test(format(value), () => {
          expect(schema.parse(value)).toBe(value);
        });
      }
    });

    describe('invalid:', () => {
      const values = ['', '-1', ' ', 'abc 123'];
      for (const value of values) {
        test(format(value), () => {
          expect(() => schema.parse(value)).toThrow();
        });
      }
    });
  });

  describe('positiveInteger', () => {
    const schema = StringType.create().pattern(
      StringType.Patterns.positiveInteger
    );

    describe('valid:', () => {
      const values = ['0', '01', '1', '9876543210'];
      for (const value of values) {
        test(format(value), () => {
          expect(schema.parse(value)).toBe(value);
        });
      }
    });

    describe('invalid:', () => {
      const values = ['-1', '1.2', '1e5', 'one', ''];
      for (const value of values) {
        test(format(value), () => {
          expect(() => schema.parse(value)).toThrow();
        });
      }
    });
  });

  describe('integer', () => {
    const schema = StringType.create().pattern(
      StringType.Patterns.integer
    );

    describe('valid:', () => {
      const values = ['0', '01', '1', '+1', '-1', '9876543210'];
      for (const value of values) {
        test(format(value), () => {
          expect(schema.parse(value)).toBe(value);
        });
      }
    });

    describe('invalid:', () => {
      const values = ['1.2', '1e5', 'one', ''];
      for (const value of values) {
        test(format(value), () => {
          expect(() => schema.parse(value)).toThrow();
        });
      }
    });
  });

  describe('float', () => {
    const schema = StringType.create().pattern(
      StringType.Patterns.float
    );

    describe('valid:', () => {
      const values = ['0', '01', '1', '+1', '-1', '34', '34.76'];
      for (const value of values) {
        test(format(value), () => {
          expect(schema.parse(value)).toBe(value);
        });
      }
    });

    describe('invalid:', () => {
      const values = ['1e5', 'one', 'one.two', ''];
      for (const value of values) {
        test(format(value), () => {
          expect(() => schema.parse(value)).toThrow();
        });
      }
    });
  });

  describe('email', () => {
    const schema = StringType.create().pattern(
      StringType.Patterns.email
    );

    describe('valid:', () => {
      const values = [
        'JoHnDoE@test.local',
        'john.doe@test.local.net',
        'john.doe@local.agency',
        'a@a.ac',
        '$A12345@example.com',
        '!foo!bar%abc@example.com',
      ];
      for (const value of values) {
        test(format(value), () => {
          expect(schema.parse(value)).toBe(value);
        });
      }
    });

    describe('invalid:', () => {
      const values = [
        'invalid@',
        'invalid.com',
        '@invalid.com',
        'with@trailing.dot.',
        'ends.with.dot.@example.com',
        'multiple..dots@example.com',
        'ShortTopLevel@domain.c',
        'somename@ｇｍａｉｌ.com',
        'ｍａｉｌ@gmail.com',
        'white space@example.com',
        'whitespace@example.co m',
        'whitespace@exam\u2800ple.com',
        'username@domain.©om',
      ];
      for (const value of values) {
        test(format(value), () => {
          expect(() => schema.parse(value)).toThrow();
        });
      }
    });
  });

  describe('dateISO', () => {
    const schema = StringType.create().pattern(
      StringType.Patterns.dateISO
    );

    describe('valid:', () => {
      const values = [
        '0000-01-01',
        '9999-12-31',
        '2010-08-20',
      ];
      for (const value of values) {
        test(format(value), () => {
          expect(schema.parse(value)).toBe(value);
        });
      }
    });

    describe('invalid:', () => {
      const values = [
        '0000-00-00',
        '20100-08-20',
        '2010-13-20',
        '2010-08-32',
      ];
      for (const value of values) {
        test(format(value), () => {
          expect(() => schema.parse(value)).toThrow();
        });
      }
    });
  });

  describe('timeISO', () => {
    const schema = StringType.create().pattern(
      StringType.Patterns.timeISO
    );

    describe('valid:', () => {
      const timeZones = [
        'Z',
        '+05',
        '+05:30',
        '-05',
        '-05:30',
      ];
      const times = [
        '17:21',
        '17:21:59',
        '17:21:59.914',
      ];
      for (const timeZone of timeZones) {
        for (const time of times) {
          const value = time + timeZone;
          test(format(value), () => {
            expect(schema.parse(value)).toBe(value);
          });
        }
      }
    });

    describe('invalid:', () => {
      const values = [
        '24:00',
        '1721',
        '172159',
        '24:21',
        '17:60',
        '17:21:60.914',
        '17:21:59.1000',
      ];
      for (const value of values) {
        test(format(value), () => {
          expect(() => schema.parse(value)).toThrow();
        });
      }
    });
  });

  describe('dateTimeISO', () => {
    const schema = StringType.create().pattern(
      StringType.Patterns.dateTimeISO
    );

    describe('valid:', () => {
      const timeZones = [
        'Z',
        '+05',
        '+05:30',
        '-05',
        '-05:30',
      ];
      const dateTimes = [
        '2010-08-20T17:21',
        '2010-08-20 17:21',
        '2010-08-20T17:21:59',
        '2010-08-20 17:21:59',
        '2010-08-20T17:21:59.914',
        '2010-08-20 17:21:59.914',
      ];
      for (const timeZone of timeZones) {
        for (const dateTime of dateTimes) {
          const value = dateTime + timeZone;
          test(format(value), () => {
            expect(schema.parse(value)).toBe(value);
          });
        }
      }
    });

    describe('invalid:', () => {
      const values = [
        '201008201721',
        '2010-08-20t17:21',
        '20100-08-20T17:21',
        '2010-13-20T17:21',
        '2010-08-32T17:21',
        '2010-08-20T24:21',
        '2010-08-20T17:60',
        '2010-08-20T17:21:60',
        '2010-08-20T17:21:59.1000',
      ];
      for (const value of values) {
        test(format(value), () => {
          expect(() => schema.parse(value)).toThrow();
        });
      }
    });
  });
});