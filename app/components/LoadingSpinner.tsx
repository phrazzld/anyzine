export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-16">
      {/* we can use a tailwind spinner */}
      <div className="border-4 border-black border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
    </div>
  );
}
