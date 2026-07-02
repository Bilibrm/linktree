export function TextBlock({ data }: { data: any }) {
  const align = data.align || "center"
  return (
    <p
      className={`text-sm text-muted-foreground leading-relaxed text-${align} whitespace-pre-wrap`}
      style={{ textAlign: align }}
    >
      {data.content || ""}
    </p>
  )
}
