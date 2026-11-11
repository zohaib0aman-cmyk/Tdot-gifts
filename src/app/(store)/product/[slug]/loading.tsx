export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading gift">
      <div className="skeleton my-5 h-4 w-60 rounded" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="skeleton aspect-[4/5] rounded-[2rem]" />
        <div className="space-y-5">
          <div className="skeleton h-5 w-32 rounded-full" />
          <div className="skeleton h-12 w-4/5 rounded-xl" />
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-9 w-40 rounded-xl" />
          <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 w-28 rounded-2xl" />)}</div>
          <div className="skeleton h-40 rounded-3xl" />
          <div className="skeleton h-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}
