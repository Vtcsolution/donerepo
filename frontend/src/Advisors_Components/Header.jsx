
export default function CategoryHeader({ title, description, icon, bgColor, textColor = "text-white" }) {
  return (
    <div className={`${bgColor} ${textColor} p-8 md:p-12 rounded-lg mb-8 relative overflow-hidden`}>
      <div className="absolute right-0 top-0 opacity-10 text-white transform translate-x-1/4 -translate-y-1/4">
        {icon}
      </div>
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <p className="max-w-2xl">{description}</p>
      </div>
    </div>
  )
}
