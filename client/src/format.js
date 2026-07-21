export function formatDiagnosisValue(item) {
  const v = item.value;
  switch (item.format) {
    case 'ratio':
      return `${v}x`;
    case 'signed':
      return v > 0 ? `+${v}` : `${v}`;
    case 'number':
      return `${v}`;
    case 'currency':
    default:
      return `$${v.toLocaleString()}`;
  }
}
