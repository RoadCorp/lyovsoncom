export function ensureStaticParams<T>(
  params: T[],
  placeholder: T
): [T, ...T[]] {
  return params.length > 0 ? [params[0], ...params.slice(1)] : [placeholder];
}
