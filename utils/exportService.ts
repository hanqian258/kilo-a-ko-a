import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';
import { escapeCsvField, triggerDownload } from './csvExport';

export const getSurveyCount = async (): Promise<number> => {
  try {
    const coll = collection(db, 'survey_responses');
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching survey count:", error);
    return 0;
  }
};

export const downloadSurveyData = async () => {
  try {
    const coll = collection(db, 'survey_responses');
    const snapshot = await getDocs(coll);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (docs.length === 0) {
      alert("No survey data found to export.");
      return;
    }

    // Dynamic headers: collect all unique keys from all documents
    const allKeys = new Set<string>();
    docs.forEach(doc => {
      Object.keys(doc).forEach(key => allKeys.add(key));
    });
    // Sort keys for consistent order, putting 'id' and 'date' first if they exist
    const sortedKeys = Array.from(allKeys).sort((a, b) => {
      if (a === 'id') return -1;
      if (b === 'id') return 1;
      if (a === 'date') return -1;
      if (b === 'date') return 1;
      return a.localeCompare(b);
    });

    const headers = sortedKeys;

    const rows = docs.map(doc => {
      return sortedKeys.map(key => {
        // Access safely
        const value = (doc as any)[key];
        return escapeCsvField(value);
      }).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const filename = `kilo_data_export_${new Date().toISOString().split('T')[0]}.csv`;

    triggerDownload(filename, csvContent);

  } catch (error) {
    console.error("Error exporting survey data:", error);
    alert("Failed to export data. See console for details.");
  }
};
