import { ScrollText, Users, CreditCard, RotateCcw, AlertTriangle, Shield, Copyright } from "lucide-react"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <ScrollText className="mx-auto h-12 w-12 text-purple-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Algemene Voorwaarden</h1>
          <p className="text-lg text-gray-600">SpiritueelChatten - Simpel en Duidelijk</p>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-12">
            {/* Section 1: User Responsibilities */}
            <section>
              <div className="flex items-center mb-6">
                <Users className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">1. Verantwoordelijkheden van de Gebruiker</h2>
              </div>
              <p className="text-gray-700 mb-4">Door gebruik te maken van SpiritueelChatten, gaat u akkoord met het volgende:</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Het verstrekken van nauwkeurige en waarheidsgetrouwe informatie voor persoonlijke spirituele analyse.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Het respecteren van de AI-gidsen en de communityrichtlijnen van het platform.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Het vermijden van misbruik van diensten voor onethische of illegale doeleinden.
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Het vertrouwelijk houden van uw toegangsgegevens.
                </li>
              </ul>
              <p className="text-gray-700 mt-4 font-medium">
                U bent zelf volledig verantwoordelijk voor de inzichten of beslissingen die u neemt op basis van de begeleiding van de AI-coaches.
              </p>
            </section>

            {/* Section 2: Payment Terms */}
            <section>
              <div className="flex items-center mb-6">
                <CreditCard className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">2. Betalingsvoorwaarden</h2>
              </div>
              <div className="space-y-3 text-gray-700">
                <p>SpiritueelChatten werkt op basis van een creditsysteem en/of abonnementen.</p>
                <p>
                  Gebruikers kunnen credits kopen om specifieke consulten te krijgen (bijv.{" "}
                  <span className="font-semibold">€1,75/min voor chat</span>) of zich abonneren op maandelijkse pakketten voor premiumfuncties.
                </p>
                <p>Prijzen worden duidelijk weergegeven vóór de betaling en kunnen variëren per dienst of type coach.</p>
              </div>
            </section>

            {/* Section 3: Refund Policy */}
            <section>
              <div className="flex items-center mb-6">
                <RotateCcw className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">3. Terugbetalingsbeleid</h2>
              </div>
              <p className="text-gray-700 mb-4">Vanwege het digitale en directe karakter van de diensten:</p>
              <div className="space-y-3 text-gray-700">
                <p>
                  <span className="font-semibold">Alle verkopen zijn definitief.</span> Er worden geen terugbetalingen gedaan voor afgeronde AI-sessies.
                </p>
                <p>
                  Mocht u technische problemen ondervinden (bijv. systeemfouten, het niet ontvangen van uw consult), neem dan binnen 24 uur contact op met de klantenservice voor beoordeling of compensatie.
                </p>
              </div>
            </section>

            {/* Section 4: Disclaimer */}
            <section>
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">4. Disclaimer over AI-gegenereerd Advies</h2>
              </div>
              <div className="space-y-3 text-gray-700">
                <p>
                  De inzichten van SpiritueelChatten worden AI-gegenereerd op basis van door de gebruiker verstrekte gegevens en spirituele tradities (astrologie, tarot, numerologie).
                </p>
                <p>
                  <span className="font-semibold">
                    Deze inzichten zijn geen vervanging voor professioneel juridisch, medisch, psychologisch of financieel advies.
                  </span>
                </p>
                <p>Gebruikers dienen hun eigen oordeel te gebruiken bij het interpreteren van de consulten.</p>
                <p>Het platform is uitsluitend bedoeld voor entertainment- en spirituele ontdekkingsdoeleinden.</p>
              </div>
            </section>

            {/* Section 5: Privacy & Data Usage */}
            {/* <section>
              <div className="flex items-center mb-6">
                <Shield className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">5. Privacy & Gegevensgebruik</h2>
              </div>
              <div className="space-y-3 text-gray-700">
                <p>
                  Wij hechten waarde aan uw privacy. Alle persoonlijke gegevens (naam, geboortedatum, geboortetijd, enz.) worden veilig opgeslagen en uitsluitend gebruikt om uw ervaring te verbeteren.
                </p>
                <p>Wij verkopen of delen uw gegevens nooit met derden zonder uw toestemming.</p>
                <p>
                  Bekijk ons volledige{" "}
                  <a href="#" className="text-purple-600 hover:text-purple-700 underline">
                    Privacybeleid
                  </a>{" "}
                  voor meer details.
                </p>
              </div>
            </section> */}

            {/* Section 6: Intellectual Property */}
            <section>
              <div className="flex items-center mb-6">
                <Copyright className="h-6 w-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">6. Intellectuele Eigendomsrechten</h2>
              </div>
              <div className="space-y-3 text-gray-700">
                <p>
                  Alle inhoud van het platform, UI-ontwerpen, logo's, AI-coachpersonages (KRS, Arkana, Numeron, Amoura) en inzichten zijn auteursrechtelijk beschermd en gedeponeerd onder SpiritueelChatten.
                </p>
                <p>U mag geen platformmateriaal reproduceren, kopiëren, wijzigen of verspreiden zonder schriftelijke toestemming.</p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Laatst bijgewerkt: {new Date().toLocaleDateString()}</p>
          <p className="mt-2">© 2024 SpiritueelChatten. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </div>
  )
}
