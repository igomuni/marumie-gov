import { notFound } from 'next/navigation';
import type { Year } from '@/types/rs-system';
import { AVAILABLE_YEARS } from '@/types/rs-system';
import { checkYearDataExists } from '@/server/repositories/json-repository';
import {
  loadPreprocessedSankeyTopologyData,
  loadPreprocessedStatistics,
} from '@/server/loaders/json-data-loader';
import YearSelector from '@/client/components/YearSelector';
import YearPageClient from '@/client/components/YearPageClient';

interface Props {
  params: Promise<{
    year: string;
  }>;
}

export default async function YearPage({ params }: Props) {
  // Next.js 15では params を await する必要がある
  const resolvedParams = await params;

  const year = parseInt(resolvedParams.year, 10) as Year;

  // 年度の妥当性チェック
  if (!AVAILABLE_YEARS.includes(year)) {
    notFound();
  }

  // データの存在チェック
  const exists = await checkYearDataExists(year);
  if (!exists) {
    notFound();
  }

  // Nivo版トポロジーベースサンキー図データと統計情報を取得
  const [sankeyData, statistics] = await Promise.all([
    loadPreprocessedSankeyTopologyData(year),
    loadPreprocessedStatistics(year),
  ]);

  // project-spendings.jsonから総支出と支出先数を計算
  const fs = require('fs').promises;
  const path = require('path');
  const projectSpendingsPath = path.join(process.cwd(), 'public', 'data', `year_${year}`, 'project-spendings.json');
  let totalSpending = 0;
  let spendingCount = 0;

  try {
    const projectSpendingsData = await fs.readFile(projectSpendingsPath, 'utf-8');
    const projectSpendings = JSON.parse(projectSpendingsData);
    const projects = Object.values(projectSpendings) as any[];
    totalSpending = projects.reduce((sum, p) => sum + (p.totalExecution || 0), 0);
    spendingCount = projects.reduce((sum, p) => sum + (p.spendings?.length || 0), 0);
  } catch (error) {
    console.error('Failed to load project-spendings.json:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                行政事業レビュー
              </h1>
              <YearSelector currentYear={year} availableYears={AVAILABLE_YEARS} />
            </div>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">予算:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {(statistics.totalBudget / 1000000000000).toFixed(1)}兆円
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">総支出:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {(totalSpending / 1000000000000).toFixed(1)}兆円
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">事業数:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{statistics.eventCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">支出先数:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{spendingCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <YearPageClient
          year={year}
          displaySankeyData={sankeyData}
          statistics={statistics}
        />
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            データソース:{' '}
            <a
              href="https://www.gyoukaku.go.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              行政事業レビュー
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
  return AVAILABLE_YEARS.map((year) => ({
    year: year.toString(),
  }));
}
