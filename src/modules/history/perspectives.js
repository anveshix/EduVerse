// T12.L1: one imagined situation examined through several overlapping perspectives.
// These are invented teaching scenarios, not translated historical testimony.
// Hindi is draft pending subject-teacher review.
import { createInquiryExplorer } from '../../components/inquiry-explorer.js';

const b = (en, hi) => ({ en, hi });
const opt = (id, en, hi, correct = false) => ({ id, text: b(en, hi), correct });
export const PERSPECTIVES = [
  {
    id: 'ruler', label: b('Ruler / official', 'शासक / अधिकारी'),
    evidence: b('Imagined perspective: a fort official wants to repair a damaged water tank and keep the gates guarded after conflict. An inscription or court chronicle might record a ruler’s claim, but not everyone’s experience.', 'काल्पनिक दृष्टिकोण: संघर्ष के बाद दुर्ग अधिकारी टूटी जल-टंकी की मरम्मत और द्वारों की रखवाली चाहता है। अभिलेख या दरबारी इतिहास शासक का दावा दर्ज कर सकता है, सबका अनुभव नहीं।'),
    question: b('How should we read a royal account?', 'शाही विवरण को कैसे पढ़ना चाहिए?'),
    options: [opt('compare', 'Ask who wrote it and compare its claims with other evidence.', 'पूछें कि किसने लिखा और दावों की दूसरे साक्ष्यों से तुलना करें।', true), opt('complete', 'Assume it records every resident’s view.', 'मान लें कि यह हर निवासी का दृष्टिकोण दर्ज करता है।')],
    explain: b('Court writers had their own audiences and interests. An official claim is useful evidence but needs comparison; it is not the whole story.', 'दरबारी लेखकों के अपने पाठक और हित थे। शाही दावा उपयोगी साक्ष्य है, पर उसकी तुलना आवश्यक है; वह पूरी कहानी नहीं है।'),
    source: 'https://ncert.nic.in/textbook/pdf/gess103.pdf', sourceLabel: b('NCERT · Delhi: court histories and their authors', 'NCERT · दिल्ली: दरबारी इतिहास और लेखक'),
  },
  {
    id: 'farmer', label: b('Cultivator', 'किसान'),
    evidence: b('Imagined perspective: a farming household outside the fort asks whether repair work, access to water and a guarded gate will affect crops and livelihoods. Farming households did not all have the same land, rights or resources.', 'काल्पनिक दृष्टिकोण: दुर्ग के बाहर खेती करने वाला परिवार पूछता है कि मरम्मत, जल की पहुँच और पहरा उनकी फसल व आजीविका को कैसे प्रभावित करेगा। खेती करने वाले सभी परिवारों की भूमि, अधिकार या संसाधन समान नहीं थे।'),
    question: b('What additional evidence might help investigate the question?', 'इस प्रश्न की जाँच में कौन-सा अतिरिक्त साक्ष्य मदद कर सकता है?'),
    options: [opt('records', 'Compare land or revenue records with physical remains and other accounts, if available.', 'जहाँ उपलब्ध हों, भूमि या राजस्व अभिलेखों की अवशेषों और अन्य विवरणों से तुलना करें।', true), opt('palace', 'Only count palace gates and ignore water and land.', 'केवल महल के द्वार गिनें और जल व भूमि की अनदेखी करें।')],
    explain: b('Records and remains can answer different questions, but surviving records may exclude landless people and other voices. The imagined family is not a historical witness.', 'अभिलेख और अवशेष अलग प्रश्नों के उत्तर दे सकते हैं, पर बचे अभिलेख भूमिहीनों और अन्य आवाज़ों को छोड़ सकते हैं। काल्पनिक परिवार ऐतिहासिक साक्षी नहीं है।'),
    source: 'https://ncert.nic.in/textbook/pdf/gess103.pdf', sourceLabel: b('NCERT · Delhi: revenue and peasants', 'NCERT · दिल्ली: राजस्व और किसान'),
  },
  {
    id: 'trader', label: b('Trader', 'व्यापारी'),
    evidence: b('Imagined perspective: a trader needs market access and safe routes, but a guarded gate could slow trade. The Rajasthan hill-forts listing describes trading centres inside some fortified settlements.', 'काल्पनिक दृष्टिकोण: व्यापारी को बाज़ार तक पहुँच और सुरक्षित रास्ते चाहिए, पर पहरे वाला द्वार व्यापार धीमा कर सकता है। राजस्थान के पहाड़ी दुर्गों का विवरण कुछ किलाबंद बस्तियों में व्यापार केंद्र बताता है।'),
    question: b('What can we responsibly conclude from the heritage listing?', 'धरोहर विवरण से सावधानीपूर्वक क्या निष्कर्ष निकाल सकते हैं?'),
    options: [opt('some', 'Some forts included trading centres; this does not prove one trader’s experience.', 'कुछ दुर्गों में व्यापार केंद्र थे; इससे किसी एक व्यापारी का अनुभव सिद्ध नहीं होता।', true), opt('all', 'Every trader prospered and nobody faced restrictions.', 'हर व्यापारी समृद्ध था और किसी पर कोई रोक नहीं थी।')],
    explain: b('Buildings and trading centres are evidence of activities, not complete records of profits, access or individual lives. Seek dated records as well.', 'भवन और व्यापार केंद्र गतिविधियों का साक्ष्य हैं, लाभ, पहुँच या व्यक्ति के जीवन का पूरा ब्योरा नहीं। दिनांकित अभिलेख भी खोजें।'),
    source: 'https://whc.unesco.org/en/list/247/', sourceLabel: b('UNESCO · Hill Forts of Rajasthan', 'यूनेस्को · राजस्थान के पहाड़ी दुर्ग'),
  },
  {
    id: 'woman', label: b('Woman craftsperson', 'महिला शिल्पकार'),
    evidence: b('Imagined perspective: a woman who makes cloth asks how time spent fetching water or repairing the tank would affect her work and family. Women could also be farmers, traders or rulers; this one invented person cannot speak for all women.', 'काल्पनिक दृष्टिकोण: कपड़ा बनाने वाली महिला पूछती है कि पानी लाने या टंकी मरम्मत में समय देने से काम और परिवार पर क्या असर होगा। महिलाएँ किसान, व्यापारी या शासक भी हो सकती थीं; एक काल्पनिक व्यक्ति सभी महिलाओं की आवाज़ नहीं है।'),
    question: b('What should a historian do when a court record is silent about her?', 'जब दरबारी अभिलेख उसके बारे में मौन हो, इतिहासकार क्या करे?'),
    options: [opt('limits', 'Look for other kinds of evidence and acknowledge what remains unknown.', 'अन्य प्रकार के साक्ष्य खोजें और जो अज्ञात है उसे स्वीकारें।', true), opt('invisible', 'Conclude that women did not work or make decisions.', 'निष्कर्ष निकालें कि महिलाएँ काम या निर्णय नहीं करती थीं।')],
    explain: b('Absence from one record is not proof of absence. The NCERT example of Raziyya also reminds us that women held varied roles, including rulership.', 'एक अभिलेख में उल्लेख न होना अस्तित्व न होने का प्रमाण नहीं है। NCERT में रज़िया का उदाहरण भी याद दिलाता है कि महिलाओं की भूमिकाएँ विविध थीं, शासन भी उनमें था।'),
    source: 'https://ncert.nic.in/textbook/pdf/gess103.pdf', sourceLabel: b('NCERT · Raziyya and court writers', 'NCERT · रज़िया और दरबारी लेखक'),
  },
];
export function createPerspectives() {
  return createInquiryExplorer({ id: 't12-perspectives', storageKey: 'T12.perspectives', className: 'history-perspectives',
    kicker: b('HISTORY WITH MANY VOICES', 'इतिहास की अनेक आवाज़ें'),
    title: b('One fort, different questions', 'एक दुर्ग, अलग प्रश्न'),
    intro: b('Imagine a fort settlement considering a water-tank repair and guarded gate after a conflict. Choose four possible perspectives, then compare what kinds of evidence could help.', 'संघर्ष के बाद जल-टंकी की मरम्मत और द्वार पर पहरा तय करती एक काल्पनिक दुर्ग बस्ती सोचें। चार संभावित दृष्टिकोण चुनें, फिर तुलना करें कि कौन-से साक्ष्य मदद कर सकते हैं।'),
    limit: b('The people and event are fictional, not quotations or a reconstruction of a named fort. Background links document wider contexts, not these invented people. Roles can overlap and views within a group differ.', 'लोग और घटना काल्पनिक हैं, किसी नामित दुर्ग के उद्धरण या पुनर्निर्माण नहीं। पृष्ठभूमि स्रोत व्यापक संदर्भ बताते हैं, इन काल्पनिक लोगों को नहीं। भूमिकाएँ आपस में मिल सकती हैं और एक समूह के विचार अलग हो सकते हैं।'),
    items: PERSPECTIVES,
  });
}
