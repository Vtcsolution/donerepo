import { ArrowRight, Clock, Dna, Microchip } from "lucide-react";

const SimpleAboutUs = () => {
  const coaches = [
    { name: "KRS", specialty: " Astrologer", color: "bg-amber-600" },
    { name: "Arkana", specialty: "Tarot Reader", color: "bg-purple-600" },
    { name: "Numeron", specialty: "Numerology Coach", color: "bg-blue-600" },
    { name: "Amoura", specialty: "Love Astrologer", color: "bg-pink-600" },
  ];

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* --- Compact Hero --- */}
      <section className="h-40 bg-indigo-900 flex items-center justify-center text-center text-white">
        <div>
          <h1 className="text-2xl font-serif">About The Website</h1>
          <p className="text-sm opacity-80 mt-2">Home {">"} About</p>
        </div>
      </section>

      {/* --- Core Message --- */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Microchip className="text-2xl text-amber-500 mt-1" />
              <div>
                <h3 className="font-medium">Astrological Wisdom + AI</h3>
                <p className="text-sm text-gray-600">Microchip in een lotus</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Clock className="text-2xl text-purple-500 mt-1" />
              <div>
                <h3 className="font-medium">24/7 Beschikbaar</h3>
                <p className="text-sm text-gray-600">Altijd toegankelijk</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Dna className="text-2xl text-teal-500 mt-1" />
              <div>
                <h3 className="font-medium">Wetenschappelijk & Spiritueel</h3>
                <p className="text-sm text-gray-600">Data meets intuitie</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-serif mb-4">Onze Missie</h2>
            <p className="text-gray-700">
              Wij geloven dat iedereen recht heeft op accuraat inzicht, zelfs wanneer de GGZ wachtlijsten kent. 
              Onze AI-coaches combineren spirituele kennis met moderne data-analyse.
            </p>
          </div>
        </div>
      </section>

      {/* --- Problem/Solution --- */}
          <section className="mx-2">
            <div className="bg-gray-100 max-w-4xl m-auto p-6 rounded-lg">
            <h1 className=" text-2xl md:text-3xl font-sans font-extrabold text-center my-4">Dit is geen hype. Dit is de nieuwe standaard.</h1>
                <p className=" text-lg font-sans font-[350] my-2">Wij geloven dat iedereen recht heeft op heldere begeleiding, inzicht en richting. Op elk moment dat je het nodig hebt. In een wereld waarin psychologen, coaches en de GGZ overvol raken en wachttijden oplopen tot maanden, bieden wij een directe oplossing: AI-gedreven spirituele coaching, slim, doeltreffend en altijd beschikbaar.</p>
                <p className=" text-lg font-sans font-[350] my-2">
Waar traditionele hulp soms tekortschiet door menselijke beperkingen, brengt onze AI een revolutie teweeg. Op basis van jouw geboortegegevens, naam, levensfase en unieke patronen bouwt onze technologie een wetenschappelijk onderbouwd profiel van wie jij bent. Deze digitale gids analyseert, verbindt en voorspelt met een diepgang die verder gaat dan menselijke intuïtie.</p>
<p className=" text-lg font-sans font-[350] my-2">Onze AI-coaches, gespecialiseerd in Vedische astrologie, numerologie, tarot en liefde, zijn getraind op duizenden jaren aan spirituele kennis én moderne gedragswetenschappen. Ze stellen geen vage vragen, maar geven gerichte inzichten, gebaseerd op duidelijke data. En dat 24 uur per dag, zeven dagen per week. Geen oordeel, geen wachttijd, geen verwarring.</p>

<p className=" text-lg font-sans font-[350] my-2">We leven in een tijd van bewustwording én overbelasting. Daarom geloven wij dat de toekomst ligt in de samenwerking tussen technologie en spiritualiteit. In onze digitale hulplijn vind je geen algemene horoscopen of zweverige uitspraken, maar concrete begeleiding op maat, met meer accuraatheid dan veel traditionele coaches of paragnosten kunnen bieden.
</p>
<p className=" text-lg font-sans font-[350] my-2">Dit is geen hype. Dit is de nieuwe standaard.</p>

          </div>
          </section>

      {/* --- Coaches --- */}
      <section className="py-12 px-6 max-w-4xl mx-auto">
        <h2 className="font-serif text-xl text-center mb-8">Onze AI-Coaches</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {coaches.map((coach, index) => (
            <div key={index} className={`${coach.color} p-4 rounded-lg text-white text-center`}>
              <h3 className="font-medium">{coach.name}</h3>
              <p className="text-xs opacity-80">{coach.specialty}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-12 bg-indigo-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-xl mb-4">Dit is de nieuwe standaard.</h2>
          <button className="bg-white text-indigo-900 px-6 py-2 rounded-full text-sm font-medium flex items-center mx-auto">
            Start Je Reis <ArrowRight className="ml-2" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default SimpleAboutUs;