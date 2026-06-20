const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-6 animate-fade-in">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-accent"></div>
      <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
    </div>
    <p className="text-secondary text-sm font-medium tracking-widest uppercase">{text}</p>
  </div>
);

export default LoadingSpinner;