/** Smooth page transition for every storefront navigation (CSS-driven, runs on the compositor). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
