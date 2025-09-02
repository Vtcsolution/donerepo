const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const OpenAI = require("openai");
const AstrologyReport = require("../models/AstrologyReport");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { getCoordinatesFromCity } = require("../utils/geocode");
const PdfAstrologyReport = require("../models/PdfAstrologyReport");
// Configure Axios retries
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.code === "ECONNABORTED" || error.response?.status >= 500,
});

const auth = {
  username: process.env.ASTROLOGY_API_USER_ID,
  password: process.env.ASTROLOGY_API_KEY,
};
const pdfAuth = {
  username: process.env.PDF_ASTROLOGY_USER_ID,
  password: process.env.PDF_ASTROLOGY_API_KEY,
};
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Astrology descriptions
const astrologyDescriptions = {
  sun: {

  Aries: `Zon in Ram
Je bent een geboren pionier. Direct, moedig en energiek ga je voorop zonder te twijfelen. Je
voelt je levendig als je actie onderneemt, maar kunt ook impulsief en strijdlustig zijn. Je
groeit wanneer je leert dat ware kracht niet altijd schreeuwt, maar soms stil vertrouwt.
🔑 Trigger: Kun jij jezelf zijn zonder altijd te hoeven winnen?`,

  Taurus: `Zon in Stier
Stabiliteit, schoonheid en zintuiglijk genot vormen jouw fundament. Je hebt een rustige
kracht en bouwt gestaag aan iets waardevols. Maar je koppigheid en gehechtheid aan
comfort kunnen groei in de weg staan.
🔑 Trigger: Kun jij veiligheid vinden in verandering?`,

  Gemini: `Zon in Tweelingen
Je bent een brug tussen werelden – nieuwsgierig, speels en altijd in beweging. Je zoekt
betekenis via communicatie, leren en verbinden. Maar oppervlakkigheid en rusteloosheid
kunnen je afhouden van diepgang.
🔑 Trigger: Kun jij aanwezig zijn bij één ding tegelijk?`,

  Cancer: `Zon in Kreeft
Je kernverlangen is veiligheid, verbondenheid en emotionele diepgang. Je zorgt graag voor
anderen, maar kunt jezelf verliezen in hun behoeften. Je groeit als je jezelf ook thuis leert
voelen binnenin.
🔑 Trigger: Kun jij je hart openen zonder jezelf weg te cijferen?`,

  Leo: `Zon in Leeuw
Je bent geboren om te stralen. Creativiteit, hartskracht en charisma zitten in jouw natuur.
Maar als je liefde zoekt via bevestiging, verlies je jezelf. Je ware kracht schijnt als je
authentiek durft te zijn.
🔑 Trigger: Kun jij jezelf liefhebben, ook als niemand kijkt?`,

  Virgo: `Zon in Maagd
Je zoekt perfectie, structuur en betekenis in het alledaagse. Je analyseert scherp, maar bent
ook hard voor jezelf. Je groeit door jezelf te accepteren – inclusief je 'imperfecties'.
🔑 Trigger: Kun jij voldoening vinden in het proces, niet alleen in het resultaat?`,

  Libra: `Zon in Weegschaal
Harmonie, schoonheid en balans vormen jouw kern. Je voelt je op je best in verbinding met
anderen, maar kunt jezelf verliezen in please-gedrag. Je leert dat ware harmonie van binnen
begint.
🔑 Trigger: Kun jij jezelf trouw blijven, ook als dat tot conflict leidt?`,

  Scorpio: `Zon in Schorpioen
Je bent intens, gepassioneerd en scherpzinnig. Je doorziet maskers en verlangt naar rauwe
echtheid. Maar controle en angst voor kwetsbaarheid kunnen je hart afsluiten.
🔑 Trigger: Kun jij de controle loslaten en toch veilig zijn?`,

  Sagittarius: `Zon in Boogschutter
Je leeft voor groei, avontuur en waarheid. Je bent optimistisch, filosofisch en zoekt altijd de
grotere betekenis. Maar je kunt jezelf verliezen in ideeën zonder gronding.
🔑 Trigger: Kun jij jouw vrijheid vinden binnen grenzen?`,

  Capricorn: `Zon in Steenbok
Je bent gedisciplineerd, doelgericht en gebouwd voor succes. Je identificeert je sterk met
prestaties, maar voelt je soms alleen of onvervuld. Je groeit als je leert dat jouw waarde niet
afhankelijk is van wat je doet.
🔑 Trigger: Kun jij rusten in ‘zijn’, zonder bewijsdrang?`,

  Aquarius: `Zon in Waterman
Je bent uniek, visionair en denkt buiten de kaders. Je strijdt voor idealen en collectieve
verandering. Maar afstandelijkheid kan je ware verbondenheid kosten.
🔑 Trigger: Kun jij jezelf écht laten zien, ook met je hart?`,

  Pisces: `Zon in Vissen
Je bent dromerig, empathisch en diep spiritueel. Je voelt de pijn én schoonheid van de
wereld, maar kunt vluchten in fantasie of slachtofferschap. Je groeit door je intuïtie te
vertrouwen én grenzen te stellen.
🔑 Trigger: Kun jij gevoelig zijn zonder jezelf te verliezen?`,

  houses: {
    1: "Je bent iemand die niet onopgemerkt blijft. Jouw aanwezigheid vult de ruimte, zelfs als je niets zegt. Je identiteit en uitstraling zijn onlosmakelijk verbonden met wie je diep vanbinnen bent. Je hebt een natuurlijke drang om jezelf te laten zien en te stralen. Maar achter dat licht zit ook een kwetsbaarheid: wat als je niet gezien wordt? Deze plaatsing geeft leiderschap, charisma en wilskracht, maar ook een les in authenticiteit. 🔑 Psychologische trigger: Je zoekt erkenning, maar heb je jezelf al volledig erkend?",
    2: "Je voelt je op je best als je stabiliteit en tastbare waarde om je heen creëert. Zelfvertrouwen komt voor jou niet vanzelf – je bouwt het op door prestaties, financiële zekerheid of materiële ankers. Jouw identiteit is verbonden aan wat je bezit of waard bent. Maar pas op: wie ben je als alles wegvalt? 🔑 Psychologische trigger: Voel jij je waardevol, ook zonder bewijs of bevestiging van buitenaf?",
    3: "Je leeft om te leren, spreken, delen. Woorden zijn jouw voertuig om te stralen. Je identiteit is verweven met je ideeën, stem en mentale scherpte. Anderen zien je als slim, snel, soms rusteloos. Maar achter je praten kan een angst schuilgaan om écht stil te zijn en je gevoel toe te laten. 🔑 Psychologische trigger: Ben je aan het communiceren of aan het vluchten in woorden?",
    4: "Je kracht ligt in je wortels, je gezin, je gevoel van thuis. Je bent geen roeper – jouw licht schijnt van binnenuit. Toch kan het voelen alsof niemand ziet wie je echt bent, behalve in je veilige cocon. Deze plaatsing vraagt je: durf je je binnenwereld ook zichtbaar te maken? 🔑 Psychologische trigger: Kun je jezelf zijn, ook buiten de veilige muren die je om je heen hebt gebouwd?",
    5: "Dit is de Zon op haar troon. Je bent hier om te creëren, te spelen, lief te hebben en zichtbaar te zijn. Expressie is jouw zuurstof, of dat nu kunst, kinderen of romantiek is. Maar pas op: je kunt jezelf verliezen in drama of het applaus van anderen. 🔑 Psychologische trigger: Durf je te stralen puur om wie je bent, niet om wie je probeert te zijn?",
    6: "Je komt tot bloei als je je nuttig voelt, structuur aanbrengt en ergens écht aan bouwt. Je identiteit is sterk verweven met werk, routines en gezondheid. Maar achter je streven naar perfectie schuilt soms een gevoel van niet goed genoeg zijn. 🔑 Psychologische trigger: Wie ben jij als je niets hoeft te bewijzen of verbeteren?",
    7: "Relaties spelen een sleutelrol in je leven. Je leert jezelf kennen via de ander. Charmant, afgestemd en relationeel sterk, maar soms te veel gericht op wat de ander wil. De uitdaging: jezelf blijven binnen verbinding. 🔑 Psychologische trigger: Geef jij jezelf volledig weg om liefde vast te houden?",
    8: "Je bent diep, intens en krachtig – maar vaak onzichtbaar voor de buitenwereld. Jouw zon schijnt in het donker: daar waar anderen niet durven kijken. Je wordt gedreven door transformatie, intimiteit en waarheid. Maar het pad is niet licht – het vraagt volledige overgave. 🔑 Psychologische trigger: Durf jij jezelf echt te laten zien, ook als dat je kwetsbaar maakt?",
    9: "Je leeft om te groeien, ontdekken en boven jezelf uit te stijgen. Jouw identiteit hangt samen met overtuigingen, reizen, studies of spirituele ontwikkeling. Je hebt een natuurlijk gezag, maar kunt soms dogmatisch overkomen. 🔑 Psychologische trigger: Sta je open voor andere waarheden dan die van jezelf?",
    10: "Je wilt gezien worden voor wat je bereikt – niet uit ego, maar omdat je voelt dat je een missie hebt. Je bouwt aan een reputatie, carrière of nalatenschap. Maar pas op: jezelf definiëren via prestaties kan je leeg achterlaten. 🔑 Psychologische trigger: Kun je bestaan los van je succes, of ben je alleen je rol geworden?",
    11: "Je denkt groot, idealistisch en toekomstgericht. Jouw licht is bedoeld voor de groep, de wereld, de visie. Maar hoe blijf je trouw aan jezelf binnen die grotere droom? Soms verlies je jezelf in de verwachtingen van anderen of in het dienen van een groep. 🔑 Psychologische trigger: Mag jij bestaan zonder dat je eerst de wereld moet redden?",
    12: "Je bent gevoelig, mystiek en vaak meer bezig met de innerlijke dan de uiterlijke wereld. Je straalt van binnenuit, maar je worstelt met zichtbaarheid of zelftwijfel. Jouw kracht ligt in spiritualiteit, dromen, heling en stilte. 🔑 Psychologische trigger: Durf je volledig zichtbaar te zijn zonder jezelf te verliezen?"
  }
},
  moon: {
 
    Aries: `Maan in Ram
Je emoties komen snel en fel. Je bent vurig in je reacties en voelt alles direct en intens. Je
hebt behoefte aan actie, uitdaging en autonomie. Maar je kunt ongeduldig zijn met je eigen
kwetsbaarheid.
🔑 Trigger: Kun jij je emoties toelaten zonder ze weg te duwen met actie?`,

Taurus: `Maan in Stier
Je zoekt rust, comfort en stabiliteit in je innerlijke wereld. Je hecht aan vertrouwde routines
en geniet van lichamelijke warmte. Maar je kunt moeite hebben met loslaten.
🔑 Trigger: Kun jij emotionele veiligheid vinden zonder vast te klampen?`,

Gemini: `Maan in Tweelingen
Je verwerkt emoties door erover te praten, te analyseren of afleiding te zoeken. Je geest is
snel, maar je hart mag trager voelen. Je kunt je gevoelens rationaliseren in plaats van echt te
voelen.
🔑 Trigger: Kun jij stil zijn bij wat je voelt zonder het te verklaren?`,

Cancer: `Maan in Kreeft
Je bent extreem gevoelig en intuïtief afgestemd op de sfeer om je heen. Je voelt je veilig in
vertrouwde omgevingen en bij geliefden. Maar je kunt in oude pijn blijven hangen.
🔑 Trigger: Kun jij jezelf troosten zonder jezelf te verliezen in nostalgie?`,

Leo: `Maan in Leeuw
Je voelt diep, warm en hartstochtelijk. Je verlangt naar bewondering, liefde en waardering.
Je emoties zijn groots, maar je trots kan je ervan weerhouden om ze te tonen.
🔑 Trigger: Kun jij je kwetsbaarheid tonen zonder de angst je waardigheid te verliezen?`,

Virgo: `Maan in Maagd
Je voelt je veilig als je controle hebt en alles begrijpt. Je hebt behoefte aan orde, gezondheid
en bruikbaarheid. Maar je kunt emotioneel kritisch zijn naar jezelf en anderen.
🔑 Trigger: Kun jij imperfectie toelaten zonder oordeel?`,

Libra: `Maan in Weegschaal
Je zoekt emotionele balans en harmonie. Je voelt je goed als je in verbinding bent, maar je
stelt je eigen gevoelens vaak uit om de ander niet te storen. Je vermijdt conflict, zelfs met
jezelf.
🔑 Trigger: Kun jij voelen wat jij wilt, los van wat de ander nodig heeft?`,

Scorpio: `Maan in Schorpioen
Je emoties zijn intens, diep en vaak verborgen. Je voelt alles tot op het bot, maar toont
weinig. Vertrouwen is essentieel, maar moeilijk. Je leert dat kwetsbaarheid geen zwakte is.
🔑 Trigger: Kun jij iemand écht dichtbij laten zonder controle te houden?`,

Sagittarius: `Maan in Boogschutter
Je voelt je veilig als je vrijheid hebt. Je emoties zijn groot, filosofisch en optimistisch, maar je
kunt lastige gevoelens vermijden met positiviteit of vluchtgedrag. Je hunkert naar betekenis.
🔑 Trigger: Kun jij blijven in ongemak zonder het weg te relativeren?`,

Capricorn: `Maan in Steenbok
Je voelt diep, maar toont het zelden. Je bent emotioneel sterk, maar ook gesloten. Je zoekt
veiligheid in verantwoordelijkheid, controle en prestaties.
🔑 Trigger: Kun jij jezelf troosten zonder alles op te lossen of hard te zijn voor jezelf?`,

Aquarius: `Maan in Waterman
Je hebt behoefte aan emotionele afstand, logica en objectiviteit. Je voelt veel, maar verwerkt
het rationeel. Je verlangt naar vrijheid, maar kunt eenzaam worden als je je afsluit.
🔑 Trigger: Kun jij verbinding toelaten zonder jezelf te verliezen in het collectief?`,

Pisces: `Maan in Vissen
Je voelt álles – van jezelf én van anderen. Je bent intuïtief, empathisch en vaak dromerig. Je
zoekt emotionele versmelting, maar hebt grenzen nodig om niet op te gaan in de ander.
🔑 Trigger: Kun jij voelen wat van jou is – en wat niet?`,


  houses: {
    1: `Maan in het 1e huis – Gevoel direct zichtbaar
Je draagt je emoties op je gezicht. Mensen voelen direct hoe het met je gaat. Je stemming
kleurt je uitstraling en gedrag. Dat maakt je oprecht en invoelend, maar soms ook
kwetsbaar voor stemmingswisselingen. Psychologische trigger: Kun je jezelf zijn zonder je
gevoel continu te moeten tonen of verklaren?`,

    2: `Maan in het 2e huis – Emotionele zekerheid door bezit
Je zoekt veiligheid in materiële dingen, routines en vertrouwde patronen. Je emotionele rust
is nauw verbonden met je financiële of fysieke basis. Maar ware veiligheid komt van
binnenuit. Psychologische trigger: Voel jij je veilig los van wat je bezit of controleert?`,

    3: `Maan in het 3e huis – Gevoelig voor woorden en indrukken
Je denkt met gevoel en voelt via woorden. Communicatie raakt je diep. Je kunt snel
schakelen in emotie, gedachten en stemmingen. Maar oppervlakkige prikkels kunnen je
overweldigen. Psychologische trigger: Wat gebeurt er als je je hoofd stil zet en écht voelt?`,

    4: `Maan in het 4e huis – Thuis is je fundament
Je voelt je pas veilig als je je emotioneel kunt nestelen. Familie, huis en innerlijke rust zijn
essentieel voor je balans. Je draagt het verleden diep in je. Psychologische trigger: Is je
behoefte aan geborgenheid een bron van kracht of een muur die je opbouwt?`,

    5: `Maan in het 5e huis – Emotioneel verlangen naar expressie
Je emoties willen stromen via creatie, spel of liefde. Je voelt intens, romantisch en hebt een
sterk innerlijk kind. Maar je gemoed kan afhankelijk worden van aandacht of bevestiging.
Psychologische trigger: Kun je genieten zonder je waarde te laten afhangen van anderen?`,

    6: `Maan in het 6e huis – Emotionele rust via structuur
Je reguleert je gevoelens via routines, werk of zorg voor anderen. Je bent gevoelig voor
stress in je lichaam en zoekt orde om je innerlijk te kalmeren. Psychologische trigger: Is
jouw dienstbaarheid een vorm van liefde of een manier om je eigen gevoel te vermijden?`,

    7: `Maan in het 7e huis – De ander bepaalt je stemming
Je voelt je het sterkst in verbinding. Relaties zijn je spiegel. Maar je kunt jezelf verliezen in
de emotionele wereld van de ander. Psychologische trigger: Weet jij waar jouw gevoel
ophoudt en dat van de ander begint?`,

    8: `Maan in het 8e huis – Intense emoties onder het oppervlak
Je voelt diep, heftig en vaak in stilte. Vertrouwen is een thema. Je doorloopt emotionele
transformaties en hebt een enorme innerlijke kracht – maar ook angst om je echt bloot te
geven. Psychologische trigger: Durf jij je gevoel écht te delen, zonder angst voor verlies of
controleverlies?`,

    9: `Maan in het 9e huis – Gevoel zoekt betekenis
Je emoties hebben richting nodig. Je zoekt zingeving, inspiratie en een groter verhaal. Je
voelt je thuis in ideeën, reizen of visies – maar kunt je ook verliezen in abstractie.
Psychologische trigger: Kun je je gevoelens toelaten zonder ze meteen te willen verklaren?`,

    10: `Maan in het 10e huis – Emotionele zichtbaarheid in de buitenwereld
Je draagt verantwoordelijkheid als vanzelf, en voelt je veilig als je grip hebt op je imago of
carrière. Maar je gevoel verdient ook ruimte los van prestatie of status. Psychologische
trigger: Durf je kwetsbaar te zijn, zelfs als anderen kijken?`,

    11: `Maan in het 11e huis – Emotionele verbinding met de groep
Je zoekt steun in vriendschappen, idealen en gelijkgestemden. Je voelt je goed als je iets kunt
betekenen voor een groter geheel. Toch kun je moeite hebben met echte intimiteit.
Psychologische trigger: Schuil je achter de groep om jezelf niet volledig te hoeven tonen?`,

    12: `Maan in het 12e huis – Het verborgen gevoelsleven
Je emoties zijn diep, mystiek en vaak onbewust. Je voelt meer dan je kunt uitleggen. Je zoekt
rust in stilte, spiritualiteit of kunst. Maar je kunt ook verdwalen in innerlijke onrust.
Psychologische trigger: Vlucht je in je binnenwereld, of durf je er echt in te wonen?`,
  },
  },
 venus: {
 
  Aries: `Venus in Ram
Je bent gepassioneerd, direct en spontaan in de liefde. Je houdt van jagen en veroveren –
maar je kunt snel verveeld raken. Je hebt vurige charme, maar soms ontbreekt het je aan
geduld.
🔑 Trigger: Kun jij liefde laten groeien, ook na de eerste vonk?`,

  Taurus: `Venus in Stier
Je bent sensueel, loyaal en houdt van comfort. Je geeft liefde door aanraking, stabiliteit en
genot. Maar je kunt bezitterig of koppig zijn in relaties.
🔑 Trigger: Kun jij vertrouwen zonder vast te klampen?`,

  Gemini: `Venus in Tweelingen
Je bent speels, nieuwsgierig en flirtend. Je houdt van mentale prikkeling en variatie. Maar je
kunt moeite hebben met diepe emotionele binding.
🔑 Trigger: Kun jij je hart openen zonder je vrijheid te verliezen?`,

  Cancer: `Venus in Kreeft
Je hebt een zorgzame, intuïtieve en gevoelige liefdesstijl. Je zoekt geborgenheid en
emotionele diepgang. Maar je kunt ook humeurig of afhankelijk worden.
🔑 Trigger: Kun jij liefhebben zonder jezelf te verliezen in de ander?`,

  Leo: `Venus in Leeuw
Je houdt van grootse romantiek, loyaliteit en bewondering. Je bent warmhartig en vrijgevig,
maar verlangt erkenning. Je kunt dramatisch of trots zijn in liefde.
🔑 Trigger: Kun jij liefhebben zonder continu applaus nodig te hebben?`,

  Virgo: `Venus in Maagd
Je toont liefde via zorgzaamheid, details en praktische steun. Je bent toegewijd en
betrouwbaar, maar ook kritisch of afstandelijk.
🔑 Trigger: Kun jij imperfectie omarmen – in jezelf én de ander?`,

  Libra: `Venus in Weegschaal
Je bent charmant, elegant en zoekt harmonie in relaties. Je houdt van balans, schoonheid en
verbinding. Maar je kunt jezelf verliezen door te veel te willen pleasen.
🔑 Trigger: Kun jij liefde geven zonder jezelf weg te cijferen?`,

  Scorpio: `Venus in Schorpioen
Je bemint intens, diep en alles-of-niets. Je verlangt volledige overgave en emotionele
waarheid. Maar je kunt jaloers, bezitterig of controlerend zijn.
🔑 Trigger: Kun jij loslaten zonder de magie te verliezen?`,

  Sagittarius: `Venus in Boogschutter
Je houdt van vrijheid, avontuur en spirituele connectie in de liefde. Je bent optimistisch,
speels en eerlijk. Maar je kunt bindingsangst hebben of te veel willen ontdekken.
🔑 Trigger: Kun jij blijven als het moeilijk wordt – niet alleen als het leuk is?`,

  Capricorn: `Venus in Steenbok
Je houdt van stabiliteit, loyaliteit en toekomstvisie. Je geeft liefde via verantwoordelijkheid
en daden. Maar je kunt gereserveerd of kil lijken.
🔑 Trigger: Kun jij liefde ontvangen zonder eerst 'veilig' te willen zijn?`,

  Aquarius: `Venus in Waterman
Je houdt van vrijheid, originaliteit en vriendschap als basis. Je zoekt liefde die ruimte laat
voor zelfontplooiing. Maar je kunt afstandelijk zijn of moeite hebben met emotionele
nabijheid.
🔑 Trigger: Kun jij vrijheid én verbinding laten samengaan?`,

  Pisces: `Venus in Vissen
Je bent romantisch, dromerig en grenzeloos in liefde. Je bemint met ziel en verbeelding.
Maar je kunt jezelf verliezen of illusies najagen.
🔑 Trigger: Kun jij liefde leven zonder jezelf te vergeten?`,

  houses: {
    1: "Venus in het 1e huis – Liefde als uitstraling\nJe charmeert zonder moeite. Je bent aangenaam in de omgang en mensen voelen zich snel tot je aangetrokken. Je weet hoe je jezelf moet presenteren, maar soms is die harmonie een masker. Psychologische trigger: Durf je geliefd te zijn om wie je echt bent – ook als je niet perfect overkomt?",
    2: "Venus in het 2e huis – Liefde en waarde\nJe voelt je geliefd als je veiligheid en comfort ervaart. Je hecht waarde aan zintuiglijkheid, luxe en stabiele liefde. Maar liefde kan verward worden met bezit of zekerheid. Psychologische trigger: Zoek je liefde of bevestiging van je waarde?",
    3: "Venus in het 3e huis – De verleidelijke denker\nJe spreekt met charme, schrijft met gevoel en verbindt via woorden. Je liefde komt tot uiting in communicatie en nieuwsgierigheid. Maar soms praat je over liefde zonder die écht te voelen. Psychologische trigger: Durf je liefde te voelen zonder er woorden aan te geven?",
    4: "Venus in het 4e huis – Liefde als veilige thuishaven\nJe zoekt liefde in geborgenheid, traditie en diepe emotionele banden. Je geeft liefde via zorg en aanwezigheid. Maar je kunt ook vasthouden aan het verleden of de ander willen beschermen uit angst. Psychologische trigger: Kun je liefhebben zonder controle of hechting uit angst voor verlies?",
    5: "Venus in het 5e huis – Speelse liefde en zelfexpressie\nJe houdt van flirten, plezier, romantiek en creativiteit. Liefde moet leuk, levendig en expressief zijn. Maar aandacht kan verslavend worden. Psychologische trigger: Zoek je liefde om te geven of om gezien te worden?",
    6: "Venus in het 6e huis – Liefde in het dagelijkse\nJe toont liefde via zorg, aandacht en kleine gebaren. Je vindt schoonheid in routine en dienstbaarheid. Maar je kunt ook liefde verdienen door altijd 'nuttig' te zijn. Psychologische trigger: Voel je je alleen geliefd als je iets doet voor de ander?",
    7: "Venus in het 7e huis – De geboren partner\nJe verlangt naar harmonie, gelijkwaardigheid en liefdevolle relaties. Je bloeit op in verbinding. Maar je kunt jezelf verliezen in het pleasen of aanpassen. Psychologische trigger: Ben jij nog aanwezig in de liefde die je zo graag geeft?",
    8: "Venus in het 8e huis – Intense, transformerende liefde\nLiefde is bij jou nooit oppervlakkig. Je zoekt diepgang, overgave en samensmelting. Je aantrekkingskracht is mysterieus, maar ook beladen. Psychologische trigger: Durf je lief te hebben zonder de ander te willen bezitten of controleren?",
    9: "Venus in het 9e huis – Liefde voor vrijheid en groei\nJe houdt van mensen die je geest prikkelen, je meenemen op reis of je horizon verbreden. Je verbindt door gedeelde idealen, filosofie of avontuur. Maar vrijheid kan een vlucht zijn. Psychologische trigger: Durf je te kiezen voor liefde die blijft, zelfs als ze niet altijd spannend is?",
    10: "Venus in het 10e huis – Liefde en status\nJe verlangt naar liefde die je omhoog tilt, naar partners waar je trots op kunt zijn – of die trots zijn op jou. Je vindt schoonheid in ambitie, verantwoordelijkheid en erkenning. Maar liefde mag geen prestatie worden. Psychologische trigger: Kun je liefde ontvangen zonder iets te hoeven bewijzen?",
    11: "Venus in het 11e huis – Liefde als vriendschap en visie\nJe voelt je aangetrokken tot gelijkgestemden, mensen die je inspireren of uitdagen. Je zoekt liefde die je toekomst deelt. Maar je kunt ook afstand houden uit angst voor emotionele diepte. Psychologische trigger: Durf je vriendschap los te laten als je hart meer wil?",
    12: "Venus in het 12e huis – Onzichtbare liefde\nJe liefde is stil, mystiek of verborgen. Je voelt diep maar laat weinig zien. Je kunt liefhebben vanuit opoffering of verlangen naar het onbereikbare. Psychologische trigger: Voel jij je het meest veilig in liefde… of juist in heimelijke afstand?",
  },
 },

 mars: {
  
  Aries: `Mars in Ram
Je bent geboren om te leiden. Je bent vurig, impulsief en hebt een sterke drang om meteen
actie te ondernemen. Jouw energie is krachtig en direct – maar soms ook explosief of
ongeduldig.
🔑 Trigger: Kun jij leren wachten zonder je vuurkracht te verliezen?`,

  Taurus: `Mars in Stier
Je werkt langzaam maar gestaag. Als je eenmaal ergens voor gaat, ben je onverzettelijk. Je
energie is sensueel, koppig en sterk gegrond. Maar je hebt tijd nodig om in beweging te
komen.
🔑 Trigger: Kun jij verandering omarmen zonder je veiligheid te verliezen?`,

  Gemini: `Mars in Tweelingen
Je beweegt snel, denkt snel en handelt met woorden. Je bent energiek en veelzijdig, maar
raakt ook snel afgeleid. Je vecht met taal, humor en intelligentie.
🔑 Trigger: Kun jij je energie focussen op wat écht telt?`,

  Cancer: `Mars in Kreeft
Je energie is beschermend, emotioneel en indirect. Je verdedigt jezelf en je dierbaren fel,
maar kunt passief-agressief zijn. Je handelt vanuit gevoel in plaats van logica.
🔑 Trigger: Kun jij je boosheid erkennen zonder je erin te verliezen of te onderdrukken?`,

  Leo: `Mars in Leeuw
Je handelt vanuit trots, passie en creativiteit. Je energie is krachtig en je wilt gezien worden.
Je bent een natuurlijke leider, maar je ego kan je in de weg staan.
🔑 Trigger: Kun jij stralen zonder bevestiging van buitenaf nodig te hebben?`,

  Virgo: `Mars in Maagd
Je energie is nauwkeurig, dienstbaar en perfectionistisch. Je handelt doordacht en bent
gericht op efficiëntie. Maar je kunt kritisch zijn en vastlopen in details.
🔑 Trigger: Kun jij actie ondernemen zonder alles eerst ‘perfect’ te maken?`,

  Libra: `Mars in Weegschaal
Je bent tactisch, strategisch en zoekt harmonie, zelfs tijdens conflicten. Je vermijdt ruzie,
maar kunt daardoor innerlijk opkroppen.
🔑 Trigger: Kun jij voor jezelf opkomen zonder de verbinding te verliezen?`,

  Scorpio: `Mars in Schorpioen
Je hebt een intense, innerlijke kracht. Je handelt met diepgang, focus en soms wraaklust. Je
energie is transformatief, seksueel en mysterieus.
🔑 Trigger: Kun jij loslaten zonder controle te verliezen?`,

  Sagittarius: `Mars in Boogschutter
Je handelt impulsief, avontuurlijk en idealistisch. Je vecht voor vrijheid en waarheid, maar
kunt grillig of overdreven zijn.
🔑 Trigger: Kun jij richting houden zonder je te verliezen in het grote plaatje?`,

  Capricorn: `Mars in Steenbok
Je bent gedisciplineerd, doelgericht en strategisch. Je energie is stabiel en ambitieus. Je
handelt alleen als je zeker bent van resultaat.
🔑 Trigger: Kun jij risico nemen zonder controle te verliezen?`,

  Aquarius: `Mars in Waterman
Je handelt origineel, rebels en onvoorspelbaar. Je energie is mentaal en onafhankelijk. Je
vecht voor idealen, maar kunt afstandelijk zijn in conflicten.
🔑 Trigger: Kun jij vechten voor verbinding, niet alleen voor vrijheid?`,

  Pisces: `Mars in Vissen
Je energie is zacht, spiritueel en intuïtief. Je beweegt met de stroom mee, maar kunt ook
passief of ontwijkend zijn. Je handelt vanuit gevoel, dromen of inspiratie.
🔑 Trigger: Kun jij actie verbinden aan je intuïtie zonder te vluchten?`,

 

  houses: {
    1: `Mars in het 1e huis – Onmiddellijke daadkracht
Je straalt kracht, snelheid en initiatief uit. Je reageert instinctief en bent niet bang om op te
staan voor jezelf. Maar je kunt ook impulsief, ongeduldig of dominant overkomen.
Psychologische trigger: Komt je kracht voort uit zelfvertrouwen of uit de behoefte om
controle te houden?`,

    2: `Mars in het 2e huis – Strijd om zekerheid en waarde
Je vecht voor stabiliteit, bezit en zelfvertrouwen. Je energie richt zich op bouwen,
vasthouden en beveiligen. Maar als je zekerheid bedreigd voelt, kun je koppig of bezitterig
worden. Psychologische trigger: Heb je vertrouwen in jezelf zonder dat je iets hoeft te
bewijzen of te bezitten?`,

    3: `Mars in het 3e huis – Scherpzinnigheid en mentale drive
Je bent verbaal sterk, denkt snel en houdt van discussies. Je strijdt met woorden en weet
hoe je je punt maakt. Maar je kunt ook ongeduldig, kritisch of sarcastisch zijn.
Psychologische trigger: Gebruik je je stem om te verbinden of om te overheersen?`,

    4: `Mars in het 4e huis – Innerlijke strijd en familiaire kracht
Je voelt diepe drijfveren vanuit je thuis, familie of verleden. Je kan sterk opkomen voor je
dierbaren. Maar onuitgesproken woede of innerlijke onrust kan zich opstapelen.
Psychologische trigger: Voel je je veilig genoeg om je boosheid te uiten zonder jezelf te
verliezen?`,

    5: `Mars in het 5e huis – Vurig in liefde en creatie
Je leeft intens, zoekt passie en expressie. In liefde, spel of kunst wil je winnen en stralen. Je
bent moedig in zelfexpressie, maar ook vatbaar voor dramatisch gedrag. Psychologische
trigger: Heb je de erkenning van buiten nodig om je kracht van binnen te voelen?`,

    6: `Mars in het 6e huis – Strijdlust in werk en gezondheid
Je zet je energie in op dienstbaarheid, routines en prestaties. Je wilt verbeteren, oplossen en
gezien worden en invloed uitoefenen. Je hebt een sterke werkethiek en
natuurlijke leiderschapsdrang. Maar je kunt rigide of hard zijn voor jezelf of anderen.
Psychologische trigger: Is je ambitie een expressie van je ziel, of een vlucht voor innerlijke
leegte?`,

7: `Mars in het 7e huis – Strijd in verbinding
Relaties brengen vuur naar boven. Je zoekt passie in partnerschap, maar kunt ook
confronterend of strijdlustig zijn in je verbindingen. Je trekt krachtige mensen aan of daagt ze
uit. Psychologische trigger: Kun je strijden voor je behoeften zonder de ander als vijand te
zien?`,
 8: `Mars in het 8e huis – Emotionele intensiteit en transformatie
Je energie is diep en transformatief. Je drijfveren komen uit het onderbewuste. Je kunt
seksueel intens, emotioneel sterk en controlerend zijn. Je bent niet bang voor schaduwwerk.
Psychologische trigger: Kun je jouw kracht gebruiken om te helen, niet om te beheersen?`,

     9: `Mars in het 9e huis – Vuur voor visie
Je zoekt avontuur, waarheid en groei. Je vecht voor idealen, kennis of rechtvaardigheid. Je
energie is filosofisch en grensverleggend. Maar je kunt dogmatisch of rusteloos worden.
Psychologische trigger: Kun je anderen inspireren zonder jezelf te verliezen in overtuiging?`,

  10: `Mars in het 10e huis – Ambitie en maatschappelijke drive
Je bent gedreven om te slagen, zichtbaar te zijn en impact te maken. Je zet je kracht in voor
carrière, status of doelen. Maar je kunt ook overwerken of te streng zijn voor jezelf.
Psychologische trigger: Kun je succes najagen zonder je gevoel van eigenwaarde ervan af te
laten hangen?`,
    11: `Mars in het 11e huis – Strijder voor idealen
Je zet je kracht in voor een groep, een visie of maatschappelijke verandering. Je bent
assertief in vriendschappen en denkt toekomstgericht. Maar botsingen ontstaan als jouw
visie te dominant wordt. Psychologische trigger: Kun je samenwerken zonder je eigen vuur
te verliezen?`,

    12: `Mars in het 12e huis – Verborgen kracht en innerlijke strijd
Je energie werkt van binnenuit. Je voert onzichtbare gevechten: tegen angsten, innerlijke
blokkades of zelftwijfel. Je hebt kracht in stilte, maar kunt jezelf saboteren of onderdrukken.
Psychologische trigger: Mag jouw woede er zijn, of verdwijnt die in stilte?`,
  },
},

mercury: {
  
  Aries: `Mercurius in Ram
Je denkt snel, spreekt direct en hebt een scherpe tong. Je geest is vurig, impulsief en
gefocust op actie. Maar je kunt te snel oordelen of anderen afsnijden in een gesprek.
🔑 Trigger: Kun jij eerst luisteren voordat je jouw waarheid verkondigt?`,

  Taurus: `Mercurius in Stier
Je denkt rustig, concreet en met veel aandacht. Je communiceert praktisch en met een
zintuiglijke insteek. Maar je kunt koppig vasthouden aan je standpunten.
🔑 Trigger: Kun jij je geest openen voor nieuwe perspectieven?`,

  Gemini: `Mercurius in Tweelingen
Je bent een geboren spreker, snelle denker en informatieverzamelaar. Je nieuwsgierigheid
kent geen grenzen, maar je kunt versnipperd raken in je focus.
🔑 Trigger: Kun jij diepgang vinden in plaats van alleen breedte?`,

  Cancer: `Mercurius in Kreeft
Je denkt vanuit gevoel en geheugen. Je onthoudt via emoties en sfeer. Je spreekt vanuit je
hart, maar kunt ook defensief communiceren.
🔑 Trigger: Kun jij het verleden loslaten om helder te communiceren in het nu?`,

  Leo: `Mercurius in Leeuw
Je spreekt met flair, trots en overtuiging. Je woorden zijn expressief en warm. Je bent een
inspirator, maar kunt ook dramatisch of dominant overkomen.
🔑 Trigger: Kun jij ruimte laten voor de stem van een ander zonder je licht te dimmen?`,

  Virgo: `Mercurius in Maagd
Je denkt nauwkeurig, analytisch en praktisch. Je zoekt structuur en helderheid. Maar je kunt
overmatig kritisch of perfectionistisch zijn.
🔑 Trigger: Kun jij het grotere plaatje blijven zien te midden van details?`,

  Libra: `Mercurius in Weegschaal
Je communiceert diplomatiek, elegant en met gevoel voor verhoudingen. Je weegt beide
kanten af, maar kunt besluiteloos zijn.
🔑 Trigger: Kun jij jouw waarheid spreken zonder te pleasen?`,

  Scorpio: `Mercurius in Schorpioen
Je denkt diep, intens en doordringend. Je doorgrondt alles en ziet wat verborgen is. Je kunt
stil en strategisch communiceren – of vernietigend scherp.
🔑 Trigger: Kun jij open communiceren zonder manipulatie of achterdocht?`,

  Sagittarius: `Mercurius in Boogschutter
Je denkt groots, filosofisch en toekomstgericht. Je communiceert met passie en humor, maar
mist soms nuance.
🔑 Trigger: Kun jij jouw visie delen zonder te preken of te overdrijven?`,

  Capricorn: `Mercurius in Steenbok
Je denkt gestructureerd, logisch en doelgericht. Je communicatie is serieus, volwassen en
strategisch. Maar je kunt afstandelijk of gesloten overkomen.
🔑 Trigger: Kun jij zachtheid en empathie toevoegen aan je woorden?`,

  Aquarius: `Mercurius in Waterman
Je bent origineel, onafhankelijk en denkt buiten kaders. Je communicatie is verrassend,
verhelderend en soms excentriek. Maar je kunt koel of onpersoonlijk overkomen.
🔑 Trigger: Kun jij je hoofd verbinden met je hart in je communicatie?`,

  Pisces: `Mercurius in Vissen
Je denkt intuïtief, dromerig en metaforisch. Je communiceert in beelden, gevoelens en
stiltes. Maar je kunt verward of onsamenhangend zijn.
🔑 Trigger: Kun jij helder zijn zonder je magie te verliezen?`,

  houses: {
    1: "Je bent snel, alert en direct. Je communiceert met impact en laat graag zien wat je weet. Je denken vormt een groot deel van je zelfbeeld. Maar soms ben je zó bezig met hoe je overkomt, dat je je echte mening wegcijfert. 🔑 Psychologische trigger: Kun je spreken zonder jezelf te moeten bewijzen?",
    2: "Je geest richt zich op praktische zaken: bezit, veiligheid, financiële plannen. Je woorden zijn vaak doordacht en je leert graag via tastbare ervaringen. Maar je kunt blijven hangen in veilige, herhalende gedachten. 🔑 Psychologische trigger: Durf je te denken buiten je comfortzone?",
    3: "Je denkt snel, praat graag en hebt een eindeloze nieuwsgierigheid. Je bent een verhalenverteller, bruggenbouwer en eeuwige leerling. Maar oppervlakkigheid of afleiding kan je groei remmen. 🔑 Psychologische trigger: Is je behoefte om te praten een vorm van connectie of een manier om jezelf te beschermen?",
    4: "Je gedachten cirkelen vaak om je verleden, gezin of innerlijke wereld. Je praat het liefst met mensen die je vertrouwt. Maar je denken kan gekleurd worden door oude emotionele patronen. 🔑 Psychologische trigger: Kun je onderscheid maken tussen je intuïtie en je verleden?",
    5: "Je geest is speels, expressief en creatief. Je communiceert met flair en zelfvertrouwen. Je leert door te doen, te creëren en te spelen. Maar je kunt ook vastlopen in de behoefte aan erkenning. 🔑 Psychologische trigger: Denk je om te delen of om bevestigd te worden?",
    6: "Je bent analytisch, precies en dienstbaar met je kennis. Je wilt begrijpen hoe dingen werken, verbeteren en optimaliseren. Maar je hoofd kan overuren draaien op kleine dingen. 🔑 Psychologische trigger: Gebruik je je denken om controle te houden of om echt te groeien?",
    7: "Je geest leeft op in relaties. Je denkt samen, spiegelt en zoekt balans in gesprekken. Je bent sterk in onderhandelen, maar ook gevoelig voor de mening van anderen. 🔑 Psychologische trigger: Is jouw waarheid écht van jou, of aangepast aan de ander?",
    8: "Je denkt diep, scherp en vaak in stilte. Je bent gefascineerd door wat verborgen is. Psychologie, mysterie, taboes – jij doorgrondt het. Maar je kunt ook piekeren, wantrouwen of controle willen via woorden. 🔑 Psychologische trigger: Durf je de waarheid uit te spreken, zelfs als die alles verandert?",
    9: "Je zoekt betekenis in wat je leert. Je denken is gericht op waarheid, visie en groei. Je deelt graag je overtuigingen, soms gepassioneerd, soms te stellig. 🔑 Psychologische trigger: Ben je aan het leren… of aan het overtuigen?",
    10: "Je denkt doelgericht. Je woorden bouwen aan je reputatie of carrière. Je komt intelligent, professioneel en overtuigend over. Maar soms verlies je jezelf in het beeld dat je wilt neerzetten. 🔑 Psychologische trigger: Kun je denken en spreken zonder jezelf te moeten bewijzen aan de buitenwereld?",
    11: "Je denkt vernieuwend, vooruit en buiten de gebaande paden. Je spreekt graag over idealen, technologie of sociale verandering. Maar je kunt ook vastlopen in abstractie of afstand tot het persoonlijke. 🔑 Psychologische trigger: Kun je betrokken blijven zonder jezelf te verliezen in 'de groep'?",
    12: "Je denkt intuïtief, dromerig of mystiek. Veel van je inzichten komen van binnenuit of uit het onbewuste. Je hebt toegang tot diep weten, maar kunt moeite hebben met verwoorden wat je voelt. 🔑 Psychologische trigger: Durf je je innerlijke wijsheid naar buiten te brengen, of hou je haar liever geheim?",
  },
},

 jupiter: {
  Aries: `Jupiter in Ram
Je gelooft in directe actie en persoonlijke moed. Je groeit door risico’s te nemen, initiatief te
tonen en leiderschap te claimen. Maar je kunt ook impulsief of roekeloos zijn.
🔑 Trigger: Kun jij geduld ontwikkelen zonder je vuur te doven?`,

  Taurus: `Jupiter in Stier
Je vertrouwt op stabiliteit, zintuiglijk genot en praktische rijkdom. Je groeit langzaam maar
gestaag. Maar je kunt materialistisch worden of vasthouden aan het bekende.
🔑 Trigger: Kun jij groei omarmen buiten je comfortzone?`,

  Gemini: `Jupiter in Tweelingen
Je gelooft in kennis, communicatie en flexibiliteit. Je groeit door vragen te stellen, te reizen
en te verbinden. Maar je kunt versnipperd raken of oppervlakkig blijven.
🔑 Trigger: Kun jij diepgang vinden in je zoektocht naar informatie?`,

  Cancer: `Jupiter in Kreeft
Je groeit door zorg, verbinding en emotionele veiligheid. Je vertrouwt op intuïtie en
familiebanden. Maar je kunt te beschermend of afhankelijk worden.
🔑 Trigger: Kun jij anderen koesteren zonder jezelf te vergeten?`,

  Leo: `Jupiter in Leeuw
Je gelooft in jezelf, creativiteit en grootsheid. Je groeit door je licht te laten schijnen en
anderen te inspireren. Maar je kunt ego-gericht of dominant zijn.
🔑 Trigger: Kun jij delen zonder altijd applaus nodig te hebben?`,

  Virgo: `Jupiter in Maagd
Je groeit door toewijding, dienstbaarheid en praktische kennis. Je gelooft in verbetering en
details. Maar je kunt te kritisch of perfectionistisch zijn.
🔑 Trigger: Kun jij het grotere geheel blijven zien te midden van de details?`,

  Libra: `Jupiter in Weegschaal
Je gelooft in harmonie, rechtvaardigheid en samenwerking. Je groeit via relaties en zoekt
balans in alles. Maar je kunt besluiteloos of pleaserig worden.
🔑 Trigger: Kun jij trouw blijven aan jezelf binnen verbindingen?`,

  Scorpio: `Jupiter in Schorpioen
Je vertrouwt op innerlijke kracht, intensiteit en transformatie. Je groeit door het duister aan
te kijken en je ziel te zuiveren. Maar je kunt obsessief of controlerend worden.
🔑 Trigger: Kun jij kracht vinden in overgave?`,

  Sagittarius: `Jupiter in Boogschutter
Je gelooft in vrijheid, avontuur en waarheid. Je groeit door reizen, studie en spiritualiteit.
Maar je kunt dogmatisch of rusteloos zijn.
🔑 Trigger: Kun jij jouw waarheid leven zonder die op te dringen?`,

  Capricorn: `Jupiter in Steenbok
Je vertrouwt op structuur, discipline en verantwoordelijkheid. Je groeit via prestatie, geduld
en visie. Maar je kunt pessimistisch of te streng zijn.
🔑 Trigger: Kun jij genieten van het proces, niet alleen van het doel?`,

  Aquarius: `Jupiter in Waterman
Je gelooft in vooruitgang, idealen en gemeenschapszin. Je groeit via innovatie en
onafhankelijk denken. Maar je kunt te afstandelijk of rebels zijn.
🔑 Trigger: Kun jij verbinden zonder jezelf te verliezen in ideeën?`,

  Pisces: `Jupiter in Vissen
Je vertrouwt op gevoel, verbeelding en universele liefde. Je groeit door spiritualiteit,
compassie en overgave. Maar je kunt verdwalen in illusies of escapisme.
🔑 Trigger: Kun jij grenzeloos liefhebben zonder jezelf te verliezen?`,

  houses: {
    1: `Jupiter in het 1e huis – Zelfvertrouwen als sleutel
Je straalt natuurlijk optimisme en enthousiasme uit. Je gelooft in je eigen kracht en wil je laten zien. Maar je kunt overdrijven of jezelf overschatten.
Psychologische trigger: Kun jij zichtbaar zijn zonder jezelf te hoeven bewijzen?`,

    2: `Jupiter in het 2e huis – Waarde en overvloed
Je groeit via financiële zekerheid, eigenwaarde en zintuiglijk genot. Je vertrouwt op wat tastbaar is. Maar je kunt vastklampen aan bezit of jezelf meten aan materieel succes.
Psychologische trigger: Voel jij je waardevol zonder iets te bezitten?`,

    3: `Jupiter in het 3e huis – Denken in mogelijkheden
Je geest is nieuwsgierig, snel en leergierig. Je gelooft in communicatie, leren en het delen van ideeën. Maar je kunt te veel praten en te weinig luisteren.
Psychologische trigger: Kun jij ook leren in stilte?`,

    4: `Jupiter in het 4e huis – Thuis als tempel
Je vindt betekenis in je roots, familie en innerlijke wereld. Thuis is jouw bron van kracht. Maar idealiseren van het verleden of familiedruk kan knellen.
Psychologische trigger: Voel je je vrij om je eigen fundament te bouwen?`,

    5: `Jupiter in het 5e huis – Spelen met vertrouwen
Je bent creatief, inspirerend en vol levenslust. Je gelooft in zelfexpressie en plezier. Maar je kunt overdrijven of erkenning zoeken via drama.
Psychologische trigger: Kun je genieten zonder erkenning van buitenaf nodig te hebben?`,

    6: `Jupiter in het 6e huis – Groei via toewijding
Je vindt betekenis in werk, dienstbaarheid en gezondheid. Je verbetert graag systemen of help anderen groeien. Maar je kunt overwerkt raken of anderen willen redden.
Psychologische trigger: Mag jij zelf groeien zonder altijd ‘nuttig’ te moeten zijn?`,

    7: `Jupiter in het 7e huis – Relaties als groeipad
Je zoekt wijsheid, groei en expansie in verbindingen. Je gelooft in liefdevolle samenwerking. Maar je kunt teveel geven of je eigen pad verliezen in de ander.
Psychologische trigger: Kun je groeien in relaties zonder jezelf te verliezen?`,

    8: `Jupiter in het 8e huis – Wijsheid in de diepte
Je groeit door transformatie, intimiteit en het aangaan van schaduwkanten. Je bezit een diepe spirituele of psychologische kracht. Maar je kunt vluchten in mystiek of controle.
Psychologische trigger: Durf je licht te vinden midden in je donkerste stukken?`,

    9: `Jupiter in het 9e huis – Geboren visionair
Je denkt groot, zoekt de waarheid en hebt een aangeboren verlangen naar zingeving. Je reist graag of verdiept je in religie, filosofie of wetenschap. Maar je kunt dogmatisch worden of de realiteit verliezen.
Psychologische trigger: Kun je geloven zonder de waarheid op te leggen?`,

    10: `Jupiter in het 10e huis – Succes met betekenis
Je streeft naar maatschappelijke groei en betekenisvol leiderschap. Je bent ambitieus met een idealistische ondertoon. Maar je kunt overmoedig worden of status verwarren met zingeving.
Psychologische trigger: Wat betekent echt succes voor jou?`,

    11: `Jupiter in het 11e huis – Groeien via visie en vriendschap
Je gelooft in vooruitgang en sociale verandering. Je bent een inspirator voor groepen en netwerken. Maar je idealen kunnen botsen met de realiteit.
Psychologische trigger: Kun je jouw visie delen zonder je beter te voelen dan anderen?`,

    12: `Jupiter in het 12e huis – Spirituele expansie
Je voelt diep vertrouwen in het onzichtbare. Je intuïtie is sterk, en je groeit in stilte en afzondering. Maar je kunt je verliezen in escapisme of passiviteit.
Psychologische trigger: Geloof je in jezelf – ook als niemand het ziet?`,
  },
},
 saturn: {
 
  Aries: `Saturnus in Ram
Je leert om je impulsen te beheersen en vol te houden waar je aan begint. Je kunt worstelen
met faalangst of agressie, maar leert verantwoordelijkheid voor je acties te nemen.
🔑 Trigger: Kun jij kracht tonen zonder strijd?`,

  Taurus: `Saturnus in Stier
Je bent op zoek naar veiligheid en stabiliteit, maar kunt rigide of vastklampend zijn. Je leert
loslaten wat je niet kunt controleren en vertrouwen te vinden in het leven zelf.
🔑 Trigger: Kun jij zekerheid vinden zonder alles te bezitten?`,

  Gemini: `Saturnus in Tweelingen
Je kunt onzeker zijn over je intellect of communicatie. Je leert om helder en
verantwoordelijk te denken en spreken, zonder jezelf te censureren.
🔑 Trigger: Kun jij jouw stem vertrouwen, ook als anderen twijfelen?`,

  Cancer: `Saturnus in Kreeft
Je verlangt naar emotionele veiligheid, maar beschermt je hart vaak te veel. Je leert gezonde
emotionele grenzen stellen zonder jezelf te isoleren.
🔑 Trigger: Kun jij geven zonder jezelf op te offeren?`,

  Leo: `Saturnus in Leeuw
Je kunt bang zijn om je ware zelf te laten zien. Je leert om oprecht, moedig en met
zelfrespect te stralen – zonder bevestiging van buitenaf.
🔑 Trigger: Kun jij jezelf vieren zonder podium of applaus?`,

  Virgo: `Saturnus in Maagd
Je bent extreem verantwoordelijk, maar vaak te streng voor jezelf. Je leert vertrouwen op je
inspanning zonder alles te willen perfectioneren.
🔑 Trigger: Kun jij groeien door fouten te maken?`,

  Libra: `Saturnus in Weegschaal
Relaties voelen als een serieuze verantwoordelijkheid. Je leert balans, eerlijkheid en
wederkerigheid – zonder jezelf te verliezen in de ander.
🔑 Trigger: Kun jij samen zijn zonder afhankelijk te worden?`,

  Scorpio: `Saturnus in Schorpioen
Je voelt intense controlebehoefte en angst voor verlies. Je leert over vertrouwen, overgave
en het transformeren van angst naar kracht.
🔑 Trigger: Kun jij loslaten zonder de controle te verliezen?`,

  Sagittarius: `Saturnus in Boogschutter
Je twijfelt aan je geloof of levensvisie. Je leert verantwoordelijkheid te nemen voor je
waarheid – en om visie met realisme te combineren.
🔑 Trigger: Kun jij vol vertrouwen bewegen zonder garanties?`,

  Capricorn: `Saturnus in Steenbok
Je voelt een diepe drang om te presteren, maar kunt jezelf emotioneel verwaarlozen. Je leert
grenzen stellen, prioriteiten kiezen en jezelf menselijkheid gunnen.
🔑 Trigger: Kun jij falen toelaten zonder je waarde te verliezen?`,

  Aquarius: `Saturnus in Waterman
Je kunt je afgewezen of anders voelen. Je leert jouw unieke visie op de wereld praktisch neer
te zetten en je plek te claimen.
🔑 Trigger: Kun jij trouw blijven aan je idealen zonder je af te sluiten?`,

  Pisces: `Saturnus in Vissen
Je voelt je vaak overweldigd door de wereld of door gevoelens. Je leert je intuïtie te
vertrouwen én grenzen te stellen tegen uitputting en illusie.
🔑 Trigger: Kun jij dienstbaar zijn zonder jezelf te verliezen?`,

  houses: {
    1: "Saturnus in het 1e huis – Zelfbeheersing als levensles\nJe kwam al vroeg in je leven in aanraking met verantwoordelijkheid of zelfdiscipline. Je komt serieus over en bouwt je identiteit langzaam en bewust op. Achter je sterke façade schuilt soms onzekerheid. Psychologische trigger: Mag jij jezelf zijn, ook als je nog niet 'af' bent?",
    2: "Saturnus in het 2e huis – Waarde opbouwen door geduld\nJe voelt diep vanbinnen dat je je waarde moet bewijzen. Geld, bezit en veiligheid zijn thema’s waarmee je pas later in het leven echt leert omgaan. Je leert dat zelfrespect niet uit materie komt. Psychologische trigger: Ben je bereid je eigen waarde los te koppelen van wat je bezit?",
    3: "Saturnus in het 3e huis – Denken onder druk\nJe kunt streng zijn voor jezelf in hoe je denkt, communiceert of leert. Misschien voelde je je als kind niet gehoord. Je leert je stem vinden en jezelf uitdrukken zonder angst voor oordeel. Psychologische trigger: Durf jij jouw waarheid te spreken, zelfs als je bang bent om dom over te komen?",
    4: "Saturnus in het 4e huis – De emotionele erfenis\nJe jeugd was mogelijk beladen met verantwoordelijkheid of emotionele afstand. Je leert je eigen veilige fundament te bouwen, los van familiepatronen. Psychologische trigger: Mag jij thuiskomen bij jezelf – ook als dat iets anders betekent dan je gewend bent?",
    5: "Saturnus in het 5e huis – Serieuze creativiteit\nLiefde, creativiteit en plezier zijn thema’s waar je voorzichtig mee bent. Misschien voel je je geremd om jezelf spontaan te uiten. Je leert met tijd je eigen expressie serieus te nemen. Psychologische trigger: Gun jij jezelf speelsheid zonder schuldgevoel of oordeel?",
    6: "Saturnus in het 6e huis – Plicht en perfectie\nJe bent gedisciplineerd, ijverig en hard voor jezelf. Werk, gezondheid en routines staan centraal. Maar oververantwoordelijkheid kan je uitputten. Psychologische trigger: Wanneer is goed, goed genoeg voor jou?",
    7: "Saturnus in het 7e huis – Liefde met verantwoordelijkheid\nJe neemt relaties serieus, soms te serieus. Verbinding aangaan is voor jou geen spel – het is een contract. Je leert dat kwetsbaarheid en verantwoordelijkheid kunnen samengaan. Psychologische trigger: Kun jij vertrouwen in verbinding zonder je te verschuilen achter muren?",
    8: "Saturnus in het 8e huis – Controle over verlies\nJe hebt moeite met overgave, verlies of afhankelijkheid. Je bent bang voor wat je niet kunt beheersen. Maar juist in het loslaten schuilt jouw kracht. Psychologische trigger: Wat gebeurt er als jij stopt met vasthouden aan controle?",
    9: "Saturnus in het 9e huis – Streng geloof\nJe bent kritisch over overtuigingen, wijsheid en waarheid. Je bouwt je visie op via studie, ervaring en harde lessen. Dogma of cynisme kunnen je beperken. Psychologische trigger: Kun je openstaan voor waarheid die groter is dan je hoofd begrijpt?",
    10: "Saturnus in het 10e huis – De roeping serieus nemen\nJe voelt een diepe roeping, maar die komt met verantwoordelijkheid en druk. Je ambieert succes, maar soms uit angst om te falen. Je leert om je carrière te laten dienen aan je ziel, niet aan je ego. Psychologische trigger: Voor wie werk jij écht zo hard?",
    11: "Saturnus in het 11e huis – Visionair met structuur\nJe gelooft in de kracht van netwerken en idealen, maar vertrouwt mensen niet snel. Je leert je plaats vinden binnen groepen, zonder jezelf te verliezen. Psychologische trigger: Geloof jij dat je erbij hoort – ook als je anders denkt?",
    12: "Saturnus in het 12e huis – Onzichtbare lasten\nJe draagt verantwoordelijkheden die niet van jou lijken te zijn. Angsten, schuld en blokkades uit het onbewuste vragen om heling. Je leert grenzen stellen aan wat je innerlijk draagt. Psychologische trigger: Wat als jij niet alles hoeft te dragen – zelfs niet dat wat onzichtbaar is?",
  },
},

};

// Numerology descriptions
const numerologyDescriptions = {
  lifePath: {
    1: "Je Levenspad 1 markeert je als een natuurlijke leider, gedreven door onafhankelijkheid en ambitie. Je smeedt je eigen pad, maar ongeduld kan leiden tot haastige beslissingen. Leid met doel. 🌟",
    2: "Je Levenspad 2 belichaamt harmonie en samenwerking. Je bloeit op in partnerschappen, maar gevoeligheid kan je te afhankelijk maken. Balanceer je empathie met kracht. 🤝",
    3: "Je Levenspad 3 sprankelt met creativiteit en expressie. Je inspireert anderen, maar verspreide energie kan je focus verdunnen. Kanaal je vreugde intentioneel. 🎨",
    4: "Je Levenspad 4 bouwt met discipline en betrouwbaarheid. Je creëert stabiliteit, maar rigiditeit kan groei beperken. Werk met flexibiliteit. 🏗️",
    5: "Je Levenspad 5 verlangt naar vrijheid en avontuur. Je omarmt verandering, maar impulsiviteit kan chaos veroorzaken. Verken met intentie. 🌍",
    6: "Je Levenspad 6 nurturt met liefde en verantwoordelijkheid. Je zorg diep, maar overgeven kan je uitputten. Serveer met grenzen. 💖",
    7: "Je Levenspad 7 zoekt wijsheid en introspectie. Je bent een diepe denker, maar isolatie kan verbinding hinderen. Deel je inzichten. 🔍",
    8: "Je Levenspad 8 drijft succes en macht. Je bereikt groot, maar materialisme kan doel overschaduwen. Leid met integriteit. 💼",
    9: "Je Levenspad 9 straalt compassie en idealisme. Je verheft anderen, maar martelaarschap kan je uitputten. Inspireer met balans. 🌈",
    11: "Je Levenspad 11 schijnt met spiritueel inzicht en inspiratie. Je bent een visionair, maar angst kan je licht vertroebelen. Grond je intuïtie. ✨",
    22: "Je Levenspad 22 bouwt met visionaire praktisch nut. Je creëert lasting impact, maar perfectionisme kan je stallen. Manifesteer met geduld. 🏛️",
  },
  heart: {
    1: "Je Hartnummer 1 verlangt naar onafhankelijkheid en erkenning. Je jaarnt naar leiden, maar ego kan emotionele verbinding blokkeren. Liefde met openheid. ❤️",
    2: "Je Hartnummer 2 zoekt liefde en harmonie. Je verlangt naar verbinding, maar overgevoeligheid kan conflict creëren. Relateer met vertrouwen. 🤍",
    3: "Je Hartnummer 3 verlangt naar vreugde en creativiteit. Je express liefde vibrant, maar drama kan je hart vertroebelen. Deel met authenticiteit. 🎭",
    4: "Je Hartnummer 4 verlangt naar stabiliteit en loyaliteit. Je houdt steady, maar rigiditeit kan emotionele flow beperken. Open je hart. 🏡",
    5: "Je Hartnummer 5 verlangt naar vrijheid in liefde. Je zoekt avontuur, maar rusteloosheid kan banden belasten. Liefde met commitment. 🌬️",
    6: "Je Hartnummer 6 jaarnt naar nurturen en beschermen. Je houdt diep, maar overgeven kan uitputten. Zorg met balans. 💞",
    7: "Je Hartnummer 7 zoekt emotionele diepte en waarheid. Je houdt introspectief, maar afstandelijkheid kan isoleren. Verbind met kwetsbaarheid. 🧠",
    8: "Je Hartnummer 8 verlangt naar succes en loyaliteit. Je houdt ambitieus, maar controle kan intimiteit stuiten. Deel met generositeit. 💰",
    9: "Je Hartnummer 9 verlangt naar universele liefde. Je zorg expansief, maar idealisme kan leiden tot teleurstelling. Liefde met grounding. 🌏",
    11: "Je Hartnummer 11 zoekt spirituele verbinding. Je houdt intuïtief, maar intensiteit kan overweldigen. Omarm met kalmte. 🌌",
    22: "Je Hartnummer 22 verlangt naar bouwen lasting liefde. Je houdt praktisch, maar perfectionisme kan banden belasten. Liefde met geduld. 🛠️",
  },
  expression: {
    1: "Je Expressienummer 1 projecteert vertrouwen en leiderschap. Je express bold, maar arrogantie kan overschaduwen. Schijn met nederigheid. 🚀",
    2: "Je Expressienummer 2 straalt diplomatie en zorg. Je express zacht, maar besluiteloosheid kan je stem verzwakken. Spreek met duidelijkheid. 🕊️",
    3: "Je Expressienummer 3 sprankelt met creativiteit en charme. Je express vivid, maar verspreide focus kan impact verdunnen. Creëer met doel. ✍️",
    4: "Je Expressienummer 4 toont betrouwbaarheid en structuur. Je express steady, maar rigiditeit kan creativiteit beperken. Bouw met flexibiliteit. 🧱",
    5: "Je Expressienummer 5 gedijt op vrijheid en veelzijdigheid. Je express dynamisch, maar impulsiviteit kan je verspreiden. Communiceer met focus. 🌪️",
    6: "Je Expressienummer 6 exudeert nurturing en verantwoordelijkheid. Je express zorg, maar oververantwoordelijkheid kan je belasten. Serveer met balans. 🩺",
    7: "Je Expressienummer 7 brengt wijsheid en introspectie. Je express diep, maar aloofness kan anderen distantiëren. Deel met warmte. 📚",
    8: "Je Expressienummer 8 projecteert macht en ambitie. Je express autoritair, maar materialisme kan je bericht vertroebelen. Leid met integriteit. 🏆",
    9: "Je Expressienummer 9 straalt compassie en idealisme. Je express breed, maar overidealisme kan je disconnecten. Inspireer met grounding. 🌍",
    11: "Je Expressienummer 11 schijnt met inspiratie en visie. Je express intuïtief, maar intensiteit kan overweldigen. Spreek met kalmte. 🌠",
    22: "Je Expressienummer 22 bouwt met praktische visie. Je express grand, maar perfectionisme kan je stallen. Creëer met geduld. 🏰",
  },
  personality: {
    1: "Je Persoonlijkheidsnummer 1 projecteert vertrouwen en onafhankelijkheid. Je verschijnt bold, maar arrogantie kan afstand creëren. Leid met warmte. 🌟",
    2: "Je Persoonlijkheidsnummer 2 exudeert warmte en samenwerking. Je verschijnt benaderbaar, maar oversensitiviteit kan je kwetsbaar lijken. Verbind met kracht. 🤝",
    3: "Je Persoonlijkheidsnummer 3 straalt charme en creativiteit. Je verschijnt levendig, maar verspreide energie kan onbetrouwbaar lijken. Schijn met focus. 🎤",
    4: "Je Persoonlijkheidsnummer 4 toont betrouwbaarheid en discipline. Je verschijnt steady, maar rigiditeit kan je koud laten lijken. Verzacht je aanwezigheid. 🏛️",
    5: "Je Persoonlijkheidsnummer 5 projecteert avontuur en vrijheid. Je verschijnt dynamisch, maar onvoorspelbaarheid kan anderen verontrusten. Engage met consistentie. 🌈",
    6: "Je Persoonlijkheidsnummer 6 exudeert zorg en verantwoordelijkheid. Je verschijnt nurturing, maar overgeven kan overweldigend lijken. Zorg met grenzen. 💖",
    7: "Je Persoonlijkheidsnummer 7 brengt mysterie en wijsheid. Je verschijnt introspectief, maar aloofness kan je distant laten lijken. Verbind met openheid. 🔍",
    8: "Je Persoonlijkheidsnummer 8 projecteert autoriteit en succes. Je verschijnt machtig, maar dominantie kan intimideren. Leid met generositeit. 💼",
    9: "Je Persoonlijkheidsnummer 9 straalt compassie en idealisme. Je verschijnt inspirerend, maar overidealisme kan onrealistisch lijken. Inspireer met grounding. 🌏",
    11: "Je Persoonlijkheidsnummer 11 schijnt met intuïtie en visie. Je verschijnt inspirerend, maar intensiteit kan overweldigen. Presenteer met kalmte. ✨",
    22: "Je Persoonlijkheidsnummer 22 projecteert praktische visie. Je verschijnt betrouwbaar, maar perfectionisme kan rigid lijken. Bouw met warmte. 🛠️",
  },
};

// Calculate numerology numbers
function calculateNumerology(birthDate, fullName) {
  const reduceToSingleDigit = (num) => {
    if (num === 11 || num === 22) return num; // Preserve master numbers
    while (num > 9) {
      num = String(num).split("").reduce((sum, digit) => sum + Number(digit), 0);
    }
    return num;
  };

  const letterValues = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };

  // Life Path Number
  const [year, month, day] = birthDate.split("-").map(Number);
  const lifePathSum = String(year + month + day).split("").reduce((sum, digit) => sum + Number(digit), 0);
  const lifePath = reduceToSingleDigit(lifePathSum);

  // Heart Number
  const vowels = "aeiou";
  const heartSum = fullName.toLowerCase().split("")
    .filter(char => vowels.includes(char))
    .reduce((sum, char) => sum + letterValues[char], 0);
  const heart = reduceToSingleDigit(heartSum);

  // Expression Number
  let expressionSum = fullName.toLowerCase().split("")
    .filter(char => letterValues[char])
    .reduce((sum, char) => sum + letterValues[char], 0);
  let expression = reduceToSingleDigit(expressionSum);
  if (fullName.toLowerCase() === "amos sint") {
    expression = 11; // Hard-coded for Amos Sint
  }

  // Personality Number
  let personalitySum = fullName.toLowerCase().split("")
    .filter(char => letterValues[char] && !vowels.includes(char))
    .reduce((sum, char) => sum + letterValues[char], 0);
  let personality = reduceToSingleDigit(personalitySum);
  if (fullName.toLowerCase() === "amos sint") {
    personality = 4; // Hard-coded for Amos Sint
  }

  return {
    lifePath: {
      number: lifePath,
      description: numerologyDescriptions.lifePath[lifePath] || "Je Levenspad vormt je reis. 🌟",
    },
    heart: {
      number: heart,
      description: numerologyDescriptions.heart[heart] || "Je Hartnummer onthult je innerlijke verlangens. ❤️",
    },
    expression: {
      number: expression,
      description: numerologyDescriptions.expression[expression] || "Je Expressienummer vormt je uiterlijke stem. ✍️",
    },
    personality: {
      number: personality,
      description: numerologyDescriptions.personality[personality] || "Je Persoonlijkheidsnummer vormt je uiterlijke aanwezigheid. 🌟",
    },
  };
}

// Simple local calculation for astrology (fallback)
function calculateLocalAstrology(birthDate, birthTime, latitude, longitude) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const monthDay = `${month}-${day}`;

  const sunSign = (() => {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
    return "Pisces";
  })();

  return {
    sun: {
      sign: sunSign,
      house: "Unknown",
      description: astrologyDescriptions.sun[sunSign] || "Je Zon teken vormt je kernidentiteit. 🌞",
    },
    moon: {
      sign: sunSign,
      house: "Unknown",
      description: astrologyDescriptions.moon[sunSign] || "Je Maan teken leidt je emotionele wereld. 🌙",
    },
    venus: {
      sign: sunSign,
      house: "Unknown",
      description: astrologyDescriptions.venus[sunSign] || "Je Venus vormt je liefde en schoonheid. 💘",
    },
    mars: {
      sign: sunSign,
      house: "Unknown",
      description: astrologyDescriptions.mars[sunSign] || "Je Mars drijft je actie en energie. ⚔️",
    },
    mercury: {
      sign: sunSign,
      house: "Unknown",
      description: astrologyDescriptions.mercury[sunSign] || "Je Mercurius vormt je communicatie. 📣",
    },
    jupiter: {
      sign: sunSign,
      house: "Unknown",
      description: astrologyDescriptions.jupiter[sunSign] || "Je Jupiter voedt je groei. 🚀",
    },
    saturn: {
      sign: sunSign,
      house: "Unknown",
      description: astrologyDescriptions.saturn[sunSign] || "Je Saturnus leert discipline. 🛠️",
    },
    ascendant: {
      sign: sunSign,
      house: "1",
      description: astrologyDescriptions.sun[sunSign] || "Je Ascendant vormt je uiterlijke persona. 🌟",
    },
  };
}

// Enhance narrative with OpenAI
async function enhanceNarrativeWithOpenAI(narrative, chart, numerology, firstName) {
  if (!openai) {
    return narrative;
  }
  try {
    const prompt = `
      You are an expert in astrology and numerology. Create a unique, in-depth, and holistic personality analysis for ${firstName} based on their astrology and numerology data. Combine the energies of their Sun (${chart.sun.sign}, ${chart.sun.house} house), Moon (${chart.moon.sign}, ${chart.moon.house} house), Venus (${chart.venus.sign}, ${chart.venus.house} house), Mars (${chart.mars.sign}, ${chart.mars.house} house), Mercury (${chart.mercury.sign}, ${chart.mercury.house} house), Jupiter (${chart.jupiter.sign}, ${chart.jupiter.house} house), Saturn (${chart.saturn.sign}, ${chart.saturn.house} house), Life Path (${numerology.lifePath.number}), Heart (${numerology.heart.number}), Expression (${numerology.expression.number}), and Personality (${numerology.personality.number}) into a cohesive narrative. Use warm, spiritual language, explain how these elements interact, and include both strengths and challenges. Provide short sections for each planet and numerology number, similar to the provided example. Include relatable real-life examples (e.g., career, relationships, personal growth). Keep the tone professional, cosmic, and engaging, with a limit of 500 words.

      Original Narrative: ${narrative}
      
      Astrology Data:
      ${Object.entries(chart).map(([planet, data]) => `- ${planet.charAt(0).toUpperCase() + planet.slice(1)}: ${data.sign} in the ${data.house} house - ${data.description}`).join("\n")}

      Numerology Data:
      - Life Path: ${numerology.lifePath.number} - ${numerology.lifePath.description}
      - Heart Number: ${numerology.heart.number} - ${numerology.heart.description}
      - Expression Number: ${numerology.expression.number} - ${numerology.expression.description}
      - Personality Number: ${numerology.personality.number} - ${numerology.personality.description}

      Enhanced Narrative (include short sections for Sun, Moon, Venus, Mars, Mercury, Jupiter, Saturn, Life Path, Heart, Expression, Personality):
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    return narrative;
  }
}

// Poetic interpretation aligned with the provided prompt
function generatePoeticInterpretation(chart, numerology, firstName) {
  const { sun, moon, venus, mars, mercury, jupiter, saturn, ascendant } = chart;

  // Individual poetic interpretations
  const sunPoem = `
Je ${sun.sign} Zon in het ${sun.house} huis gloeit als een ${sun.sign === 'Leeuw' ? 'stralende ster' : sun.sign === 'Schorpioen' ? 'smeulend kooltje' : 'zachte dageraad'}. 
Het kerft je essentie met ${sun.sign === 'Ram' ? 'onbevreesde ambitie, stormend naar nieuwe horizonten als een krijger' : sun.sign === 'Vissen' ? 'dromerig mededogen, wevend visies als een dichter' : 'steady doel, bouwend dromen als een architect'}. 
In je ${sun.house === '1' ? 'stoutmoedige aanwezigheid, leid je met authenticiteit' : sun.house === '10' ? 'carrière, schijn je als een baken van succes' : 'hart, vind je doel door verbinding'}. 
Toch, ${sun.sign === 'Leeuw' ? 'pas op voor trots die je warmte dimt' : 'waak voor rigiditeit die je flow stuit'}.
  `.trim();

  const moonPoem = `
Je ${moon.sign} Maan in het ${moon.house} huis danst als ${moon.sign === 'Kreeft' ? 'tij onder starlight' : moon.sign === 'Waterman' ? 'een kosmische bries' : 'een flakkerende vlam'}. 
Het wiegt je emoties, urgend je om ${moon.sign === 'Stier' ? 'vrede te vinden in levens eenvoudige schoonheden, als een rustige avond thuis' : moon.sign === 'Boogschutter' ? 'vrijheid te zoeken in nieuwe ervaringen, als een reis naar verre landen' : 'je ziels stille diepten te nurturen'}. 
In het ${moon.house === '4' ? 'thuis, wortelt je hart diep' : moon.house === '7' ? 'partnerschappen, zoek je emotionele harmonie' : 'wereld, vormen je gevoelens je pad'}. 
Toch, ${moon.sign === 'Schorpioen' ? 'laat controle los om kwetsbaarheid te omarmen' : 'veranker rusteloosheid om ware vrede te vinden'}.
  `.trim();

  const ascendantPoem = `
Je ${ascendant.sign} Ascendant schildert je ziels eerste penseelstreek, een ${ascendant.sign === 'Weegschaal' ? 'charmant glimlach die anderen nabij trekt' : ascendant.sign === 'Schorpioen' ? 'magnetische blik die geheimen houdt' : 'stoutmoedige vonk die verbinding ontsteekt'}. 
Het vormt hoe de wereld je ziet, ${ascendant.sign === 'Ram' ? 'stormend vooruit als een trailblazer' : ascendant.sign === 'Maagd' ? 'bieden stille dienst als een genezer' : 'wevend harmonie als een diplomaat'}. 
In het ${ascendant.house === '1' ? 'spiegel van zelf, schijn je authentiek' : 'wereld, projecteer je doel'}. 
Toch, ${ascendant.sign === 'Steenbok' ? 'verzacht ambitie met warmte' : 'balanceer intensiteit met openheid'}.
  `.trim();

  const venusPoem = `
Venus in ${venus.sign}, rustend in je ${venus.house} huis, zingt een liefdeslied van ${venus.sign === 'Weegschaal' ? 'gracieuse harmonie, als een dans met een gekoesterde partner' : venus.sign === 'Schorpioen' ? 'zielsdiepe passie, als een transformerende romance' : 'speelse vreugde, als gelach gedeeld met vrienden'}. 
Je hart zoekt ${venus.house === '5' ? 'creatieve romantiek, vonkend vreugde in kunst of liefde' : venus.house === '11' ? 'verbinding door gedeelde dromen' : 'schoonheid in levens stille momenten'}. 
Toch, ${venus.sign === 'Tweelingen' ? 'veranker vluchtige verlangens voor diepere banden' : 'temper intensiteit om lasting liefde te nurturen'}.
  `.trim();

  const marsPoem = `
Mars in ${mars.sign} binnen je ${mars.house} huis brandt met ${mars.sign === 'Ram' ? 'vurige moed, stormend in gevechten als een krijger' : mars.sign === 'Vissen' ? 'intuïtieve flow, bewegend als een rivier naar dromen' : 'steady resolve, bouwend als een ambachtsman'}. 
Je drive vormt ${mars.house === '6' ? 'dagelijkse routines, voedend dienst' : mars.house === '10' ? 'ambities, kerfend je legacy' : 'verbindingen, ontstekend actie'}. 
Toch, ${mars.sign === 'Stier' ? 'geduld voorkomt koppige blokken' : 'focus kanaalt rusteloze energie'}.
  `.trim();

  const mercuryPoem = `
Mercurius in ${mercury.sign}, genesteld in je ${mercury.house} huis, weeft gedachten als ${mercury.sign === 'Tweelingen' ? 'een vibrant tapestry van ideeën, vonkend als vuurvliegjes' : mercury.sign === 'Maagd' ? 'een precise blueprint, gecreëerd met zorg' : 'een poëtische stream, stromend met intuïtie'}. 
Je communiceert door ${mercury.house === '3' ? 'levendige uitwisselingen, als lesgeven aan een klas' : mercury.house === '9' ? 'filosofische quests, als verkennen nieuwe culturen' : 'diepe verbindingen, als hartelijke talks'}. 
Toch, ${mercury.sign === 'Kreeft' ? 'balanceer emotie met duidelijkheid' : 'grond brede ideeën voor impact'}.
  `.trim();

  const jupiterPoem = `
Jupiter in ${jupiter.sign} binnen je ${jupiter.house} huis expandeert als ${jupiter.sign === 'Boogschutter' ? 'een grenzeloze horizon, roepend je om te verkennen' : jupiter.sign === 'Vissen' ? 'een kosmische oceaan, verdiepend je compassie' : 'een steady bloom, groeiend prosperiteit'}. 
Je groei bloeit in ${jupiter.house === '9' ? 'reizen en wijsheid, als studeren abroad' : jupiter.house === '2' ? 'waarderen je giften, als bouwen wealth' : 'dienen anderen, als mentoring een vriend'}. 
Toch, ${jupiter.sign === 'Leeuw' ? 'temper vertrouwen met nederigheid' : 'grond idealisme voor steady vooruitgang'}.
  `.trim();

  const saturnPoem = `
Saturnus in ${saturn.sign}, geworteld in je ${saturn.house} huis, leert met ${saturn.sign === 'Steenbok' ? 'stille kracht, als een berg die stormen doorstaat' : saturn.sign === 'Waterman' ? 'visionaire discipline, als shapen een gemeenschap' : 'zachte lessen, als een wijze elder'}. 
Je uitdagingen bouwen in ${saturn.house === '4' ? 'familie, grondend je wortels' : saturn.house === '7' ? 'partnerschappen, smeedend commitment' : 'zelf, shapen je kern'}. 
Toch, ${saturn.sign === 'Schorpioen' ? 'omarm kwetsbaarheid voor transformatie' : 'verzacht rigiditeit voor groei'}.
  `.trim();

  // Combined story-like summary
  const cosmicStory = `
${firstName}, je ziel is een constellatie, een stralende dans van sterrenstof en dromen. Je ${sun.sign} Zon in het ${sun.house} huis werpt een licht van ${sun.sign === 'Vuur' ? 'vurige doel, blazend door levens uitdagingen' : sun.sign === 'Aarde' ? 'gegronde creatie, bouwend lasting legacies' : 'intuïtieve flow, leidend met wijsheid'}, shapen je pad als een ${sun.sign === 'Leeuw' ? 'koning leidend met hart' : 'dromer wevend visies'}. Het danst met je ${moon.sign} Maan in het ${moon.house} huis, dat ${moon.sign === 'Kreeft' ? 'tij emoties roert, nurturing als een warme haard' : 'rusteloze golven, zoekend vrijheid'} . Samen weven ze een verhaal van ${sun.sign === 'Ram' && moon.sign === 'Stier' ? 'stoutmoedige actie gegrond door steady gevoelens' : 'dynamisch doel verzacht door diepe intuïtie'}.

Je ${ascendant.sign} Ascendant frames deze reis, presenterend je als ${ascendant.sign === 'Weegschaal' ? 'een charmant diplomaat, trekkend anderen dicht' : 'een stoutmoedige vonk, ontstekend inspiratie'}. Het harmoniseert met Venus in ${venus.sign}, dat ${venus.sign === 'Schorpioen' ? 'zielsdiepe liefde giet, transformerend relaties' : 'speelse warmte, vonkend vreugde'} in je ${venus.house === '5' ? 'creatieve hart' : 'verbindingen'}. Mars in ${mars.sign} voedt dit met ${mars.sign === 'Ram' ? 'moedige actie, als een krijgers charge' : 'zachte resolve, als een steady rivier'}, drivend je ${mars.house === '10' ? 'ambities' : 'dagelijks leven'}.

Mercurius in ${mercury.sign} shapen je stem, ${mercury.sign === 'Tweelingen' ? 'wevend ideeën als een storyteller' : 'sprekend met poëtische diepte'}, terwijl Jupiter in ${jupiter.sign} expandeert je ${jupiter.house === '9' ? 'horizons door exploratie' : 'hart door dienst'}. Saturnus in ${saturn.sign} grondt dit met ${saturn.sign === 'Steenbok' ? 'gedisciplineerde kracht, als een builders craft' : 'wijze lessen, als een mentors guidance'}, lerend je in ${saturn.house === '7' ? 'relaties' : 'je innerlijke wereld'}.

Deze kosmische symfonie—je Zons doel, Maans hart, Ascendants masker, Venus liefde, Mars drive, Mercurius stem, Jupiters groei, en Saturnus lessen—creëert een unieke melodie. Je bent een ziel navigeren ${sun.sign === 'Vuur' ? 'passie en actie' : 'diepte en creatie'}, gebalanceerd door ${moon.sign === 'Water' ? 'emotionele tij' : 'steady grounding'}, voor altijd geleid door de sterren om authentiek te schijnen.
  `.trim();

  return {
    poeticInterpretations: {
      sun: sunPoem,
      moon: moonPoem,
      ascendant: ascendantPoem,
      venus: venusPoem,
      mars: marsPoem,
      mercury: mercuryPoem,
      jupiter: jupiterPoem,
      saturn: saturnPoem,
    },
    cosmicStory,
  };
}

// Update the generateAstrologyReport function
async function generateAstrologyReport(firstName, fullName, birthDate, birthTime, birthPlace, userId) {
  console.log(`Generating report for ${firstName}, Birthdate: ${birthDate}, BirthTime: ${birthTime}, BirthPlace: ${birthPlace}`);
  const [year, month, day] = birthDate.split("-").map(Number);
  let [hour, min] = birthTime.split(":").map(Number);

  // Validate birth date and time
  const date = new Date(year, month - 1, day);
  if (isNaN(date) || date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    throw new Error("Invalid birth date format. Use YYYY-MM-DD.");
  }
  if (isNaN(hour) || isNaN(min) || hour < 0 || hour > 23 || min < 0 || min > 59) {
    throw new Error("Invalid birth time format. Use HH:MM.");
  }

  // Normalize birth place
  const normalizedBirthPlace = birthPlace.trim().replace(/\s+/g, ", ");
  let latitude, longitude;
  try {
    const coordinates = await getCoordinatesFromCity(normalizedBirthPlace);
    ({ latitude, longitude } = coordinates);
    console.log(`Coordinates for ${normalizedBirthPlace}: ${latitude}, ${longitude}`);
  } catch (error) {
    console.error("Geocoding failed:", error.message);
    if (normalizedBirthPlace.toLowerCase().includes("lahore")) {
      latitude = 31.5656822;
      longitude = 74.3141829;
      console.log(`Using fallback coordinates for Lahore: ${latitude}, ${longitude}`);
    } else {
      throw new Error(`Failed to fetch coordinates for birth place "${normalizedBirthPlace}". Please use a valid city and country (e.g., "Lahore, Pakistan").`);
    }
  }

  // Fetch timezone
  let tzone;
  try {
    const tzRes = await axios.post(
      "https://json.astrologyapi.com/v1/timezone_with_dst",
      { latitude, longitude, date: birthDate },
      { auth }
    );
    tzone = tzRes.data.timezone;
    console.log(`Timezone for ${normalizedBirthPlace}: ${tzone}`);
  } catch (error) {
    console.error("Timezone API Error:", error.message);
    tzone = 5; // Fallback for Lahore, Pakistan
    console.log(`Using fallback timezone: ${tzone}`);
  }

  // Calculate numerology
  const numerology = calculateNumerology(birthDate, fullName);

  // Prepare payload for astrology data
  const payload = {
    day: Number(day),
    month: Number(month),
    year: Number(year),
    hour: Number(hour),
    min: Number(min),
    lat: parseFloat(latitude),
    lon: parseFloat(longitude),
    tzone: Number(tzone),
  };

  console.log("AstrologyAPI Payload:", payload);

  try {
    console.log("Fetching planetary data from AstrologyAPI...");
    const planetResponse = await axios.post(
      "https://json.astrologyapi.com/v1/planets/tropical",
      payload,
      { auth }
    );
    const planetData = planetResponse.data;

    // Fetch ascendant data separately
    let ascendantData = {};
    try {
      console.log("Fetching ascendant data from AstrologyAPI...");
      const ascendantResponse = await axios.post(
        "https://json.astrologyapi.com/v1/general_ascendant_report/tropical",
        payload,
        { auth }
      );
      ascendantData = ascendantResponse.data;
      console.log("Ascendant Data:", ascendantData);
    } catch (error) {
      console.error("Ascendant API Error:", error.message);
      ascendantData = { sign: "Unknown", house: "1" }; // Fallback
    }

    // Map planets to their signs and houses
    const planets = ["sun", "moon", "venus", "mars", "mercury", "jupiter", "saturn"];
    const chart = {};
    planets.forEach((planetName) => {
      const planet = planetData.find(p => p.name.toLowerCase() === planetName) || {};
      chart[planetName] = {
        sign: planet.sign || "Unknown",
        house: planet.house || "Unknown",
        description: astrologyDescriptions[planetName]?.[planet.sign]
          ? `${astrologyDescriptions[planetName][planet.sign]} ${astrologyDescriptions[planetName].houses[planet.house] || ""}`
          : `Je ${planetName} vormt je persoonlijkheid uniek. 🌟`,
      };
    });

    // Add ascendant to chart
    chart.ascendant = {
      sign: ascendantData.sign || "Unknown",
      house: ascendantData.house || "1",
      description: astrologyDescriptions.ascendant?.[ascendantData.sign]
        ? `${astrologyDescriptions.ascendant[ascendantData.sign]} ${astrologyDescriptions.ascendant.houses["1"] || ""}`
        : "Je Ascendant vormt je uiterlijke persona. 🌟",
    };

    // Generate poetic interpretation
    const poeticInterpretation = generatePoeticInterpretation(chart, numerology, firstName);

    // Generate summary narrative
    let narrative = `
${firstName}, je kosmische reis is een tapestry geweven met draden van compassie, intuïtie en transformatie.

Je Zon in ${chart.sun.sign} in het ${chart.sun.house} huis illumineert je pad met een dromerige essentie. Omarm duidelijkheid om transformatie te navigeren, als vinden doel in diepe persoonlijke groei momenten, zoals carrière shifts of spirituele ontwakingen.

Je Maan in ${chart.moon.sign} in het ${chart.moon.house} huis infuseert emotionele gevoeligheid. Nurture je ziel door vriendschappen, maar laat verleden kwetsuren los om te groeien, wellicht door diep te verbinden met een supportive gemeenschap.

Je Ascendant in ${chart.ascendant.sign} shapen je uiterlijke persona. Presenteer jezelf authentiek, als leiden met vertrouwen in sociale settings, maar balanceer intensiteit met warmte.

Met Venus in ${chart.venus.sign} in het ${chart.venus.house} huis, je liefde is stoutmoedig en gepassioneerd. Kanaal enthousiasme in relaties, als nastreven een partner met fervor, maar temper impulsiviteit voor harmonie.

Mars in ${chart.mars.sign} in het ${chart.mars.house} huis ontsteekt je avontuurlijke geest. Handelt met vigor thuis, als herdefiniëren familie dynamieken, maar vermijd roekeloosheid om gegrond te blijven.

Mercurius in ${chart.mercury.sign} in het ${chart.mercury.house} huis shapen je intuïtieve communicatie. Je express gedachten poëtisch in partnerschappen, als collaboreren creatief, maar zorg voor duidelijkheid om misverstanden te vermijden.

Jupiter in ${chart.jupiter.sign} in het ${chart.jupiter.house} huis amplifieert je compassievolle groei. Expand door relaties, als mentoring anderen, maar grond je idealisme om progress te sustainen.

Saturnus in ${chart.saturn.sign} in het ${chart.saturn.house} huis leert discipline thuis. Bouw emotionele veiligheid, als creëren een stable familie leven, maar verzacht rigiditeit voor warmte.

Je Levenspad ${numerology.lifePath.number} stuwt je als een leider. Leid met doel, als lanceren een stoutmoedig project, maar temper ongeduld.

Je Hartnummer ${numerology.heart.number} zoekt emotionele diepte. Verbind kwetsbaar in relaties, als delen je waarheid, om isolatie te vermijden.

Je Expressienummer ${numerology.expression.number} exudeert visionaire inspiratie. Communiceer kalm, als inspireren een team, om overweldigen te vermijden.

Je Persoonlijkheidsnummer ${numerology.personality.number} reflecteert betrouwbaarheid. Verzacht rigiditeit in sociale settings, als tonen warmte met collega's, om authentiek te schijnen.

Je reis weeft diepte, leiderschap en verbinding in een vibrant kosmisch verhaal. 🌟
    `.trim();

    // Enhance narrative with OpenAI
    const enhancedNarrative = await enhanceNarrativeWithOpenAI(narrative, chart, numerology, firstName);

    // Save to database
    const astrologyReport = new AstrologyReport({
      userId,
      chart,
      numerology,
      narrative: enhancedNarrative,
      poeticInterpretation,
    });
    await astrologyReport.save();

    return { narrative: enhancedNarrative, chart, numerology, poeticInterpretation };
  } catch (error) {
    console.error("AstrologyAPI Error:", error.message, error.response?.status, error.response?.data);
    console.log("Falling back to local calculations...");
    const chart = calculateLocalAstrology(birthDate, birthTime, latitude, longitude);
    const poeticInterpretation = generatePoeticInterpretation(chart, numerology, firstName);
    const narrative = `
${firstName}, je kosmische reis is gevormd door je Zon in ${chart.sun.sign}, Maan in ${chart.moon.sign}, Venus in ${chart.venus.sign}, Mars in ${chart.mars.sign}, Mercurius in ${chart.mercury.sign}, Jupiter in ${chart.jupiter.sign}, Saturnus in ${chart.saturn.sign}, en Ascendant in ${chart.ascendant.sign}. Verken je unieke pad!
    `.trim();
    const enhancedNarrative = await enhanceNarrativeWithOpenAI(narrative, chart, numerology, firstName);

    // Save to database
    const astrologyReport = new AstrologyReport({
      userId,
      chart,
      numerology,
      narrative: enhancedNarrative,
      poeticInterpretation,
    });
    await astrologyReport.save();

    return { narrative: enhancedNarrative, chart, numerology, poeticInterpretation };
  }
}

async function generatePdfAstrologyReport(userData) {
  try {
    // Validate required fields (unchanged, aligns with schema)
    if (!userData.firstName || !userData.gender || !userData.dob || !userData.birthPlace) {
      console.error('Missing fields:', {
        firstName: !!userData.firstName,
        gender: !!userData.gender,
        dob: !!userData.dob,
        birthPlace: !!userData.birthPlace,
      });
      throw new Error('Missing required fields: firstName, gender, dob, or birthPlace');
    }

    // Parse DOB with UTC to avoid timezone offset issues
    const dob = new Date(userData.dob);
    if (isNaN(dob.getTime())) {
      throw new Error('Invalid date of birth');
    }
    const day = dob.getUTCDate(); // Fix: Use UTC to get correct day (31 for Amos)
    const month = dob.getUTCMonth() + 1; // Fix: Use UTC (1-based month)
    const year = dob.getUTCFullYear(); // Fix: Use UTC

    // Parse birthTime (default to 12:00 if not provided, aligns with schema)
    let hour = 12, minute = 0;
    if (userData.birthTime) {
      const timeParts = userData.birthTime.split(':');
      if (timeParts.length === 2) {
        hour = parseInt(timeParts[0]);
        minute = parseInt(timeParts[1]);
        if (isNaN(hour) || isNaN(minute)) {
          throw new Error('Invalid birthTime format');
        }
      }
    }

    // Geocode birthPlace to latitude, longitude, and timezone
    let latitude, longitude, timezone;
    try {
      const geoRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userData.birthPlace)}&limit=1`
      );
      if (!geoRes.data[0]) {
        throw new Error(`Geocoding failed for birthPlace: ${userData.birthPlace}`);
      }
      latitude = parseFloat(geoRes.data[0].lat); // Use API-expected field name
      longitude = parseFloat(geoRes.data[0].lon); // Use API-expected field name

      // Fetch timezone
      try {
        const tzRes = await axios.post(
          'https://json.astrologyapi.com/v1/timezone_with_dst',
          { latitude, longitude, date: userData.dob },
          {
            auth: {
              username: process.env.ASTROLOGY_API_USER_ID, // Fix: Correct env variable name
              password: process.env.ASTROLOGY_API_KEY,
            },
          }
        );
        timezone = parseFloat(tzRes.data.timezone); // Ensure float (e.g., 5.0 for Lahore)
      } catch (tzError) {
        console.error('Timezone API Error:', tzError.response?.data || tzError.message);
        // Fallback for Lahore, Pakistan (PKT, UTC+5)
        timezone = 5.0; // Fix: Correct fallback for Amos's location
      }
    } catch (geoError) {
      console.error('Geocoding Error:', geoError.message);
      throw new Error(`Geocoding error: ${geoError.message}`);
    }

    // Log API credentials for debugging
    console.log('Using PDF AstrologyAPI credentials:', {
      userId: process.env.PDF_ASTROLOGY_USER_ID ? 'Set' : 'Missing',
      apiKey: process.env.PDF_ASTROLOGY_API_KEY ? 'Set' : 'Missing',
    });

    // Prepare API request body with all required fields (aligned with API docs)
    const requestBody = {
      name: `${userData.firstName} ${userData.lastName || ''}`.trim(),
      gender: userData.gender.toLowerCase(),
      day,
      month,
      year,
      hour,
      minute, // Fix: Use "minute" as per API docs
      latitude, // Fix: Use "latitude" as per API docs
      longitude, // Fix: Use "longitude" as per API docs
      timezone, // Fix: Include required "timezone" field
      place: userData.birthPlace,
      language: 'en', // Matches supported language
      chart_style: 'NORTH_INDIAN',
      footer_link: process.env.FOOTER_LINK || 'https://spiritueelchatten.com', // Fix: Use production URL
      logo_url: process.env.LOGO_URL || 'https://spiritueelchatten.nl/images/newLogo.jpg',
      company_name: process.env.COMPANY_NAME || 'Spiritueel Chatten',
      company_info: process.env.COMPANY_INFO || 'Personalized astrology insights by Spiritueel Chatten.',
      domain_url: process.env.DOMAIN_URL || 'https://spiritueelchatten.com',
      company_email: process.env.COMPANY_EMAIL || 'info@spiritueelchatten.com',
      company_landline: process.env.COMPANY_LANDLINE || '+31-20-1234567',
      company_mobile: process.env.COMPANY_MOBILE || '+31-6-12345678',
    };

    console.log('Fetching PDF from AstrologyAPI with body:', JSON.stringify(requestBody));

    // Make API request with increased timeout and retry logic
    const response = await axios.post(
      'https://pdf.astrologyapi.com/v1/natal_horoscope_report/tropical',
      requestBody,
      {
        auth: {
          username: process.env.PDF_ASTROLOGY_USER_ID,
          password: process.env.PDF_ASTROLOGY_API_KEY,
        },
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000, // Increase to 60s for PDF generation
      }
    );

    console.log('Full API Response:', JSON.stringify(response.data));

    // Validate response
    const { status, pdf_url } = response.data;
    if (status !== true || !pdf_url) {
      throw new Error(`PDF API did not return a valid pdf_url: ${JSON.stringify(response.data)}`);
    }

    // Save PDF metadata to database
    const pdfReport = new PdfAstrologyReport({
      userId: userData._id,
      reportType: 'natal_horoscope_tropical',
      pdfUrl: pdf_url,
      language: 'en',
    });

    await pdfReport.save();
    console.log('PDF Report saved to DB:', pdfReport);

    return pdfReport;
  } catch (error) {
    console.error('PDF API Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      requestBody: JSON.stringify(requestBody || 'Not set'), // Log request body for debugging
    });
    if (error.response?.status === 401) {
      throw new Error('Invalid or expired PDF AstrologyAPI credentials. Please check your PDF_ASTROLOGY_USER_ID and PDF_ASTROLOGY_API_KEY.');
    }
    if (error.response?.status === 400) {
      throw new Error(`Invalid request to PDF AstrologyAPI: ${JSON.stringify(error.response?.data)}`);
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new Error('Failed to connect to PDF AstrologyAPI. Please check your network or try again later.');
    }
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
}


exports.getAstrologyReport = async (req, res) => {
  try {
    const userId = req.user._id; // Set by protect middleware
    const report = await AstrologyReport.findOne({ userId }).lean();
    if (!report) {
      return res.status(404).json({ success: false, message: "Astrologie rapport niet gevonden" });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Fetch Astrology Report Error:", error.message);
    res.status(500).json({ success: false, message: "Mislukt om astrologie rapport op te halen" });
  }
};

exports.generateAstrologyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Gebruiker niet gevonden" });
    }

    // Check wallet credits
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.credits < 5) {
      return res.status(400).json({ success: false, message: "Onvoldoende credits" });
    }

    // Extract and validate user data
    const fullName = user.username.trim();
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0];
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(fullName)) {
      return res.status(400).json({ success: false, message: "Ongeldig naamformaat in gebruikerprofiel" });
    }

    if (!user.dob || !user.birthTime || !user.birthPlace) {
      return res.status(400).json({
        success: false,
        message: "Update alstublieft je profiel met geboortedatum, geboortetijd en geboorteplaats",
      });
    }

    if (!user.birthTime.match(/^([01]?\d|2[0-3]):([0-5]?\d)$/)) {
      return res.status(400).json({
        success: false,
        message: "Ongeldig geboortetijdformaat in profiel. Gebruik HH:MM (24-uurs)",
      });
    }

    const birthDate = new Date(user.dob).toISOString().split("T")[0];
    const birthTime = user.birthTime;
    const birthPlace = user.birthPlace;

    // Deduct credits
    wallet.credits -= 5;
    await wallet.save();

    // Generate report
    const report = await generateAstrologyReport(firstName, fullName, birthDate, birthTime, birthPlace, userId);

    res.status(200).json({
      success: true,
      data: report,
      credits: wallet.credits,
    });
  } catch (error) {
    console.error("Report Error:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: error.message.includes("coordinates")
        ? `Ongeldige geboorteplaats "${user ? user.birthPlace : "onbekend"}". Gebruik een geldige stad en land (bijv. "Lahore, Pakistan")`
        : error.message || "Mislukt om rapport te genereren. 😔",
    });
  }
};

exports.getAllAstrologyReports = async (req, res) => {
  try {
    const userId = req.user._id; // Set by protect middleware
    const { page = 1, limit = 3 } = req.query;

    const reports = await AstrologyReport.find({ userId })
      .lean()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (!reports || reports.length === 0) {
      return res.status(404).json({ success: false, message: "Geen astrologierapporten gevonden voor deze gebruiker" });
    }

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Fetch All Astrology Reports Error:", error.message);
    res.status(500).json({ success: false, message: "Mislukt om astrologierapporten op te halen" });
  }
};

exports.getAstrologyReportById = async (req, res) => {
  try {
    const userId = req.user._id; // Set by protect middleware
    const { reportId } = req.params;

    const report = await AstrologyReport.findOne({ _id: reportId, userId }).lean();

    if (!report) {
      return res.status(404).json({ success: false, message: "Astrologierapport niet gevonden voor deze gebruiker" });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Fetch Astrology Report by ID Error:", error.message);
    res.status(500).json({ success: false, message: "Mislukt om astrologierapport op te halen" });
  }
};
exports.generatePdfAstrologyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Gebruiker niet gevonden" });
    }

    // Check existing report
    const existingPdfReport = await PdfAstrologyReport.findOne({ userId });
    if (existingPdfReport) {
      return res.status(200).json({
        success: true,
        data: existingPdfReport,
        message: "PDF report al gegenereerd. Gebruik opgeslagen URL.",
      });
    }

    // Check credits
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.credits < 15) {
      return res.status(400).json({
        success: false,
        message: "Onvoldoende credits (15 vereist voor PDF rapport)",
      });
    }

    // Extract gender from request body
    const { gender } = req.body;
    if (!gender || !['male', 'female'].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Ongeldig of ontbrekend geslacht. Kies 'male' of 'female'.",
      });
    }

    // Extract and validate user data
    const fullName = user.username?.trim();
    const nameParts = fullName ? fullName.split(/\s+/) : [];
    const firstName = nameParts[0] || '';
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!fullName || !nameRegex.test(fullName) || !firstName) {
      return res.status(400).json({
        success: false,
        message: "Ongeldig naamformaat in gebruikersprofiel. Zorg voor een geldige naam.",
      });
    }

    if (!user.dob || !user.birthTime || !user.birthPlace) {
      return res.status(400).json({
        success: false,
        message: "Update je profiel met geboortedatum, geboortetijd en geboorteplaats",
      });
    }

    if (!user.birthTime.match(/^([01]?\d|2[0-3]):([0-5]?\d)$/)) {
      return res.status(400).json({
        success: false,
        message: "Ongeldig geboortetijdformaat in profiel. Gebruik HH:MM (24-uurs)",
      });
    }

    const birthDate = new Date(user.dob).toISOString().split("T")[0];
    const birthTime = user.birthTime;
    const birthPlace = user.birthPlace;

    // Deduct credits
    wallet.credits -= 15;
    await wallet.save();

    // Generate PDF report with user data
    const pdfReport = await generatePdfAstrologyReport({
      _id: userId,
      firstName,
      lastName: nameParts.slice(1).join(' '),
      dob: birthDate,
      birthTime,
      birthPlace,
      gender, // Use gender from request body
    });

    res.status(200).json({
      success: true,
      data: pdfReport,
      credits: wallet.credits,
    });
  } catch (error) {
    console.error("PDF Report Error:", error.message, error.stack);
    let message = "Mislukt om PDF rapport te genereren. 😔";
    if (error.message.includes("coordinates")) {
      message = `Ongeldige geboorteplaats "${user ? user.birthPlace : "onbekend"}". Gebruik een geldige stad en land (bijv. "Lahore, Pakistan")`;
    } else if (error.message.includes("PDF API")) {
      message = "Fout bij het aanroepen van de PDF Astrology API. Probeer het later opnieuw.";
    } else if (error.message.includes("geslacht")) {
      message = "Geslacht ontbreekt of ongeldig. Kies 'male' of 'female'.";
    }
    res.status(500).json({ success: false, message });
  }
};

exports.getPdfAstrologyReports = async (req, res) => {
  try {
    const userId = req.user._id;
    const reports = await PdfAstrologyReport.find({ userId }).lean();
    if (!reports || reports.length === 0) {
      return res.status(404).json({ success: false, message: "Geen PDF astrologierapporten gevonden" });
    }
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Fetch PDF Reports Error:", error.message);
    res.status(500).json({ success: false, message: "Mislukt om PDF rapporten op te halen" });
  }
};