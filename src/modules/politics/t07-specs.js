// T07 Elections lab specs (L1, L3, L4).
import * as E from '../../engines/domain/election.js';
import * as S_ from '../../engines/domain/society.js';
import { esc, fmt } from '../../core/dom.js';
import { pair as P } from '../../core/i18n.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });

// ------------------------------------------------------------------ T07.L1 Election Process Timeline & ECI Workflow
const ECI_STAGES = [
  { id: 1, en: '1. Voter Roll Update', hi: '1. मतदाता सूची अद्यतन', law: 'RPA 1950', descEn: 'Electoral officers maintain rolls. Eligible citizens apply and should check their names; turning 18 alone does not automatically add a name.', descHi: 'निर्वाचन अधिकारी मतदाता सूची सँभालते हैं। पात्र नागरिक आवेदन करें और अपना नाम जाँचें; केवल 18 वर्ष के होने से नाम अपने आप नहीं जुड़ता।' },
  { id: 2, en: '2. Notification & Model Code of Conduct', hi: '2. अधिसूचना व आचार संहिता', law: 'Article 324 & MCC', descEn: 'After the election schedule is announced, the Model Code places restrictions on parties and candidates, including misuse of official resources.', descHi: 'चुनाव कार्यक्रम घोषित होने के बाद आदर्श आचार संहिता दलों और उम्मीदवारों पर प्रतिबंध लगाती है, जिनमें सरकारी संसाधनों का दुरुपयोग भी शामिल है।' },
  { id: 3, en: '3. Nominations, Scrutiny & Campaigning', hi: '3. नामांकन, जांच व प्रचार', law: 'RPA 1951 (Sec 33–36)', descEn: 'Candidates submit nominations and required disclosures. Campaigning is restricted during the statutory silence period before the close of polling.', descHi: 'उम्मीदवार नामांकन और आवश्यक घोषणाएँ जमा करते हैं। मतदान समाप्ति से पहले वैधानिक मौन अवधि में प्रचार पर प्रतिबंध होते हैं।' },
  { id: 4, en: '4. Polling, EVM/VVPAT & Counting', hi: '4. मतदान, ईवीएम/वीवीपैट व मतगणना', law: 'Article 326 (Universal Suffrage)', descEn: 'At a polling station a voter can check the VVPAT slip through a window; it falls into a sealed box. Prescribed sample verification forms part of counting.', descHi: 'मतदाता केंद्र पर वीवीपैट पर्ची खिड़की से देख सकता है; पर्ची सीलबंद बॉक्स में गिरती है। निर्धारित नमूने का मिलान मतगणना का हिस्सा है।' },
];
export const electionTimeline = {
  id: 'T07.L1',
  objective: b('Trace a simplified Lok Sabha or state Assembly election workflow led by the Election Commission of India (ECI) under Article 324 and the Representation of the People Acts (1950, 1951).', 'अनुच्छेद 324 और जनप्रतिनिधित्व अधिनियम (1950, 1951) के अंतर्गत भारत निर्वाचन आयोग की लोकसभा या राज्य विधानसभा चुनाव प्रक्रिया का सरलीकृत अध्ययन करें।'),
  note: { kind: 'schematic', en: 'A simplified Indian election workflow, not an application or legal eligibility check. Delimitation happens separately, not before every election. Processes and instructions can change; consult the Election Commission for current guidance.', hi: 'भारतीय चुनाव प्रक्रिया का सरलीकृत रूप; यह आवेदन या कानूनी पात्रता जाँच नहीं है। परिसीमन अलग होता है, हर चुनाव से पहले नहीं। प्रक्रिया और निर्देश बदल सकते हैं; वर्तमान जानकारी के लिए निर्वाचन आयोग देखें।' },
  init: () => ({ stage: 2, independentEci: true }),
  controls: [
    { id: 'stage', type: 'slider', label: b('Election stage (1–4)', 'चुनाव चरण (1–4)'), min: 1, max: 4, step: 1 },
    { id: 'independentEci', type: 'toggle', label: b('Imagine independent supervision', 'स्वतंत्र निगरानी की कल्पना करें') },
  ],
  view(S) {
    const st = ECI_STAGES[S.stage - 1] || ECI_STAGES[0];
    const g = ECI_STAGES.map((x, i) => {
      const y = 18 + i * 52, active = x.id === S.stage;
      const fill = !S.independentEci && active ? '#b91c1c' : active ? '#1d4ed8' : '#f1f5f9';
      return `<rect x="24" y="${y}" width="592" height="42" rx="8" fill="${fill}" fill-opacity="${active ? '.18' : '1'}" stroke="${active ? (S.independentEci ? '#1d4ed8' : '#b91c1c') : '#cbd5e1'}" stroke-width="${active ? '2.5' : '1.2'}"/>`
        + `<text class="txt b${active ? '' : ' static-on-light'}" x="40" y="${y + 20}">${esc(P(x.en, x.hi))}</text>`
        + `<text class="txt sm mut${active ? '' : ' static-on-light'}" x="598" y="${y + 22}" text-anchor="end">${esc(x.law)}</text>`;
    }).join('');
    const svg = `<svg viewBox="0 0 640 232" class="chart t07-timeline" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
    return {
      plate: {
        src: 'assets/images/plates/t07-elections.jpg',
        en: 'Indian polling station courtyard: tap pins to walk step-by-step through the 4 ECI election phases.',
        hi: 'भारतीय मतदान केंद्र: निर्वाचन आयोग के चारों चुनावी चरणों को देखने हेतु पिन पर टैप करें।',
        spots: [
          { x: 20, y: 60, en: 'Stage 1: Voter Roll Revision', hi: 'चरण 1: मतदाता सूची संशोधन', detail: b('Eligible people must apply and check the roll; being 18 does not automatically register a voter.', 'पात्र लोगों को आवेदन और मतदाता सूची की जाँच करनी होती है; 18 वर्ष होने से स्वतः पंजीकरण नहीं होता।'), set: { stage: 1, independentEci: true } },
          { x: 44, y: 44, en: 'Stage 2: Model Code of Conduct', hi: 'चरण 2: आदर्श आचार संहिता', detail: b('The Model Code places restrictions on the misuse of official resources after the schedule is announced.', 'चुनाव कार्यक्रम घोषित होने पर आचार संहिता सरकारी संसाधनों के दुरुपयोग पर प्रतिबंध लगाती है।'), set: { stage: 2, independentEci: true } },
          { x: 66, y: 54, en: 'Stage 3: Affidavits & Campaign', hi: 'चरण 3: शपथपत्र व चुनाव प्रचार', detail: b('Candidates provide required disclosures; a statutory silence period restricts campaigning before polling closes.', 'उम्मीदवार आवश्यक घोषणाएँ देते हैं; मतदान समाप्ति से पहले वैधानिक मौन अवधि में प्रचार पर प्रतिबंध होता है।'), set: { stage: 3, independentEci: true } },
          { x: 84, y: 58, en: 'Stage 4: EVM/VVPAT Secret Ballot', hi: 'चरण 4: EVM/VVPAT गुप्त मतदान', detail: b('A voter can see the VVPAT slip briefly; it falls into a sealed box. Specified samples are checked during counting.', 'मतदाता वीवीपैट पर्ची कुछ क्षण देख सकता है; पर्ची सीलबंद बॉक्स में गिरती है। मतगणना में निर्धारित नमूने जाँचे जाते हैं।'), set: { stage: 4, independentEci: true } },
        ],
      },
      svg,
      aria: P(`Stage ${st.id}: ${st.en}. Independent supervision: ${S.independentEci ? 'yes' : 'no'}.`, `चरण ${st.id}: ${st.hi}। स्वतंत्र निगरानी: ${S.independentEci ? 'हाँ' : 'नहीं'}।`),
      lines: [
        { en: `${st.en} (${st.law}): ${st.descEn}`, hi: `${st.hi}: ${st.descHi}`, cls: S.independentEci ? 'balanced' : 'warn' },
        { en: S.independentEci ? 'Independent supervision can help protect fair competition, but independence alone does not guarantee an error-free election.' : 'Hypothetical: if supervision answered to the ruling cabinet, public trust could be at risk. This switch does not change the real ECI.', hi: S.independentEci ? 'स्वतंत्र निगरानी निष्पक्ष प्रतिस्पर्धा में मदद कर सकती है, पर अकेले स्वतंत्रता त्रुटिरहित चुनाव की गारंटी नहीं है।' : 'कल्पना करें: यदि निगरानी सत्ताधारी मंत्रिमंडल के अधीन होती तो सार्वजनिक विश्वास को खतरा हो सकता था। यह स्विच वास्तविक आयोग को नहीं बदलता।', cls: S.independentEci ? 'note' : 'warn' },
      ],
    };
  },
  discover: [
    b('Walk through stages 1 to 4 and note which Representation of the People Act governs voter rolls (1950) vs candidate conduct & counting (1951).', 'चरण 1 से 4 तक देखें कि मतदाता सूची (1950) बनाम उम्मीदवारी व मतगणना (1951) किस अधिनियम में आते हैं।'),
    b('Toggle Independent ECI off to examine why constitutional protection under Article 324 matters.', 'अनुच्छेद 324 की संवैधानिक सुरक्षा का महत्व समझने के लिए स्वतंत्र ECI बंद करके देखें।'),
  ],
  predictions: [{
    id: 'p1', revision: 't07-step7',
    stem: b('After the election schedule is announced, may a ruling party use official government vehicles for its campaign?', 'चुनाव कार्यक्रम घोषित होने के बाद क्या सत्ताधारी दल अपने प्रचार में सरकारी वाहनों का उपयोग कर सकता है?'),
    options: [opt('no', 'No — official vehicles must not be used for the party campaign', 'नहीं — दल के प्रचार में सरकारी वाहन उपयोग नहीं होने चाहिए'), opt('yes', 'Yes — ruling leaders face no restrictions', 'हाँ — सत्ताधारी नेताओं पर कोई रोक नहीं')],
    run: (S) => { S.stage = 2; S.independentEci = true; return 'no'; },
    explain: () => b('The Model Code restricts the use of official resources for party campaigning. Consult the current ECI code and instructions for details.', 'आदर्श आचार संहिता दल के प्रचार में सरकारी संसाधनों के उपयोग पर प्रतिबंध लगाती है। विवरण के लिए निर्वाचन आयोग की वर्तमान संहिता और निर्देश देखें।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('Which Article bases Lok Sabha and state Assembly elections on adult suffrage, subject to the law?', 'कौन-सा अनुच्छेद लोकसभा और राज्य विधानसभा चुनावों को कानून के अधीन वयस्क मताधिकार पर आधारित करता है?'),
    correct: '326',
    options: [
      opt('326', 'Article 326', 'अनुच्छेद 326'),
      opt('1950', 'Only local municipal by-laws', 'केवल स्थानीय नगरपालिका उप-नियम', b('Universal adult franchise is guaranteed directly by Article 326 of the Constitution.', 'सार्वभौमिक वयस्क मताधिकार सीधे संविधान के अनुच्छेद 326 द्वारा गारंटीकृत है।')),
    ],
    explain: b('Article 324 provides for the ECI. Article 326 sets adult suffrage at 18, subject to specified legal disqualifications; registration is required.', 'अनुच्छेद 324 निर्वाचन आयोग का प्रावधान करता है। अनुच्छेद 326 में 18 वर्ष पर वयस्क मताधिकार है, निर्धारित कानूनी अपात्रताओं के अधीन; पंजीकरण आवश्यक है।'),
    hint: b('Check Stage 4 in the workflow.', 'प्रक्रिया में चरण 4 देखें।'),
  }],
  reflect: b('Why is candidate disclosure of assets and criminal cases before voting helpful for citizens?', 'मतदान से पहले उम्मीदवारों द्वारा संपत्ति और आपराधिक मामलों की घोषणा नागरिकों के लिए क्यों उपयोगी है?'),
};

// ------------------------------------------------------------------ T07.L3 Delimitation & Electoral Roll Enumerator
export const delimitationLab = {
  id: 'T07.L3',
  objective: b('Explore how drawing constituency boundaries (delimitation) shapes seat outcomes from identical block votes, and check voter-roll eligibility rules.', 'देखें कि एक जैसे मतों के बावजूद निर्वाचन क्षेत्र की सीमाएँ (परिसीमन) बदलने से सीट परिणाम कैसे बदल जाते हैं, और मतदाता सूची पात्रता जाँचें।'),
  note: { kind: 'fictional', en: 'Toy 9-block city: 460 A votes and 440 B votes. Each block has 100 fictional voters; here voters stand in for population. Real delimitation considers census population, geography and law, not this toy voting data.', hi: 'काल्पनिक 9-ब्लॉक शहर: A को 460 और B को 440 मत। हर ब्लॉक में 100 काल्पनिक मतदाता हैं; यहाँ मतदाताओं को जनसंख्या माना गया है। वास्तविक परिसीमन जनगणना की जनसंख्या, भूगोल और कानून देखता है, ये काल्पनिक मत नहीं।' },
  init: () => ({ scheme: 'rows', voterAge: 19, resident: true }),
  controls: [
    { id: 'scheme', type: 'chips', label: b('Boundary map', 'सीमा मानचित्र'), options: [
      opt('rows', 'Equal-population rows (300/seat)', 'समान जनसंख्या पंक्तियाँ (300/सीट)'),
      opt('cols', 'Equal-population columns (300/seat)', 'समान जनसंख्या स्तंभ (300/सीट)'),
      opt('packedA', 'Gerrymandered (Pack A)', 'पक्षपातपूर्ण (A को समेटना)'),
      opt('unequal', 'Unequal Pop (Malapportion)', 'असमान जनसंख्या'),
    ] },
    { id: 'voterAge', type: 'slider', label: b('Citizen age (enumerator check)', 'नागरिक आयु (प्रगणक जांच)'), min: 15, max: 25, step: 1 },
    { id: 'resident', type: 'toggle', label: b('Ordinarily resident in constituency', 'निर्वाचन क्षेत्र का सामान्य निवासी') },
  ],
  view(S) {
    const res = S_.delimitationOutcome(S.scheme);
    const roll = S_.checkVoterRoll({ age: S.voterAge, resident: S.resident, citizen: true });
    const distCol = ['#dbeafe', '#fef3c7', '#dcfce7'], distStroke = ['#1d4ed8', '#b45309', '#15803d'];
    let cells = '';
    res.districts.forEach((d, di) => {
      d.blocks.forEach((bid) => {
        const blk = S_.TOY_BLOCKS[bid], r = Math.floor(bid / 3), c = bid % 3;
        const x = 36 + c * 92, y = 22 + r * 66;
        cells += `<rect x="${x}" y="${y}" width="84" height="58" rx="6" fill="${distCol[di]}" stroke="${distStroke[di]}" stroke-width="2.5"/>`
          + `<text class="txt sm b" x="${x + 42}" y="${y + 22}" text-anchor="middle">D${di + 1} · ${blk.a > blk.b ? 'A' : 'B'}</text>`
          + `<text class="txt sm mut" x="${x + 42}" y="${y + 42}" text-anchor="middle">A:${blk.a} B:${blk.b}</text>`;
      });
    });
    const summary = res.districts.map((d, di) => {
      const y = 32 + di * 62;
      return `<rect x="336" y="${y}" width="284" height="48" rx="8" fill="${distCol[di]}" stroke="${distStroke[di]}" stroke-width="1.8"/>`
        + `<text class="txt b" x="350" y="${y + 22}">D${di + 1}: ${esc(P('People', 'लोग'))} ${d.pop} → ${esc(P('Winner', 'विजेता'))}: ${d.winner}</text>`
        + `<text class="txt sm mut" x="350" y="${y + 39}">A ${d.votesA} / B ${d.votesB}</text>`;
    }).join('');
    const svg = `<div class="t07-boundary-hint">${esc(P('Scroll the map sideways if needed; counts also appear below.', 'ज़रूरत पर मानचित्र को आड़ा सरकाएँ; संख्याएँ नीचे भी हैं।'))}</div><div class="t07-boundary-scroll" role="region" tabindex="0" aria-label="${esc(P('Scrollable nine-block district map', 'सरकने वाला नौ-ब्लॉक क्षेत्र मानचित्र'))}"><svg viewBox="0 0 640 232" class="chart t07-boundaries" role="img" xmlns="http://www.w3.org/2000/svg">${cells}${summary}</svg></div>`;
    return {
      plate: {
        src: 'assets/images/plates/t07-delimitation.jpg',
        en: 'Delimitation Commission workbench: tap district puzzle, voter roll or surveyor compass to test boundary drawing fairness.',
        hi: 'परिसीमन आयोग कार्यमेज़: सीमा-मानचित्र, मतदाता सूची या दिशासूचक पर टैप कर निष्पक्षता परखें।',
        spots: [
          { x: 46, y: 56, en: 'Equal-population rows (300/seat)', hi: 'समान जनसंख्या पंक्तियाँ', detail: b('Here A has the most votes overall and wins two seats. Equal population alone does not ensure proportional seats.', 'यहाँ A के कुल मत सबसे अधिक हैं और वह दो सीटें जीतता है। केवल समान जनसंख्या अनुपात में सीटें सुनिश्चित नहीं करती।'), set: { scheme: 'rows' } },
          { x: 16, y: 28, en: 'Voter Roll Eligibility Check (18+)', hi: 'मतदाता सूची पात्रता जांच', detail: b('Test citizen age & ordinary residence under enumerator rules.', 'प्रगणक नियमों के तहत आयु (18+) और सामान्य निवास पात्रता परखें।'), set: { voterAge: 18, resident: true } },
          { x: 86, y: 72, en: 'Gerrymandering Trap (Pack A)', hi: 'पक्षपातपूर्ण परिसीमन (पैकिंग)', detail: b('The same fictional votes and equal-sized connected districts give the 48.9% party two of three seats. This deliberately packed example illustrates a possibility, not proof of a real boundary’s intent.', 'वही काल्पनिक मत और समान आकार के जुड़े क्षेत्र 48.9% मत वाले दल को तीन में से दो सीटें देते हैं। जानबूझकर समेटा यह उदाहरण संभावना दिखाता है, किसी वास्तविक सीमा का उद्देश्य सिद्ध नहीं करता।'), set: { scheme: 'packedA' } },
        ],
      },
      svg,
      aria: P(`Fictional districts: A ${res.seatsA} seats, B ${res.seatsB}; population gap ${res.popSpread}.`, `काल्पनिक क्षेत्र: A को ${res.seatsA} सीटें, B को ${res.seatsB}; जनसंख्या अंतर ${res.popSpread}।`),
      lines: [
        { en: `Result: Party A (51.1% votes) wins ${res.seatsA} seat${res.seatsA === 1 ? '' : 's'}; Party B (48.9%) wins ${res.seatsB} seat${res.seatsB === 1 ? '' : 's'}. Population gap across constituencies: ${res.popSpread}.`, hi: `परिणाम: दल A (51.1% मत) को ${res.seatsA} सीटें; दल B (48.9% मत) को ${res.seatsB} सीटें। जनसंख्या अंतर: ${res.popSpread}।`, cls: res.mismatch || res.popSpread > 0 ? 'warn' : 'balanced' },
        { en: `District votes: ${res.districts.map((d, i) => `D${i + 1}: A ${d.votesA}, B ${d.votesB} (${d.pop} people)`).join('; ')}. All blocks are fictional and connected within each district. Equal population does not by itself prevent partisan boundary drawing.`, hi: `क्षेत्रों के मत: ${res.districts.map((d, i) => `D${i + 1}: A ${d.votesA}, B ${d.votesB} (${d.pop} लोग)`).join('; ')}। हर क्षेत्र के काल्पनिक ब्लॉक आपस में जुड़े हैं। केवल समान जनसंख्या पक्षपातपूर्ण सीमा-निर्धारण को नहीं रोकती।`, cls: 'note' },
        { en: `Toy checks (assumed citizen; age ${S.voterAge}, ordinarily resident: ${S.resident ? 'yes' : 'no'}): ${roll.eligible ? 'passes these checks, not automatic registration' : 'does not pass these checks'}. Qualifying dates and legal disqualifications also matter; an electoral officer decides registration.`, hi: `काल्पनिक जाँच (नागरिक मानकर; आयु ${S.voterAge}, सामान्य निवासी: ${S.resident ? 'हाँ' : 'नहीं'}): ${roll.eligible ? 'इन जाँचों में पास, स्वतः पंजीकरण नहीं' : 'इन जाँचों में पास नहीं'}। अर्हता तिथियाँ और कानूनी अपात्रताएँ भी महत्त्वपूर्ण हैं; पंजीकरण का निर्णय निर्वाचन अधिकारी करता है।`, cls: roll.eligible ? 'note' : 'warn' },
      ],
    };
  },
  discover: [
    b('Compare equal-population rows with the deliberately packed example: block votes stay the same but the seat winner changes.', 'समान जनसंख्या पंक्तियों को जानबूझकर समेटे उदाहरण से तुलना करें: ब्लॉक के मत वही हैं पर सीट विजेता बदलता है।'),
    b('Try "Unequal Pop" and explain why India’s Delimitation Commission keeps constituency populations roughly equal.', '“असमान जनसंख्या” चुनें और समझें कि भारत का परिसीमन आयोग जनसंख्या लगभग समान क्यों रखता है।'),
  ],
  predictions: [{
    id: 'p1', revision: 't07-step7',
    stem: b('When Party A’s voters are packed tightly into 1 constituency while Party B wins 2 narrower ones, who wins more seats despite fewer total votes?', 'जब दल A के मतदाताओं को 1 ही क्षेत्र में समेट दिया जाए और दल B अन्य 2 क्षेत्रों में थोड़ा आगे रहे, तो कम कुल मत के बावजूद कौन अधिक सीटें जीतता है?'),
    options: [opt('B', 'Party B wins 2–1', 'दल B 2–1 से जीतता है'), opt('A', 'Party A still wins 2–1', 'दल A अब भी 2–1 से जीतता है')],
    run: (S) => { S.scheme = 'packedA'; return S_.delimitationOutcome('packedA').mismatch ? 'B' : 'A'; },
    explain: () => b('D1 has A 205–95, while B wins D2 155–145 and D3 190–110. All three fictional districts are connected and have 300 people; equal population alone does not prevent a biased design.', 'D1 में A 205–95 से आगे है, पर B, D2 को 155–145 और D3 को 190–110 से जीतता है। तीनों काल्पनिक क्षेत्र जुड़े हैं और इनमें 300 लोग हैं; समान जनसंख्या अकेले पक्षपातपूर्ण सीमा नहीं रोकती।'),
  }],
  exit: [{
    id: 'e1',
    stem: b('What is the main purpose of an independent Delimitation Commission in India?', 'भारत में स्वतंत्र परिसीमन आयोग का मुख्य उद्देश्य क्या है?'),
    correct: 'parity',
    options: [
      opt('parity', 'Ensure each constituency has roughly equal population and boundaries are not manipulated for party advantage.', 'सुनिश्चित करना कि प्रत्येक क्षेत्र की जनसंख्या लगभग समान रहे और सीमाओं से दलीय लाभ न उठाया जाए।'),
      opt('count', 'Count ballot papers on election night.', 'मतगणना की रात मतपत्र गिनना।', b('Returning Officers count votes; Delimitation draws boundaries periodically.', 'मतगणना रिटर्निंग अधिकारी करते हैं; परिसीमन समय-समय पर सीमाएँ तय करता है।')),
    ],
    explain: b('Population parity is an important aim, along with geographic and legal considerations. Equal population alone cannot rule out partisan boundary design.', 'जनसंख्या समानता एक महत्वपूर्ण लक्ष्य है, साथ में भूगोल और कानूनी पहलू भी हैं। केवल समान जनसंख्या पक्षपातपूर्ण सीमा की संभावना नहीं हटाती।'),
    hint: b('Look at the population spread readout between the modes.', 'मोड के बीच जनसंख्या अंतर देखें।'),
  }],
  reflect: b('Why do accurate, updated electoral rolls matter, and what can an eligible voter do to check or request a correction?', 'सही और अद्यतन मतदाता सूची क्यों महत्त्वपूर्ण है, और पात्र मतदाता नाम जाँचने या सुधार का अनुरोध करने के लिए क्या कर सकता है?'),
};


const PNAME = { R: b('Party R', 'दल R'), B: b('Party B', 'दल B'), G: b('Party G', 'दल G'), Y: b('Party Y', 'दल Y') };
const SYSN = { fptp: b('First-past-the-post', 'सर्वाधिक मत से जीत (FPTP)'), runoff: b('Two-round runoff', 'दो-चरणीय चुनाव'), pr: b('Proportional', 'आनुपातिक') };
export const coalition = {
  id: 'T07.L4',
  objective: b('Explore seat combinations when no party wins a majority, and consider the purpose and limits of India’s anti-defection provisions.', 'जब किसी दल को सीटों का बहुमत नहीं मिलता तो सीटों के समूह जाँचें और भारत के दलबदल-रोधी प्रावधानों के उद्देश्य व सीमाओं पर विचार करें।'),
  note: { kind: 'fictional', en: 'All parties, votes and seats are fictional. In this arithmetic a majority of the whole 10-seat house is 6 seats; it does not determine the government. Includes a brief note on India’s Tenth Schedule.', hi: 'सभी दल, मत और सीटें काल्पनिक हैं। इस गणना में पूरे 10-सीट सदन का बहुमत 6 सीटें हैं; इससे सरकार तय नहीं होती। भारत की दसवीं अनुसूची पर छोटा परिचय भी है।' },
  init: () => ({ system: 'proportional', swing: 0 }),
  controls: [
    { id: 'system', type: 'chips', label: b('Electoral system', 'चुनाव-प्रणाली'), options: [opt('fptp', ...Object.values(SYSN.fptp)), opt('runoff', ...Object.values(SYSN.runoff)), opt('proportional', ...Object.values(SYSN.pr))] },
    { id: 'swing', type: 'slider', label: b('Swing: positive moves B votes to R (points)', 'झुकाव: धनात्मक पर B के मत R की ओर (अंक)'), min: -10, max: 15, step: 1, fmt: (v) => (v > 0 ? `+${v}` : `${v}`) },
  ],
  view(S) {
    const r = E.run(S.system, S.swing), mw = E.minimalWinningCoalitions(r.seats), single = E.PARTIES.find((p) => r.seats[p] >= mw.need);
    const max = 10, pcol = { R: '#dc2626', B: '#2563eb', G: '#16a34a', Y: '#d97706' };
    // Build 10-seat semicircular Parliamentary Hemicycle
    const seatParties = E.PARTIES.flatMap((p) => Array(r.seats[p]).fill(p));
    let g = `<path d="M210,112 A110,110 0 0,1 430,112" fill="none" stroke="var(--line)" stroke-width="2" stroke-dasharray="4 4"/>`;
    seatParties.forEach((p, idx) => {
      const ang = Math.PI - (idx + 0.5) / 10 * Math.PI;
      const sx = (320 + Math.cos(ang) * 92).toFixed(1), sy = (112 - Math.sin(ang) * 86).toFixed(1);
      g += `<circle cx="${sx}" cy="${sy}" r="11" fill="${pcol[p]}" stroke="#fff" stroke-width="2"/><text class="txt sm b" x="${sx}" y="${(Number(sy) + 4).toFixed(1)}" text-anchor="middle" fill="#fff">${p}</text>`;
    });
    g += `<text class="txt sm b" x="320" y="114" text-anchor="middle">${esc(P('10-Seat House (Need 6)', '10-सीट सदन (बहुमत 6)'))}</text>`;
    E.PARTIES.forEach((p, i) => { const y = 136 + i * 44; g += `<text class="lbl" x="10" y="${y + 20}">${esc(P(PNAME[p].en, PNAME[p].hi))}</text><rect x="130" y="${y}" width="${(r.seats[p] / max) * 420}" height="28" rx="6" fill="${pcol[p]}" opacity="${r.seats[p] >= mw.need ? 1 : 0.82}"/><text class="txt b" x="${138 + (r.seats[p] / max) * 420}" y="${y + 20}">${r.seats[p]} ${esc(P('seats', 'सीटें'))} · ${fmt(r.voteShare[p] * 100, 0)}% ${esc(P('votes', 'मत'))}</text>`; });
    g += `<line x1="${130 + (mw.need / max) * 420}" x2="${130 + (mw.need / max) * 420}" y1="128" y2="314" stroke="var(--bad)" stroke-width="3" stroke-dasharray="6 4"/><text class="txt sm b" x="${130 + (mw.need / max) * 420}" y="330" text-anchor="middle" fill="var(--bad)">${esc(P('majority: 6', 'बहुमत: 6'))}</text>`;
    const names = (c) => c.parties.map((p) => PNAME[p].en).join(' + '), namesHi = (c) => c.parties.map((p) => PNAME[p].hi).join(' + ');
    const lines = [single ? { en: `${PNAME[single].en} has ${r.seats[single]} of 10 seats: a single-party majority in this toy. This alone does not determine who forms a government.`, hi: `${PNAME[single].hi} के पास 10 में से ${r.seats[single]} सीटें हैं: इस मॉडल में एकल-दल बहुमत। इससे अकेले यह तय नहीं होता कि सरकार कौन बनाएगा।`, cls: 'balanced' }
      : { en: `No party reaches ${mw.need} seats (a hung house). Arithmetically minimal winning sets, not actual agreements: ${mw.coalitions.map((c) => `${names(c)} (${c.seats})`).join('; ') || 'none'}.`, hi: `कोई दल ${mw.need} सीटों तक नहीं पहुँचता (त्रिशंकु सदन)। गणना में न्यूनतम विजयी समूह, वास्तविक समझौते नहीं: ${mw.coalitions.map((c) => `${namesHi(c)} (${c.seats})`).join('; ') || 'कोई नहीं'}।`, cls: 'warn' },
      r.mismatch ? { en: 'No vote leader is among the seat leaders here; the counting rule shapes the result.', hi: 'सबसे अधिक मत पाने वाले दलों में से कोई यहाँ सीटों में आगे नहीं है; गणना का नियम परिणाम को प्रभावित करता है।', cls: 'warn' } : { en: 'At least one vote leader is also a seat leader here (there may be ties).', hi: 'यहाँ मतों में अग्रणी कम-से-कम एक दल सीटों में भी अग्रणी है (बराबरी संभव है)।', cls: 'note' },
      { en: 'The Tenth Schedule provides for disqualification in specified cases, such as voluntarily giving up party membership or certain votes against a party direction. The presiding officer decides; conditions and exceptions apply, including to mergers. It does not guarantee stability.', hi: 'दसवीं अनुसूची में कुछ स्थितियों में अपात्रता का प्रावधान है, जैसे स्वेच्छा से दल की सदस्यता छोड़ना या दल के निर्देश के विरुद्ध कुछ मतदान। पीठासीन अधिकारी निर्णय करता है; विलय सहित शर्तें व अपवाद लागू हैं। यह स्थिरता की गारंटी नहीं है।', cls: 'note' }];
    return {
      plate: {
        src: 'assets/images/plates/t07-coalition.jpg',
        en: 'Semicircular parliamentary chamber: tap pins to compare hung Proportional coalition benches vs FPTP swing majority.',
        hi: 'अर्धवृत्ताकार संसद कक्ष: आनुपातिक गठबंधन बनाम FPTP बहुमत देखने हेतु पिन पर टैप करें।',
        spots: [
          { x: 26, y: 52, en: 'Proportional Hung House (Coalition)', hi: 'आनुपातिक त्रिशंकु सदन (गठबंधन)', detail: b('No single party hits 6/10 seats — partners negotiate a joint coalition.', 'कोई दल 6 सीटों तक नहीं पहुँचता — साझा कार्यक्रम पर गठबंधन बनता है।'), set: { system: 'proportional', swing: 0 } },
          { x: 54, y: 44, en: 'FPTP Single-Party Majority', hi: 'FPTP एकल-दल बहुमत', detail: b('With the exact same votes, FPTP hands one party 7/10 seats!', 'इन्हीं मतों से FPTP एक ही दल को 10 में से 7 सीटें दे देता है!'), set: { system: 'fptp', swing: 0 } },
          { x: 78, y: 60, en: '+10% Voter Swing Shift', hi: '+10% मत-झुकाव प्रभाव', detail: b('Positive swing moves B votes to R; compare this result with a negative swing.', 'धनात्मक झुकाव B के मत R को देता है; इस परिणाम की ऋणात्मक झुकाव से तुलना करें।'), set: { system: 'fptp', swing: 10 } },
        ],
      },
      svg: `<svg viewBox="0 0 640 342" class="chart" role="img" xmlns="http://www.w3.org/2000/svg">${g}</svg>`, aria: P(`Seats: ${E.PARTIES.map((p) => `${p} ${r.seats[p]}`).join(', ')}.`, `सीटें: ${E.PARTIES.map((p) => `${p} ${r.seats[p]}`).join(', ')}।`), lines };
  },
  discover: [b('Switch to proportional representation. How many parties do you need to form a government now?', 'आनुपातिक प्रतिनिधित्व चुनें। अब सरकार बनाने के लिए कितने दल चाहिए?'), b('Switch to first-past-the-post and move the swing slider until the majority party changes.', 'FPTP चुनें और झुकाव स्लाइडर तब तक बदलें जब तक बहुमत वाला दल न बदल जाए।')],
  predictions: [{ id: 'p1', revision: 't07-step7', stem: b('With proportional representation and no swing, does any single party win 6 or more of the 10 seats?', 'आनुपातिक प्रतिनिधित्व और शून्य झुकाव पर क्या किसी एक दल को 10 में से 6 या अधिक सीटें मिलती हैं?'), options: [opt('yes', 'Yes, one party has a majority', 'हाँ, एक दल के पास बहुमत है'), opt('no', 'No party has a majority', 'किसी दल का बहुमत नहीं है')],
    run: (S) => { S.system = 'proportional'; S.swing = 0; const r = E.run('proportional', 0); return Object.values(r.seats).some((v) => v >= 6) ? 'yes' : 'no'; }, explain: () => { const r = E.run('proportional', 0); return { en: `Proportional seats are ${E.PARTIES.map((p) => `${p} ${r.seats[p]}`).join(', ')}: no party reaches 6. A majority could involve negotiated coalition or outside support; arithmetic alone does not decide.`, hi: `आनुपातिक सीटें ${E.PARTIES.map((p) => `${p} ${r.seats[p]}`).join(', ')} हैं: कोई दल 6 तक नहीं पहुँचता। बहुमत गठबंधन या बाहरी समर्थन से मिल सकता है; केवल गणना से निर्णय नहीं होता।` }; } }],
  exit: [{ id: 'e1', stem: b('Why can a coalition government be less stable than a single-party majority government?', 'गठबंधन सरकार एकल-दल बहुमत सरकार से कम स्थिर क्यों हो सकती है?'), correct: 'a', options: [
    { id: 'a', ...b('If one partner leaves, the government may lose its majority.', 'यदि कोई साझेदार हट जाए तो सरकार का बहुमत समाप्त हो सकता है।') }, { id: 'b', ...b('Coalitions are not allowed to pass laws.', 'गठबंधनों को कानून पारित करने की अनुमति नहीं होती।'), why: b('Coalitions can pass laws; the risk is losing the majority when a partner leaves.', 'गठबंधन कानून पारित कर सकते हैं; जोखिम यह है कि साझेदार के हटने पर बहुमत चला जाता है।') }],
    explain: b('A partner’s departure may remove a majority; a coalition with surplus support might keep it. Negotiations and outside support also matter.', 'साझेदार के हटने से बहुमत जा सकता है; अतिरिक्त समर्थन होने पर बहुमत बना भी रह सकता है। बातचीत और बाहरी समर्थन भी महत्त्वपूर्ण हैं।'), hint: b('Check the seat count of the smallest coalition.', 'सबसे छोटे गठबंधन की सीट-संख्या जाँचें।') }],
  reflect: b('Should a country prefer clear, quick majorities or fair representation of every vote? Give one reason.', 'क्या किसी देश को स्पष्ट, शीघ्र बहुमत पसंद करना चाहिए या हर मत का न्यायपूर्ण प्रतिनिधित्व? एक कारण दें।'),
};
