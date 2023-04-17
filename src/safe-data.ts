import { InferInput, InferOutput } from './types.js';
import { ValidationError, ValidationErrorOptions } from './validation-error.js';
import { errorCodes } from './error-codes.js';
import {
  ArraySchemaOptions,
  BigIntSchemaOptions,
  BooleanSchemaOptions,
  EnumSchemaOptions,
  InstanceSchemaOptions,
  NumberSchemaOptions,
  ObjectSchemaOptions,
  ShapeSchemaOptions,
  StringSchemaOptions,
  UnionSchemaOptions,
  createArraySchema,
  createBigIntSchema,
  createBooleanSchema,
  createEnumSchema,
  createInstanceSchema,
  createNumberSchema,
  createObjectSchema,
  createShapeSchema,
  createStringSchema,
  createUnionSchema,
} from './schemas/index.js';
import {
  integer,
  isoDate,
  isoDatetime,
  isoTime,
  max,
  maxItems,
  maxLength,
  min,
  minItems,
  minLength,
  nonEmpty,
  numericString,
  pattern,
  range,
} from './rules/index.js';

const schema = {
  boolean: createBooleanSchema,
  number: createNumberSchema,
  bigint: createBigIntSchema,
  string: createStringSchema,
  enum: createEnumSchema,
  array: createArraySchema,
  object: createObjectSchema,
  instanceOf: createInstanceSchema,
  shape: createShapeSchema,
  union: createUnionSchema,
};

const rules = {
  min,
  max,
  minLength,
  maxLength,
  minItems,
  maxItems,
  integer,
  range,
  nonEmpty,
  pattern,
  numericString,
  isoDate,
  isoTime,
  isoDatetime,
};

export {
  ValidationError,
  schema,
  rules,
  errorCodes,
  type InferOutput as InferType,
  type InferInput,
  type InferOutput,
  type ValidationErrorOptions,
  type BooleanSchemaOptions,
  type NumberSchemaOptions,
  type BigIntSchemaOptions,
  type StringSchemaOptions,
  type EnumSchemaOptions,
  type ArraySchemaOptions,
  type ObjectSchemaOptions,
  type InstanceSchemaOptions,
  type ShapeSchemaOptions,
  type UnionSchemaOptions,
};