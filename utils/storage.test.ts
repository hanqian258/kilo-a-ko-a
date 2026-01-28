import { describe, it, expect } from 'vitest';
import { generateSurveyCSV } from './storage';
import { SurveyResponse } from '../types';

describe('generateSurveyCSV', () => {
  it('should generate CSV with headers and data for new fields', () => {
    const surveys: SurveyResponse[] = [
      {
        id: '1',
        date: '2023-10-27T00:00:00.000Z',
        ageGroup: 'over18',
        interestedPrior: 'Yes',
        priorKnowledge: 3,
        topicsLearned: 'Coral bleaching and "sunscreen"',
        experienceRating: 5,
        likedOrWantedMore: 'More videos',
        needsChanging: 'Nothing',
        wantToLearnMore: 'Yes'
      }
    ];

    const csv = generateSurveyCSV(surveys);
    const lines = csv.split('\n');

    // Check headers
    expect(lines[0]).toContain('Interested Prior');
    expect(lines[0]).toContain('Topics Learned (New)');

    // Check data row
    const row = lines[1];
    expect(row).toContain('Yes'); // Interested Prior
    expect(row).toContain('3'); // Prior Knowledge
    expect(row).toContain('"Coral bleaching and ""sunscreen"""'); // Topics Learned (escaped quotes)
    expect(row).toContain('5'); // Experience Rating
    expect(row).toContain('"More videos"');
    expect(row).toContain('"Nothing"');
    expect(row).toContain('Yes'); // Want to learn more
  });

  it('should handle mixed data (old and new fields)', () => {
    const surveys: SurveyResponse[] = [
      {
        id: '1',
        date: '2023-10-27',
        ageGroup: 'over18',
        rating: 4,
        topics: ['sunscreen', 'bleaching'],
        buyingPlan: 'Yes',
        feedback: 'Great!'
      },
      {
        id: '2',
        date: '2023-10-28',
        ageGroup: 'under18',
        interestedPrior: 'No',
        priorKnowledge: 1,
        topicsLearned: 'Nothing',
        experienceRating: 2,
        likedOrWantedMore: 'N/A',
        needsChanging: 'Make it shorter',
        wantToLearnMore: 'No'
      }
    ];

    const csv = generateSurveyCSV(surveys);
    const lines = csv.split('\n');

    // Row 1 (Old data)
    const row1 = lines[1];
    expect(row1).toContain(',"sunscreen; bleaching",'); // Topics Old
    expect(row1).toContain(',"Great!"'); // Feedback Old

    // Row 2 (New data)
    const row2 = lines[2];
    expect(row2).toContain(',No,1,"Nothing",2,"N/A","Make it shorter",No,,,,');
  });
});
