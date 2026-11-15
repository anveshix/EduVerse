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
      b('Classroom tally (10 min): use invented totals to discuss equal participation, plurality, ties, abstention and rights. It is not a real or secret ballot.', 'कक्षा गिनती (10 मिनट): काल्पनिक संख्याओं से समान भागीदारी, सर्वाधिक मत, बराबरी, मत से विरत रहने और अधिकारों पर चर्चा करें। यह असली या गुप्त मतदान नहीं है।'),
      b('Panchayati Raj (12 min): distinguish the Gram Sabha from elected panchayats at village, intermediate and district levels; discuss varying state powers and historical limits.', 'पंचायती राज (12 मिनट): ग्राम सभा को ग्राम, मध्यवर्ती व जिला स्तर की निर्वाचित पंचायतों से अलग समझें; राज्यों के अलग अधिकारों और ऐतिहासिक सीमाओं पर चर्चा करें।'),
      b('Systems comparison (18 min): run a simplified confidence motion with all 100 members voting, then compare parliamentary and presidential structures.', 'प्रणाली तुलना (18 मिनट): सभी 100 सदस्यों के मतदान वाला सरल विश्वास प्रस्ताव चलाएँ और संसदीय व अध्यक्षीय संरचनाओं की तुलना करें।'),
    ],
    prompts: [b('How could a community hear those who were absent or lost a vote without treating the vote as permission to ignore their rights?', 'समुदाय अनुपस्थित या मत में हारने वाले लोगों की बात कैसे सुने, बिना उनके अधिकारों को नज़रअंदाज़ किए?')],
    misconceptions: [b('A Gram Sabha is not the same as its elected Gram Panchayat, and one tally alone cannot establish that a process is democratic.', 'ग्राम सभा अपनी निर्वाचित ग्राम पंचायत के समान नहीं है, और एक गिनती अकेले प्रक्रिया का लोकतांत्रिक होना सिद्ध नहीं करती।')],
  },
  T07: {
    flow: [
      b('Voter journey and vote-to-seat (15 min): check the fictional roll, private choice and VVPAT steps, then compare FPTP with fictional runoff and list PR.', 'मतदाता यात्रा और मत-से-सीट (15 मिनट): काल्पनिक सूची, गोपनीय चुनाव व वीवीपैट के चरण देखें, फिर FPTP की काल्पनिक पुनर्मतदान और सूची PR से तुलना करें।'),
      b('Boundaries and coalitions (15 min): compare connected equal-population maps, then choose parties and test whether every partner is needed for a 10-seat majority.', 'सीमाएँ और गठबंधन (15 मिनट): जुड़े हुए समान जनसंख्या मानचित्र तुलना करें, फिर दल चुनकर जाँचें कि 10 सीटों के बहुमत में हर साझेदार आवश्यक है या नहीं।'),
    ],
    prompts: [b('Does a majority of seats always mean a majority of votes? Can equal-population maps still produce different seat results?', 'क्या सीटों के बहुमत का अर्थ हमेशा मतों का बहुमत है? क्या समान जनसंख्या मानचित्र अलग सीट परिणाम दे सकते हैं?')],
    misconceptions: [b('Turning 18 does not automatically register a voter; equal district population alone cannot rule out biased boundary design. A numerical coalition is not an actual political agreement.', '18 वर्ष होने से मतदाता स्वतः पंजीकृत नहीं होता; समान क्षेत्रीय जनसंख्या अकेले पक्षपातपूर्ण सीमा की संभावना नहीं मिटाती। संख्यात्मक गठबंधन वास्तविक राजनीतिक समझौता नहीं है।')],
  },
  T08: {
    flow: [
      b('Scarcity & PPF (15 min): compare fictional ₹100 and ₹1,000 plans; contrast the two-hour straight-line example with the assumed curved farm frontier.', 'दुर्लभता व PPF (15 मिनट): काल्पनिक ₹100 व ₹1,000 योजनाएँ और दो घंटे की सीधी सीमा की कृषि वक्र से तुलना करें।'),
      b('Central Problems, Systems & Safety Net (15 min): compare market, planned, and mixed economies plus shock protection.', 'केंद्रीय समस्याएँ, प्रणालियाँ व सुरक्षा-जाल (15 मिनट): प्रणालियों और संकट-सुरक्षा की तुलना करें।'),
    ],
  },
  T09: T09_TEACHER,
  T10: {
    flow: [
      b('3D Ocean Relief & Motions (15 min): sculpt shelf, slope, trench, and ridge; contrast waves, spring/neap tides, and currents.', '3D महासागर उच्चावच व गति (15 मिनट): मग्नतट, गर्त, ज्वार-भाटा और धाराएँ समझें।'),
      b('Fisheries, Coastal Hazards & Maritime Law (15 min): compare invented stock indices with local livelihoods, distinguish cyclones and tsunami warnings, and inspect UNCLOS zones. The tsunami calculation is not an evacuation clock.', 'मत्स्य, तटीय खतरे व समुद्री नियम (15 मिनट): काल्पनिक भंडार सूचक व आजीविका की तुलना करें, चक्रवात और सुनामी चेतावनी में अंतर समझें। सुनामी गणना निकासी घड़ी नहीं है।'),
    ],
  },
  T11: {
    flow: [
      b('Habitats and reserves (15 min): compare Thar, Sundarbans, Western Ghats and Bihar’s Kabartal; distinguish a Ramsar wetland from a biosphere reserve and test the simplified climate matcher.', 'आवास और आरक्षित क्षेत्र (15 मिनट): थार, सुंदरबन, पश्चिमी घाट और बिहार के काबरताल तुलना करें; रामसर आर्द्रभूमि व जैवमंडल आरक्षित क्षेत्र अलग समझें।'),
      b('Forest trade-offs (15 min): compare the fictional visit-count reference, livelihoods, rights and habitat; test harvest starting stock and discuss fire prevention without treating the model as an alert.', 'वन संतुलन (15 मिनट): काल्पनिक भ्रमण संख्या के साथ आजीविका, अधिकार व आवास तुलना करें; शुरुआती वन भंडार परखें और मॉडल को चेतावनी न मानें।'),
    ],
    prompts: [b('Whose livelihoods and knowledge should be heard in a wetland or forest decision? What would the model need to know before anyone could judge sustainability?', 'आर्द्रभूमि या वन निर्णय में किसकी आजीविका व ज्ञान सुना जाना चाहिए? टिकाऊपन जाँचने से पहले मॉडल को क्या जानना होगा?')],
    misconceptions: [b('Grassland is not empty land; Ramsar status is not a biosphere-reserve designation. A model index, numerical visitor reference or maximum growth does not prove real-world safety or sustainability.', 'घासभूमि खाली जमीन नहीं है; रामसर दर्जा जैवमंडल आरक्षित क्षेत्र नहीं है। मॉडल सूचक, भ्रमण संदर्भ या अधिकतम वृद्धि वास्तविक सुरक्षा या टिकाऊपन सिद्ध नहीं करता।')],
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
  T06: b('Class votes and case scores are invented teaching tools, not a secure ballot or complete democracy test. Panchayat roles, powers and exceptions depend on state law; real constitutional systems are more complex.', 'कक्षा मत और केस अंक काल्पनिक शिक्षण साधन हैं, सुरक्षित मतपेटी या लोकतंत्र का पूरा परीक्षण नहीं। पंचायत भूमिकाएँ, अधिकार और अपवाद राज्य के कानून पर निर्भर हैं; वास्तविक संवैधानिक प्रणालियाँ अधिक जटिल हैं।'),
  T07: b('All party names, block populations, and vote shares in the sandboxes are strictly fictional for teaching mechanics.', 'प्रयोगशालाओं में सभी दल, मत-प्रतिशत और ब्लॉक जनसंख्या केवल शिक्षण हेतु काल्पनिक हैं।'),
  T08: b('Smooth straight/curved frontier models with fictional rupee figures to demonstrate opportunity cost and safety-net arithmetic.', 'अवसर-लागत व सुरक्षा-जाल गणित दिखाने हेतु काल्पनिक रुपये और सरल वक्र मॉडल।'),
  T09: T09_LIMITS,
  T10: b('The 3D depth is exaggerated. Fishery indices are invented, and constant-depth tsunami arithmetic is not an evacuation clock. Follow current official and local warnings.', '3D गहराई अतिरंजित है। मत्स्य सूचक काल्पनिक हैं और समान गहराई की सुनामी गणना निकासी घड़ी नहीं है। वर्तमान आधिकारिक और स्थानीय चेतावनी मानें।'),
  T11: b('Habitat dots and climate envelopes are schematic. Harvest, visitor reference and fire indices are invented; none certifies sustainability or safety. Follow current local fire instructions. Hindi needs teacher review.', 'आवास बिंदु व जलवायु सीमाएँ योजनाबद्ध हैं। कटाई, भ्रमण संदर्भ और आग सूचक काल्पनिक हैं; कोई टिकाऊपन या सुरक्षा सिद्ध नहीं करता। वर्तमान स्थानीय आग निर्देश मानें। हिंदी की शिक्षक से जाँच चाहिए।'),
  T12: b('3D hill fort is an architectural composite; regional polity boundaries varied considerably across 1000–1700 CE.', '3D पहाड़ी दुर्ग एक समग्र स्थापत्य पुनर्निर्माण है; 1000–1700 ई. में क्षेत्रीय सीमाएँ समय-समय पर बदलती रहीं।'),
  T13: b('Ports and routes are simplified great-circle arcs across multiple centuries; verify exact dates against textbook chronologies.', 'बंदरगाह व मार्ग अनेक सदियों के सरलीकृत चाप हैं; सटीक तिथियों के लिए पाठ्यपुस्तक देखें।'),
  T14: b('Conceptual governance indicators and fictional grievance timelines illustrating constitutional accountability.', 'संवैधानिक जवाबदेही दर्शाने वाले अवधारणात्मक शासन सूचक और काल्पनिक शिकायत प्रक्रिया।'),
  T15: b('Fictional small-business prices, simplified Schumpeterian transition curves, and illustrative startup hubs.', 'काल्पनिक व्यवसाय मूल्य, सरल नवाचार वक्र और प्रतिनिधि भारतीय स्टार्टअप केंद्र।'),
  T16: b('Hypothetical interest/inflation examples and strictly unitless tax-slab illustrations — never live statutory tax rates or financial advice.', 'काल्पनिक ब्याज/मुद्रास्फीति उदाहरण और इकाई-रहित कर-स्तर चित्रण — ये वास्तविक वैधानिक कर दरें या वित्तीय सलाह नहीं हैं।'),
};
