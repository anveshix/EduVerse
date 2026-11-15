// Bilingual teacher panel flow notes and honest model limitations for all 16 themes.
import { T02_TEACHER, T02_LIMITS } from './geography/content.js';
import { T09_TEACHER, T09_LIMITS } from './economics/content.js';

const b = (en, hi) => ({ en, hi });

export const TEACHER = {
  T01: {
    flow: [
      b('Hook (3 min): pose a daily question about your town and ask students which school subject answers it.', 'प्रश्न (3 मिनट): अपने शहर से जुड़ा एक दैनिक प्रश्न पूछें और देखें कौन-सा विषय उसका उत्तर देता है।'),
      b('System Map & 4-Lens Explorer (15 min): pick Varanasi or Sundarbans and read Geography, History, Politics, and Economics side by side.', 'प्रणाली मानचित्र व 4-लेंस अन्वेषक (15 मिनट): एक ही स्थान को चारों दृष्टिकोणों से देखें।'),
      b('Sorter & Exit Ticket (10 min): classify real-world news questions and write a multi-lens reflection.', 'वर्गीकरण व निकास-टिकट (10 मिनट): प्रश्नों को विषयों में छाँटें।'),
    ],
    misconceptions: [
      b('“Economics is only about money, and Geography is only maps.” Both explain resources, livelihoods, and human choices.', '“अर्थशास्त्र केवल पैसा है और भूगोल केवल नक्शे।” दोनों मानव चयन और संसाधन समझाते हैं।'),
    ],
  },
  T02: T02_TEACHER,
  T03: {
    flow: [
      b('Start a seven-day diary (10 min setup, then one safe observation per day): distinguish missing rain observations from rain not seen at that moment; compare with the illustrative station graphs.', 'सात-दिवसीय डायरी शुरू करें (10 मिनट की तैयारी, फिर प्रतिदिन सुरक्षित प्रेक्षण): बिना दर्ज वर्षा और उस समय वर्षा न दिखने में अंतर करें; उदाहरण आरेखों से तुलना करें।'),
      b('Monsoon mechanism and map (15 min): trace heating, pressure, ITCZ, cross-equatorial flow, branches, relief and reversal. Compare Bihar and Tamil Nadu without predicting exact weather.', 'मानसून प्रक्रिया व मानचित्र (15 मिनट): तापन, दाब, ITCZ, विषुवत-पार प्रवाह, शाखाएँ, उच्चावच और वापसी समझें। सटीक मौसम बताए बिना बिहार व तमिलनाडु की तुलना करें।'),
      b('Atmosphere, breeze, catchment and carbon labs (as time allows): test the remaining models and discuss their limits.', 'वायुमंडल, समीर, जलग्रहण और कार्बन प्रयोग (समयानुसार): शेष मॉडल परखें और उनकी सीमाओं पर चर्चा करें।'),
    ],
    misconceptions: [
      b('“One rainy week tells us the climate.” A diary is short-term weather; WMO standard climate normals use 30-year periods. The grapher values here are illustrative, not official station normals.', '“एक वर्षा-भरा सप्ताह जलवायु बता देता है।” डायरी अल्पकालिक मौसम है; WMO मानक जलवायु औसत 30 वर्षों के होते हैं। यहाँ के आरेख मान उदाहरण हैं, आधिकारिक केंद्र औसत नहीं।'),
      b('“The monsoon always arrives on the same day and rains continuously.” Onset, breaks and rainfall differ by year and place; the model is not a warning or forecast.', '“मानसून हर वर्ष एक ही दिन आता है और लगातार वर्षा होती है।” आगमन, विराम और वर्षा वर्ष व स्थान के अनुसार बदलते हैं; मॉडल चेतावनी या पूर्वानुमान नहीं है।'),
    ],
  },
  T04: {
    flow: [
      b('Clock and detective kit (15 min): compare the two-million-year window with older known tools. For each imagined case, separate observations, alternative inferences, uncertainty and the next test; let students revise answers.', 'घड़ी और जासूस किट (15 मिनट): 20 लाख वर्ष के अंतराल की पुराने ज्ञात औज़ारों से तुलना करें। हर काल्पनिक केस में प्रेक्षण, वैकल्पिक निष्कर्ष, अनिश्चितता और अगली जाँच अलग करें; उत्तर बदलने दें।'),
      b('Harappan tour (15 min): inspect six stops in 3D or the same 2D/text tour. Compare the Great Bath and drains with the disputed “granary” interpretation; discuss what the composite model cannot show.', 'हड़प्पा यात्रा (15 मिनट): छह पड़ाव 3D या उसी 2D/पाठ यात्रा में देखें। महास्नानागार और नालियों की विवादित “अन्नागार” व्याख्या से तुलना करें; मिश्रित मॉडल की सीमाएँ समझें।'),
      b('Settlement and atlas (as time allows): question the toy population assumptions and compare sites and dates without treating all cultures as identical or simultaneous.', 'बस्ती और मानचित्र (समयानुसार): काल्पनिक जनसंख्या धारणाओं पर प्रश्न करें और सभी संस्कृतियों को समान या समकालीन माने बिना स्थल व तिथियाँ तुलना करें।'),
    ],
    misconceptions: [
      b('“One object proves a whole story.” Marks, grains and foundations need context and comparison; plausible interpretations can change with new evidence.', '“एक वस्तु पूरी कहानी सिद्ध करती है।” निशान, अनाज और आधार को संदर्भ व तुलना चाहिए; नए प्रमाण से संभावित व्याख्या बदल सकती है।'),
      b('“The so-called granary proves a king stored grain there.” The use of these large foundations is debated; material remains do not by themselves identify rulers.', '“तथाकथित अन्नागार सिद्ध करता है कि राजा वहाँ अनाज रखता था।” बड़े आधारों के उपयोग पर मतभेद है; अवशेष अकेले शासक की पहचान नहीं करते।'),
      b('“Farming instantly made life easier for everyone.” Practices and trade-offs varied, and foraging and farming could coexist.', '“खेती ने तुरंत सभी का जीवन आसान बना दिया।” पद्धतियाँ और लाभ-हानि अलग थे; संग्रह और खेती साथ भी हो सकते थे।'),
    ],
  },
  T05: {
    flow: [
      b('Timeline and source inquiry (12 min): compare Mauryan, Gupta and later Chola examples, distinguish royal claims from evidence, and discuss restricted participation at Uttaramerur.', 'समय-रेखा और स्रोत जाँच (12 मिनट): मौर्य, गुप्त और बाद के चोल उदाहरणों की तुलना करें, शाही दावों व प्रमाणों का अंतर और उत्तरमेरूर में सीमित भागीदारी पर चर्चा करें।'),
      b('Saptanga builder and toy scenario (18 min): match all seven terms; distinguish the Arthashastra’s theory from the separate invented tax-and-works scores.', 'सप्तांग रचना और काल्पनिक मॉडल (18 मिनट): सातों शब्द मिलाएँ; अर्थशास्त्र का सिद्धांत अलग रखें और कर व निर्माण के बनाए गए अंकों को ऐतिहासिक माप न समझें।'),
      b('AI Audit Studio (10 min): have groups debunk plausible AI bot claims using epigraphy, chronology, and material finds instead of rote memorisation.', 'एआई तथ्य-जाँच प्रयोगशाला (10 मिनट): रटने के बजाय अभिलेख, कालक्रम व उत्खनन प्रमाणों से एआई दावों की जाँच करें।'),
    ],
    prompts: [
      b('What do the Uttaramerur inscriptions say about committee selection, and why is that not the same as universal adult suffrage?', 'उत्तरमेरूर अभिलेख समिति चयन के बारे में क्या कहते हैं और यह सार्वभौमिक वयस्क मताधिकार जैसा क्यों नहीं है?'),
    ],
    misconceptions: [
      b('“History is just memorising king lists and dates.” Real historians test systems, corroborate conflicting sources, and separate royal praise (prashasti) from evidence.', '“इतिहास केवल राजाओं के नाम व तिथियाँ रटना है।” वास्तविक इतिहासकार प्रणालियों का विश्लेषण और स्रोतों की सत्यता जाँचते हैं।'),
      b('“Ashoka’s Dhamma was a narrow sectarian command.” Stone edicts explicitly promote civic concord (samavaya), roads, medical care, and mutual respect.', '“अशोक का धम्म संकीर्ण धार्मिक आदेश था।” शिलालेख स्पष्ट रूप से नागरिक सद्भाव (समवाय), मार्ग व जन-कल्याण का आग्रह करते हैं।'),
    ],
  },
  T06: {
    flow: [
      b('Case Assessor & Early Traditions (12 min): test the 4 democratic criteria and read the 920 CE Uttaramerur Kudavolai rules.', 'लोकतंत्र जांच व प्रारंभिक परंपराएँ (12 मिनट): 4 मानदंड परखें और उत्तरमेरूर अभिलेख देखें।'),
      b('Parliamentary vs Presidential & Country Atlas (18 min): run a no-confidence vote and compare India, USA, France, Canada, and Russia.', 'संसदीय बनाम अध्यक्षीय व विश्व तुलना (18 मिनट): अविश्वास मत चलाएँ और देशों की तुलना करें।'),
    ],
  },
  T07: {
    flow: [
      b('ECI Workflow & Vote-to-Seat Sandbox (15 min): see how Model Code works and compare FPTP vs Runoff vs PR on one fictional vote set.', 'निर्वाचन प्रक्रिया व प्रयोगशाला (15 मिनट): आचार संहिता व FPTP बनाम आनुपातिक प्रणाली परखें।'),
      b('Delimitation, Voter Roll & Coalitions (15 min): test gerrymandering vs parity and form minimal winning coalitions.', 'परिसीमन व गठबंधन (15 मिनट): सीमा-निर्धारण और न्यूनतम बहुमत गठबंधन जाँचें।'),
    ],
  },
  T08: {
    flow: [
      b('Scarcity Board & PPF (15 min): allocate ₹100, trace bowing opportunity cost on the PPF, and discuss idle capacity.', 'दुर्लभता व PPF (15 मिनट): ₹100 का विभाजन करें और बढ़ती अवसर-लागत समझें।'),
      b('Central Problems, Systems & Safety Net (15 min): compare market, planned, and mixed economies plus shock protection.', 'केंद्रीय समस्याएँ, प्रणालियाँ व सुरक्षा-जाल (15 मिनट): प्रणालियों और संकट-सुरक्षा की तुलना करें।'),
    ],
  },
  T09: T09_TEACHER,
  T10: {
    flow: [
      b('3D Ocean Relief & Motions (15 min): sculpt shelf, slope, trench, and ridge; contrast waves, spring/neap tides, and currents.', '3D महासागर उच्चावच व गति (15 मिनट): मग्नतट, गर्त, ज्वार-भाटा और धाराएँ समझें।'),
      b('Fisheries, Coastal Hazards & Maritime Law (15 min): manage MSY, calculate tsunami evacuation minutes, and inspect UNCLOS zones.', 'मत्स्य, चक्रवात/सुनामी व समुद्री नियम (15 मिनट): टिकाऊ मत्स्य व UNCLOS देखें।'),
    ],
  },
  T11: {
    flow: [
      b('World Biomes & India Biosphere Reserves (15 min): match climate to flora/fauna and locate reserves from Nilgiri to Sundarbans.', 'विश्व बायोम व भारत जैवमंडल (15 मिनट): जलवायु के अनुसार वनस्पति और आरक्षित क्षेत्र पहचानें।'),
      b('Forest Trade-offs, Fire Mitigation & Sacred Groves (15 min): balance ecotourism, test fire drivers, and study community conservation.', 'पारिस्थितिक पर्यटन, वनाग्नि व पवित्र उपवन (15 मिनट): वनाग्नि रोकथाम और सामुदायिक संरक्षण देखें।'),
    ],
  },
  T12: {
    flow: [
      b('Regional Polities & 3D Hill Fort (15 min): inspect Chola, Rajput, Vijayanagara, Maratha, and Ahom centres; rotate the 3D hill fort cutaway.', 'क्षेत्रीय राज्य व 3D पहाड़ी दुर्ग (15 मिनट): मानचित्र पर राज्य और 3D दुर्ग रक्षा रचना देखें।'),
      b('Heritage, Bhakti Map & Continuity Timeline (15 min): trace Bhakti poets across regions and track economic-cultural resilience (1000–1700 CE).', 'विरासत, भक्ति मानचित्र व समय-रेखा (15 मिनट): 1000–1700 ई. की निरंतरता परखें।'),
    ],
  },
  T13: {
    flow: [
      b('Trade Routes & Cultural Exchange Maps (15 min): filter routes from 1900 BCE to 1200 CE and trace scripts, art, and monsoons.', 'व्यापार व सांस्कृतिक विनिमय मानचित्र (15 मिनट): प्राचीन बंदरगाह व विचार-प्रवाह देखें।'),
      b('IKS Gallery & Artefact Provenance (15 min): examine Aryabhata/Sushruta traditions and match museum finds to port origins.', 'भारतीय ज्ञान प्रणाली व पुरावशेष (15 मिनट): विज्ञान-चिकित्सा योगदान व उत्पत्ति जांचें।'),
    ],
  },
  T14: {
    flow: [
      b('Kautilya/Shukraniti & Concept Map (15 min): balance Danda and Nyaya and distinguish raw power from legitimate authority.', 'कौटिल्य/शुक्रनीति व अवधारणा मानचित्र (15 मिनट): दंड-न्याय संतुलन व वैध प्राधिकार देखें।'),
      b('Constitutional Timeline, Styles & Citizen Workflow (15 min): walk a lawful grievance from ward desk to courts.', 'संवैधानिक विकास व नागरिक प्रक्रिया (15 मिनट): वैध शिकायत प्रक्रिया का अभ्यास करें।'),
    ],
  },
  T15: {
    flow: [
      b('Business Plan & Unit Economics (15 min): test problem validation and find break-even units on the chart.', 'व्यवसाय योजना व इकाई अर्थशास्त्र (15 मिनट): प्रोटोटाइप जांच और सम-विच्छेद बिंदु निकालें।'),
      b('India Hubs, Creative Destruction & P&L (15 min): explore MSME clusters, worker reskilling curves, and shop profit/loss.', 'स्टार्टअप केंद्र, नवाचार व लाभ-हानि (15 मिनट): MSME क्लस्टर व बही-खाता देखें।'),
    ],
  },
  T16: {
    flow: [
      b('Budgeting, Inflation & Compound Interest (15 min): test 50-30-20 shocks, real purchasing power, and the Rule of 72.', 'बजट, मुद्रास्फीति व चक्रवृद्धि ब्याज (15 मिनट): क्रय-शक्ति और 72 के नियम का प्रयोग करें।'),
      b('Risk-Return, Insurance Pool & Tax Concept (15 min): pool 200 families’ risk and explore conceptual progressive tax slabs.', 'जोखिम-प्रतिफल, बीमा व कर अवधारणा (15 मिनट): जोखिम-विभाजन व सार्वजनिक सेवा वित्तपोषण समझें।'),
    ],
  },
};

export const LIMITS = {
  T01: b('Illustrative four-lens summaries and simplified six-node society graph for introductory framing.', 'प्रारंभिक समझ के लिए संक्षिप्त चार-लेंस विवरण और 6-नोड समाज आरेख।'),
  T02: T02_LIMITS,
  T03: b('Station values are illustrative, not official climate normals. Diary entries are learner observations stored locally, not verified station data. Monsoon arrows, catchment and carbon models are simplified; none is a weather forecast.', 'केंद्र के मान उदाहरण हैं, आधिकारिक जलवायु औसत नहीं। डायरी स्थानीय रूप से सहेजे विद्यार्थी प्रेक्षण हैं, सत्यापित केंद्र आँकड़े नहीं। मानसून तीर, जलग्रहण व कार्बन मॉडल सरल हैं; इनमें कोई मौसम पूर्वानुमान नहीं है।'),
  T04: b('Detective records are fictional; the tour is a composite, not a site survey. The large platform’s function is disputed. Settlement numbers and rates are invented; dates and cultural bands vary by region. Notes remain local and Hindi needs teacher review.', 'जासूस केस काल्पनिक हैं; यात्रा मिश्रित मॉडल है, स्थल सर्वेक्षण नहीं। बड़े चबूतरे का उपयोग विवादित है। बस्ती की संख्याएँ और दरें काल्पनिक हैं; तिथियाँ व काल क्षेत्रानुसार बदलते हैं। नोट स्थानीय रहते हैं और हिंदी की शिक्षक से जाँच चाहिए।'),
  T05: b('Schematic regional extents and simplified governance flow diagrams representing centuries of diverse change.', 'सदियों के विविध ऐतिहासिक परिवर्तनों के लिए योजनाबद्ध क्षेत्रीय विस्तार और सरलीकृत प्रशासन आरेख।'),
  T06: b('Fictional assessment cases and concise constitutional summaries; real democracies involve many evolving institutions.', 'काल्पनिक परीक्षण केस और संक्षिप्त संवैधानिक तुलना; वास्तविक लोकतंत्र में कई गतिशील संस्थाएँ होती हैं।'),
  T07: b('All party names, block populations, and vote shares in the sandboxes are strictly fictional for teaching mechanics.', 'प्रयोगशालाओं में सभी दल, मत-प्रतिशत और ब्लॉक जनसंख्या केवल शिक्षण हेतु काल्पनिक हैं।'),
  T08: b('Smooth straight/curved frontier models with fictional rupee figures to demonstrate opportunity cost and safety-net arithmetic.', 'अवसर-लागत व सुरक्षा-जाल गणित दिखाने हेतु काल्पनिक रुपये और सरल वक्र मॉडल।'),
  T09: T09_LIMITS,
  T10: b('Vertical ocean depth in 3D cutaway is strongly exaggerated; logistics fisheries and tsunami speeds are textbook order-of-magnitude models.', '3D समुद्री काट में गहराई अतिरंजित है; मत्स्य और सुनामी मॉडल पाठ्यपुस्तकीय परिमाण दिखाने हेतु हैं।'),
  T11: b('Simplified biome boundaries, reserve markers, and heuristic fire-risk / ecotourism formulas — check local forest advisories for real conditions.', 'सरल बायोम सीमाएँ, आरक्षित क्षेत्र बिंदु और वनाग्नि-जोखिम के शैक्षिक सूत्र।'),
  T12: b('3D hill fort is an architectural composite; regional polity boundaries varied considerably across 1000–1700 CE.', '3D पहाड़ी दुर्ग एक समग्र स्थापत्य पुनर्निर्माण है; 1000–1700 ई. में क्षेत्रीय सीमाएँ समय-समय पर बदलती रहीं।'),
  T13: b('Ports and routes are simplified great-circle arcs across multiple centuries; verify exact dates against textbook chronologies.', 'बंदरगाह व मार्ग अनेक सदियों के सरलीकृत चाप हैं; सटीक तिथियों के लिए पाठ्यपुस्तक देखें।'),
  T14: b('Conceptual governance indicators and fictional grievance timelines illustrating constitutional accountability.', 'संवैधानिक जवाबदेही दर्शाने वाले अवधारणात्मक शासन सूचक और काल्पनिक शिकायत प्रक्रिया।'),
  T15: b('Fictional small-business prices, simplified Schumpeterian transition curves, and illustrative startup hubs.', 'काल्पनिक व्यवसाय मूल्य, सरल नवाचार वक्र और प्रतिनिधि भारतीय स्टार्टअप केंद्र।'),
  T16: b('Hypothetical interest/inflation examples and strictly unitless tax-slab illustrations — never live statutory tax rates or financial advice.', 'काल्पनिक ब्याज/मुद्रास्फीति उदाहरण और इकाई-रहित कर-स्तर चित्रण — ये वास्तविक वैधानिक कर दरें या वित्तीय सलाह नहीं हैं।'),
};
