// T09 content (English + draft Hindi, needs subject-teacher review). Numbers shown to students come from models.js, never from this file.
const b = (en, hi) => ({ en, hi });
export const T09_LIMITS = b(
  'Straight-line teaching models with fictional numbers. Real markets have many goods, changing tastes and incomes, and curves that are not straight; use these labs to reason about direction and cause, not to predict real prices.',
  'ये काल्पनिक संख्याओं वाले सीधी-रेखा शिक्षण-मॉडल हैं। वास्तविक बाज़ारों में अनेक वस्तुएँ, बदलती रुचियाँ और आय होती हैं और वक्र सीधे नहीं होते; इन प्रयोगों से दिशा और कारण समझें, वास्तविक कीमतों का पूर्वानुमान न लगाएँ।');
export const T09_TEACHER = {
  flow: [
    b('Hook (3 min): show the opening question; students write a guess.', 'प्रश्न (3 मिनट): आरंभिक प्रश्न दिखाएँ; विद्यार्थी अनुमान लिखें।'),
    b('Market lab (15 min): compare the dated Patna wholesale, retail and MSP examples; distinguish historical evidence from the fictional supply-shift graph. Drag the price line and predict each experiment.', 'बाज़ार-प्रयोग (15 मिनट): पटना के तारीख वाले थोक, खुदरा और MSP उदाहरणों की तुलना करें; पुराने साक्ष्य को काल्पनिक पूर्ति-परिवर्तन ग्राफ़ से अलग पहचानें। कीमत-रेखा खींचें और हर प्रयोग का अनुमान लगाएँ।'),
    b('Price ceiling (5 min): switch on the maximum price and discuss the shortage and black-market pressure.', 'मूल्य-सीमा (5 मिनट): अधिकतम कीमत चालू करें और कमी तथा काला बाज़ार के दबाव पर चर्चा करें।'),
    b('When markets fail (12 min): side effects, public goods and the used-bike market, one prediction each.', 'जब बाज़ार विफल होते हैं (12 मिनट): बाहरी प्रभाव, सार्वजनिक वस्तुएँ और पुरानी बाइक का बाज़ार, प्रत्येक में एक अनुमान।'),
    b('Exit ticket and reflection (5 min).', 'निकास-टिकट और चिंतन (5 मिनट)।'),
  ],
  misconceptions: [
    b('“A higher price means demand has fallen.” A price change moves buyers ALONG the demand curve; the curve itself shifts only when something other than price changes.', '“कीमत बढ़ी यानी माँग घट गई।” कीमत बदलने से खरीदार माँग वक्र पर ही चलते हैं; वक्र तभी खिसकता है जब कीमत के अलावा कुछ और बदले।'),
    b('“MSP or a subsidised sale is the price of every market transaction.” MSP is an announced procurement support price; a subsidised sale applies to selected outlets. Access and conditions matter.', '“MSP या रियायती बिक्री हर बाज़ार सौदे का मूल्य है।” MSP खरीद के लिए घोषित समर्थन मूल्य है; रियायती बिक्री चुने केंद्रों पर लागू होती है। पहुँच और शर्तें महत्त्वपूर्ण हैं।'),
    b('“A maximum price always helps buyers.” In this model, a ceiling below equilibrium creates a shortage: some buyers get the good cheaply, others get none.', '“अधिकतम कीमत हमेशा खरीदारों की मदद करती है।” इस मॉडल में संतुलन से नीचे सीमा से कमी होती है: कुछ खरीदारों को वस्तु सस्ती मिलती है, कुछ को नहीं।'),
    b('“A public good is anything the government provides.” It is defined by two tests: nobody can be kept out, and one person’s use does not reduce another’s.', '“सरकार जो भी दे वह सार्वजनिक वस्तु है।” इसकी परिभाषा दो कसौटियों से है: किसी को रोका नहीं जा सकता, और एक के उपयोग से दूसरे का उपयोग नहीं घटता।'),
  ],
};
// prediction option labels, keyed by the answer id that the model returns
export const OPT = {
  surplus: b('A surplus: unsold goods', 'अधिशेष: बिना बिका माल'),
  shortage: b('A shortage: not enough goods', 'कमी: पर्याप्त माल नहीं'),
  balanced: b('The market stays balanced', 'बाज़ार संतुलित रहता है'),
  noeffect: b('Nothing changes', 'कुछ नहीं बदलता'),
  PuQu: b('Price up, quantity up', 'कीमत ऊपर, मात्रा ऊपर'),
  PuQd: b('Price up, quantity down', 'कीमत ऊपर, मात्रा नीचे'),
  PdQu: b('Price down, quantity up', 'कीमत नीचे, मात्रा ऊपर'),
  PdQd: b('Price down, quantity down', 'कीमत नीचे, मात्रा नीचे'),
  moreFall: b('The price falls more', 'कीमत अधिक गिरती है'),
  lessFall: b('The price falls less', 'कीमत कम गिरती है'),
  sameFall: b('The price falls by the same amount', 'कीमत उतनी ही गिरती है'),
  more: b('More than is best for society', 'समाज के लिए सर्वश्रेष्ठ से अधिक'),
  less: b('Less than is best for society', 'समाज के लिए सर्वश्रेष्ठ से कम'),
  same: b('Exactly the best quantity', 'ठीक सर्वश्रेष्ठ मात्रा'),
  yes: b('Yes', 'हाँ'),
  no: b('No', 'नहीं'),
  fair: b('They sell at a fair price', 'वे उचित कीमत पर बिकती हैं'),
  withdraw: b('Their owners withdraw them from the market', 'उनके मालिक उन्हें बाज़ार से हटा लेते हैं'),
};
const o = (id, en, hi, why) => ({ id, en, hi, ...(why ? { why } : {}) });
export const EXIT = [
  { id: 'x1', stem: b('At the current price, sellers offer more than buyers want. What is this called, and which way does the price tend to move?', 'वर्तमान कीमत पर विक्रेता उससे अधिक माल देते हैं जितना खरीदार चाहते हैं। इसे क्या कहते हैं और कीमत किस ओर जाती है?'), correct: 'surdown',
    options: [o('surdown', 'A surplus; the price tends to fall', 'अधिशेष; कीमत गिरने लगती है'), o('surup', 'A surplus; the price tends to rise', 'अधिशेष; कीमत बढ़ने लगती है', b('Sellers with unsold stock cut the price to attract buyers.', 'बिना बिके माल वाले विक्रेता खरीदार खींचने के लिए कीमत घटाते हैं।')), o('shodown', 'A shortage; the price tends to fall', 'कमी; कीमत गिरने लगती है', b('A shortage is the opposite case: buyers want more than sellers offer.', 'कमी उलटी स्थिति है: खरीदार उससे अधिक चाहते हैं जितना विक्रेता देते हैं।'))],
    explain: b('Unsold goods are a surplus. Sellers lower the price until the quantity demanded equals the quantity supplied.', 'बिना बिका माल अधिशेष है। विक्रेता कीमत तब तक घटाते हैं जब तक माँगी गई मात्रा पूर्ति की मात्रा के बराबर न हो जाए।'), hint: b('Think about what a shopkeeper does with stock that is not selling.', 'सोचें कि दुकानदार न बिकने वाले माल का क्या करता है।') },
  { id: 'x2', stem: b('Which of these SHIFTS the whole demand curve for umbrellas?', 'इनमें से क्या छातों का पूरा माँग वक्र खिसकाता है?'), correct: 'rain',
    options: [o('price', 'The price of umbrellas falls', 'छातों की कीमत घटती है', b('A change in the good’s own price moves buyers along the same curve; it does not shift it.', 'वस्तु की अपनी कीमत बदलने से खरीदार उसी वक्र पर चलते हैं; वक्र नहीं खिसकता।')), o('rain', 'The monsoon arrives', 'मानसून आ जाता है'), o('stock', 'Shops hold more umbrellas in stock', 'दुकानें अधिक छाते रखती हैं', b('That changes supply, not demand.', 'इससे पूर्ति बदलती है, माँग नहीं।'))],
    explain: b('Rain makes people want more umbrellas at every price, so the whole curve moves right.', 'बारिश में लोग हर कीमत पर अधिक छाते चाहते हैं, इसलिए पूरा वक्र दाईं ओर खिसकता है।'), hint: b('Look for a cause other than the umbrella’s own price.', 'छाते की अपनी कीमत के अलावा कोई कारण खोजें।') },
  { id: 'x3', stem: b('Why is street lighting usually paid for from taxes rather than sold to each user?', 'सड़क की रोशनी का खर्च प्रत्येक उपयोगकर्ता को बेचने के बजाय प्रायः कर से क्यों चुकाया जाता है?'), correct: 'free',
    options: [o('cost', 'Because it is too expensive for any market', 'क्योंकि यह किसी भी बाज़ार के लिए बहुत महँगी है', b('Cost is not the reason; many expensive things are sold in markets.', 'कारण लागत नहीं है; कई महँगी वस्तुएँ बाज़ार में बिकती हैं।')), o('free', 'Because non-payers cannot be kept out, people wait for others to pay', 'क्योंकि भुगतान न करने वालों को रोका नहीं जा सकता, लोग दूसरों के भुगतान की प्रतीक्षा करते हैं'), o('rival', 'Because one person’s use leaves less light for others', 'क्योंकि एक के उपयोग से दूसरों के लिए रोशनी कम बचती है', b('The light is not used up; that is exactly why it is a public good.', 'रोशनी खर्च नहीं होती; इसी कारण यह सार्वजनिक वस्तु है।'))],
    explain: b('It is non-excludable and non-rival, so some may free-ride. In the simplified game, sharing the cost through a tax funds the light; real tax and service design also matter.', 'यह अपवर्जन-रहित और प्रतिद्वंद्विता-रहित है, इसलिए कुछ लोग फ्री-राइड कर सकते हैं। सरल खेल में कर से खर्च बाँटकर बत्ती जलती है; वास्तविक कर और सेवा की व्यवस्था भी महत्त्वपूर्ण है।'), hint: b('Remember the street-light game with 10 households.', '10 परिवारों वाला स्ट्रीट-लाइट खेल याद करें।') },
  { id: 'T09.L2.e1', stem: b('In the simple model, a price ceiling below equilibrium can lead to…', 'सरल मॉडल में संतुलन से नीचे अधिकतम मूल्य से क्या हो सकता है?'), correct: 'short',
    options: [o('short', 'A shortage, because buyers want more than sellers offer', 'कमी, क्योंकि खरीदार पूर्ति से अधिक चाहते हैं'), o('guarantee', 'Enough goods for every buyer automatically', 'अपने आप हर खरीदार के लिए पर्याप्त माल', b('At the capped price, compare quantity demanded with quantity supplied.', 'सीमित मूल्य पर माँगी और पूर्ति की गई मात्रा की तुलना करें।'))],
    explain: b('In this model, quantity demanded exceeds quantity supplied. Actual outcomes also depend on enforcement, rationing and supply responses.', 'इस मॉडल में माँगी मात्रा पूर्ति से अधिक है। वास्तविक परिणाम नियम के पालन, राशन और पूर्ति की प्रतिक्रिया पर भी निर्भर हैं।'), hint: b('Turn on the ceiling and compare Qd and Qs.', 'मूल्य सीमा चालू करके Qd और Qs की तुलना करें।') },
  { id: 'T09.L3.e1', stem: b('Why might unsold tomatoes be harder to hold for a later sale than a durable good?', 'टिकाऊ वस्तु की तुलना में न बिके टमाटर बाद में बेचने के लिए रखना कठिन क्यों हो सकता है?'), correct: 'spoil',
    options: [o('spoil', 'They can spoil, so storage and time matter', 'वे खराब हो सकते हैं, इसलिए भंडारण और समय महत्त्वपूर्ण हैं'), o('fixed', 'Their price can never change', 'उनकी कीमत कभी नहीं बदल सकती', b('Perishable goods can still have changing prices.', 'जल्दी खराब होने वाली वस्तुओं की कीमत भी बदल सकती है।'))],
    explain: b('Perishability can constrain how long sellers hold stock. The fictional curve illustrates one possible response, not a forecast.', 'जल्दी खराब होना माल रोककर रखने की अवधि सीमित कर सकता है। काल्पनिक वक्र एक संभावित प्रतिक्रिया है, पूर्वानुमान नहीं।'), hint: b('Think about what happens to produce over time.', 'सोचें समय बीतने पर सब्ज़ियों का क्या हो सकता है।') },
  { id: 'T09.L4.e1', stem: b('A factory’s pollution affects neighbours who are not part of the sale. This is…', 'कारखाने का प्रदूषण उन पड़ोसियों को प्रभावित करता है जो बिक्री में शामिल नहीं हैं। यह क्या है?'), correct: 'external',
    options: [o('external', 'A negative externality', 'एक नकारात्मक बाह्यता'), o('private', 'Only a private cost to the buyer', 'केवल खरीदार की निजी लागत', b('The neighbours bear a cost outside the buyer–seller transaction.', 'खरीदार-विक्रेता लेनदेन के बाहर पड़ोसियों को लागत उठानी पड़ती है।'))],
    explain: b('A negative externality imposes a cost on others beyond those buying and selling.', 'नकारात्मक बाह्यता खरीदने और बेचने वालों के अलावा अन्य पर लागत डालती है।'), hint: b('Who is affected besides buyer and seller?', 'खरीदार और विक्रेता के अलावा कौन प्रभावित है?') },
  { id: 'T09.L6.e1', stem: b('In the used-bike model, why might an independent inspection help?', 'पुरानी बाइक के मॉडल में स्वतंत्र जाँच क्यों मदद कर सकती है?'), correct: 'info',
    options: [o('info', 'It can give buyers more information about condition', 'यह खरीदार को हालत की अधिक जानकारी दे सकती है'), o('perfect', 'It guarantees all real transactions are fair', 'यह हर वास्तविक सौदे की निष्पक्षता की गारंटी देती है', b('Real inspections can be imperfect or costly; guarantees are not automatic.', 'वास्तविक जाँच अपूर्ण या महँगी हो सकती है; गारंटी अपने आप नहीं मिलती।'))],
    explain: b('Information can reduce uncertainty, but real inspections may have costs or errors and cannot guarantee a fair trade.', 'जानकारी अनिश्चितता घटा सकती है, पर वास्तविक जाँच महँगी या गलत हो सकती है और उचित सौदे की गारंटी नहीं देती।'), hint: b('Compare what buyer and seller know before the sale.', 'बिक्री से पहले खरीदार और विक्रेता की जानकारी की तुलना करें।') },
];
export const REFLECT = b(
  'Think of something whose price changed recently where you live. Was it a change in demand, in supply, or a rule set by the government? Write two sentences.',
  'अपने आसपास की किसी ऐसी वस्तु के बारे में सोचें जिसकी कीमत हाल में बदली। यह माँग में बदलाव था, पूर्ति में, या सरकार का कोई नियम? दो वाक्य लिखें।');
