/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Moon, Star } from "lucide-react"


const sampleCards= [
  {
    name: "The High Priestess",
    keywords: ["Intuition", "Mystery", "Divine Feminine"],
    advice: "Trust your instincts—answers will come in dreams and quiet moments of reflection.",
  },
  {
    name: "The Fool",
    keywords: ["New Beginnings", "Adventure", "Innocence"],
    advice: "Embrace the unknown with an open heart. A new journey awaits you.",
  },
  {
    name: "The Star",
    keywords: ["Hope", "Inspiration", "Spiritual Guidance"],
    advice: "Your wishes are aligning with the universe. Keep faith in your path.",
  },
]

export default function Tarot_Reader_detail() {
  const [spreadType, setSpreadType] = useState("three")
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedCards, setSelectedCards] = useState([])

  useEffect(() => {
    // Simulate card draw
    const timer = setTimeout(() => {
      setIsFlipped(true)
      if (spreadType === "single") {
        setSelectedCards([sampleCards[0]])
      } else {
        setSelectedCards([
          { ...sampleCards[1], position: "Past" },
          { ...sampleCards[0], position: "Present" },
          { ...sampleCards[2], position: "Future" },
        ])
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [spreadType])


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 p-4">
      {/* Mystical background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-violet-400/20 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Moon className="w-8 h-8 text-purple-300" />
            <h1 className="text-4xl font-bold text-white">Arkana</h1>
            <Star className="w-8 h-8 text-purple-300" />
          </motion.div>
          <p className="text-purple-200 text-lg">Divine Guidance Through the Cards</p>
        </div>

        {/* Card Spread Area */}
        <div className="mb-8">
          {spreadType === "single" ? (
            <div className="flex justify-center">
              <TarotCardComponent card={selectedCards[0]} isFlipped={isFlipped} delay={0} large />
            </div>
          ) : (
            <div className="flex justify-center items-center gap-8 flex-wrap">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex flex-col items-center">
                  <TarotCardComponent card={selectedCards[index]} isFlipped={isFlipped} delay={index * 300} />
                  {selectedCards[index] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.5 + index * 0.3 }}
                      className="text-purple-200 mt-2 text-sm font-medium"
                    >
                      {selectedCards[index].position}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interpretation Panel */}
        <AnimatePresence>
          {isFlipped && selectedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-400/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                    <h2 className="text-2xl font-bold text-white">Interpretation</h2>
                  </div>

                  {selectedCards.map((card, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                      {spreadType === "three" && (
                        <h3 className="text-lg font-semibold text-purple-200 mb-2">
                          {card.position}: {card.name}
                        </h3>
                      )}
                      {spreadType === "single" && (
                        <h3 className="text-lg font-semibold text-purple-200 mb-2">{card.name}</h3>
                      )}

                      <div className="mb-3">
                        <p className="text-sm text-purple-300 mb-1">Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {card.keywords.map((keyword, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-purple-600/30 text-purple-100 rounded-full text-sm border border-purple-400/30"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-purple-300 mb-1">Guidance:</p>
                        <p className="text-white leading-relaxed">{card.advice}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

function TarotCardComponent({
  card,
  isFlipped,
  delay,
  large = false,
}) {
  const cardSize = large ? "w-48 h-80" : "w-32 h-52"

  return (
    <motion.div
      initial={{ rotateY: 0 }}
      animate={{ rotateY: isFlipped ? 180 : 0 }}
      transition={{ duration: 0.8, delay: delay / 1000 }}
      className={`${cardSize} relative preserve-3d cursor-pointer`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Card Back */}
      <div
        className={`absolute inset-0 ${cardSize} backface-hidden rounded-lg border-2 border-purple-400/50 bg-gradient-to-br from-purple-800 to-indigo-900 shadow-2xl`}
        style={{ backfaceVisibility: "hidden" }}
      >
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20" />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-purple-500/30 rounded-full flex items-center justify-center border border-purple-400/50">
              <Star className="w-8 h-8 text-purple-200" />
            </div>
            <div className="text-purple-200 text-xs font-medium">ARKANA</div>
          </div>
          {/* Mystical pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-2 h-2 bg-purple-300 rounded-full animate-pulse" />
            <div className="absolute top-8 right-6 w-1 h-1 bg-indigo-300 rounded-full animate-pulse delay-300" />
            <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-violet-300 rounded-full animate-pulse delay-700" />
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-1000" />
          </div>
        </div>
      </div>

      {/* Card Front */}
      <div
        className={`absolute inset-0 ${cardSize} backface-hidden rounded-lg border-2 border-purple-400/50 bg-gradient-to-br from-purple-900 to-indigo-950 shadow-2xl rotate-y-180`}
        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
      >
        {card && (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center relative overflow-hidden rounded-lg">
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-indigo-400/20 rounded-lg" />
            <div className="absolute inset-0 shadow-inner shadow-purple-500/50 rounded-lg" />

            <div className="relative z-10">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2 leading-tight">{card.name}</h3>
              <div className="text-purple-200 text-xs space-y-1">
                {card.keywords.slice(0, 2).map((keyword, i) => (
                  <div key={i} className="px-2 py-1 bg-purple-600/30 rounded text-xs">
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
