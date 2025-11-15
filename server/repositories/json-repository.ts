import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import type { Year } from '@/types/rs-system';
import { AVAILABLE_YEARS } from '@/types/rs-system';

/**
 * 事前処理済みデータのベースパス
 */
const DATA_BASE_PATH = path.join(process.cwd(), 'public', 'data');

/**
 * JSONファイルを読み込む
 */
async function readJSON<T>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading JSON file ${filePath}:`, error);
    throw new Error(`Failed to read JSON file: ${filePath}`);
  }
}

/**
 * 年度のディレクトリが存在するか確認
 */
export async function checkYearDataExists(year: Year): Promise<boolean> {
  try {
    const dirPath = path.join(DATA_BASE_PATH, `year_${year}`);
    await fs.access(dirPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 統計情報を取得
 */
export async function getStatistics(year: Year) {
  const filePath = path.join(DATA_BASE_PATH, `year_${year}`, 'statistics.json');
  return readJSON<{
    totalBudget: number;
    totalExecution: number;
    averageExecutionRate: number;
    eventCount: number;
    ministryCount: number;
  }>(filePath);
}

/**
 * 事業別支出データを取得（Nivo版モーダル用）
 */
export async function getProjectSpendings(year: Year) {
  const filePath = path.join(DATA_BASE_PATH, `year_${year}`, 'project-spendings.json');
  return readJSON<Record<number, {
    projectId: number;
    projectName: string;
    budget: number;
    top20Spendings: Array<{ name: string; amount: number }>;
    othersTotal: number;
    totalSpendingAmount: number;
    unknownAmount: number;
  }>>(filePath);
}

/**
 * 利用可能な年度のリストを取得
 */
export async function getAvailableYears(): Promise<Year[]> {
  const years: Year[] = [];

  for (const year of AVAILABLE_YEARS) {
    if (await checkYearDataExists(year)) {
      years.push(year);
    }
  }

  return years;
}
