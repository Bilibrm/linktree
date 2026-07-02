export function HeaderBlock({ data }: { data: any }) {
  const level = data.level || 2
  const text = data.text || "Header"

  const className = {
    1: "text-2xl font-bold",
    2: "text-xl font-semibold",
    3: "text-lg font-medium",
  }[level as 1 | 2 | 3] || "text-xl font-semibold"

  return <h2 className={`${className} text-center`}>{text}</h2>
}
