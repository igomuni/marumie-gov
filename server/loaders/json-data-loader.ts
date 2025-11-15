import 'server-only';
import type { Year } from '@/types/rs-system';
import type { SankeyData } from '@/types/sankey';
import {
  getStatistics,
  getProjectSpendings,
} from '../repositories/json-repository';

/**
 * 指定年度のNivo版サンキー図データを取得（トポロジーベース4列）
 */
export async function loadPreprocessedSankeyTopologyData(year: Year): Promise<SankeyData> {
  const path = `public/data/year_${year}/sankey-main.json`;
  const fs = await import('fs/promises');
  const data = await fs.readFile(path, 'utf-8');
  return JSON.parse(data) as SankeyData;
}

/**
 * 指定年度の統計情報を取得（事前処理済みJSON版）
 */
export async function loadPreprocessedStatistics(year: Year) {
  return getStatistics(year);
}

/**
 * 指定年度の事業別支出データを取得（事前処理済みJSON版、Nivo版モーダル用）
 */
export async function loadPreprocessedProjectSpendings(year: Year) {
  return getProjectSpendings(year);
}
