import { getDb, saveDb } from '../config/db';

export async function getArchivedHistory() {
  const dbData = await getDb();
  return {
    status: 200,
    data: {
      summaries: dbData.monthlySummaries || [],
    },
  };
}
