export function ImageBlock({ data }: { data: any }) {
  if (!data.src) return null

  return (
    <div className="text-center">
      <img
        src={data.src}
        alt={data.alt || "Image"}
        className="w-full rounded-xl object-cover max-h-80"
      />
      {data.caption && (
        <p className="text-xs text-muted-foreground mt-1">{data.caption}</p>
      )}
    </div>
  )
}
