// Renders "[TODO: ...]" markers as visible placeholders.
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[TODO:[^\]]*\])/).map((part, i) =>
        part.startsWith("[TODO:") ? (
          <span key={i} className="border border-line px-[6px] font-mono text-[12px] text-muted">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
