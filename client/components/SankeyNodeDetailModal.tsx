'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { formatBudget } from '@/client/lib/formatBudget';
import type { Year } from '@/types/rs-system';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  nodeMetadata?: any;
  year: Year;
  availableMinistries: string[];
}

interface SpendingDetail {
  projectId: number;
  ministry: string;
  projectName: string;
  spendingName: string;
  budget: number;
  execution: number;
  spendingCount?: number; // まとめた場合の支出先件数
}

type SortColumn = 'ministry' | 'projectName' | 'spendingName' | 'budget' | 'execution';
type SortDirection = 'asc' | 'desc';

export default function SankeyNodeDetailModal({
  isOpen,
  onClose,
  nodeId,
  nodeName,
  nodeType,
  nodeMetadata,
  year,
  availableMinistries,
}: Props) {
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [groupByProject, setGroupByProject] = useState(true);
  const [data, setData] = useState<SpendingDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>('execution');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [projectNameFilter, setProjectNameFilter] = useState('');
  const [spendingNameFilter, setSpendingNameFilter] = useState('');
  // スマホでは初期状態を折り畳み、PCでは展開
  const [isFilterExpanded, setIsFilterExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  // スマホ判定
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  // ページネーション（支出先まとめOFF時のパフォーマンス対策）
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(1000); // 1ページあたり1000件

  // スマホ判定のリスナー
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ノードタイプに応じた初期設定
  useEffect(() => {
    if (!isOpen) return;

    // デフォルトのフィルタ設定
    if (nodeType === 'ministry') {
      // 府省庁ノードの場合、そのノードの府省庁を選択
      const ministry = nodeMetadata?.ministry || nodeId.replace('ministry_budget_', '').replace('ministry_execution_', '');
      setSelectedMinistries([ministry]);
    } else if (nodeType === 'others') {
      // その他ノードの場合、メタデータから府省庁リストを取得
      const ministryList = nodeMetadata?.ministryList?.map((m: any) => m.name) || [];
      setSelectedMinistries(ministryList);
    } else {
      // 合計ノードの場合、全府省庁を選択
      setSelectedMinistries(availableMinistries);
    }

    // デフォルトのまとめフラグ（常にON）
    setGroupByProject(true);
  }, [isOpen, nodeId, nodeType, nodeMetadata, availableMinistries]);

  // データ読み込み
  useEffect(() => {
    if (!isOpen || selectedMinistries.length === 0) return;

    async function loadData() {
      setLoading(true);
      setData([]); // ローディング開始時にデータをクリアして、古いデータが表示されるのを防ぐ
      try {
        // 年度ごとの全プロジェクトの支出先データを読み込み
        const response = await fetch(`/data/year_${year}/project-spendings.json`);
        const yearlySpendings = await response.json();

        // データを展開
        const details: SpendingDetail[] = [];

        // 選択された府省庁のプロジェクトのみを処理
        Object.values(yearlySpendings).forEach((project: any) => {
          if (!selectedMinistries.includes(project.ministry)) return;

          if (groupByProject) {
            // 事業名でまとめる
            details.push({
              projectId: project.projectId,
              ministry: project.ministry,
              projectName: project.projectName,
              spendingName: '', // まとめる場合は空
              budget: project.budget || 0,
              execution: project.totalExecution || 0,
              spendingCount: project.spendings?.length || 0,
            });
          } else {
            // 支出先ごとに展開
            if (project.spendings && project.spendings.length > 0) {
              // 支出先がある場合：各支出先を展開
              for (const sp of project.spendings) {
                details.push({
                  projectId: project.projectId,
                  ministry: project.ministry,
                  projectName: project.projectName,
                  spendingName: sp.name,
                  budget: project.budget || 0,
                  execution: sp.amount || 0,
                });
              }
            } else {
              // 支出先がない場合：支出先なしとして1行追加
              details.push({
                projectId: project.projectId,
                ministry: project.ministry,
                projectName: project.projectName,
                spendingName: '（支出先データなし）',
                budget: project.budget || 0,
                execution: 0,
              });
            }
          }
        });

        setData(details);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, selectedMinistries, groupByProject, year]);

  // フィルタリングとソート処理
  const sortedData = useMemo(() => {
    // テキストフィルタリング
    let filtered = data.filter((item) => {
      const matchProject = projectNameFilter === '' || item.projectName.toLowerCase().includes(projectNameFilter.toLowerCase());
      const matchSpending = spendingNameFilter === '' || item.spendingName.toLowerCase().includes(spendingNameFilter.toLowerCase());
      return matchProject && matchSpending;
    });

    // ソート
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'ministry':
          aValue = a.ministry;
          bValue = b.ministry;
          break;
        case 'projectName':
          aValue = a.projectName;
          bValue = b.projectName;
          break;
        case 'spendingName':
          aValue = a.spendingName || '';
          bValue = b.spendingName || '';
          break;
        case 'budget':
          aValue = a.budget;
          bValue = b.budget;
          break;
        case 'execution':
          aValue = a.execution;
          bValue = b.execution;
          break;
        default:
          return 0;
      }

      // 文字列の場合はlocaleCompareを使用
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue, 'ja')
          : bValue.localeCompare(aValue, 'ja');
      }

      // 数値の場合は通常の比較
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  }, [data, sortColumn, sortDirection, projectNameFilter, spendingNameFilter]);

  // ページネーション用のデータ分割
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  // 総ページ数
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // フィルタ変更時にページを1にリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [projectNameFilter, spendingNameFilter, sortColumn, sortDirection, groupByProject]);

  // ソートハンドラー
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // 同じカラムをクリックした場合は方向を反転
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 新しいカラムの場合はdesc（降順）から開始
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // ソートインジケーター
  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return '⇅';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 府省庁トグル
  const toggleMinistry = (ministry: string) => {
    setSelectedMinistries((prev) =>
      prev.includes(ministry) ? prev.filter((m) => m !== ministry) : [...prev, ministry]
    );
  };

  // 全選択/全解除
  const toggleAllMinistries = () => {
    if (selectedMinistries.length === availableMinistries.length) {
      setSelectedMinistries([]);
    } else {
      setSelectedMinistries(availableMinistries);
    }
  };

  // ドロップダウン表示テキスト
  const getDropdownDisplayText = () => {
    if (selectedMinistries.length === 0) return '表示対象なし';
    if (selectedMinistries.length === 1) return selectedMinistries[0];
    return `選択中 (${selectedMinistries.length}/${availableMinistries.length})`;
  };

  // 全体統計とフィルター後統計の計算
  const [allYearlyData, setAllYearlyData] = useState<any>(null);

  // 全データ読み込み（統計用）
  useEffect(() => {
    if (!isOpen) return;

    async function loadAllData() {
      try {
        const response = await fetch(`/data/year_${year}/project-spendings.json`);
        const data = await response.json();
        setAllYearlyData(data);
      } catch (error) {
        console.error('Failed to load all data:', error);
      }
    }
    loadAllData();
  }, [isOpen, year]);

  // 全体統計（フィルター前）
  const overallStatistics = useMemo(() => {
    if (!allYearlyData) return { totalBudget: 0, projectCount: 0, totalExecution: 0, spendingCount: 0 };

    const projects = Object.values(allYearlyData) as any[];
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalExecution = projects.reduce((sum, p) => sum + (p.totalExecution || 0), 0);
    const spendingCount = projects.reduce((sum, p) => sum + (p.spendings?.length || 0), 0);

    return {
      totalBudget,
      projectCount: projects.length,
      totalExecution,
      spendingCount,
    };
  }, [allYearlyData]);

  // フィルター後統計
  const filteredStatistics = useMemo(() => {
    const uniqueProjects = new Set(data.map((d) => d.projectId));

    // 予算額は重複を避けるため、プロジェクトIDごとに1回だけカウント
    const projectBudgetMap = new Map<number, number>();
    data.forEach((d) => {
      if (!projectBudgetMap.has(d.projectId)) {
        projectBudgetMap.set(d.projectId, d.budget);
      }
    });
    const totalBudget = Array.from(projectBudgetMap.values()).reduce((sum, budget) => sum + budget, 0);

    // 支出額の計算
    const totalExecution = data.reduce((sum, d) => sum + d.execution, 0);

    // 支出先数の計算
    const spendingCount = groupByProject
      ? data.reduce((sum, d) => sum + (d.spendingCount || 0), 0)
      : data.length;

    return {
      totalBudget,
      projectCount: uniqueProjects.size,
      totalExecution,
      spendingCount,
    };
  }, [data, groupByProject]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-bold">予算と支出詳細</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          {/* 全体統計 */}
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">総予算: </span>
              <span className="text-gray-900 dark:text-white">{formatBudget(overallStatistics.totalBudget)}</span>
            </div>
            <div>
              <span className="font-medium">事業数: </span>
              <span className="text-gray-900 dark:text-white">{overallStatistics.projectCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="font-medium">総支出: </span>
              <span className="text-gray-900 dark:text-white">{formatBudget(overallStatistics.totalExecution)}</span>
            </div>
            <div>
              <span className="font-medium">支出先数: </span>
              <span className="text-gray-900 dark:text-white">{overallStatistics.spendingCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* フィルタ設定 */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          {/* 折り畳みヘッダー */}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">フィルタ設定</span>
            <span className="text-gray-500 dark:text-gray-400 text-lg">
              {isFilterExpanded ? '▼' : '▶'}
            </span>
          </button>

          {/* フィルタコンテンツ */}
          {isFilterExpanded && (
            <div className="px-4 pb-4">
              <div className="flex flex-col gap-3">
                {/* 1行目: 府省庁フィルタと支出先まとめチェックボックス */}
                <div className="flex items-center gap-3 flex-wrap">
              {/* 府省庁フィルタ（カスタムドロップダウン） */}
              <div className="w-64 relative" ref={dropdownRef}>
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">府省庁</label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-3 py-0 text-sm text-left border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                >
                  <span className="truncate">{getDropdownDisplayText()}</span>
                  <span className="ml-2 text-gray-400 text-lg">▾</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-64 overflow-y-auto">
                    {/* 全選択/全解除 */}
                    <label className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedMinistries.length === availableMinistries.length}
                        onChange={toggleAllMinistries}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium">すべて選択/解除</span>
                    </label>

                    {/* 府省庁リスト */}
                    {availableMinistries.map((ministry) => (
                      <label
                        key={ministry}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMinistries.includes(ministry)}
                          onChange={() => toggleMinistry(ministry)}
                          className="mr-2"
                        />
                        <span className="text-sm">{ministry}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 支出先まとめチェックボックス */}
              <div className="flex items-center gap-2 mt-5">
                <input
                  type="checkbox"
                  id="groupByProject"
                  checked={groupByProject}
                  onChange={(e) => setGroupByProject(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="groupByProject" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  支出先をまとめる
                </label>
              </div>
            </div>

            {/* 2行目: テキスト検索 */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* 事業名フィルタ */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">事業名</label>
                <input
                  type="text"
                  value={projectNameFilter}
                  onChange={(e) => setProjectNameFilter(e.target.value)}
                  placeholder="事業名で検索"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 支出先フィルタ */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium mb-1 text-gray-700 dark:text-gray-300">支出先</label>
                <input
                  type="text"
                  value={spendingNameFilter}
                  onChange={(e) => setSpendingNameFilter(e.target.value)}
                  placeholder="支出先で検索"
                  disabled={groupByProject}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* データテーブル */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">読み込み中...</div>
          ) : selectedMinistries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              表示対象なし
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 z-[5] shadow-sm">
                  <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                    <th
                      className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
                      onClick={() => handleSort('ministry')}
                    >
                      府省庁 {getSortIndicator('ministry')}
                    </th>
                    <th
                      className="px-4 py-2 text-left cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleSort('projectName')}
                    >
                      事業名 {getSortIndicator('projectName')}
                    </th>
                    <th
                      className={`px-4 py-2 text-left ${
                        groupByProject ? 'whitespace-nowrap' : ''
                      } ${groupByProject ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                      onClick={() => !groupByProject && handleSort('spendingName')}
                    >
                      {groupByProject ? '支出先件数' : `支出先 ${getSortIndicator('spendingName')}`}
                    </th>
                    <th
                      className="px-4 py-2 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
                      onClick={() => handleSort('budget')}
                    >
                      予算 {getSortIndicator('budget')}
                    </th>
                    <th
                      className="px-4 py-2 text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap"
                      onClick={() => handleSort('execution')}
                    >
                      支出 {getSortIndicator('execution')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2 whitespace-nowrap">{item.ministry}</td>
                      <td className="px-4 py-2">{item.projectName}</td>
                      <td className={`px-4 py-2 ${groupByProject ? 'whitespace-nowrap' : ''}`}>
                        {groupByProject
                          ? `${item.spendingCount || 0}件`
                          : item.spendingName}
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">{formatBudget(item.budget)}</td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">{formatBudget(item.execution)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ページネーション（1000件以上の場合のみ表示） */}
              {totalPages > 1 && (
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {sortedData.length.toLocaleString()}件中 {((currentPage - 1) * itemsPerPage + 1).toLocaleString()} - {Math.min(currentPage * itemsPerPage, sortedData.length).toLocaleString()}件を表示
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      最初
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      前へ
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      次へ
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      最後
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            {/* フィルター後統計 */}
            <div className={`flex ${isMobile ? 'gap-3 flex-wrap' : 'gap-6'} text-sm text-gray-600 dark:text-gray-400`}>
              <div>
                <span className="font-medium">予算額: </span>
                <span className="text-gray-900 dark:text-white">{formatBudget(filteredStatistics.totalBudget)}</span>
              </div>
              <div>
                <span className="font-medium">事業数: </span>
                <span className="text-gray-900 dark:text-white">{filteredStatistics.projectCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium">支出額: </span>
                <span className="text-gray-900 dark:text-white">{formatBudget(filteredStatistics.totalExecution)}</span>
              </div>
              <div>
                <span className="font-medium">支出先数: </span>
                <span className="text-gray-900 dark:text-white">{filteredStatistics.spendingCount.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`${
                isMobile
                  ? 'w-10 h-10 flex items-center justify-center'
                  : 'px-4 py-2'
              } bg-blue-600 text-white rounded hover:bg-blue-700 flex-shrink-0`}
              title="閉じる"
            >
              {isMobile ? '✕' : '閉じる'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
