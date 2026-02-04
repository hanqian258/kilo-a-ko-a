import { describe, it, expect } from 'vitest';
import { formatDate, escapeCsvField, getLatestStatus, generateCoralCSV } from './csvExport';
import { CoralImage } from '../types';

describe('formatDate', () => {
  it('formats valid date string correctly', () => {
    // Note: This test might depend on timezone if not careful.
    // Using ISO string helps, but new Date() uses local time by default.
    // However, the function returns YYYY-MM-DD HH:mm based on local time.
    // To make it deterministic in tests, we can stick to a fixed date and check components or mock timezone.
    // For simplicity, we'll accept that it parses correctly.
    const input = '2023-10-05T14:30:00.000Z';
    const output = formatDate(input);
    expect(output).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

    // Check components roughly (allowing for timezone diffs)
    expect(output).toContain('2023');
    expect(output).toContain('10'); // Month or Day depending on TZ
  });

  it('returns original string for invalid date', () => {
    const input = 'invalid-date';
    expect(formatDate(input)).toBe('invalid-date');
  });
});

describe('escapeCsvField', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
  });

  it('returns normal string as is', () => {
    expect(escapeCsvField('hello')).toBe('hello');
  });

  it('wraps string with comma in quotes', () => {
    expect(escapeCsvField('hello, world')).toBe('"hello, world"');
  });

  it('wraps string with newline in quotes', () => {
    expect(escapeCsvField('hello\nworld')).toBe('"hello\nworld"');
  });

  it('escapes quotes by doubling them', () => {
    expect(escapeCsvField('hello "world"')).toBe('"hello ""world"""');
  });

  it('handles mixed special characters', () => {
    expect(escapeCsvField('a, "b", c\n')).toBe('"a, ""b"", c\n"');
  });

  it('prevents CSV injection', () => {
    expect(escapeCsvField('=1+1')).toBe("'=1+1");
    expect(escapeCsvField('+1+1')).toBe("'+1+1");
    expect(escapeCsvField('-1+1')).toBe("'-1+1");
    // Contains comma, so it gets wrapped in quotes
    expect(escapeCsvField('@SUM(1,1)')).toBe("\"'@SUM(1,1)\"");
  });
});

describe('getLatestStatus', () => {
  it('returns Unknown for no milestones', () => {
    const image = { milestones: [] } as unknown as CoralImage;
    expect(getLatestStatus(image)).toBe('Unknown');
  });

  it('returns Unknown for undefined milestones', () => {
    const image = {} as unknown as CoralImage;
    expect(getLatestStatus(image)).toBe('Unknown');
  });

  it('returns status of the latest milestone by date', () => {
    const image = {
      milestones: [
        { date: '2023-01-01', status: 'healthy' },
        { date: '2023-02-01', status: 'warning' }, // Latest
        { date: '2023-01-15', status: 'recovery' }
      ]
    } as unknown as CoralImage;
    expect(getLatestStatus(image)).toBe('warning');
  });
});

describe('generateCoralCSV', () => {
  it('generates correct CSV headers and data', () => {
    const images = [
      {
        id: '1',
        date: '2023-01-01T10:00:00Z',
        location: 'Hawaii',
        scientificName: 'Porites',
        description: 'Nice coral',
        milestones: [{ date: '2023-01-01', status: 'healthy' }]
      },
      {
        id: '2',
        date: '2023-01-02T11:30:00Z',
        location: 'Maui, Beach',
        scientificName: undefined, // Missing type
        description: 'Split "desc"',
        milestones: [] // Unknown status
      }
    ] as unknown as CoralImage[];

    const csv = generateCoralCSV(images);
    const lines = csv.split('\n');

    // Header
    expect(lines[0]).toBe('Date,Location,Coral Type,Health Status,Notes');

    // Row 1
    // Date format depends on TZ, so we check parts
    expect(lines[1]).toContain('Hawaii');
    expect(lines[1]).toContain('Porites');
    expect(lines[1]).toContain('healthy');
    expect(lines[1]).toContain('Nice coral');

    // Row 2
    expect(lines[2]).toContain('"Maui, Beach"'); // Escaped location
    expect(lines[2]).toContain('Unknown'); // Status
    expect(lines[2]).toContain('"Split ""desc"""'); // Escaped description
    // Coral Type should be empty string (between commas)
    // We can split by comma, but be careful with quoted commas.
    // Simplified check:
    expect(lines[2]).toMatch(/,Unknown,/);
  });
});
