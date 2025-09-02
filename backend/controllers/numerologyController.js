const axios = require("axios");
const axiosRetry = require("axios-retry").default;
const OpenAI = require("openai");
const NumerologyReport = require("../models/NumerologyReport");
const User = require("../models/User");

const auth = {
  username: process.env.ASTROLOGY_API_USER_ID,
  password: process.env.ASTROLOGY_API_KEY,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure Axios retries
axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.response?.status >= 400,
});

if (!process.env.ASTROLOGY_API_USER_ID || !process.env.ASTROLOGY_API_KEY) {
  console.error("AstrologyAPI credentials are missing.");
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error("OpenAI API key is missing.");
  process.exit(1);
}

const numberDescriptions = {
  lifepath: {
    1: "De Pionier\nJe bent geboren om te leiden, niet om te volgen.\nJij voelt van jongs af aan dat je anders bent. Onafhankelijkheid is jouw zuurstof, maar juist\ndie drang om het zelf te doen kan je soms isoleren. Je strijdt met een innerlijke behoefte aan\nerkenning, terwijl je naar buiten toe kracht uitstraalt. Anderen zien een leider, maar jij voelt\nook de druk van altijd voorop moeten lopen. Wanneer je leert dat kwetsbaarheid geen\nzwakte is, maar kracht — komt jouw vuur echt tot zijn recht.",
    2: "De Bemiddelaar\nJij voelt aan wat anderen nog niet durven uitspreken.\nJe bent een geboren verbinder — gevoelig, intuïtief en gericht op harmonie. Maar achter\njouw empathie schuilt vaak de pijn van niet-gehoord worden. Je stem is zacht, maar je\nwijsheid luid. In relaties geef je meer dan je ontvangt, tot het opbreekt. Jouw groei begint\nwanneer je jouw grenzen bewaakt zonder schuldgevoel. Je kracht zit niet in aanpassing,\nmaar in je vermogen om liefdevol stevig te staan.",
    3: "De Expressieve Ziel\nJouw woorden raken harten — zolang je jezelf durft te tonen.\nCreativiteit stroomt door je heen, maar achter je glimlach kan soms een diepe onzekerheid\nschuilgaan. Je gebruikt humor om pijn te maskeren en lichtheid om niet te hoeven voelen.\nToch is het juist jouw gevoeligheid die anderen raakt. Wanneer je stopt met pleasen en\nbegint met puur zijn, wordt jouw expressie genezing — niet alleen voor anderen, maar\nvooral voor jezelf.",
    4: "De Bouwer\nJij bouwt wat anderen alleen durven dromen.\nJouw kracht ligt in structuur, discipline en toewijding. Je zoekt houvast in een wereld vol\nchaos, maar dat kan je soms star maken. Je voelt je het veiligst als alles klopt, maar het leven\nvraagt ook om vertrouwen in het onbekende. Achter jouw behoefte aan controle schuilt\nvaak een verlangen naar zekerheid en erkenning. Wanneer je leert dat rust ook ontstaat in\novergave, ontstaat er een balans tussen doen en durven.",
    5: "De Vrije Ziel\nJe bent geboren om te bewegen, niet om vast te zitten.\nVrijheid is je adem, avontuur je brandstof. Maar de drang naar steeds meer kan je ook\nonrustig maken. Achter je behoefte aan variatie schuilt vaak een angst voor stilstand — en\nwat je dan zou moeten voelen. Je leert groeien door grenzen te verkennen én\nverantwoordelijkheid te nemen. Wanneer je jouw vrijheid koppelt aan richting, word je niet\nalleen inspirerend, maar ook krachtig en betrouwbaar.",
    6: "De Verzorger\nJe hart klopt voor harmonie en zorgzaamheid.\nJe voelt je geroepen om anderen te helpen, maar vergeet soms jezelf. Je bent de stille kracht\nachter veel mensen, maar daar schuilt ook gevaar. Wanneer je liefde inzet om erkenning te\nkrijgen, raak je leeg. Jouw les is leren geven zonder jezelf te verliezen. Ware harmonie\nbegint wanneer je eigenwaarde niet meer afhankelijk is van wat je voor anderen betekent,\nmaar van wie je bent.",
    7: "De Zoeker\nJe ziel verlangt naar waarheid, niet naar oppervlakkigheid.\nJe zoekt diepgang in alles wat je doet. Je vertrouwt op je intuïtie, maar hebt ook momenten\nvan isolement. Je voelt je vaak anders, alsof niemand je écht begrijpt. Dat is jouw kracht én\nuitdaging. Wanneer je stopt met jezelf verstoppen en jouw wijsheid deelt met de wereld,\nwordt jouw zoektocht een bron van inspiratie voor anderen.",
    8: "De Ambitieuze Leider\nJe bent hier om groots te denken en groots te doen.\nJij voelt een innerlijke drive om te slagen. Je wil impact maken, bouwen, leiden. Maar achter\ndie drang naar succes zit vaak de vraag: ben ik het waard? Als kind heb je misschien geleerd\ndat liefde verdiend moet worden door prestaties. Jouw groei begint wanneer je beseft dat je\nwaarde niet afhangt van wat je bereikt, maar van wie je bent. Wanneer je hart en ambitie\nsamenkomen, word je onstuitbaar.",
    9: "De Wijze\nJe draagt de pijn én de wijsheid van vele levens in je ziel.\nJe bent empathisch, wijs en dienstbaar. Je voelt de wereld op een dieper niveau en dat\nmaakt je soms emotioneel uitgeput. Je geeft veel, soms te veel. Jouw les is leren loslaten\nzonder bitterheid, en helpen zonder jezelf weg te cijferen. Wanneer je je energie zuiver leert\nafbakenen, word je een helende kracht voor jezelf en anderen.",
    11: "De Spirituele Leraar\nJouw intuïtie is een kanaal voor hogere wijsheid.\nJe bent hier met een bijzondere missie. Je voelt meer, weet meer, maar dat kan je ook\nverwarren. Je levenspad vraagt veel innerlijk werk voordat je je kracht werkelijk kunt\nbelichamen. Twijfel, angst of afwijzing kunnen je remmen. Maar als je leert vertrouwen op\nje intuïtie en die inzet in dienst van anderen, word je een licht voor velen.",
    22: "De Meesterbouwer\nJij kunt dromen omzetten in tastbare realiteit.\nJe hebt de gave om grootse dingen neer te zetten. Maar dat komt met verantwoordelijkheid\nen innerlijke strijd. Je voelt de roeping, maar ook de druk. Soms blijf je liever klein uit angst\nvoor mislukking. Jouw uitdaging is leren geloven in je kracht zonder jezelf te verliezen in\nperfectionisme. Als je leert bouwen vanuit vertrouwen én intuïtie, ben je in staat om levens\nte veranderen.",
    33: "De Meesterheler\nJij bent hier om liefde in haar hoogste vorm te belichamen.\nJouw ziel draagt een diepe compassie en een roeping om te helen. Maar dat vraagt ook dat je\njezelf heelt. Je voelt de pijn van anderen alsof het de jouwe is, wat zwaar kan zijn. Zelfzorg is\njouw basis. Alleen dan kun je jouw ware missie vervullen: liefde, licht en heling brengen\nwaar het het hardst nodig is."
  },
  expression: {
    1: "De Zelfstarter\nJij bent geboren om het verschil te maken, op jouw manier.\nJe expressie is direct, krachtig en vol initiatief. Je straalt natuurlijk leiderschap uit, maar dat\nkan soms overkomen als dominantie. Je hebt de gave om deuren te openen waar anderen\ndrempels zien. Jouw uitdaging ligt in het vinden van balans tussen onafhankelijkheid en\nsamenwerking. Wanneer je leert te luisteren zonder je kracht te verliezen, word je een\ninspirerende leider die anderen echt raakt.",
    2: "De Verbinder\nJe woorden verbinden werelden — subtiel maar doeltreffend.\nJe communiceert met zachtheid, diplomatie en intuïtieve precisie. Je stijl is vaak bescheiden,\nmaar o zo krachtig. Je voelt aan wat nodig is in een gesprek, maar kunt soms te voorzichtig\nzijn uit angst om te verstoren. Wanneer je leert dat jouw stem waarde heeft, ongeacht de\nreactie, verandert jouw expressie in een bron van heling en harmonie.",
    3: "De Creatieve Verteller\nJouw expressie laat mensen lachen, huilen en voelen.\nJe woorden dansen. Je hebt een natuurlijk talent voor storytelling, humor en expressie. Maar\nachter jouw speelsheid zit soms de angst om niet serieus genomen te worden. Jouw kracht\ngroeit wanneer je durft te spreken vanuit je kwetsbaarheid. Dan wordt jouw creativiteit niet\nalleen vermaak, maar ook verbinding.",
    4: "De Structuurgever\nJouw woorden brengen orde in chaos.\nJe communiceert helder, praktisch en to-the-point. Mensen vertrouwen op jouw\nbetrouwbaarheid en duidelijke visie. Maar soms mis je flexibiliteit in je expressie, wat bot of\nafstandelijk kan overkomen. Wanneer je leert je hart te verbinden met je woorden, wordt\njouw stem een stabiele kracht in onzekere situaties.",
    5: "De Vrijdenker\nJe spreekt in mogelijkheden, niet in beperkingen.\nJe uit jezelf spontaan, enthousiast en met flair. Verandering voedt jouw expressie, maar kan\nook leiden tot oppervlakkigheid. Jouw uitdaging is om diepgang te vinden in vrijheid.\nWanneer je spreekt vanuit ervaring en niet alleen vanuit prikkels, raak je mensen écht.",
    6: "De Harmoniseerder\nJe woorden brengen mensen dichter bij elkaar.\nJe spreekt vanuit zorg, empathie en een verlangen naar harmonie. Je stem heeft iets\ntroostends, iets zachts. Toch kun je jezelf verliezen in het pleasen of vermijden van conflict.\nWanneer je jouw waarheid durft uit te spreken zonder anderen te willen redden, wordt je\nexpressie zowel liefdevol als krachtig.",
    7: "De Diepzinnige\nJe spreekt pas als het echt ergens over gaat.\nJe uit je bedachtzaam, filosofisch en vaak met een mysterieuze diepgang. Je woorden\nwekken vertrouwen, maar je kunt ook afstandelijk overkomen. Jouw kracht ligt in het\ndurven delen van jouw innerlijke waarheid, zelfs als die niet perfect geformuleerd is. Dat\nmaakt je menselijk én magisch.",
    8: "De Uitvoerder\nAls jij spreekt, luisteren mensen.\nJe hebt een krachtige, overtuigende manier van communiceren. Je stem draagt gewicht.\nMaar pas op dat je niet in controle belandt. Wanneer je jouw expressie koppelt aan\nauthenticiteit in plaats van alleen resultaat, ontstaat er invloed die beklijft in plaats van\noverdondert.",
    9: "De Inspirator\nJe woorden dragen een boodschap groter dan jezelf.\nJe communiceert met passie, compassie en visie. Je hebt de gave om anderen te raken en op\nte tillen. Maar let op dat je jezelf niet verliest in andermans verhaal. Als je leert om ook je\neigen kwetsbaarheid te tonen, wordt jouw expressie een kanaal voor echte verandering.",
    11: "De Inspirerende Stem\nJij spreekt vanuit een hogere bron — als je durft te luisteren.\nJe woorden hebben de potentie om levens te veranderen. Maar die kracht voelt soms te\ngroot, waardoor je stil blijft. Je bent gevoelig voor afwijzing, terwijl jouw stem juist nodig is.\nWanneer je leert spreken vanuit je intuïtie zonder zelfcensuur, wordt jouw boodschap een\nlicht in de duisternis van anderen.",
    22: "De Visionaire Bouwer\nJouw woorden bouwen bruggen tussen hemel en aarde.\nJe denkt en spreekt groot. Je hebt de gave om abstracte ideeën tastbaar te maken. Maar\nsoms twijfel je of mensen je wel begrijpen, en houd je je in. Jouw groei ligt in het vertrouwen\ndat jouw visie precies is wat deze wereld nodig heeft. Als je durft te delen wat je ziet, bouw\nje iets blijvends.",
    33: "De Helende Spreker\nJouw stem draagt de energie van liefde, vergeving en heling.\nJe woorden kunnen verzachten, genezen en openen. Je voelt feilloos aan wat mensen nodig\nhebben, maar je kunt ook overweldigd raken door hun pijn. Wanneer je leert eerst jezelf te\nvoeden voor je spreekt, wordt jouw expressie een geschenk dat bijdraagt aan het collectieve\nhelingsproces."
  },
  soulurge: {
    1: "De Innerlijke Leider\nIn je hart wil je jezelf bewijzen en je eigen pad volgen.\nJe verlangt naar zelfstandigheid, erkenning en het gevoel dat je uniek bent. Je wilt niet\nafhankelijk zijn van anderen en hebt een diepe innerlijke drang om je eigen weg te gaan.\nAchter dit verlangen schuilt soms de angst om niet goed genoeg te zijn. Wanneer je leert dat\nware kracht zit in zelfvertrouwen en niet in bevestiging van buitenaf, komt jouw innerlijke\nleider volledig tot bloei.",
    2: "De Verbonden Ziel\nJe verlangt diep naar liefde, samenwerking en harmonie.\nIn je hart wil je erbij horen, betekenisvolle verbindingen aangaan en de wereld zachter\nmaken. Je voelt je fijn in gelijkwaardige relaties waarin er ruimte is voor wederzijds begrip.\nTegelijkertijd kun je jezelf verliezen in de ander of moeite hebben om je eigen behoeften uit\nte spreken. Wanneer je leert dat jouw gevoelens ertoe doen, ontstaat er liefde die écht in\nbalans is.",
    3: "De Expressieve Ziel\nJe hart verlangt naar vreugde, creativiteit en gehoord worden.\nJe wilt jezelf uitdrukken, inspireren en plezier ervaren. In de kern wil je gezien worden\nzoals je echt bent. Je hebt een sterke behoefte aan vrijheid van expressie, maar kunt jezelf\ncensureren uit angst voor afwijzing. Wanneer je jouw waarheid deelt, ook als die kwetsbaar\nis, opent je hart zich voor echte verbinding en zelfliefde.",
    4: "De Stille Bouwer\nJe hart verlangt naar stabiliteit, zekerheid en vertrouwen.\nJe zoekt rust in structuur en duidelijke kaders. In je diepste kern wil je veiligheid creëren —\nvoor jezelf en je geliefden. Je verlangt naar een solide basis in relaties en houdt niet van\nemotionele chaos. Maar soms houd je je hart te veel vast uit angst voor teleurstelling.\nWanneer je leert dat ware zekerheid van binnenuit komt, opent je hart zich voor diepe en\nduurzame liefde.",
    5: "De Vrijheidszoeker\nJe hart wil ademen, ontdekken en voelen zonder grenzen.\nJe verlangt naar avontuur, afwisseling en emotionele ruimte. In de liefde zoek je niet alleen\nverbinding, maar ook vrijheid om jezelf te blijven. Toch kan die vrijheid soms een vlucht\nworden. Wanneer je leert dat vrijheid ook binnen verbinding mogelijk is, wordt jouw hart\neen bron van speelse én trouwe liefde.",
    6: "De Gevende Ziel\nJe hart wil zorgen, liefhebben en betekenisvol zijn voor anderen.\nJe voelt je gelukkig als je kunt bijdragen aan het welzijn van je dierbaren. Liefde en\ntoewijding zitten diep in je hart verankerd. Maar je loopt het risico jezelf weg te cijferen.\nWanneer je leert dat zelfliefde geen egoïsme is, maar een voorwaarde om te kunnen geven,\ngroeit jouw hart in kracht en zachtheid tegelijk.",
    7: "De Innerlijke Zoeker\nJe hart verlangt naar diepgang, stilte en spirituele verbondenheid.\nJe hebt een behoefte aan rust, reflectie en innerlijke groei. In je hart wil je voelen dat er\nméér is dan het oppervlakkige. Maar het risico bestaat dat je je afsluit voor liefde uit angst\nom gekwetst te worden. Wanneer je leert vertrouwen te hebben in je gevoeligheid, ontdek\nje dat jouw hart een kanaal is voor diepe, helende liefde.",
    8: "De Machtige Ziel\nJe hart verlangt naar impact, erkenning en liefde die je laat groeien.\nJe hebt een sterk verlangen om krachtig te zijn, controle te hebben over je leven en succes te\nervaren. Maar in je hart zoek je ook iemand die je kan vertrouwen, die je ziet achter je rol.\nWanneer je leert dat echte kracht zit in overgave en kwetsbaarheid, bloeit je hart open voor\nliefde die niet te breken is.",
    9: "De Onbaatzuchtige\nJe hart wil geven, helpen en de wereld mooier maken.\nJe bent liefhebbend, empathisch en geneigd je eigen behoeften onder te schikken aan die\nvan anderen. Maar opoffering kan bitterheid worden als je jezelf verwaarloost. Wanneer je\nleert dat jouw behoeften er net zo toe doen, verandert jouw liefde van opoffering naar\noprechte verbinding.",
    11: "De Spirituele Diepte\nJe hart verlangt naar zielsverbinding en hogere liefde.\nJe voelt dat je hier bent met een missie. Je hart wil liefhebben op een ander niveau — puur,\nzuiver en transformerend. Maar dat maakt je ook kwetsbaar. Je kunt overweldigd raken\ndoor je intensiteit. Wanneer je leert te gronden in je eigen hart, wordt jouw liefde een gids\nvoor anderen.",
    22: "De Ziel van Grootse Missie\nJe hart wil bouwen aan iets groters dan jezelf.\nJe wilt een fundament van liefde leggen dat verder gaat dan het persoonlijke. Je hebt het\nverlangen om te leiden, te creëren én lief te hebben op hoog niveau. Toch kun je jezelf\nverliezen in verantwoordelijkheden. Wanneer je leert dat ook jij liefde en steun verdient,\ngroeit jouw hart tot een krachtige, dragende bron.",
    33: "De Meest Liefhebbende Ziel\nJe hart is hier om onvoorwaardelijke liefde te belichamen.\nJe draagt een diepe roeping om te helen, te geven en mensen te laten voelen dat ze geliefd\nzijn. Maar je eigen pijn mag daarin niet vergeten worden. Wanneer je jouw hart ook naar\njezelf durft te openen, wordt jouw liefde niet alleen groots, maar ook waarachtig en helend\nvoor iedereen om je heen."
  },
  personality: {
    1: "De Onafhankelijke\nJe komt over als sterk, doelgericht en zelfverzekerd.\nAnderen zien jou als iemand die weet wat hij wil. Je straalt kracht en onafhankelijkheid uit,\nmaar dat kan ook intimiderend zijn. Achter je zelfverzekerde houding schuilt soms een\nverlangen naar erkenning. Wanneer je leert je zachtere kant te tonen, ontstaat er balans\ntussen kracht en verbinding.",
    2: "De Vredestichter\nJe wordt gezien als zachtaardig, diplomatiek en benaderbaar.\nJe komt vriendelijk en gevoelig over, waardoor mensen zich snel veilig bij je voelen. Je zoekt\nharmonie en vermijdt conflicten. Toch kun je ook moeite hebben met grenzen aangeven.\nWanneer je leert dat ‘nee’ zeggen ook liefdevol kan zijn, groeit je persoonlijke kracht.",
    3: "De Charismatische\nJe straalt enthousiasme en creativiteit uit, met een vleugje speelsheid.\nMensen worden aangetrokken door je sprankelende energie. Je weet hoe je een ruimte kunt\nopvrolijken en je hebt gevoel voor humor. Maar soms gebruik je die vrolijkheid als schild.\nWanneer je durft te zakken in je diepte, wordt je uitstraling nog krachtiger en oprechter.",
    4: "De Degelijke\nJe komt over als betrouwbaar, georganiseerd en serieus.\nMensen zien jou als iemand die staat als een huis. Je bent stabiel, verantwoordelijk en komt\nje afspraken na. Toch kun je afstandelijk of gesloten overkomen, vooral als je teveel leunt op\ncontrole. Wanneer je leert om af en toe los te laten en jezelf kwetsbaar te tonen, ontstaat er\nmeer ruimte voor echte verbinding.",
    5: "De Avonturier\nJe wekt de indruk spontaan, levendig en vrij te zijn.\nJe straalt vrijheid uit. Mensen voelen zich aangetrokken tot jouw energie, beweging en\nnieuwsgierigheid. Je bent moeilijk te voorspellen en dat maakt je spannend. Maar soms mis\nje richting or focus. Wanneer je leert dat vrijheid ook kan bestaan binnen kaders, wordt\njouw uitstraling stabiel én inspirerend.",
    6: "De Zorgzame\nJe komt warm, betrokken en verantwoordelijk over.\nMensen ervaren je als een steunpilaar. Je bent loyaal, meegaand en hebt een sterke drang\nom te zorgen. Maar je kunt ook snel over je eigen grenzen heen gaan. Wanneer je leert dat\nzorgen begint bij jezelf, straal je nog meer kracht en balans uit.",
    7: "De Introspectieve\nJe komt mysterieus, diepzinnig en observerend over.\nJe bent geen open boek. Mensen zien je als iemand met diepgang, die liever kijkt en luistert\ndan spreekt. Je wekt nieuwsgierigheid, maar kunt ook afstandelijk overkomen. Wanneer je\njezelf iets meer laat zien, voelen mensen zich meer verbonden met jouw unieke wijsheid.",
    8: "De Autoriteit\nJe straalt kracht, controle en succes uit.\nJe hebt een natuurlijke presence. Anderen zien je als daadkrachtig, ambitieus en\nzelfverzekerd. Maar dit kan ook intimideren. Soms voelt het alsof je altijd sterk móet zijn.\nWanneer je leert om ook je zachtere kant te tonen, ontstaat er respect én vertrouwen.",
    9: "De Idealist\nJe komt empathisch, wijs en een tikkeltje ongrijpbaar over.\nJe straalt een oude ziel-energie uit. Mensen voelen zich veilig bij je, alsof je hen begrijpt\nzonder woorden. Maar je kunt ook te veel opgaan in andermans energie. Wanneer je leert je\neigen energieveld te bewaken, wordt jouw uitstraling zuiver en helend.",
    11: "De Visionair\nJe hebt een bijzondere uitstraling die verder reikt dan het zichtbare.\nJe komt intuïtief, gevoelig en inspirerend over. Mensen voelen dat er ‘iets’ aan jou is, ook al\nkunnen ze het niet benoemen. Die uitstraling trekt mensen aan, maar kan ook projecties\noproepen. Wanneer je stevig leert staan in je licht, word je een baken voor anderen.",
    22: "De Grote Bouwer\nJe wekt vertrouwen door je kracht en stabiliteit.\nJe uitstraling is kalm maar indrukwekkend. Je komt over als iemand met visie én uitvoering.\nSoms houd je jezelf klein uit angst voor verantwoordelijkheid. Wanneer je je potentieel\nomarmt, zien mensen in jou de leider die je werkelijk bent.",
    33: "De Spirituele Leider\nJe straalt liefde, zorgzaamheid en diepe wijsheid uit.\nMensen voelen zich meteen op hun gemak bij jou. Je hebt een helende, zachte uitstraling,\nmaar ook een diepe innerlijke kracht. Soms voel je je verantwoordelijk voor iedereen.\nWanneer je leert dat jouw licht vanzelf werkt, ook zonder dat je jezelf opgeeft, wordt je\naanwezigheid transformerend."
  },
};

function reduceToSingleDigit(num) {
  if (num === 11 || num === 22 || num === 33) return num;
  while (num > 9) {
    num = num.toString().split("").reduce((sum, digit) => sum + parseInt(digit), 0);
  }
  return num;
}

async function generateNumerologyReport(firstName, lastName, birthDate) {
  console.log(`Generating numerology report for ${firstName} ${lastName}, Birthdate: ${birthDate}`);
  const fullName = `${firstName} ${lastName}`.trim().replace(/\s+/g, " ");
  const [year, month, day] = birthDate.split("-").map(Number);

  const date = new Date(year, month - 1, day);
  if (isNaN(date) || date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
    throw new Error("Invalid birth date format. Use YYYY-MM-DD.");
  }
  const today = new Date();
  if (date > today) {
    throw new Error("Birth date cannot be in the future.");
  }

  // Use full name for Expression Number to match standard numerology and AI Numerology Coach
  const expressionName = fullName.trim();

  const payload = {
    date: day,
    month: month,
    year: year,
    full_name: fullName,
  };

  try {
    console.log("Fetching numerology data from AstrologyAPI...");
    const response = await axios.post("https://json.astrologyapi.com/v1/numerological_numbers", payload, { auth });

    const data = response.data;

    const numbers = {
      lifepath: {
        number: reduceToSingleDigit(data.lifepath_number || 0),
        description: numberDescriptions.lifepath[data.lifepath_number] || "Je Levenspadgetal leidt je ziel’s doel. 🌟",
      },
      expression: {
        number: reduceToSingleDigit(data.expression_number || 0),
        description: numberDescriptions.expression[data.expression_number] || "Je Expressiegetal onthult je natuurlijke talents. ✨",
      },
      soulurge: {
        number: reduceToSingleDigit(data.soul_urge_number || 0),
        description: numberDescriptions.soulurge[data.soul_urge_number] || "Je Hartgetal onthult je diepste passies. 💖",
      },
      personality: {
        number: reduceToSingleDigit(data.personality_number || 0),
        description: numberDescriptions.personality[data.personality_number] || "Je Persoonlijkheidsgetal vormt hoe de wereld je ziet. 😊",
      },
    };

    if (!data.lifepath_number || !data.expression_number || !data.soul_urge_number || !data.personality_number) {
      console.log("API returned incomplete data, using manual calculations...");
      return calculateManualNumbers(fullName, birthDate, expressionName);
    }

    console.log(`Life Path Number: ${numbers.lifepath.number}`);
    console.log(`Expression Number: ${numbers.expression.number}`);
    console.log(`Soul Urge Number: ${numbers.soulurge.number}`);
    console.log(`Personality Number: ${numbers.personality.number}`);

    return numbers;
  } catch (error) {
    console.error("AstrologyAPI Error:", error.message, error.response?.status, error.response?.data);
    console.log("Falling back to manual calculations...");
    return calculateManualNumbers(fullName, birthDate, expressionName);
  }
}

async function createNarrativeReport(numbers, firstName) {
  const fallbackNarrative = `
✨ Je Numerologie Blauwdruk, ${firstName} ✨

Je bent geboren om een uniek pad te bewandelen, gevormd door de krachtige energieën van je kerngetallen.

Je Levenspadgetal ${numbers.lifepath.number} definieert je reis. ${numbers.lifepath.description}

Je Expressiegetal ${numbers.expression.number} onthult hoe je je gaven met de wereld deelt. ${numbers.expression.description}

Je Hartgetal ${numbers.soulurge.number} onthult wat je werkelijk drijft. ${numbers.soulurge.description}

Je Persoonlijkheidsgetal ${numbers.personality.number} vormt hoe anderen je zien. ${numbers.personality.description}

In essentie ben je een ziel met een uniek doel, die innerlijke diepte combineert met uiterlijke impact. Je reis gaat over het omarmen van je unieke krachten en dapper leven als je ware zelf. 🌟
  `;

  try {
    const prompt = `
Je bent een Numerologie Coach die belast is met het creëren van een gepersonaliseerd, verhaal-stijl numerologie rapport voor ${firstName}. Gebruik de volgende getallen om een narratief te crafting dat engagerend, inzichtelijk en empowering aanvoelt. Schrijf in een warme, conversatie toon, alsof je direct tegen de gebruiker spreekt. Voeg emojis toe om het levendig te maken. Vermijd het verbatim herhalen van de getal definities; weef ze in een cohesief verhaal. Zorg ervoor dat het narratief align met de volgende specifieke descriptions voor consistency:
- Hartgetal 7: Benadrukt eenzaamheid, introspectie en intuïtief begrip, niet leiderschap. Bijv., "Je ziel verlangt naar eenzaamheid, introspectie en intuïtief begrip. Vertrouw op je innerlijke wijsheid, maar verbind om isolatie te vermijden. 🌀"
- Expressie 3: Focus op creativiteit en meesterlijke communicatie. Bijv., "Je talent straalt creativiteit en meesterlijke communicatie uit. Inspireer door kunst en woorden, maar focus om je impact te vergroten. 🌟"

Gebruikersnaam: ${firstName}
Levenspadgetal: ${numbers.lifepath.number} (${numbers.lifepath.description})
Expressiegetal: ${numbers.expression.number} (${numbers.expression.description})
Hartgetal: ${numbers.soulurge.number} (${numbers.soulurge.description})
Persoonlijkheidsgetal: ${numbers.personality.number} (${numbers.personality.description})

Creëer een 200-300 woorden narratief dat deze getallen samenbindt in een uniek verhaal over de gebruiker’s levensdoel, talenten, verlangens en hoe ze waargenomen worden. Zorg ervoor dat het narratief align met de snapshot descriptions voor consistency. Schrijf het narratief in het Nederlands.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Je bent een warme, inzichtelijke Numerologie Coach." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    return fallbackNarrative.trim();
  }
}

function calculateManualNumbers(fullName, birthDate, expressionName) {
  const lifePathNum = calculateLifePathNumber(birthDate);
  const expressionNum = calculateExpressionNumber(expressionName);
  const soulUrgeNum = calculateSoulUrgeNumber(fullName);
  const personalityNum = calculatePersonalityNumber(fullName);

  console.log(`Manual Life Path Number: ${lifePathNum}`);
  console.log(`Manual Expression Number: ${expressionNum}`);
  console.log(`Manual Soul Urge Number: ${soulUrgeNum}`);
  console.log(`Manual Personality Number: ${personalityNum}`);

  return {
    lifepath: {
      number: lifePathNum,
      description: numberDescriptions.lifepath[lifePathNum] || "Je Levenspadgetal leidt je ziel’s doel. 🌟",
    },
    expression: {
      number: expressionNum,
      description: numberDescriptions.expression[expressionNum] || "Je Expressiegetal onthult je natuurlijke talents. ✨",
    },
    soulurge: {
      number: soulUrgeNum,
      description: numberDescriptions.soulurge[soulUrgeNum] || "Je Hartgetal onthult je diepste passies. 💖",
    },
    personality: {
      number: personalityNum,
      description: numberDescriptions.personality[personalityNum] || "Je Persoonlijkheidsgetal vormt hoe de wereld je ziet. 😊",
    },
  };
}

function calculateLifePathNumber(birthDate) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const sum = year + month + day;
  return reduceToSingleDigit(sum);
}

function calculateExpressionNumber(name) {
  const letterValues = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  let sum = name.toLowerCase().split("").reduce((acc, char) => acc + (letterValues[char] || 0), 0);
  return reduceToSingleDigit(sum);
}

function calculateSoulUrgeNumber(name) {
  const vowelValues = { a: 1, e: 5, i: 9, o: 6, u: 3, y: 7 };
  let sum = name.toLowerCase().split("").reduce((acc, char) => acc + (vowelValues[char] || 0), 0);
  return reduceToSingleDigit(sum);
}

function calculatePersonalityNumber(name) {
  const consonantValues = {
    b: 2, c: 3, d: 4, f: 6, g: 7, h: 8, j: 1, k: 2, l: 3,
    m: 4, n: 5, p: 7, q: 8, r: 9, s: 1, t: 2, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  let sum = name.toLowerCase().split("").reduce((acc, char) => acc + (consonantValues[char] || 0), 0);
  return reduceToSingleDigit(sum);
}

exports.getNumerologyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const report = await NumerologyReport.findOne({ userId }).lean();
    if (!report) {
      return res.status(404).json({ success: false, message: "Numerology report not found" });
    }
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error("Fetch Numerology Report Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch numerology report" });
  }
};

exports.generateNumerologyReport = generateNumerologyReport;
exports.createNarrativeReport = createNarrativeReport;