export function determineType(value: unknown): string {
  const type = typeof value;
  if (type === 'object') {
    if (value === null) {
      return 'null';
    }
    if (Array.isArray(value)) {
      return 'array';
    }
  }
  return type;
}
