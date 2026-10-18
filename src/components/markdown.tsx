import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// react-markdown does not render raw HTML, and its default URL filter drops unsafe protocols.
const components: Components = {
  h2: ({ children }) => <h2 className="mb-2 mt-10 font-heading text-[28px] font-bold leading-none tracking-[-0.03em]">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-8 font-heading text-[22px] font-bold leading-none tracking-[-0.03em]">{children}</h3>,
  p: ({ children }) => <p className="mb-3">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc pl-3">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal pl-3">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="!underline !decoration-accent underline-offset-4">
      {children}
    </a>
  ),
  blockquote: ({ children }) => <blockquote className="mb-3 border-l border-line pl-2 text-muted">{children}</blockquote>,
  hr: () => <hr className="my-6 border-line" />,
  code: ({ children, className }) => <code className={`font-mono text-[0.9em] ${className ?? ""}`}>{children}</code>,
  pre: ({ children }) => <pre className="mb-3 overflow-x-auto border border-line p-2 font-mono text-[14px] leading-snug">{children}</pre>,
  img: ({ src, alt }) =>
    typeof src === "string" && src.startsWith("https://") ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} loading="lazy" className="mb-3 h-auto max-w-full border border-line" />
    ) : null,
  table: ({ children }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[15px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-line px-1 py-1 font-bold">{children}</th>,
  td: ({ children }) => <td className="border-b border-line px-1 py-1">{children}</td>,
};

export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  );
}
