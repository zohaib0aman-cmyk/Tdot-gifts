import Link from "next/link";
import type { ReactNode } from "react";

/** Minimal, safe markdown (## headings, - lists, **bold**, [links](/x)) for admin-editable policies. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("**")) out.push(<strong key={k++}>{t.slice(2, -2)}</strong>);
    else {
      const [, label, href] = /\[([^\]]+)\]\(([^)]+)\)/.exec(t)!;
      const safe = href.startsWith("/") || href.startsWith("https://") || href.startsWith("mailto:") ? href : "#";
      out.push(safe.startsWith("/") ? <Link key={k++} href={safe}>{label}</Link> : <a key={k++} href={safe} rel="noreferrer">{label}</a>);
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="prose-gs">
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter(Boolean);
        if (!lines.length) return null;
        if (lines[0].startsWith("## ")) {
          const rest = lines.slice(1);
          return (
            <div key={i}>
              <h2>{lines[0].slice(3)}</h2>
              {rest.length > 0 && (rest.every((l) => l.startsWith("- ")) ? <ul>{rest.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul> : <p>{inline(rest.join(" "))}</p>)}
            </div>
          );
        }
        if (lines.every((l) => l.startsWith("- "))) return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
