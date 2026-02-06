import { CoralImage } from '../types';

/**
 * Formats a date string into YYYY-MM-DD HH:mm format.
 * Falls back to original string if parsing fails.
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const pad = (num: number) => num.toString().padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * Escapes a CSV field content.
 * Wraps in quotes if it contains commas, quotes, or newlines.
 * Escapes existing quotes by doubling them.
 */
export const escapeCsvField = (field: string | number | boolean | undefined | null): string => {
  if (field === undefined || field === null) {
    return '';
  }

  let stringField = String(field);

  // Prevent CSV Injection (Formula Injection)
  const firstChar = stringField.charAt(0);
  if (['=', '+', '-', '@'].includes(firstChar)) {
    stringField = `'${stringField}`;
  }

  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n') || stringField.includes('\r')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
};

/**
 * Derives the latest health status from the coral image milestones.
 * Returns the status of the most recent milestone, or 'Unknown' if no milestones exist.
 */
export const getLatestStatus = (image: CoralImage): string => {
  if (!image.milestones || image.milestones.length === 0) {
    return 'Unknown';
  }

  // Sort milestones by date descending to get the latest one
  const sortedMilestones = [...image.milestones].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return sortedMilestones[0].status;
};

/**
 * Generates a CSV string from an array of CoralImage objects.
 * Columns: Date, Location, Coral Type, Health Status, Notes
 */
export const generateCoralCSV = (images: CoralImage[]): string => {
  const headers = ['Date', 'Location', 'Coral Type', 'Health Status', 'Notes'];

  const rows = images.map(image => {
    return [
      escapeCsvField(formatDate(image.date)),
      escapeCsvField(image.location),
      escapeCsvField(image.scientificName || ''),
      escapeCsvField(getLatestStatus(image)),
      escapeCsvField(image.description)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

/**
 * Triggers a browser download for the given content.
 */
export const triggerDownload = (filename: string, content: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  // Create download link
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
