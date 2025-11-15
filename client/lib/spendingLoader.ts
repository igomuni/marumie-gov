/**
 * 支出先データをクライアント側で動的にロード
 */
import type { Year } from '@/types/rs-system';

export interface SpendingData {
  [projectId: string]: {
    projectId: number;
    projectName: string;
    budget: number;
    top20Spendings: Array<{ name: string; amount: number }>;
    othersTotal: number;
    totalSpendingAmount: number;
    unknownAmount: number;
  };
}

// キャッシュ用
const spendingCache = new Map<Year, SpendingData>();

/**
 * 指定年度の支出先データをロード
 */
export async function loadSpendingData(year: Year): Promise<SpendingData> {
  // キャッシュから取得
  if (spendingCache.has(year)) {
    return spendingCache.get(year)!;
  }

  // ファイルからロード
  const response = await fetch(`/data/year_${year}/project-spendings.json`);
  if (!response.ok) {
    throw new Error(`Failed to load spending data for year ${year}`);
  }

  const data: SpendingData = await response.json();

  // キャッシュに保存
  spendingCache.set(year, data);

  return data;
}

/**
 * 特定の事業の支出先データを取得
 */
export async function getProjectSpendings(
  year: Year,
  projectId: number
): Promise<{ name: string; amount: number }[]> {
  const data = await loadSpendingData(year);
  const projectData = data[projectId];

  if (!projectData) {
    return [];
  }

  return projectData.top20Spendings || [];
}
