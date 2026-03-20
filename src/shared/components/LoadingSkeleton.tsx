const LoadingSkeleton = () => (
  <div className="space-y-2">
    {[...Array(3)].map((_, index) => (
      <div key={index} className="h-3 rounded-full bg-white/10" />
    ))}
  </div>
);

export default LoadingSkeleton;
