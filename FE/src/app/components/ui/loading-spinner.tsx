export default function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <div
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-2 border-gray-300 border-t-gray-800 dark:border-gray-700 dark:border-t-white"
      />
    </div>
  );
}
