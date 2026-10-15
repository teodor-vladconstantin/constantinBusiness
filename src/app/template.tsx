// Re-mounts on every navigation, so the CSS enter animation plays as the page transition.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
