const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'w-12 h-12 rounded-full',
    card: 'h-48 w-full rounded-2xl',
    image: 'h-40 w-full rounded-xl',
    button: 'h-10 w-24 rounded-xl'
  };

  return (
    <div className={`skeleton ${variants[variant]} ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="title" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <Skeleton variant="text" />
    <Skeleton variant="text" className="w-3/4" />
  </div>
);

export const MediaGridSkeleton = () => (
  <div className="masonry-grid">
    {[...Array(8)].map((_, i) => (
      <Skeleton key={i} variant="image" className="aspect-square" />
    ))}
  </div>
);

export const MessageSkeleton = () => (
  <div className="flex gap-4 p-4">
    <Skeleton variant="avatar" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="w-1/4" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-3/4" />
    </div>
  </div>
);

export default Skeleton;