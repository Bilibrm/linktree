export function GalleryBlock({ data }: { data: any }) {
  const images = (data.images || []).filter((img: any) => img.src)
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((img: any, i: number) => (
        <img
          key={i}
          src={img.src}
          alt={img.alt || `Gallery ${i + 1}`}
          className="rounded-lg object-cover aspect-square"
        />
      ))}
    </div>
  )
}
