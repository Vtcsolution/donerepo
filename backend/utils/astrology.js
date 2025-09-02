const translateSign = (sign) => {
  const signMap = {
    Aries: 'Ram',
    Taurus: 'Stier',
    Gemini: 'Tweelingen',
    Cancer: 'Kreeft',
    Leo: 'Leeuw',
    Virgo: 'Maagd',
    Libra: 'Weegschaal',
    Scorpio: 'Schorpioen',
    Sagittarius: 'Boogschutter',
    Capricorn: 'Steenbok',
    Aquarius: 'Waterman',
    Pisces: 'Vissen',
  };
  return signMap[sign] || sign;
};

const translateElement = (element) => {
  const map = {
    Fire: 'Vuur',
    Earth: 'Aarde',
    Air: 'Lucht',
    Water: 'Water',
  };
  return map[element] || element;
};

const translateQuality = (quality) => {
  const map = {
    Cardinal: 'kardinaal',
    Fixed: 'vast',
    Mutable: 'veranderlijk',
  };
  return map[quality] || quality;
};

const translateHouse = (house) => {
  const num = parseInt(house);
  let ordinal;
  if (num === 1) ordinal = '1e';
  else if (num === 2) ordinal = '2e';
  else if (num === 3) ordinal = '3e';
  else ordinal = num + 'e';
  return ordinal + ' huis';
};

const astrologyDescriptions = {
  sun: {
  signs: {
    Aries: "Je bent een geboren pionier. Direct, moedig en energiek ga je voorop zonder te twijfelen. Je voelt je levendig als je actie onderneemt, maar kunt ook impulsief en strijdlustig zijn. Je groeit wanneer je leert dat ware kracht niet altijd schreeuwt, maar soms stil vertrouwt.\n🔑 Trigger: Kun jij jezelf zijn zonder altijd te hoeven winnen?",
    Taurus: "Stabiliteit, schoonheid en zintuiglijk genot vormen jouw fundament. Je hebt een rustige kracht en bouwt gestaag aan iets waardevols. Maar je koppigheid en gehechtheid aan comfort kunnen groei in de weg staan.\n🔑 Trigger: Kun jij veiligheid vinden in verandering?",
    Gemini: "Je bent een brug tussen werelden – nieuwsgierig, speels en altijd in beweging. Je zoekt betekenis via communicatie, leren en verbinden. Maar oppervlakkigheid en rusteloosheid kunnen je afhouden van diepgang.\n🔑 Trigger: Kun jij aanwezig zijn bij één ding tegelijk?",
    Cancer: "Je kernverlangen is veiligheid, verbondenheid en emotionele diepgang. Je zorgt graag voor anderen, maar kunt jezelf verliezen in hun behoeften. Je groeit als je jezelf ook thuis leert voelen vanbinnen.\n🔑 Trigger: Kun jij je hart openen zonder jezelf weg te cijferen?",
    Leo: "Je bent geboren om te stralen. Creativiteit, hartskracht en charisma zitten in jouw natuur. Maar als je liefde zoekt via bevestiging, verlies je jezelf. Je ware kracht schijnt als je authentiek durft te zijn.\n🔑 Trigger: Kun jij jezelf liefhebben, ook als niemand kijkt?",
    Virgo: "Je zoekt perfectie, structuur en betekenis in het alledaagse. Je analyseert scherp, maar bent ook hard voor jezelf. Je groeit door jezelf te accepteren – inclusief je 'imperfecties'.\n🔑 Trigger: Kun jij voldoening vinden in het proces, niet alleen in het resultaat?",
    Libra: "Harmonie, schoonheid en balans vormen jouw kern. Je voelt je op je best in verbinding met anderen, maar kunt jezelf verliezen in pleasegedrag. Je leert dat ware harmonie vanbinnen begint.\n🔑 Trigger: Kun jij jezelf trouw blijven, ook als dat tot conflict leidt?",
    Scorpio: "Je bent intens, gepassioneerd en scherpzinnig. Je doorziet maskers en verlangt naar rauwe echtheid. Maar controle en angst voor kwetsbaarheid kunnen je hart afsluiten.\n🔑 Trigger: Kun jij de controle loslaten en toch veilig zijn?",
    Sagittarius: "Je leeft voor groei, avontuur en waarheid. Je bent optimistisch, filosofisch en zoekt altijd de grotere betekenis. Maar je kunt jezelf verliezen in ideeën zonder gronding.\n🔑 Trigger: Kun jij jouw vrijheid vinden binnen grenzen?",
    Capricorn: "Je bent gedisciplineerd, doelgericht en gebouwd voor succes. Je identificeert je sterk met prestaties, maar voelt je soms alleen of onvervuld. Je groeit als je leert dat jouw waarde niet afhankelijk is van wat je doet.\n🔑 Trigger: Kun jij rusten in ‘zijn’, zonder bewijsdrang?",
    Aquarius: "Je bent uniek, visionair en denkt buiten de kaders. Je strijdt voor idealen en collectieve verandering. Maar afstandelijkheid kan je ware verbondenheid kosten.\n🔑 Trigger: Kun jij jezelf écht laten zien, ook met je hart?",
    Pisces: "Je bent dromerig, empathisch en diep spiritueel. Je voelt de pijn én schoonheid van de wereld, maar kunt vluchten in fantasie of slachtofferschap. Je groeit door je intuïtie te vertrouwen én grenzen te stellen.\n🔑 Trigger: Kun jij gevoelig zijn zonder jezelf te verliezen?",
  },
  houses: {
    1: "Zon in het 1e huis – De geboren leider met een zichtbare ziel\nJe bent iemand die niet onopgemerkt blijft. Jouw aanwezigheid vult de ruimte, zelfs als je niets zegt. Je identiteit en uitstraling zijn onlosmakelijk verbonden met wie je diep vanbinnen bent. Je hebt een natuurlijke drang om jezelf te laten zien en te stralen. Maar achter dat licht zit ook een kwetsbaarheid: wat als je niet gezien wordt? Deze plaatsing geeft leiderschap, charisma en wilskracht, maar ook een les in authenticiteit. Psychologische trigger: Je zoekt erkenning, maar heb je jezelf al volledig erkend?",
    2: "Zon in het 2e huis – Zelfvertrouwen door bezit en waarde\nJe voelt je op je best als je stabiliteit en tastbare waarde om je heen creëert. Zelfvertrouwen komt voor jou niet vanzelf – je bouwt het op door prestaties, financiële zekerheid of materiële ankers. Jouw identiteit is verbonden aan wat je bezit of waard bent. Maar pas op: wie ben je als alles wegvalt? Psychologische trigger: Voel jij je waardevol, ook zonder bewijs of bevestiging van buitenaf?",
    3: "Zon in het 3e huis – Denken als kracht en identiteit\nJe leeft om te leren, spreken, delen. Woorden zijn jouw voertuig om te stralen. Je identiteit is verweven met je ideeën, stem en mentale scherpte. Anderen zien je als slim, snel, soms rusteloos. Maar achter je praten kan een angst schuilgaan om écht stil te zijn en je gevoel toe te laten. Psychologische trigger: Ben je aan het communiceren of aan het vluchten in woorden?",
    4: "Zon in het 4e huis – De stille kracht achter gesloten deuren\nJe kracht ligt in je wortels, je gezin, je gevoel van thuis. Je bent geen roeper – jouw licht schijnt vanbinnenuit. Toch kan het voelen alsof niemand ziet wie je echt bent, behalve in je veilige cocon. Deze plaatsing vraagt je: durf je je binnenwereld ook zichtbaar te maken? Psychologische trigger: Kun je jezelf zijn, ook buiten de veilige muren die je om je heen hebt gebouwd?",
    5: "Zon in het 5e huis – Geboren om te creëren en te stralen\nDit is de Zon op haar troon. Je bent hier om te creëren, te spelen, lief te hebben en zichtbaar te zijn. Expressie is jouw zuurstof, of dat nu kunst, kinderen of romantiek is. Maar pas op: je kunt jezelf verliezen in drama of het applaus van anderen. Psychologische trigger: Durf je te stralen puur om wie je bent, niet om wie je probeert te zijn?",
    6: "Zon in het 6e huis – Meesterschap door dienstbaarheid\nJe komt tot bloei als je je nuttig voelt, structuur aanbrengt en ergens écht aan bouwt. Je identiteit is sterk verweven met werk, routines en gezondheid. Maar achter je streven naar perfectie schuilt soms een gevoel van niet goed genoeg zijn. Psychologische trigger: Wie ben jij als je niets hoeft te bewijzen of verbeteren?",
    7: "Zon in het 7e huis – De ander als spiegel van je identiteit\nRelaties spelen een sleutelrol in je leven. Je leert jezelf kennen via de ander. Charmant, afgestemd en relationeel sterk, maar soms te veel gericht op wat de ander wil. De uitdaging: jezelf blijven binnen verbinding. Psychologische trigger: Geef jij jezelf volledig weg om liefde vast te houden?",
    8: "Zon in het 8e huis – Getransformeerde kracht vanuit de schaduw\nJe bent diep, intens en krachtig – maar vaak onzichtbaar voor de buitenwereld. Jouw zon schijnt in het donker: daar waar anderen niet durven kijken. Je wordt gedreven door transformatie, intimiteit en waarheid. Maar het pad is niet licht – het vraagt volledige overgave. Psychologische trigger: Durf jij jezelf echt te laten zien, ook als dat je kwetsbaar maakt?",
    9: "Zon in het 9e huis – De zoeker naar waarheid, visie en vrijheid\nJe leeft om te groeien, ontdekken en boven jezelf uit te stijgen. Jouw identiteit hangt samen met overtuigingen, reizen, studies of spirituele ontwikkeling. Je hebt een natuurlijk gezag, maar kunt soms dogmatisch overkomen. Psychologische trigger: Sta je open voor andere waarheden dan die van jezelf?",
    10: "Zon in het 10e huis – Geboren om impact te maken\nJe wilt gezien worden voor wat je bereikt – niet uit ego, maar omdat je voelt dat je een missie hebt. Je bouwt aan een reputatie, carrière of nalatenschap. Maar pas op: jezelf definiëren via prestaties kan je leeg achterlaten. Psychologische trigger: Kun je bestaan los van je succes, of ben je alleen je rol geworden?",
    11: "Zon in het 11e huis – De visionair met een missie voor het collectief\nJe denkt groot, idealistisch en toekomstgericht. Jouw licht is bedoeld voor de groep, de wereld, de visie. Maar hoe blijf je trouw aan jezelf binnen die grotere droom? Soms verlies je jezelf in de verwachtingen van anderen of in het dienen van een groep. Psychologische trigger: Mag jij bestaan zonder dat je eerst de wereld moet redden?",
    12: "Zon in het 12e huis – Het verborgen licht van de ziel\nJe bent gevoelig, mystiek en vaak meer bezig met de innerlijke dan de uiterlijke wereld. Je straalt vanbinnenuit, maar je worstelt met zichtbaarheid of zelftwijfel. Jouw kracht ligt in spiritualiteit, dromen, heling en stilte. Psychologische trigger: Durf je volledig zichtbaar te zijn zonder jezelf te verliezen?",
  },
},
  moon: {
    signs: {
      Aries: "Je Maan in Ram voedt snelle emotionele reacties en onafhankelijkheid.",
      Taurus: "Je Maan in Stier hunkert naar comfort en emotionele stabiliteit.",
      Gemini: "Je Maan in Tweelingen uit emoties door communicatie en nieuwsgierigheid.",
      Cancer: "Je Maan in Kreeft is diep voedend en emotioneel intuïtief.",
      Leo: "Je Maan in Leeuw zoekt emotionele validatie door drama en creativiteit.",
      Virgo: "Je Maan in Maagd verwerkt emoties analytisch, zoekend naar orde.",
      Libra: "Je Maan in Weegschaal verlangt emotionele harmonie en balans in relaties.",
      Scorpio: "Je Maan in Schorpioen voelt emoties intens, zoekend naar diepte.",
      Sagittarius: "Je Maan in Boogschutter verlangt emotionele vrijheid en verkenning.",
      Capricorn: "Je Maan in Steenbok houdt emoties gedisciplineerd en doelgericht.",
      Aquarius: "Je Maan in Waterman distantieert emotioneel, waarderend intellectuele verbinding.",
      Pisces: "Je Maan in Vissen is empathisch en spiritueel afgestemd.",
    },
    houses: {
    1: "In het 1e huis vormt je Maan een emotioneel expressieve persona.\nAls de Maan van je partner in jouw eerste huis valt, voel je je diep gezien en erkend in je emoties. Je partner raakt direct jouw identiteit en zelfbeeld, waardoor er een sterke band ontstaat. Jij voelt dat je emoties en behoeften er écht mogen zijn.",
    2: "In het 2e huis koppelt je Maan emoties aan veiligheid en bezittingen.\nDe Maan in jouw tweede huis maakt dat je je veilig voelt bij je partner. Hun aanwezigheid geeft je emotionele stabiliteit en een gevoel van zekerheid, zowel emotioneel als materieel. Je voelt je gesteund in je zelfwaarde.",
    3: "In het 3e huis gedijt je Maan op emotionele communicatie.\nWanneer de Maan in jouw derde huis valt, is er een natuurlijke emotionele communicatie. Je voelt je begrepen en gehoord in gesprekken, alsof je partner intuïtief aanvoelt wat je wilt zeggen. Dit schept veiligheid in het dagelijks contact.",
    4: "In het 4e huis voelt je Maan zich thuis in familie en wortels.\nDe Maan in jouw vierde huis voelt als thuiskomen. Je partner raakt je diepste emoties en innerlijke kern. Samen ervaar je een sterke behoefte aan geborgenheid, huiselijkheid en een gevoel van familie.",
    5: "In het 5e huis uit je Maan emoties door creativiteit.\nAls de Maan van je partner in jouw vijfde huis staat, word je emotioneel geraakt in je creativiteit en speelsheid. Er ontstaat plezier, romantiek en een gevoel van vreugde. Je voelt je geliefd en gewaardeerd om wie je bent.",
    6: "In het 6e huis richt je Maan zich op emotionele routines en dienstbaarheid.\nDe Maan in jouw zesde huis raakt aan dagelijkse routines en zorg. Je partner voelt intuïtief wat je nodig hebt in kleine dingen, en er ontstaat een gevoel van veiligheid door zorg, steun en praktische toewijding.",
    7: "In het 7e huis zoekt je Maan emotionele vervulling in partnerschappen.\nWanneer de Maan in jouw zevende huis valt, voel je je diep emotioneel verbonden met je partner. Dit aspect versterkt intimiteit en wederzijds begrip, waardoor de relatie erg betekenisvol en vertrouwd aanvoelt.",
    8: "In het 8e huis duikt je Maan in diepe emotionele transformaties.\nDe Maan in jouw achtste huis raakt je diepste emoties en kwetsbaarheden. Je partner brengt verborgen gevoelens naar boven, waardoor je je intens verbonden voelt. Dit kan zowel helend als confronterend zijn.",
    9: "In het 9e huis hunkert je Maan naar emotionele verkenning en wijsheid.\nAls de Maan van je partner in jouw negende huis valt, verbindt jullie relatie emoties met groei, reizen en levensfilosofie. Je voelt je gesteund in je zoektocht naar zingeving en nieuwe perspectieven.",
    10: "In het 10e huis koppelt je Maan emoties aan carrière en reputatie.\nDe Maan in jouw tiende huis maakt dat je partner een emotionele invloed heeft op je ambities en levensrichting. Je voelt je gesteund in je dromen en doelen, en je partner raakt je gevoel van succes en erkenning.",
    11: "In het 11e huis verbindt je Maan emotioneel met groepen.\nWanneer de Maan in jouw elfde huis valt, voel je je emotioneel verbonden in vriendschap en gezamenlijke idealen. Je partner voelt aan waar je van droomt en ondersteunt je in je wensen voor de toekomst.",
    12: "In het 12e huis is je Maan gevoelig voor het onderbewuste.\nDe Maan in jouw twaalfde huis raakt je onderbewuste en spirituele kant. Je voelt een diepe, soms onverklaarbare emotionele verbinding. Dit kan helend zijn, maar ook oude pijnen naar boven halen die door je partner aangeraakt worden.",
  },
  },
  venus: {
    signs: {
      Aries: "Je Venus in Ram houdt gepassioneerd en impulsief.",
      Taurus: "Je Venus in Stier koestert sensuele en stabiele liefde.",
      Gemini: "Je Venus in Tweelingen flirt met humor en variëteit.",
      Cancer: "Je Venus in Kreeft zoekt emotionele veiligheid in liefde.",
      Leo: "Je Venus in Leeuw houdt dramatisch en zoekt bewondering.",
      Virgo: "Je Venus in Maagd houdt met zorg en praktisch nut.",
      Libra: "Je Venus in Weegschaal gedijt op harmonie en romantische balans.",
      Scorpio: "Je Venus in Schorpioen houdt intens en bezitterig.",
      Sagittarius: "Je Venus in Boogschutter zoekt vrijheid in liefde.",
      Capricorn: "Je Venus in Steenbok waardeert toegewijde, praktische liefde.",
      Aquarius: "Je Venus in Waterman houdt onconventioneel en intellectueel.",
      Pisces: "Je Venus in Vissen houdt met mededogen en dromerigheid.",
    },
   houses: {
    1: "In het 1e huis verbetert je Venus charme en aantrekkelijkheid.\nWanneer de Venus van je partner in jouw eerste huis valt, voel je je meteen gezien en gewaardeerd. Hun aanwezigheid versterkt je zelfvertrouwen en maakt dat je je aantrekkelijker voelt. Er ontstaat vaak een sterke fysieke aantrekkingskracht en een gevoel dat jullie elkaar natuurlijk aanvullen.",
    2: "In het 2e huis houdt je Venus van luxe en financiële veiligheid.\nMet de Venus van je partner in jouw tweede huis voel je je veilig en gekoesterd. Hun liefde richt zich vaak op stabiliteit, zekerheid en het samen opbouwen van iets tastbaars. Dit kan financieel voordeel opleveren of een diep gevoel van waardering voor elkaars waarden.",
    3: "In het 3e huis uit je Venus liefde door communicatie.\nWanneer de Venus van je partner in jouw derde huis staat, brengt hun liefde lichtheid en speelsheid in je dagelijkse gesprekken. Er ontstaat plezier in communicatie, gedeelde interesses en een gevoel van verstandhouding. Jullie vinden elkaar aantrekkelijk in woorden en ideeën.",
    4: "In het 4e huis vindt je Venus liefde in huis en familie.\nDe Venus van je partner in jouw vierde huis geeft een gevoel van thuiskomen. Hun aanwezigheid roept warmte en geborgenheid op, alsof je samen een veilige haven creëert. Vaak ontstaat er een diepe band rond familie, huis en de behoefte om samen een thuis te bouwen.",
    5: "In het 5e huis gedijt je Venus in romantische creativiteit.\nMet de Venus van je partner in jouw vijfde huis ontstaat een sterke romantische en speelse energie. Er is aantrekkingskracht, plezier, en vaak ook creatieve samenwerking. Dit is de stand van verliefdheid, passie en het gevoel dat jullie samen van het leven genieten.",
    6: "In het 6e huis houdt je Venus door dienstbaarheid en zorg.\nWanneer de Venus van je partner in jouw zesde huis staat, brengt hun liefde zorgzaamheid en steun in je dagelijkse leven. Ze helpen je praktisch en maken alledaagse taken lichter en plezieriger. Er kan een liefdevolle samenwerking ontstaan waarin kleine gebaren veel betekenen.",
    7: "In het 7e huis schijnt je Venus in partnerschappen.\nDe Venus van je partner in jouw zevende huis voelt vaak als een soulmate-verbinding. Hun liefde raakt je diep en je ziet hen als de perfecte partner. Er is balans, harmonie en het verlangen naar een serieuze relatie of zelfs huwelijk.",
    8: "In het 8e huis zoekt je Venus diepe, transformerende liefde.\nWanneer de Venus van je partner in jouw achtste huis valt, is de connectie intens, gepassioneerd en soms obsessief. Hun liefde raakt je in je diepste lagen, en er ontstaat een sterke fysieke en emotionele aantrekkingskracht. Dit is de stand van transformatie door liefde.",
    9: "In het 9e huis houdt je Venus van avontuur en culturele verkenning.\nMet de Venus van je partner in jouw negende huis opent de relatie je horizon. Hun liefde inspireert je om te groeien, reizen of filosofische en spirituele ideeën te verkennen. Er ontstaat een gevoel dat jullie samen avonturen beleven en elkaar nieuwe perspectieven bieden.",
    10: "In het 10e huis koppelt je Venus liefde aan status en carrière.\nDe Venus van je partner in jouw tiende huis maakt dat hun liefde invloed heeft op je status en levensdoelen. Je voelt je gesteund in je ambities en er kan bewondering ontstaan voor elkaars prestaties. Samen hebben jullie de kracht om iets zichtbaar in de wereld te zetten.",
    11: "In het 11e huis houdt je Venus door vriendschappen en groepen.\nWanneer de Venus van je partner in jouw elfde huis staat, voelt de relatie vriendschappelijk, gelijkwaardig en inspirerend. Er is plezier in het samen delen van dromen en doelen. Vaak ontstaat er een band waarin liefde en vriendschap hand in hand gaan.",
    12: "In het 12e huis houdt je Venus spiritueel en geheim.\nMet de Venus van je partner in jouw twaalfde huis kan hun liefde mysterieus of karmisch aanvoelen. Het kan voelen alsof jullie elkaar al langer kennen. Hun aanwezigheid raakt verborgen emoties en geeft vaak een diep spiritueel of ongrijpbaar gevoel aan de relatie.",
  },
  },
  mars: {
    signs: {
      Aries: "Je Mars in Ram is assertief en actiegericht.",
      Taurus: "Je Mars in Stier achtervolgt doelen gestaag en sensueel.",
      Gemini: "Je Mars in Tweelingen handelt door communicatie en veelzijdigheid.",
      Cancer: "Je Mars in Kreeft handelt beschermend en emotioneel.",
      Leo: "Je Mars in Leeuw is stoutmoedig en zoekt erkenning.",
      Virgo: "Je Mars in Maagd handelt met precisie en efficiëntie.",
      Libra: "Je Mars in Weegschaal zoekt balans in actie en relaties.",
      Scorpio: "Je Mars in Schorpioen is intens en transformerend.",
      Sagittarius: "Je Mars in Boogschutter achtervolgt avontuur en vrijheid.",
      Capricorn: "Je Mars in Steenbok is gedisciplineerd en ambitieus.",
      Aquarius: "Je Mars in Waterman handelt innovatief en onafhankelijk.",
      Pisces: "Je Mars in Vissen handelt intuïtief en mededogend.",
    },
   houses: {
    1: "In het 1e huis drijft je Mars een stoutmoedige persona.\nWanneer de Mars van je partner in jouw eerste huis valt, voel je zijn of haar energie direct. Er is aantrekking en spanning tegelijk. Jij voelt je krachtiger, maar soms ook uitgedaagd of opgejaagd door de intensiteit.",
    2: "In het 2e huis vecht je Mars voor financiële veiligheid.\nMet Mars in jouw tweede huis raakt je partner jouw gevoel van veiligheid en bezit. Er kan passie zijn rond geld en zekerheid, maar ook strijd om waarden en wie de controle heeft over stabiliteit.",
    3: "In het 3e huis energiseert je Mars communicatie.\nMars in jouw derde huis zorgt voor vurige gesprekken. Jullie communicatie is direct, soms scherp. Er is een intellectuele klik, maar ook kans op botsingen door woorden of meningen.",
    4: "In het 4e huis beschermt je Mars huis en familie.\nAls Mars in jouw vierde huis staat, raakt je partner je thuisgevoel. Er kan warmte en bescherming zijn, maar ook strijd om wie de baas is in de privésfeer. Dit maakt jullie band intens, maar soms onrustig.",
    5: "In het 5e huis voedt je Mars creatieve pursuits.\nMars in jouw vijfde huis ontketent passie, plezier en aantrekkingskracht. Er is een speelse, creatieve energie. Tegelijk kan jaloezie of drama een rol spelen als de intensiteit te groot wordt.",
    6: "In het 6e huis energiseert je Mars dagelijkse routines.\nWanneer Mars in jouw zesde huis valt, voel je de drive van je partner in het dagelijks leven. Samenwerken kan kracht geven, maar er kan ook kritiek of druk ontstaan rond routines en verplichtingen.",
    7: "In het 7e huis drijft je Mars partnerschapsdynamieken.\nMars in jouw zevende huis brengt pure aantrekkingskracht én strijd. Je partner daagt je uit in relaties, waardoor jullie band intens en leerzaam is. Het kan evenveel passie als conflict oproepen.",
    8: "In het 8e huis zoekt je Mars intense transformaties.\nMet Mars in jouw achtste huis ervaar je een diepe, magnetische aantrekkingskracht. Er is sterke seksuele energie, maar ook thema’s van macht en controle. Dit maakt de relatie transformerend en intens.",
    9: "In het 9e huis achtervolgt je Mars avontuur en kennis.\nMars in jouw negende huis inspireert tot avontuur en groei. Samen verkennen jullie nieuwe ideeën of reizen. Toch kan er strijd zijn rond overtuigingen en levensvisie.",
    10: "In het 10e huis drijft je Mars carrière-ambities.\nWanneer Mars in jouw tiende huis valt, stimuleert je partner jouw ambitie. Er is drive om te presteren, maar ook kans op competitie of strijd over status en richting.",
    11: "In het 11e huis energiseert je Mars groepsinspanningen.\nMars in jouw elfde huis wekt energie in vriendschap en gezamenlijke doelen. Samen kunnen jullie een krachtig team vormen, maar botsingen kunnen ontstaan als jullie dromen verschillen.",
    12: "In het 12e huis handelt je Mars subtiel en spiritueel.\nMet Mars in jouw twaalfde huis wordt onbewuste energie aangeraakt. Er is een mysterieuze aantrekkingskracht, maar ook kans op verborgen spanningen of passieve strijd. Dit vraagt om bewustwording en eerlijkheid.",
  },
  },
  mercury: {
    signs: {
      Aries: "Je Mercurius in Ram communiceert stoutmoedig en snel.",
      Taurus: "Je Mercurius in Stier communiceert gestaag en praktisch.",
      Gemini: "Je Mercurius in Tweelingen is geestig en veelzijdig.",
      Cancer: "Je Mercurius in Kreeft communiceert emotioneel en intuïtief.",
      Leo: "Je Mercurius in Leeuw communiceert met flair en zelfvertrouwen.",
      Virgo: "Je Mercurius in Maagd is precies en analytisch.",
      Libra: "Je Mercurius in Weegschaal communiceert diplomatisch.",
      Scorpio: "Je Mercurius in Schorpioen onderzoekt diep en intens.",
      Sagittarius: "Je Mercurius in Boogschutter communiceert filosofisch.",
      Capricorn: "Je Mercurius in Steenbok is gestructureerd en doelgericht.",
      Aquarius: "Je Mercurius in Waterman is innovatief en intellectueel.",
      Pisces: "Je Mercurius in Vissen communiceert intuïtief en poëtisch.",
    },
   houses: {
    1: "In het 1e huis vormt je Mercurius een communicatieve persona.\nWanneer de Mercurius van je partner in jouw eerste huis valt, voel je dat hij of zij voortdurend je manier van denken en spreken beïnvloedt. Jouw zelfbeeld en hoe je jezelf presenteert worden sterk geraakt door zijn of haar woorden. Dit kan stimulerend zijn, maar ook confronterend: je wordt uitgedaagd om duidelijker en scherper te communiceren. Je voelt je vaak gezien en begrepen in hoe je denkt, maar soms ook over-analyseerd.",
    2: "In het 2e huis richt je Mercurius zich op financiële communicatie.\nAls de Mercurius van je partner in jouw tweede huis komt, richt de aandacht zich op waarden, geld en zekerheid. Jouw partner beïnvloedt hoe jij denkt over bezit en stabiliteit. Vaak ontstaan er gesprekken over geld, werk en het opbouwen van iets samen. Je voelt je gestimuleerd om nieuwe manieren te bedenken om inkomsten of zekerheid te creëren. Soms kan dit spanning geven als jullie op dit gebied andere ideeën hebben.",
    3: "In het 3e huis blinkt je Mercurius uit in leren en praten.\nWanneer de Mercurius van je partner in jouw derde huis staat, brengt dit veel communicatie, ideeën en prikkels. Jullie praten eindeloos en inspireren elkaar mentaal. Zijn of haar manier van denken raakt direct jouw manier van leren, schrijven en uitwisselen. Het kan voelen alsof je geest nooit stil staat in zijn of haar aanwezigheid. Soms kan dit leiden tot rusteloosheid, maar vaak geeft het vooral een gevoel van verbinding.",
    4: "In het 4e huis communiceert je Mercurius over huis.\nMet de Mercurius van je partner in jouw vierde huis raken zijn of haar woorden direct je gevoel van veiligheid en thuis. Er ontstaan gesprekken over familie, opvoeding en het verleden. Zijn of haar manier van denken kan je helpen je jeugd te verwerken of je een ander perspectief geven op je emoties. Dit kan helend werken, maar soms ook confronterend, omdat diepe thema’s worden aangeraakt.",
    5: "In het 5e huis uit je Mercurius creatief.\nWanneer de Mercurius van je partner in jouw vijfde huis valt, voel je dat zijn of haar woorden je creativiteit en spelende kant wakker maken. Er ontstaat vaak luchtige, flirterige communicatie. Jullie inspireren elkaar om nieuwe ideeën te bedenken in kunst, spel, of zelfs opvoeding van kinderen. Het voelt speels en stimulerend, maar soms ook dramatisch of theatraal.",
    6: "In het 6e huis richt je Mercurius zich op werk en dienstbaarheid.\nAls de Mercurius van je partner in jouw zesde huis komt, richt hij of zij zich sterk op jouw dagelijkse routines, werk en gezondheid. Er kunnen veel gesprekken zijn over plannen, details en hoe je je leven beter organiseert. Zijn of haar woorden hebben invloed op hoe jij omgaat met structuur en discipline. Dit kan nuttig zijn, maar soms ook kritiek opleveren die je als bemoeiend ervaart.",
    7: "In het 7e huis gedijt je Mercurius in partnerschapsgesprekken.\nMet de Mercurius van je partner in jouw zevende huis voel je dat communicatie de kern van jullie relatie is. Zijn of haar manier van praten en denken raakt direct jouw behoefte aan balans in partnerschap. Er kunnen diepe gesprekken zijn over jullie relatie, maar ook ruzies die juist door woorden ontstaan. Dit kan een spiegel zijn waarin je leert wat je echt zoekt in een partner.",
    8: "In het 8e huis onderzoekt je Mercurius diepe kwesties.\nWanneer de Mercurius van je partner in jouw achtste huis staat, raken zijn of haar woorden direct je diepste emoties en angsten. Er ontstaan gesprekken over intimiteit, vertrouwen, en soms taboes zoals geld, macht of seksualiteit. Je voelt dat hij of zij je confronteert met stukken die je liever verborgen houdt. Dit kan intens zijn, maar ook enorm transformerend.",
    9: "In het 9e huis verkent je Mercurius filosofie en reizen.\nAls de Mercurius van je partner in jouw negende huis komt, voel je dat zijn of haar woorden je horizon verbreden. Jullie hebben veel gesprekken over reizen, filosofie, geloof of levensvisies. Hij of zij daagt je uit om groter te denken en buiten je comfortzone te gaan. Dit geeft vaak een gevoel van vrijheid, maar soms ook botsingen in overtuigingen.",
    10: "In het 10e huis vormt je Mercurius carrièrecommunicatie.\nMet de Mercurius van je partner in jouw tiende huis heeft hij of zij invloed op jouw carrière en levensdoelen. Er ontstaan gesprekken over ambities, status en je rol in de maatschappij. Zijn of haar manier van denken kan je helpen strategisch te plannen of een groter netwerk op te bouwen. Soms kan dit voelen als druk of kritiek, maar meestal brengt het focus en richting.",
    11: "In het 11e huis verbindt je Mercurius met groepen.\nWanneer de Mercurius van je partner in jouw elfde huis valt, draait jullie communicatie vaak om vrienden, netwerken en gezamenlijke dromen. Zijn of haar woorden inspireren je om groter te denken en je toekomst te plannen. Jullie praten veel over idealen en projecten die jullie willen realiseren. Dit geeft energie, maar kan ook botsen als jullie dromen verschillen.",
    12: "In het 12e huis communiceert je Mercurius intuïtief.\nAls de Mercurius van je partner in jouw twaalfde huis komt, raken zijn of haar woorden je op een subtiele, soms verwarrende manier. Communicatie kan vaag of mysterieus aanvoelen, alsof er iets verborgen blijft. Tegelijkertijd kan hij of zij je helpen je intuïtie of spirituele kant sterker te ontwikkelen. Dit voelt soms als een mentale spiegel van je onderbewuste.",
  },
  },
  jupiter: {
  signs: {
    Aries: "Je gelooft in directe actie en persoonlijke moed. Je groeit door risico’s te nemen, initiatief te tonen en leiderschap te claimen. Maar je kunt ook impulsief of roekeloos zijn.\n🔑 Trigger: Kun jij geduld ontwikkelen zonder je vuur te doven?",
    Taurus: "Je vertrouwt op stabiliteit, zintuiglijk genot en praktische rijkdom. Je groeit langzaam maar gestaag. Maar je kunt materialistisch worden of vasthouden aan het bekende.\n🔑 Trigger: Kun jij groei omarmen buiten je comfortzone?",
    Gemini: "Je gelooft in kennis, communicatie en flexibiliteit. Je groeit door vragen te stellen, te reizen en te verbinden. Maar je kunt versnipperd raken of oppervlakkig blijven.\n🔑 Trigger: Kun jij diepgang vinden in je zoektocht naar informatie?",
    Cancer: "Je groeit door zorg, verbinding en emotionele veiligheid. Je vertrouwt op intuïtie en familiebanden. Maar je kunt te beschermend of afhankelijk worden.\n🔑 Trigger: Kun jij anderen koesteren zonder jezelf te vergeten?",
    Leo: "Je gelooft in jezelf, creativiteit en grootsheid. Je groeit door je licht te laten schijnen en anderen te inspireren. Maar je kunt ego-gericht of dominant zijn.\n🔑 Trigger: Kun jij delen zonder altijd applaus nodig te hebben?",
    Virgo: "Je groeit door toewijding, dienstbaarheid en praktische kennis. Je gelooft in verbetering en details. Maar je kunt te kritisch of perfectionistisch zijn.\n🔑 Trigger: Kun jij het grotere geheel blijven zien te midden van de details?",
    Libra: "Je gelooft in harmonie, rechtvaardigheid en samenwerking. Je groeit via relaties en zoekt balans in alles. Maar je kunt besluiteloos of pleaserig worden.\n🔑 Trigger: Kun jij trouw blijven aan jezelf binnen verbindingen?",
    Scorpio: "Je vertrouwt op innerlijke kracht, intensiteit en transformatie. Je groeit door het duister aan te kijken en je ziel te zuiveren. Maar je kunt obsessief of controlerend worden.\n🔑 Trigger: Kun jij kracht vinden in overgave?",
    Sagittarius: "Je gelooft in vrijheid, avontuur en waarheid. Je groeit door reizen, studie en spiritualiteit. Maar je kunt dogmatisch of rusteloos zijn.\n🔑 Trigger: Kun jij jouw waarheid leven zonder die op te dringen?",
    Capricorn: "Je vertrouwt op structuur, discipline en verantwoordelijkheid. Je groeit via prestatie, geduld en visie. Maar je kunt pessimistisch of te streng zijn.\n🔑 Trigger: Kun jij genieten van het proces, niet alleen van het doel?",
    Aquarius: "Je gelooft in vooruitgang, idealen en gemeenschapszin. Je groeit via innovatie en onafhankelijk denken. Maar je kunt te afstandelijk of rebels zijn.\n🔑 Trigger: Kun jij verbinden zonder jezelf te verliezen in ideeën?",
    Pisces: "Je vertrouwt op gevoel, verbeelding en universele liefde. Je groeit door spiritualiteit, compassie en overgave. Maar je kunt verdwalen in illusies of escapisme.\n🔑 Trigger: Kun jij grenzeloos liefhebben zonder jezelf te verliezen?",
  },
  houses: {
    1: "Jupiter in het 1e huis – Grootse uitstraling\nJe komt zelfverzekerd, optimistisch en inspirerend over. Je gelooft in jezelf en straalt dat ook uit. Maar arrogantie of te veel willen overtuigen kan je valkuil zijn.\nWanneer zijn of haar Jupiter in jouw eerste huis valt, voel je je door deze persoon onmiddellijk geïnspireerd en aangemoedigd. Hij of zij ziet je potentie en helpt je om groter te dromen. Jij ervaart hun aanwezigheid als positief en levensverruimend, alsof je meer durft te zijn dan je dacht.\n🔑 Trigger: Kun je groot zijn zonder jezelf te overschreeuwen?",
    2: "Jupiter in het 2e huis – Groei door waarde en bezit\nJe hebt aanleg voor financiële groei en een gezond gevoel voor eigenwaarde. Je zoekt betekenis in materie en stabiliteit. Maar overdaad of verslaving aan comfort kan je remmen.\nZijn of haar Jupiter in jouw tweede huis brengt kansen op groei in je financiën en eigenwaarde. Deze persoon moedigt je aan om vertrouwen te hebben in je talenten en om groter te denken over wat je waard bent. Samen voel je dat overvloed en mogelijkheden binnen handbereik zijn.\n🔑 Trigger: Zit jouw waarde in wat je bezit – of in wie je bent?",
    3: "Jupiter in het 3e huis – Denken in mogelijkheden\nJe geest is open, snel en vol ideeën. Je communiceert met flair en leert snel. Maar je kunt ook veel praten en weinig luisteren.\nMet Jupiter in jouw derde huis komt er veel positieve energie in communicatie en leren. Deze persoon inspireert je om je kennis te verbreden en stimuleert je met optimisme en humor. Je voelt dat gesprekken met hen je horizon vergroten en je denken verruimen.\n🔑 Trigger: Gebruik je woorden om te verbinden – of om indruk te maken?",
    4: "Jupiter in het 4e huis – Innerlijke rijkdom\nJe vindt zingeving in je roots, familie en innerlijke wereld. Thuis is jouw bron van kracht. Maar idealiseren van het verleden of familiedruk kan knellen.\nZijn of haar Jupiter in jouw vierde huis geeft een gevoel van veiligheid, warmte en optimisme in je thuisomgeving. Je ervaart dat je samen een basis van vertrouwen en groei kunt bouwen. Er kan ook letterlijk uitbreiding komen in familie of woonruimte.\n🔑 Trigger: Voel je je vrij om je eigen fundament te bouwen?",
    5: "Jupiter in het 5e huis – Spelen met vertrouwen\nJe bent creatief, inspirerend en vol levenslust. Je gelooft in zelfexpressie en plezier. Maar je kunt overdrijven of erkenning zoeken via drama.\nWanneer Jupiter in jouw vijfde huis valt, wordt plezier, creativiteit en romantiek versterkt. Deze persoon brengt een gevoel van speelsheid en overvloed in je leven, waardoor je jezelf vrijer en expressiever voelt. Dit kan ook wijzen op vruchtbaarheid of gezamenlijke creatieve projecten.\n🔑 Trigger: Kun je genieten zonder erkenning van buitenaf nodig te hebben?",
    6: "Jupiter in het 6e huis – Groei via toewijding\nJe vindt betekenis in werk, dienstbaarheid en gezondheid. Je verbetert graag systemen of helpt anderen groeien. Maar je kunt overwerkt raken of anderen willen redden.\nZijn of haar Jupiter in jouw zesde huis brengt positiviteit in je dagelijkse routines en gezondheid. Deze persoon inspireert je om beter voor jezelf te zorgen en laat je zien dat werk ook plezierig kan zijn. Samen voel je meer motivatie om orde en welzijn in je leven te brengen.\n🔑 Trigger: Mag jij zelf groeien zonder altijd ‘nuttig’ te moeten zijn?",
    7: "Jupiter in het 7e huis – Relaties als groeipad\nJe zoekt wijsheid, groei en expansie in verbindingen. Je gelooft in liefdevolle samenwerking. Maar je kunt teveel geven of je eigen pad verliezen in de ander.\nMet Jupiter in jouw zevende huis kan deze persoon aanvoelen als een levenspartner of iemand die je relaties verrijkt. Hij of zij brengt groei, optimisme en vertrouwen in je samenwerkingen. Je ervaart dat verbinding met hen meer kansen en geluk aantrekt.\n🔑 Trigger: Kun je groeien in relaties zonder jezelf te verliezen?",
    8: "Jupiter in het 8e huis – Wijsheid in de diepte\nJe groeit door transformatie, intimiteit en het aangaan van schaduwkanten. Je bezit een diepe spirituele of psychologische kracht. Maar je kunt vluchten in mystiek of controle.\nWanneer zijn of haar Jupiter in jouw achtste huis valt, voel je een diepe expansie op het gebied van intimiteit, gedeelde middelen en transformatie. Deze persoon kan je leren loslaten en vertrouwen in het proces van verandering, waardoor je gezamenlijke groei ervaart.\n🔑 Trigger: Durf je licht te vinden midden in je donkerste stukken?",
    9: "Jupiter in het 9e huis – Geboren visionair\nJe denkt groot, zoekt de waarheid en hebt een aangeboren verlangen naar zingeving. Je reist graag of verdiept je in religie, filosofie of wetenschap. Maar je kunt dogmatisch worden of de realiteit verliezen.\nZijn of haar Jupiter in jouw negende huis voelt alsof je samen op ontdekkingsreis gaat. Deze persoon stimuleert je om te leren, te reizen, of een bredere levensvisie te ontwikkelen. Hij of zij opent je wereld en geeft je vertrouwen in je eigen pad.\n🔑 Trigger: Kun je geloven zonder de waarheid op te leggen?",
    10: "Jupiter in het 10e huis – Succes met betekenis\nJe streeft naar maatschappelijke groei en betekenisvol leiderschap. Je bent ambitieus met een idealistische ondertoon. Maar je kunt overmoedig worden of status verwarren met zingeving.\nMet Jupiter in jouw tiende huis ervaar je dat deze persoon je carrière en reputatie positief beïnvloedt. Hij of zij moedigt je aan om groots te denken over je doelen en kan deuren openen richting succes. Je voelt meer vertrouwen in je mogelijkheden om impact te maken.\n🔑 Trigger: Wat betekent echt succes voor jou?",
    11: "Jupiter in het 11e huis – Groeien via visie en vriendschap\nJe gelooft in vooruitgang en sociale verandering. Je bent een inspirator voor groepen en netwerken. Maar je idealen kunnen botsen met de realiteit.\nZijn of haar Jupiter in jouw elfde huis versterkt je sociale kring en dromen voor de toekomst. Samen ervaar je vriendschap, samenwerking en kansen in groepen of netwerken. Deze persoon helpt je groter te denken over je idealen en hoe je ze kunt waarmaken.\n🔑 Trigger: Kun je jouw visie delen zonder je beter te voelen dan anderen?",
    12: "Jupiter in het 12e huis – Spirituele expansie\nJe voelt diep vertrouwen in het onzichtbare. Je intuïtie is sterk, en je groeit in stilte en afzondering. Maar je kunt je verliezen in escapisme of passiviteit.\nWanneer Jupiter in jouw twaalfde huis valt, voel je dat deze persoon je innerlijke wereld en spiritualiteit verruimt. Hij of zij geeft je vertrouwen in het onbekende en laat je zien dat overgave en geloof groei kunnen brengen. Samen ervaar je een diepe, bijna kosmische verbinding.\n🔑 Trigger: Geloof je in jezelf – ook als niemand het ziet?",
  },
},

  saturn: {
    signs: {
      Aries: "Je Saturnus in Ram leert discipline in actie.",
      Taurus: "Je Saturnus in Stier eist stabiliteit en geduld.",
      Gemini: "Je Saturnus in Tweelingen disciplineert communicatie.",
      Cancer: "Je Saturnus in Kreeft structureert emotionele veiligheid.",
      Leo: "Je Saturnus in Leeuw leert nederigheid in zelfexpressie.",
      Virgo: "Je Saturnus in Maagd eist precisie en dienstbaarheid.",
      Libra: "Je Saturnus in Weegschaal balanceert relaties met verantwoordelijkheid.",
      Scorpio: "Je Saturnus in Schorpioen transformeert door discipline.",
      Sagittarius: "Je Saturnus in Boogschutter structureert verkenning.",
      Capricorn: "Je Saturnus in Steenbok gedijt op ambitie en structuur.",
      Aquarius: "Je Saturnus in Waterman disciplineert innovatie.",
      Pisces: "Je Saturnus in Vissen structureert spirituele groei.",
    },
   houses: {
    1: "In het 1e huis vormt je Saturnus een gedisciplineerde persona.\nWanneer de Saturnus van je partner in jouw eerste huis staat, kan dit een gevoel geven van serieuze verantwoordelijkheid. Jij ervaart zijn of haar aanwezigheid als confronterend, omdat je vaak bewust wordt gemaakt van je beperkingen of verantwoordelijkheden. Dit aspect wijst vaak op diepe lessen in relaties en verbintenissen.",
    2: "In het 2e huis structureert je Saturnus financiële stabiliteit.\nWanneer de Saturnus van je partner in jouw tweede huis komt, legt hij of zij nadruk op zekerheid, geld en waarden. Jij kan je soms beperkt voelen in je vrijheid rondom bezit of inkomsten. Tegelijkertijd helpt dit aspect om langdurige stabiliteit en discipline op te bouwen in financiën en materiële zaken.",
    3: "In het 3e huis disciplineert je Saturnus communicatie.\nMet de Saturnus van je partner in jouw derde huis kan communicatie serieus en soms zwaar aanvoelen. Je leert via de ander om zorgvuldiger te spreken en je gedachten beter te structureren. Dit kan beperkend zijn, maar ook leiden tot meer diepgang en betrouwbaarheid in hoe jullie ideeën uitwisselen.",
    4: "In het 4e huis stabiliseert je Saturnus huisleven.\nWanneer de Saturnus van je partner in jouw vierde huis staat, raakt dit jouw gevoel van thuis, veiligheid en familie. Soms kan het zwaar aanvoelen, alsof verantwoordelijkheid en verplichtingen centraal staan. Toch helpt dit aspect ook om een stevig fundament te bouwen binnen je privéleven en familiebanden.",
    5: "In het 5e huis disciplineert je Saturnus creativiteit.\nMet de Saturnus van je partner in jouw vijfde huis kan speelsheid soms begrensd aanvoelen. Jij kan het gevoel hebben dat plezier, liefde of creatieve expressie serieuze thema’s worden. Uiteindelijk helpt dit aspect om je creatieve kant en liefdesleven meer vorm en verantwoordelijkheid te geven.",
    6: "In het 6e huis structureert je Saturnus werk en gezondheid.\nWanneer de Saturnus van je partner in jouw zesde huis staat, legt dit nadruk op werk, routines en gezondheid. Jij kan je soms bekritiseerd of beperkt voelen in je dagelijkse bezigheden. Tegelijkertijd stimuleert dit aspect discipline, verantwoordelijkheid en een stabiele structuur in je leefstijl.",
    7: "In het 7e huis eist je Saturnus commitment in partnerschappen.\nMet de Saturnus van je partner in jouw zevende huis wordt de relatie zelf vaak ervaren als een zware verantwoordelijkheid. Er zijn diepe lessen in balans, vertrouwen en toewijding. Soms voelt het beperkend, maar dit aspect wijst juist op duurzame en karmische verbindingen.",
    8: "In het 8e huis eist je Saturnus discipline in transformatie.\nSaturnus in het achtste huis maakt de band intens en karmisch. Jij kan diepe angsten of onzekerheden bij de ander oproepen, maar ook helpen om oude patronen los te laten. Het kan voelen alsof jij een spiegel bent voor hun kwetsbaarheid. Dit aspect vraagt tijd en geduld om vertrouwen te laten groeien.",
    9: "In het 9e huis structureert je Saturnus verkenning.\nIn het negende huis beïnvloedt Saturnus overtuigingen, reizen en levensfilosofie. Jij kan de ander structuur geven in hun geloof of studierichting. Toch kan de ander zich soms beperkt voelen, alsof jij hun horizon verkleint. Uiteindelijk help jij hen echter om hun idealen praktisch en concreet te maken.",
    10: "In het 10e huis drijft je Saturnus carrière-discipline.\nSaturnus in het tiende huis raakt carrière en status. Jij kan de ander aansporen om verantwoordelijkheid te nemen voor hun ambities. Soms voelt dit als druk of kritiek, maar uiteindelijk stimuleer jij hen om succes te behalen. Jij wordt gezien als iemand die helpt een stevig fundament te bouwen.",
    11: "In het 11e huis structureert je Saturnus groepsinspanningen.\nWanneer Saturnus in het elfde huis van je partner staat, beïnvloedt dit vriendschappen en groepsverbanden. Jij kan de ander leren om serieuzer met vrienden of idealen om te gaan. Soms voelt de ander zich geremd in sociale kringen door jouw invloed. Toch bied jij loyaliteit en betrouwbaarheid in gezamenlijke doelen.",
    12: "In het 12e huis disciplineert je Saturnus spiritualiteit.\nSaturnus in het twaalfde huis voelt zwaar en ongrijpbaar. Jij kan onbewust angsten of onzekerheden van de ander oproepen. Soms ervaart de ander je als streng of afstandelijk op een manier die ze niet helemaal begrijpen. Toch help jij hen om oude karmische patronen onder ogen te zien en te helen.",
  },
  },
  ascendant: {
    signs: {
      Aries: "Je Ram Ascendant projecteert stoutmoedigheid en energie.",
      Taurus: "Je Stier Ascendant straalt kalmte en betrouwbaarheid uit.",
      Gemini: "Je Tweelingen Ascendant is nieuwsgierig en communicatief.",
      Cancer: "Je Kreeft Ascendant is voedend en gevoelig.",
      Leo: "Je Leeuw Ascendant schijnt met zelfvertrouwen en charisma.",
      Virgo: "Je Maagd Ascendant is precies en behulpzaam.",
      Libra: "Je Weegschaal Ascendant zoekt harmonie en charme.",
      Scorpio: "Je Schorpioen Ascendant straalt intensiteit en mysterie uit.",
      Sagittarius: "Je Boogschutter Ascendant is avontuurlijk en optimistisch.",
      Capricorn: "Je Steenbok Ascendant projecteert ambitie en discipline.",
      Aquarius: "Je Waterman Ascendant is innovatief en uniek.",
      Pisces: "Je Vissen Ascendant is mededogend en dromerig.",
    },
  },
};
const elementCompatibility = {
  Vuur: {
    Vuur: "Een vlammende verbinding vol passie en energie, die creativiteit vonkt maar risico op uitbranden loopt als niet getemperd.",
    Aarde: "Een grondende kracht ontmoet vurige ambitie, balancerend stabiliteit met opwinding, hoewel wrijving kan ontstaan door verschillende tempo's.",
    Lucht: "Een levendige synergie waar ideeën actie ontsteken, maar overdenken kan de vonk dimmen.",
    Water: "Een dynamisch samenspel van passie en emotie, creërend diepte maar vereisend zorg om elkaar niet te overweldigen."
  },
  Aarde: {
    Vuur: "Stabiliteit tempert vurige impulsiviteit, groei bevorderend, hoewel geduld nodig is om je ritmes af te stemmen.",
    Aarde: "Een rotsvaste band gebouwd op gedeelde waarden, maar flexibiliteit is sleutel om stagnatie te vermijden.",
    Lucht: "Praktisch nut ontmoet intellect, creërend een gebalanceerd partnerschap, hoewel emotionele disconnecties bruggen nodig hebben.",
    Water: "Een voedende verbinding waar veiligheid gevoeligheid ontmoet, maar overvoorzichtigheid kan emotionele stroom belemmeren."
  },
  Lucht: {
    Vuur: "Ideeën wakkeren de vlammen van passie aan, creërend een opwindende band, maar grounding is nodig om het te behouden.",
    Aarde: "Intellect ontmoet praktisch nut, groei bevorderend door structuur, hoewel rigiditeit creativiteit kan belemmeren.",
    Lucht: "Een wervelwind van ideeën en communicatie, levendig maar soms ontbrekend aan emotionele diepte.",
    Water: "Intellect en emotie verstrengelen zich, creërend een poëtische verbinding, maar helderheid is nodig om misverstanden te vermijden."
  },
  Water: {
    Vuur: "Emotie tempert passie, creërend een zielvolle band, maar intensiteit balanceren met stabiliteit is sleutel.",
    Aarde: "Gevoeligheid ontmoet veiligheid, bevorderend een voedende partnerschap, hoewel emotionele openheid inspanning vereist.",
    Lucht: "Emotie en intellect dansen samen, creërend inspiratie, maar grounding is nodig voor stabiliteit.",
    Water: "Een diep intuïtieve verbinding, rijk aan empathie, maar grenzen zijn nodig om emotionele overwhelm te vermijden."
  }
};const signElements = {
  Aries: "Fire", Leo: "Fire", Sagittarius: "Fire",
  Taurus: "Earth", Virgo: "Earth", Capricorn: "Earth",
  Gemini: "Air", Libra: "Air", Aquarius: "Air",
  Cancer: "Water", Scorpio: "Water", Pisces: "Water"
};

// Sign to quality mapping
const signQualities = {
  Aries: "Cardinal", Taurus: "Fixed", Gemini: "Mutable",
  Cancer: "Cardinal", Leo: "Fixed", Virgo: "Mutable",
  Libra: "Cardinal", Scorpio: "Fixed", Sagittarius: "Mutable",
  Capricorn: "Cardinal", Aquarius: "Fixed", Pisces: "Mutable"
};
const combinedInfluences = {
  sun: (userSign, partnerSign, userHouse, partnerHouse) => {
    const userElement = signElements[userSign] || "Unknown";
    const partnerElement = signElements[partnerSign] || "Unknown";
    const userQuality = signQualities[userSign] || "Unknown";
    const partnerQuality = signQualities[partnerSign] || "Unknown";
    const elementInteraction = elementCompatibility[translateElement(userElement)]?.[translateElement(partnerElement)] || "Een unieke mengeling van energieën die jullie verbinding vormt.";
    
    let narrative = `${elementInteraction} Jullie kernidentiteiten dansen samen, met ${translateSign(userSign)}'s ${translateQuality(userQuality)} energie ${userHouse !== "Unknown" ? ` in het ${translateHouse(userHouse)}` : ""} brengend ${astrologyDescriptions.sun.signs[userSign]?.toLowerCase() || "een levendige essentie"} aan de relatie. Ondertussen voegt ${translateSign(partnerSign)}'s ${translateQuality(partnerQuality)} energie ${partnerHouse !== "Unknown" ? ` in het ${translateHouse(partnerHouse)}` : ""} toe ${astrologyDescriptions.sun.signs[partnerSign]?.toLowerCase() || "zijn eigen licht"}. `;
    
    if (userElement === partnerElement) {
      narrative += `Jullie gedeelde ${translateElement(userElement).toLowerCase()} essentie creëert een natuurlijke harmonie, zoals twee vlammen die samensmelten of twee rivieren die samenstromen. Bijvoorbeeld, jullie kunnen elkaar inspireren om gedurfde dromen na te jagen (${translateSign(userSign)}) terwijl jullie elkaar grondt in gedeelde doelen (${translateSign(partnerSign)}).`;
    } else if (userElement === "Fire" && partnerElement === "Water") {
      narrative += `Jullie vurige passie (${translateSign(userSign)}) ontmoet hun emotionele diepte (${translateSign(partnerSign)}), creërend een stomende, transformerende verbinding. Stel je knusse nachten voor waarop jullie dromen delen, maar pas op voor botsende intensiteiten—probeer actie te balanceren met oprechte gesprekken.`;
    } else if (userElement === "Earth" && partnerElement === "Air") {
      narrative += `Jullie gegronde natuur (${translateSign(userSign)}) complementeert hun intellectuele vonk (${translateSign(partnerSign)}), zoals een boom die zwaait in de bries. Jullie kunnen een toekomst samen plannen, maar zorg ervoor dat hun ideeën niet verstikt raken door jullie praktisch nut—probeer samen te brainstormen.`;
    }
    
    if (userHouse !== "Unknown" && partnerHouse !== "Unknown") {
      narrative += ` De ${translateHouse(userHouse)} en ${translateHouse(partnerHouse)} plaatsingen suggereren dat jullie energieën schijnen in ${astrologyDescriptions.sun.houses[userHouse]?.toLowerCase() || "unieke gebieden"}, bevorderend een partnerschap waar jullie groeien door gedeeld doel.`;
    }
    
    return narrative;
  },
  moon: (userSign, partnerSign, userHouse, partnerHouse) => {
    const userElement = signElements[userSign] || "Unknown";
    const partnerElement = signElements[partnerSign] || "Unknown";
    const elementInteraction = elementCompatibility[translateElement(userElement)]?.[translateElement(partnerElement)] || "Een unieke emotionele wisselwerking.";
    
    let narrative = `${elementInteraction} Jullie emotionele werelden verstrengelen zich, met ${translateSign(userSign)}'s ${astrologyDescriptions.moon.signs[userSign]?.toLowerCase() || "emotionele essentie"} ${userHouse !== "Unknown" ? ` in het ${translateHouse(userHouse)}` : ""} mengend met ${translateSign(partnerSign)}'s ${astrologyDescriptions.moon.signs[partnerSign]?.toLowerCase() || "emotioneel ritme"} ${partnerHouse !== "Unknown" ? ` in het ${translateHouse(partnerHouse)}` : ""}. `;
    
    if (userElement === "Water" && partnerElement === "Water") {
      narrative += `Jullie gedeelde emotionele diepte creëert een zielvolle band, zoals twee oceanen die samensmelten. Jullie kunnen troost vinden in stille momenten samen, maar stel grenzen om emotionele overwhelm te vermijden—probeer samen te journalen om gevoelens te delen.`;
    } else if (userElement === "Fire" && partnerElement === "Earth") {
      narrative += `Jullie gepassioneerde emoties (${translateSign(userSign)}) ontmoeten hun standvastige hart (${translateSign(partnerSign)}), creërend een warme, gegronde verbinding. Stel je knusse avonden voor balancerend spontaniteit met routine, maar zorg ervoor dat hun behoefte aan stabiliteit jullie vuur niet dimt.`;
    }
    
    return narrative;
  },
  venus: (userSign, partnerSign, userHouse, partnerHouse) => {
    const userElement = signElements[userSign] || "Unknown";
    const partnerElement = signElements[partnerSign] || "Unknown";
    const elementInteraction = elementCompatibility[translateElement(userElement)]?.[translateElement(partnerElement)] || "Een unieke romantische wisselwerking.";
    
    let narrative = `${elementInteraction} Jullie romantische stijlen mengen prachtig, met ${translateSign(userSign)}'s ${astrologyDescriptions.venus.signs[userSign]?.toLowerCase() || "aanpak van liefde"} ${userHouse !== "Unknown" ? ` in het ${translateHouse(userHouse)}` : ""} dansend met ${translateSign(partnerSign)}'s ${astrologyDescriptions.venus.signs[partnerSign]?.toLowerCase() || "romantische energie"} ${partnerHouse !== "Unknown" ? ` in het ${translateHouse(partnerHouse)}` : ""}. `;
    
    if (userSign === "Leo" && partnerSign === "Libra") {
      narrative += `Jullie dramatische flair (${translateSign(userSign)}) ontmoet hun harmonieuze charme (${translateSign(partnerSign)}), creërend een romance waardig een sprookje. Stel je grootse gebaren voor gebalanceerd door doordachte daden van liefde, zoals het plannen van een diner bij kaarslicht samen.`;
    } else if (userElement === "Air" && partnerElement === "Water") {
      narrative += `Jullie intellectuele aanpak van liefde (${translateSign(userSign)}) ontmoet hun emotionele diepte (${translateSign(partnerSign)}), creërend een poëtische romance. Probeer liefdesbrieven te schrijven om jullie stijlen te overbruggen, maar zorg ervoor dat emoties niet verloren gaan in woorden.`;
    }
    
    return narrative;
  },
  mars: (userSign, partnerSign, userHouse, partnerHouse) => {
    const userElement = signElements[userSign] || "Unknown";
    const partnerElement = signElements[partnerSign] || "Unknown";
    const elementInteraction = elementCompatibility[translateElement(userElement)]?.[translateElement(partnerElement)] || "Een unieke gepassioneerde wisselwerking.";
    
    let narrative = `${elementInteraction} Jullie verlangens ontsteken, met ${translateSign(userSign)}'s ${astrologyDescriptions.mars.signs[userSign]?.toLowerCase() || "assertieve energie"} ${userHouse !== "Unknown" ? ` in het ${translateHouse(userHouse)}` : ""} voedend ${translateSign(partnerSign)}'s ${astrologyDescriptions.mars.signs[partnerSign]?.toLowerCase() || "dynamische drive"} ${partnerHouse !== "Unknown" ? ` in het ${translateHouse(partnerHouse)}` : ""}. `;
    
    if (userElement === "Fire" && partnerElement === "Fire") {
      narrative += `Jullie gedeelde vurige passie creëert een elektrificerende band, zoals twee vonken die een vlam ontsteken. Kanaal deze energie in gedeelde avonturen, maar oefen geduld om botsende ego's te vermijden.`;
    } else if (userElement === "Earth" && partnerElement === "Water") {
      narrative += `Jullie standvastige drive (${translateSign(userSign)}) ontmoet hun emotionele intensiteit (${translateSign(partnerSign)}), creërend een gebalanceerde passie. Stel je voor samen te werken aan een gedeeld doel, maar zorg ervoor dat emoties jullie praktisch nut niet overweldigen.`;
    }
    
    return narrative;
  },
  mercury: (userSign, partnerSign, userHouse, partnerHouse) => {
    const userElement = signElements[userSign] || "Unknown";
    const partnerElement = signElements[partnerSign] || "Unknown";
    const elementInteraction = elementCompatibility[translateElement(userElement)]?.[translateElement(partnerElement)] || "Een unieke communicatieve wisselwerking.";
    
    let narrative = `${elementInteraction} Jullie geesten verbinden, met ${translateSign(userSign)}'s ${astrologyDescriptions.mercury.signs[userSign]?.toLowerCase() || "communicatiestijl"} ${userHouse !== "Unknown" ? ` in het ${translateHouse(userHouse)}` : ""} engagerend ${translateSign(partnerSign)}'s ${astrologyDescriptions.mercury.signs[partnerSign]?.toLowerCase() || "doordachte expressie"} ${partnerHouse !== "Unknown" ? ` in het ${translateHouse(partnerHouse)}` : ""}. `;
    
    if (userElement === "Air" && partnerElement === "Air") {
      narrative += `Jullie gedeelde intellectuele vonk creëert een levendige uitwisseling van ideeën, zoals een gesprek dat nooit eindigt. Probeer samen te brainstormen, maar zorg ervoor dat emoties bijbenen met jullie woorden.`;
    } else if (userElement === "Fire" && partnerElement === "Water") {
      narrative += `Jullie stoutmoedige ideeën (${translateSign(userSign)}) ontmoeten hun intuïtieve inzichten (${translateSign(partnerSign)}), creërend een dynamische dialoog. Deel jullie gedachten door creatieve outlets, zoals schrijven of kunst, om begrip te verdiepen.`;
    }
    
    return narrative;
  },
  jupiter: (userSign, partnerSign, userHouse, partnerHouse) => {
    const userElement = signElements[userSign] || "Unknown";
    const partnerElement = signElements[partnerSign] || "Unknown";
    const elementInteraction = elementCompatibility[translateElement(userElement)]?.[translateElement(partnerElement)] || "Een unieke expansieve wisselwerking.";
    
    let narrative = `${elementInteraction} Jullie groei aligneert, met ${translateSign(userSign)}'s ${astrologyDescriptions.jupiter.signs[userSign]?.toLowerCase() || "optimistische visie"} ${userHouse !== "Unknown" ? ` in het ${translateHouse(userHouse)}` : ""} inspirerend ${translateSign(partnerSign)}'s ${astrologyDescriptions.jupiter.signs[partnerSign]?.toLowerCase() || "expansieve dromen"} ${partnerHouse !== "Unknown" ? ` in het ${translateHouse(partnerHouse)}` : ""}. `;
    
    if (userElement === "Fire" && partnerElement === "Air") {
      narrative += `Jullie stoutmoedige aspiraties (${translateSign(userSign)}) ontmoeten hun intellectuele visie (${translateSign(partnerSign)}), creërend een partnerschap dat zweeft. Plan een gedeeld avontuur, zoals reizen of leren, om jullie groei te voeden.`;
    } else if (userElement === "Earth" && partnerElement === "Earth") {
      narrative += `Jullie gedeelde praktisch nut bouwt een stabiele toekomst, zoals een tuin die gestaag groeit. Werk aan langetermijndoelen samen, maar omarm spontaniteit om dingen fris te houden.`;
    }
    
    return narrative;
  },
  saturn: (userSign, partnerSign, userHouse, partnerHouse) => {
    const userElement = signElements[userSign] || "Unknown";
    const partnerElement = signElements[partnerSign] || "Unknown";
    const elementInteraction = elementCompatibility[translateElement(userElement)]?.[translateElement(partnerElement)] || "Een unieke toegewijde wisselwerking.";
    
    let narrative = `${elementInteraction} Jullie commitment versterkt, met ${translateSign(userSign)}'s ${astrologyDescriptions.saturn.signs[userSign]?.toLowerCase() || "gedisciplineerde aanpak"} ${userHouse !== "Unknown" ? ` in het ${translateHouse(userHouse)}` : ""} verankerend ${translateSign(partnerSign)}'s ${astrologyDescriptions.saturn.signs[partnerSign]?.toLowerCase() || "standvastige resolve"} ${partnerHouse !== "Unknown" ? ` in het ${translateHouse(partnerHouse)}` : ""}. `;
    
    if (userElement === "Earth" && partnerElement === "Earth") {
      narrative += `Jullie gedeelde toewijding creëert een rotsvaste fundering, zoals een huis gebouwd om te duren. Plan jullie toekomst samen, maar laat ruimte voor emotionele spontaniteit.`;
    } else if (userElement === "Water" && partnerElement === "Air") {
      narrative += `Jullie emotionele diepte (${translateSign(userSign)}) ontmoet hun intellectuele structuur (${translateSign(partnerSign)}), creërend een gebalanceerd commitment. Bouw vertrouwen door open communicatie, zoals wekelijkse check-ins.`;
    }
    
    return narrative;
  }
};

async function enhanceSynastryNarrative(narrative, chart, yourName, partnerName) {
  // Calculate compatibility score
  const calculateCompatibilityScore = () => {
    let score = 50; // Base score
    const planets = ["sun", "moon", "venus", "mars", "mercury", "jupiter", "saturn"];
    planets.forEach((planet) => {
      const userElement = signElements[chart.user[planet].sign] || "Unknown";
      const partnerElement = signElements[chart.partner[planet].sign] || "Unknown";
      if (userElement === partnerElement) score += 5; // Same element: +5
      else if (
        (userElement === "Fire" && partnerElement === "Air") ||
        (userElement === "Earth" && partnerElement === "Water")
      ) score += 3; // Compatible elements: +3
      else score -= 2; // Incompatible elements: -2
    });
    return Math.min(100, Math.max(0, score));
  };

  const compatibilityScore = calculateCompatibilityScore();

  let enhanced = `${yourName} en ${partnerName}, jullie liefde is een kosmische symfonie, waar elke noot—elke planeet, teken en huis—samenweeft om een melodie uniek jullie te creëren. Met een compatibiliteitsscore van ${compatibilityScore}%, sprankelt jullie verbinding met potentieel, wevend passie, begrip en groei in een band die voelt als voorbestemd door de sterren. 💫\n\n`;


  enhanced += `**Jullie Kosmische Liefdestips** 💞\nOm jullie verbinding te voeden, omarm deze sterreninlichtingen:\n`;
  enhanced += `- **Verdiep Emotionele Intimiteit**: Zet elke week tijd opzij voor oprechte gesprekken, wellicht over een diner bij kaarslicht, om jullie Manen’ emotionele ritmes af te stemmen.\n`;
  enhanced += `- **Vonken Romantiek**: Verras elkaar met kleine daden van liefde, zoals een handgeschreven notitie of een spontane date, om Venus’ vonk levend te houden.\n`;
  enhanced += `- **Los Conflicten op met Zorg**: Wanneer Mars’ vurige energie oplaait, neem een moment om te ademen en te luisteren, zorgend dat jullie passie versterkt in plaats van verdeelt.\n`;
  enhanced += `- **Groei Samen**: Plan een gedeeld avontuur of leerervaring, zoals een weekendje weg of een nieuwe hobby, om Jupiter’s expansieve energie te laten schijnen.\n`;
  enhanced += `Jullie liefde is een reis geschreven in de sterren, ${yourName} en ${partnerName}. Koester elk moment, en laat de kosmos jullie leiden naar een diepere, meer levendige verbinding. ✨`;

  return enhanced;
}
function calculateChart(birthData) {
  // Mock implementation (assumed to return chart data)
  return {
    user: {
      sun: { sign: birthData.yourSun || "Aries", house: birthData.yourSunHouse || "1", description: astrologyDescriptions.sun.signs[birthData.yourSun || "Aries"] },
      moon: { sign: birthData.yourMoon || "Taurus", house: birthData.yourMoonHouse || "2", description: astrologyDescriptions.moon.signs[birthData.yourMoon || "Taurus"] },
      venus: { sign: birthData.yourVenus || "Gemini", house: birthData.yourVenusHouse || "3", description: astrologyDescriptions.venus.signs[birthData.yourVenus || "Gemini"] },
      mars: { sign: birthData.yourMars || "Cancer", house: birthData.yourMarsHouse || "4", description: astrologyDescriptions.mars.signs[birthData.yourMars || "Cancer"] },
      mercury: { sign: birthData.yourMercury || "Leo", house: birthData.yourMercuryHouse || "5", description: astrologyDescriptions.mercury.signs[birthData.yourMercury || "Leo"] },
      jupiter: { sign: birthData.yourJupiter || "Virgo", house: birthData.yourJupiterHouse || "6", description: astrologyDescriptions.jupiter.signs[birthData.yourJupiter || "Virgo"] },
      saturn: { sign: birthData.yourSaturn || "Libra", house: birthData.yourSaturnHouse || "7", description: astrologyDescriptions.saturn.signs[birthData.yourSaturn || "Libra"] }
    },
    partner: {
      sun: { sign: birthData.partnerSun || "Libra", house: birthData.partnerSunHouse || "7", description: astrologyDescriptions.sun.signs[birthData.partnerSun || "Libra"] },
      moon: { sign: birthData.partnerMoon || "Scorpio", house: birthData.partnerMoonHouse || "8", description: astrologyDescriptions.moon.signs[birthData.partnerMoon || "Scorpio"] },
      venus: { sign: birthData.partnerVenus || "Sagittarius", house: birthData.partnerVenusHouse || "9", description: astrologyDescriptions.venus.signs[birthData.partnerVenus || "Sagittarius"] },
      mars: { sign: birthData.partnerMars || "Capricorn", house: birthData.partnerMarsHouse || "10", description: astrologyDescriptions.mars.signs[birthData.partnerMars || "Capricorn"] },
      mercury: { sign: birthData.partnerMercury || "Aquarius", house: birthData.partnerMercuryHouse || "11", description: astrologyDescriptions.mercury.signs[birthData.partnerMercury || "Aquarius"] },
      jupiter: { sign: birthData.partnerJupiter || "Pisces", house: birthData.partnerJupiterHouse || "12", description: astrologyDescriptions.jupiter.signs[birthData.partnerJupiter || "Pisces"] },
      saturn: { sign: birthData.partnerSaturn || "Aries", house: birthData.partnerSaturnHouse || "1", description: astrologyDescriptions.saturn.signs[birthData.partnerSaturn || "Aries"] }
    }
  };
}
async function generateReport(birthData, yourName, partnerName) {
  const chart = calculateChart(birthData);
  const planets = ["sun", "moon", "venus", "mars", "mercury", "jupiter", "saturn"];
  
  // Add combined influences to chart
  planets.forEach((planet) => {
    chart.user[planet].combined = combinedInfluences[planet](
      chart.user[planet].sign,
      chart.partner[planet].sign,
      chart.user[planet].house,
      chart.partner[planet].house
    );
  });

  let narrative = "Je Liefdescompatibiliteitsrapport\n\n";
  narrative = await enhanceSynastryNarrative(narrative, chart, yourName, partnerName);
  
  return { chart, narrative };
}

module.exports = {
  astrologyDescriptions,
  combinedInfluences,
  generateReport,
  enhanceSynastryNarrative
};