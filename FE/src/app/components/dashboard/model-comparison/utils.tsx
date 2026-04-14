
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

export const getDiffIcon = (diff: number, inverse?: boolean) => {
  const isPositive = inverse ? diff < 0 : diff > 0;

  if (Math.abs(diff) < 0.001) {
    return <Minus className="w-4 h-4 text-gray-400" />;
  }

  return isPositive ? (
    <ArrowUp className="w-4 h-4 text-green-600" />
  ) : (
    <ArrowDown className="w-4 h-4 text-red-600" />
  );
};

export const getDiffColor = (diff: number, inverse?: boolean) => {
  const isPositive = inverse ? diff < 0 : diff > 0;

  if (Math.abs(diff) < 0.001) {
    return 'text-gray-500';
  }

  return isPositive
    ? 'text-green-600 dark:text-green-500'
    : 'text-red-600 dark:text-red-500';
};