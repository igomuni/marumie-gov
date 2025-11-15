'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SpendingTimeSeries } from '@/types/report';

interface SpendingTimeSeriesChartProps {
  spendings: SpendingTimeSeries[];
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#14b8a6',
];

export function SpendingTimeSeriesChart({
  spendings,
}: SpendingTimeSeriesChartProps) {
  const [selectedSpendings, setSelectedSpendings] = useState<Set<string>>(
    new Set(spendings.slice(0, 5).map((e) => e.name))
  );

  // 年度のユニオン
  const allYears = Array.from(
    new Set(
      spendings.flatMap((e) => Object.keys(e.yearlyAmounts).map(Number))
    )
  ).sort();

  // チャートデータ生成
  const chartData = allYears.map((year) => {
    const dataPoint: any = { year };

    spendings.forEach((exp) => {
      if (selectedSpendings.has(exp.name)) {
        dataPoint[exp.name] = (exp.yearlyAmounts[year] || 0) / 100000000;
      }
    });

    return dataPoint;
  });

  const handleToggle = (name: string) => {
    setSelectedSpendings((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        支出先別推移
      </h2>

      {/* チェックボックス */}
      <div className="mb-6 space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          表示する支出先を選択:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {spendings.map((exp, index) => (
            <label
              key={exp.name}
              className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedSpendings.has(exp.name)}
                onChange={() => handleToggle(exp.name)}
                className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div
                className="w-4 h-4 mr-2 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {exp.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* グラフ */}
      {selectedSpendings.size > 0 ? (
        <div className="w-full" style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="dark:opacity-20"
              />
              <XAxis
                dataKey="year"
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                label={{
                  value: '億円',
                  angle: -90,
                  position: 'insideLeft',
                  className: 'text-gray-600 dark:text-gray-400',
                }}
                stroke="currentColor"
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip
                formatter={(value: number) => `${Number(value).toFixed(1)}億円`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{ color: '#111827' }}
              />
              <Legend />
              {spendings.map(
                (exp, index) =>
                  selectedSpendings.has(exp.name) && (
                    <Line
                      key={exp.name}
                      type="monotone"
                      dataKey={exp.name}
                      name={exp.name}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400 py-8">
          支出先を選択してください
        </p>
      )}
    </section>
  );
}
