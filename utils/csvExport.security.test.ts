import { describe, it, expect } from 'vitest';
import { escapeCsvField } from './csvExport';

describe('escapeCsvField - Security', () => {
  it('prepends a single quote to strings starting with "="', () => {
    expect(escapeCsvField('=1+1')).toBe("'=1+1");
  });

  it('prepends a single quote to strings starting with "+"', () => {
    expect(escapeCsvField('+1+1')).toBe("'+1+1");
  });

  it('prepends a single quote to strings starting with "-"', () => {
    expect(escapeCsvField('-1+1')).toBe("'-1+1");
  });

  it('prepends a single quote to strings starting with "@"', () => {
    expect(escapeCsvField('@function()')).toBe("'@function()");
  });

  it('prepends a single quote even if content needs quoting', () => {
    expect(escapeCsvField('=1,2')).toBe('"\'' + '=1,2"');
  });

  it('does NOT prepend a single quote to normal strings', () => {
    expect(escapeCsvField('normal string')).toBe('normal string');
  });

  it('does NOT prepend a single quote to empty strings', () => {
    expect(escapeCsvField('')).toBe('');
  });
});
