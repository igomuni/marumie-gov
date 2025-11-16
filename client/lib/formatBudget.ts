/**
 * 金額を適切な単位（兆円/億円/万円）でフォーマット
 * 数値部分に3桁ごとのカンマを付与
 */
export function formatBudget(amount: number): string {
  const absAmount = Math.abs(amount);

  // 1兆円以上
  if (absAmount >= 1000000000000) {
    const cho = amount / 1000000000000;
    return `${cho.toLocaleString('ja-JP', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}兆円`;
  }

  // 1億円以上
  if (absAmount >= 100000000) {
    const oku = amount / 100000000;
    return `${oku.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}億円`;
  }

  // 1万円以上
  if (absAmount >= 10000) {
    const man = amount / 10000;
    return `${man.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}万円`;
  }

  // それ以下
  return `${amount.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}円`;
}
