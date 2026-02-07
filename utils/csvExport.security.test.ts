import { describe, it, expect } from 'vitest';
import { escapeCsvField } from './csvExport';

describe('escapeCsvField - Security (CSV Injection)', () => {
  it('prepends single quote to fields starting with =', () => {
    expect(escapeCsvField('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
  });

  it('prepends single quote to fields starting with +', () => {
    expect(escapeCsvField('+1+2')).toBe("'+1+2");
  });

  it('prepends single quote to fields starting with -', () => {
    expect(escapeCsvField('-1-2')).toBe("'-1-2");
  });

  it('prepends single quote to fields starting with @', () => {
    expect(escapeCsvField('@SUM(A1:A10)')).toBe("'@SUM(A1:A10)");
  });

  it('handles dangerous characters combined with commas (needs quotes)', () => {
    // Original: =SUM(A1), test
    // Expected: "'=SUM(A1), test" -> then wrapped in quotes because of comma -> "''=SUM(A1), test"
    // Wait, let's verify standard behavior.
    // If I have `'=SUM(A1), test` (starts with '), Excel treats it as text.
    // So the CSV field should be: "'=SUM(A1), test" (if not quoted)
    // But since it has a comma, it MUST be quoted.
    // So it becomes `"'=SUM(A1), test"`
    expect(escapeCsvField('=SUM(A1), test')).toBe('"\'' + '=SUM(A1), test"');
  });

  it('handles dangerous characters combined with quotes', () => {
    // Original: =SUM("A1")
    // Safe: '=SUM("A1")
    // Escaped for CSV: "'=SUM(""A1"")"
    expect(escapeCsvField('=SUM("A1")')).toBe('"\'' + '=SUM(""A1"")"');
  });
});
