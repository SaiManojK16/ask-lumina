export default function TypingAnimation() {
  return (
    <div className="flex items-center">
      <div className="flex space-x-1.5">
        <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse"></div>
        <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-150"></div>
        <div className="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  );
}
