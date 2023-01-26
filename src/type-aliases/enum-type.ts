import { type ResultMapper } from '../types.js';
import { TypeAlias } from './type-alias.js';
import { ParseError } from '../parse-error.js';
import { requiredError } from './error-messages.js';

type EnumTypeOptions<T> = {
  values: readonly T[];
  isOptional: boolean;
  isNullable: boolean;
  typeError?: string;
  requiredError?: string;
};

export type EnumParams = {
  typeError?: string;
  requiredError?: string;
};

export class EnumType<
  Value,
  Result,
> extends TypeAlias<Value, Result> {
  protected readonly options: EnumTypeOptions<Value>;
  protected readonly mapper: ResultMapper | undefined;

  protected constructor(
    options: EnumTypeOptions<Value>,
    mapper: ResultMapper | undefined
  ) {
    super();
    this.options = options;
    this.mapper = mapper;
  }

  static ErrorCodes = {
    type: 'ENUM_TYPE',
    required: 'ENUM_REQUIRED',
  } as const;

  static create<Value, Params extends EnumParams>(
    values: readonly Value[],
    params?: Params
  ): EnumType<Value, Value> {
    return new EnumType({
      values,
      isOptional: false,
      isNullable: false,
      typeError: params?.typeError,
      requiredError: params?.requiredError,
    }, undefined);
  }

  static formatValues(values: unknown[] | readonly unknown[]): string {
    const formatted: string[] = [];
    for (const value of values) {
      if (typeof value === 'string') {
        formatted.push(`'${value}'`);
      } else if (typeof value === 'bigint') {
        formatted.push(`${value}n`);
      } else if (Array.isArray(value) || typeof value === 'object') {
        formatted.push(JSON.stringify(value));
      } else {
        formatted.push(String(value));
      }
    }
    return `[${formatted.join(', ')}]`;
  }

  optional(): EnumType<Value, Result | undefined> {
    return new EnumType(
      { ...this.options, isOptional: true },
      this.mapper
    );
  }

  nullable(): EnumType<Value, Result | null> {
    return new EnumType(
      { ...this.options, isNullable: true },
      this.mapper
    );
  }

  nullish(): EnumType<Value, Result | null | undefined> {
    return new EnumType(
      { ...this.options, isOptional: true, isNullable: true },
      this.mapper
    );
  }

  required(): EnumType<Value, Exclude<Result, null | undefined>> {
    return new EnumType(
      { ...this.options, isOptional: false, isNullable: false },
      this.mapper
    );
  }

  map<Mapped>(mapper: (value: Value) => Mapped): EnumType<Value, Mapped> {
    return new EnumType({ ...this.options }, mapper);
  }

  parse(value: unknown): Result;
  parse(value: unknown): unknown {
    const { ErrorCodes } = EnumType;
    const { options, mapper } = this;

    if (value == null) {
      if (value === undefined && options.isOptional) {
        return value;
      }
      if (value === null && options.isNullable) {
        return value;
      }
      throw new ParseError(
        ErrorCodes.required,
        options.requiredError || requiredError
      );
    }

    const values = options.values;
    if (!options.values.includes(value as Value)) {
      throw new ParseError(
        ErrorCodes.type,
        options.typeError || `Must be one of ${EnumType.formatValues(values)}`,
        { params: { values } }
      );
    }

    if (typeof mapper === 'function') {
      try {
        return mapper(value);
      } catch (err) {
        throw ParseError.of(err);
      }
    }

    return value;
  }
}
