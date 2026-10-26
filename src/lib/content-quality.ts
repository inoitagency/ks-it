/** Reject obvious test fixtures. This is a guard, not school approval of factual accuracy. */
export function isPlaceholderContent(title: string, description = ""): boolean {
  const text = title.trim();
  return !text || /^(?:test(?:ing)?|dummy|sample|placeholder)(?:$|[\s:_-]|\d)/i.test(text) ||
    /^(?:hello|hey|hi)[!.\s]*$/i.test(text) ||
    /\b(?:lorem ipsum|dolor sit|consequatur|aliquip|eligend)\b/i.test(`${text} ${description}`) ||
    /^(?:chal\s+h+t+|qwerty\w*)[!.\s]*$/i.test(description.trim());
}
