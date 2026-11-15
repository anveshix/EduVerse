// T10: connections and safety decisions. Hindi text is draft pending teacher review.
import { createInquiryExplorer } from '../../components/inquiry-explorer.js';
const b = (en, hi) => ({ en, hi });
const option = (id, en, hi, correct = false) => ({ id, text: b(en, hi), correct });
const FISHERIES_SOURCE = 'https://www.dof.gov.in/static/uploads/2025/08/4686b6bf87e0a1844293531a7ad72c74.pdf';
const IMD_SOURCE = 'https://mausam.imd.gov.in/Forecast/marquee_data/Press%20Release%2027-10-2025.pdf';
const READY_SOURCE = 'https://tsunami.incois.gov.in/tsunamiready/Guidelines_IOTR.pdf';
const IMD_SAFETY = 'https://mausam.imd.gov.in/chennai/mcdata/dos%26donts.pdf';
const source = b('Department of Fisheries annual report, 2024–25', 'मत्स्य विभाग की वार्षिक रिपोर्ट, 2024–25');

export const FISHERY_CASES = [
  {
    id: 'marine', label: b('At sea', 'समुद्र में'),
    evidence: b('Marine fisheries provide food and livelihoods along India’s coasts. People in different boats and communities face different costs and risks. Weather warnings can affect whether it is safe to go to sea.', 'समुद्री मत्स्यन भारत के तटों पर भोजन और आजीविका देता है। अलग नावों और समुदायों की लागत व जोखिम अलग हैं। मौसम चेतावनी से समुद्र में जाना सुरक्षित है या नहीं, यह प्रभावित होता है।'),
    question: b('What should a fishing crew do when authorities warn them not to venture into the sea?', 'जब अधिकारी समुद्र में न जाने की चेतावनी दें तो मछुआरा दल क्या करे?'),
    options: [option('warning', 'Follow the warning and local safety instructions.', 'चेतावनी और स्थानीय सुरक्षा निर्देश मानें।', true), option('ignore', 'Ignore it because the model predicts fish.', 'चेतावनी अनदेखी करें क्योंकि मॉडल मछली दिखाता है।')],
    explain: b('The simulation cannot assess actual weather or personal safety. Official local warnings take priority.', 'सिमुलेशन वास्तविक मौसम या व्यक्तिगत सुरक्षा नहीं आँक सकता। स्थानीय आधिकारिक चेतावनी को प्राथमिकता दें।'), source: IMD_SAFETY, sourceLabel: b('IMD cyclone safety guidance', 'IMD चक्रवात सुरक्षा मार्गदर्शन'),
  },
  {
    id: 'value', label: b('Beyond the boat', 'नाव से आगे'),
    evidence: b('Fishing livelihoods also include landing, processing, transport and selling. Women and men work in varied roles. A seasonal closure may support conservation, but can also interrupt earnings; local rules and support differ.', 'मत्स्य आजीविका में मछली उतारना, प्रसंस्करण, ढुलाई और बिक्री भी हैं। महिलाएँ और पुरुष अलग भूमिकाओं में काम करते हैं। मौसमी रोक संरक्षण में मदद कर सकती है, पर आय रोक भी सकती है; स्थानीय नियम व सहायता अलग हैं।'),
    question: b('Which question helps evaluate a proposed closure fairly?', 'प्रस्तावित रोक को निष्पक्ष समझने में कौन-सा प्रश्न मदद करेगा?'),
    options: [option('tradeoff', 'Who is affected now, and what evidence and support exist?', 'अभी कौन प्रभावित है और क्या साक्ष्य व सहायता उपलब्ध हैं?', true), option('guarantee', 'Will every worker’s income automatically rise?', 'क्या हर कामगार की आय अपने आप बढ़ेगी?')],
    explain: b('A closure can have ecological benefits and immediate livelihood costs; its effects and any available assistance depend on the fishery and the rules.', 'रोक के पर्यावरणीय लाभ और तत्काल आजीविका लागत दोनों हो सकते हैं; असर व उपलब्ध सहायता मत्स्य क्षेत्र और नियमों पर निर्भर हैं।'), source: FISHERIES_SOURCE, sourceLabel: source,
  },
  {
    id: 'inland', label: b('Inland Bihar', 'भीतरी बिहार'),
    evidence: b('India has both marine fisheries and inland fishing or fish farming in rivers, wetlands and ponds. Bihar is inland; its fisheries should not be labelled marine simply because India has a coast.', 'भारत में समुद्री मत्स्यन के साथ नदियों, आर्द्रभूमि और तालाबों में भी मत्स्यन या मत्स्य पालन है। बिहार समुद्र से दूर है; यहाँ के मत्स्यन को भारत का तट होने से समुद्री नहीं कहना चाहिए।'),
    question: b('Which is an inland fisheries example?', 'भीतरी मत्स्यन का उदाहरण कौन-सा है?'),
    options: [option('pond', 'Fish farming in a Bihar pond.', 'बिहार के तालाब में मत्स्य पालन।', true), option('sea', 'A trawler fishing in the open sea.', 'खुले समुद्र में मछली पकड़ता ट्रॉलर।')],
    explain: b('Inland and marine systems differ in water, species, management and risks. Both can support livelihoods.', 'भीतरी और समुद्री प्रणालियों का जल, प्रजातियाँ, प्रबंधन और जोखिम अलग हैं। दोनों आजीविका दे सकते हैं।'), source: FISHERIES_SOURCE, sourceLabel: source,
  },
];
export const HAZARD_CASES = [
  {
    id: 'cyclone', label: b('Bay of Bengal cyclone', 'बंगाल की खाड़ी का चक्रवात'),
    evidence: b('A cyclone is a rotating storm. Coastal communities can face damaging wind, heavy rain and storm surge. On 27 October 2025 IMD forecast Cyclone Montha near Andhra Pradesh; this is a historical forecast, not an alert today.', 'चक्रवात घूमता हुआ तूफ़ान है। तटीय समुदायों को तेज़ हवा, भारी बारिश और समुद्री तूफ़ानी उभार का सामना हो सकता है। 27 अक्टूबर 2025 को IMD ने आंध्र प्रदेश के पास चक्रवात मोंथा का पूर्वानुमान दिया था; यह पुराना पूर्वानुमान है, आज की चेतावनी नहीं।'),
    question: b('If a current local cyclone warning tells people to evacuate, what should they do?', 'यदि वर्तमान स्थानीय चक्रवात चेतावनी में निकासी को कहा जाए तो क्या करें?'),
    options: [option('evacuate', 'Follow local officials’ evacuation and shelter instructions.', 'स्थानीय अधिकारियों के निकासी व आश्रय निर्देश मानें।', true), option('watch', 'Go to the beach to watch the surge.', 'तूफ़ानी उभार देखने समुद्र तट जाएँ।')],
    explain: b('Use current IMD and local authority advice, avoid the sea when warned, and stay in shelter until officials say it is safe. A calm interval can be the eye, not the end.', 'वर्तमान IMD और स्थानीय प्रशासन की सलाह लें, चेतावनी पर समुद्र से दूर रहें और सुरक्षित घोषित होने तक आश्रय में रहें। बीच की शांति चक्रवात की आँख हो सकती है, अंत नहीं।'), source: IMD_SOURCE, sourceLabel: b('IMD bulletin, 27 October 2025', 'IMD बुलेटिन, 27 अक्टूबर 2025'),
  },
  {
    id: 'bihar', label: b('Inland rain · Bihar', 'भीतरी वर्षा · बिहार'),
    evidence: b('The same 27 October 2025 IMD bulletin also forecast heavy rain in parts of Bihar for 29–31 October. That forecast is not proof of what fell everywhere or a current warning. Bihar is inland: rain and flooding are the relevant example here, not coastal storm surge.', 'उसी 27 अक्टूबर 2025 के IMD बुलेटिन ने 29–31 अक्टूबर को बिहार के कुछ स्थानों पर भारी वर्षा का पूर्वानुमान भी दिया था। यह हर जगह हुई वर्षा का प्रमाण या वर्तमान चेतावनी नहीं है। बिहार समुद्र से दूर है: यहाँ उदाहरण वर्षा व बाढ़ है, तटीय तूफ़ानी उभार नहीं।'),
    question: b('If heavy rain and flooding threaten your area, which action is safer?', 'यदि आपके क्षेत्र में भारी बारिश और बाढ़ का खतरा हो तो कौन-सा कदम सुरक्षित है?'),
    options: [option('flood', 'Follow current local alerts and stay out of floodwater.', 'वर्तमान स्थानीय चेतावनी मानें और बाढ़ के पानी से दूर रहें।', true), option('walk', 'Walk through moving floodwater to measure its depth.', 'गहराई मापने के लिए बहते बाढ़-पानी में चलें।')],
    explain: b('Floodwater can hide strong currents, debris and hazards. Move to safety when threatened and follow current local emergency advice.', 'बाढ़ के पानी में तेज़ बहाव, मलबा और खतरे छिपे हो सकते हैं। खतरे पर सुरक्षित स्थान जाएँ और वर्तमान स्थानीय आपात सलाह मानें।'), source: IMD_SOURCE, sourceLabel: b('IMD bulletin, 27 October 2025', 'IMD बुलेटिन, 27 अक्टूबर 2025'),
  },
  {
    id: 'tsunami', label: b('Coastal tsunami signs', 'तटीय सुनामी संकेत'),
    evidence: b('A tsunami is a series of long waves, often caused by a large undersea earthquake; it is not a cyclone. On a coast, a long or strong earthquake or unusual rapid sea-level change can be a natural warning. Do not wait to see the sea recede.', 'सुनामी लंबी लहरों की शृंखला है, जो अक्सर बड़े समुद्री भूकंप से बनती है; यह चक्रवात नहीं है। तट पर लंबा या तेज़ भूकंप अथवा समुद्र स्तर में असामान्य तेज़ बदलाव प्राकृतिक चेतावनी हो सकता है। समुद्र के पीछे हटने की प्रतीक्षा न करें।'),
    question: b('After a strong coastal earthquake, what should people do?', 'तट पर तेज़ भूकंप के बाद लोगों को क्या करना चाहिए?'),
    options: [option('high', 'During shaking drop, cover and hold on; when it stops, move immediately inland to higher ground.', 'झटकों के दौरान झुकें, ढकें और पकड़े रहें; रुकने पर तुरंत भीतर ऊँचे स्थान जाएँ।', true), option('wait', 'Wait on the beach for a siren or the first wave.', 'सायरन या पहली लहर के लिए समुद्र तट पर प्रतीक्षा करें।')],
    explain: b('Near-source waves may arrive before an official warning. Move away from the coast without waiting; later waves may also be dangerous. Return only after the local all-clear.', 'पास की लहरें आधिकारिक चेतावनी से पहले आ सकती हैं। प्रतीक्षा किए बिना तट से दूर जाएँ; बाद की लहरें भी खतरनाक हो सकती हैं। स्थानीय सुरक्षित घोषणा के बाद ही लौटें।'), source: READY_SOURCE, sourceLabel: b('Indian Ocean Tsunami Ready guidelines', 'हिंद महासागर सुनामी तैयारी दिशानिर्देश'),
  },
];

export function createFisheryConnections(lab) {
  return createInquiryExplorer({ id: 't10-fishery', storageKey: 'T10.fisheryConnections', className: 'ocean-fishery',
    kicker: b('OCEAN TO INLAND', 'समुद्र से भीतरी क्षेत्र तक'),
    title: b('People behind fisheries', 'मत्स्य आजीविका से जुड़े लोग'),
    intro: b('Explore three perspectives, then compare two hypothetical closures in the model below.', 'तीन दृष्टिकोण देखें, फिर नीचे के मॉडल में दो काल्पनिक बंद अवधियों की तुलना करें।'),
    limit: b('The 25-year graph uses invented indices and assumptions, not measured stocks, income, a current law or a forecast. Changing a model setting does not establish a safe fishing decision.', '25-वर्षीय ग्राफ़ काल्पनिक सूचक और मान्यताएँ है, मापा भंडार, आय, वर्तमान कानून या पूर्वानुमान नहीं। मॉडल सेटिंग से मछली पकड़ने की सुरक्षा तय नहीं होती।'),
    items: FISHERY_CASES,
    actions: [
      { id: 'zero', label: b('Set model closure to 0 months', 'मॉडल में बंद अवधि 0 महीने करें'), run: () => lab.setState({ closed: 0 }) },
      { id: 'two', label: b('Set model closure to 2 months', 'मॉडल में बंद अवधि 2 महीने करें'), run: () => lab.setState({ closed: 2 }) },
    ],
  });
}
export function createHazardConnections() {
  return createInquiryExplorer({ id: 't10-hazard', storageKey: 'T10.hazardConnections', className: 'ocean-hazards',
    kicker: b('BAY → COAST AND INLAND', 'खाड़ी → तट और भीतरी क्षेत्र'),
    title: b('Different hazards, different responses', 'अलग खतरे, अलग प्रतिक्रिया'),
    intro: b('Explore a dated Bay of Bengal forecast, inland rain and natural tsunami warnings. These are learning examples, not live alerts.', 'बंगाल की खाड़ी का पुराना पूर्वानुमान, भीतरी वर्षा और सुनामी के प्राकृतिक संकेत देखें। ये सीखने के उदाहरण हैं, वर्तमान चेतावनी नहीं।'),
    limit: b('For real emergencies use current IMD, INCOIS and local authority instructions. The speed calculation below is not an evacuation clock. Do not delay evacuation to consult this app.', 'वास्तविक आपात स्थिति में वर्तमान IMD, INCOIS और स्थानीय प्रशासन के निर्देश मानें। नीचे की गति-गणना निकासी की घड़ी नहीं है। इस ऐप को देखने के लिए निकासी न रोकें।'),
    items: HAZARD_CASES,
  });
}
