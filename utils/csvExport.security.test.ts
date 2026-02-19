import { describe, it, expect } from 'vitest';
import { escapeCsvField } from './csvExport';

describe('escapeCsvField Security', () => {
  it('escapes fields starting with = (Formula Injection)', () => {
    expect(escapeCsvField('=1+1')).toBe("'=1+1");
  });

  it('escapes fields starting with +', () => {
    expect(escapeCsvField('+1+1')).toBe("'+1+1");
  });

  it('escapes fields starting with -', () => {
    expect(escapeCsvField('-1+1')).toBe("'-1+1");
  });

  it('escapes fields starting with @', () => {
    // Contains comma, so it gets quoted
    expect(escapeCsvField('@SUM(1,1)')).toBe(`"'@SUM(1,1)"`);
  });

  it('escapes fields starting with tab', () => {
    expect(escapeCsvField('\tHello')).toBe("'\tHello");
  });

  it('escapes fields starting with carriage return', () => {
    // Contains \r, so it gets quoted
    expect(escapeCsvField('\rHello')).toBe(`"'\rHello"`);
  });

  it('escapes fields with injection AND special characters', () => {
    expect(escapeCsvField('=1,1')).toBe(`"'=1,1"`);
  });
});
