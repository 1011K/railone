/**
 * RailOne Next — Multilingual Localization System
 * Dynamic runtime text translation across English, Hindi (हिंदी), and Marathi (मराठी)
 * Specifically tuned for Indian Railways & Mumbai Suburban transit commuters.
 */

export type AppLanguage = 'en' | 'hi' | 'mr';

export interface AppTranslations {
  appName: string;
  ministryName: string;
  statutoryActive: string;
  home: string;
  journey: string;
  live: string;
  railSathi: string;
  tickets: string;
  help: string;
  fromStation: string;
  toStation: string;
  fromPlaceholder: string;
  toPlaceholder: string;
  findItineraries: string;
  quickActions: string;
  unreservedPass: string;
  reservedTransit: string;
  platformPermit: string;
  seasonPass: string;
  transitWallet: string;
  liveTelemetry: string;
  coachPosition: string;
  stationGuide: string;
  nextDepartures: string;
  liveBoard: string;
  primaryCorridors: string;
  officialRoutes: string;
  railYatriTitle: string;
  railYatriSubtitle: string;
  oneCallBooking: string;
  oneCallBadge: string;
  bookFastLocalDadarThane: string;
  bookSecondThaneCsmt: string;
  findAcLocalDadarThane: string;
  checkDelay95112: string;
  quoteFareChurchgateBorivali: string;
  callScreen: string;
  chatScreen: string;
  askAssistantPlaceholder: string;
  bookingConfirmed: string;
  ticketIssued: string;
  viewWallet: string;
  yesConfirmBooking: string;
  cancel: string;
  darkMode: string;
  lightMode: string;
  switchTheme: string;
  liveStatus: string;
  trainTracker: string;
  delayPill: string;
  onTimePill: string;
  fastLocal: string;
  slowLocal: string;
  acLocal: string;
  moderateCrowd: string;
  lightCrowd: string;
  heavyCrowd: string;
  stationNavTitle: string;
  stationNavSubtitle: string;
  fobPathfinder: string;
  stepFreeElevators: string;
  platformsL0: string;
  bridgesL1: string;
  savedTicketsTitle: string;
  noTicketsYet: string;
  emergencyHelpline: string;
  grievanceDrafter: string;
  passengerRights: string;
  themePreferences: string;
  selectCity: string;
  readyToCall: string;
  connected: string;
  listening: string;
  speaking: string;
  thinking: string;
  endCall: string;
  startCall: string;
  departAfter: string;
  arriveBy: string;
  allClasses: string;
  secondClass: string;
  firstClass: string;
  acMandatory: string;
  fastest: string;
  leastCrowded: string;
  lowestFare: string;
  fewestTransfers: string;
  verifiedTrunk: string;
  bookTicket: string;
  trackerSubtab: string;
  boardSubtab: string;
  mapSubtab: string;
  coachSubtab: string;
  allServices: string;
  activePassesSubtab: string;
  seasonPassesSubtab: string;
  walletSubtab: string;
  tteSubtab: string;
}

export const TRANSLATIONS: Record<AppLanguage, AppTranslations> = {
  en: {
    appName: 'RailOne Next',
    ministryName: 'Ministry of Railways · Indian Railways',
    statutoryActive: 'STATUTORY ACTIVE',
    home: 'Home',
    journey: 'Journey',
    live: 'Live',
    railSathi: 'Rail Yatri',
    tickets: 'Tickets',
    help: 'Help',
    fromStation: 'From Station',
    toStation: 'To Station',
    fromPlaceholder: 'e.g. Dadar (DR)',
    toPlaceholder: 'e.g. Thane (TNA)',
    findItineraries: 'Find Verified Itineraries',
    quickActions: 'One-Tap Services',
    unreservedPass: 'UTS Local',
    reservedTransit: 'Express Rail',
    platformPermit: 'Platform Permit',
    seasonPass: 'Season Pass',
    transitWallet: 'Ticket Wallet',
    liveTelemetry: 'Live Running',
    coachPosition: 'Coach Position',
    stationGuide: 'Station Guide',
    nextDepartures: 'Next Departures',
    liveBoard: 'Live Board ➔',
    primaryCorridors: 'Primary Mumbai Corridors',
    officialRoutes: 'Official Suburban Routes',
    railYatriTitle: 'Rail Yatri Voice & Booking Assistant',
    railYatriSubtitle: 'One-call instant ticket booking, live delays & Hindi/Marathi assistance',
    oneCallBooking: 'Instant One-Call Booking',
    oneCallBadge: 'ONE-CALL INSTANT',
    bookFastLocalDadarThane: 'Book Fast local from Dadar to Thane',
    bookSecondThaneCsmt: 'Book Second Class Thane to CSMT',
    findAcLocalDadarThane: 'Find AC Local Dadar to Thane',
    checkDelay95112: 'Check delay for Train 95112',
    quoteFareChurchgateBorivali: 'Quote fare Churchgate to Borivali',
    callScreen: 'Voice Call',
    chatScreen: 'Interactive Chat',
    askAssistantPlaceholder: 'Ask Rail Yatri Assistant (e.g. Book Fast local Dadar to Thane)...',
    bookingConfirmed: 'Booking Confirmed!',
    ticketIssued: 'Specimen Ticket Issued',
    viewWallet: 'View in Ticket Wallet ➔',
    yesConfirmBooking: 'Yes, Confirm Booking',
    cancel: 'Cancel',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    switchTheme: 'Switch Livery',
    liveStatus: 'Live Train Running Status',
    trainTracker: 'Track Train or Station',
    delayPill: 'Delayed',
    onTimePill: 'Right Time',
    fastLocal: 'Fast Local',
    slowLocal: 'Slow Local',
    acLocal: 'AC Local',
    moderateCrowd: 'Moderate',
    lightCrowd: 'Light',
    heavyCrowd: 'Heavy',
    stationNavTitle: 'Station Navigation & Guide',
    stationNavSubtitle: 'Platform directions, FOB bridges, elevators & exits',
    fobPathfinder: 'Bridge Transfer Guide',
    stepFreeElevators: 'Step-Free Wheelchair Access',
    platformsL0: 'Platforms (L0)',
    bridgesL1: 'Footbridges (L1)',
    savedTicketsTitle: 'Saved Specimen Tickets & Passes',
    noTicketsYet: 'No active tickets in wallet',
    emergencyHelpline: 'Emergency Helpline 139',
    grievanceDrafter: 'RailMadad Complaint Drafter',
    passengerRights: 'Passenger Rights & Statutory Rules',
    themePreferences: 'Theme Livery & Preferences',
    selectCity: 'Select Transit City',
    readyToCall: 'Ready to Call · Hindi / English / Marathi',
    connected: 'Connected',
    listening: 'Listening to passenger...',
    speaking: 'Rail Yatri speaking...',
    thinking: 'Checking railway schedules...',
    endCall: 'End Call',
    startCall: 'Start Voice Call',
    departAfter: 'Depart After',
    arriveBy: 'Arrive By',
    allClasses: 'All Classes',
    secondClass: '2nd Class (II)',
    firstClass: '1st Class (I)',
    acMandatory: 'AC Local Only',
    fastest: '⚡ Fastest',
    leastCrowded: '👥 Least Crowded',
    lowestFare: '💰 Lowest Fare',
    fewestTransfers: 'Direct',
    verifiedTrunk: '[VERIFIED TRUNK]',
    bookTicket: 'Book Specimen Ticket',
    trackerSubtab: 'Running Tracker',
    boardSubtab: 'Station Board',
    mapSubtab: 'Network Map',
    coachSubtab: 'Coach Guide',
    allServices: 'All Services',
    activePassesSubtab: 'Active & Unreserved',
    seasonPassesSubtab: 'Season Passes',
    walletSubtab: 'R-Wallet',
    tteSubtab: 'TTE Inspection'
  },
  hi: {
    appName: 'रेलवन नेक्स्ट',
    ministryName: 'रेल मंत्रालय · भारतीय रेल',
    statutoryActive: 'सत्यापित सक्रिय',
    home: 'होम',
    journey: 'यात्रा',
    live: 'लाइव',
    railSathi: 'रेल यात्री',
    tickets: 'टिकट',
    help: 'मदद',
    fromStation: 'प्रारंभिक स्टेशन',
    toStation: 'गंतव्य स्टेशन',
    fromPlaceholder: 'उदा. दादर (DR)',
    toPlaceholder: 'उदा. ठाणे (TNA)',
    findItineraries: 'सत्यापित ट्रेनें खोजें',
    quickActions: 'एक-टैप सेवाएं',
    unreservedPass: 'यूटीएस लोकल',
    reservedTransit: 'एक्सप्रेस ट्रेन',
    platformPermit: 'प्लेटफॉर्म टिकट',
    seasonPass: 'सीज़न पास',
    transitWallet: 'टिकट वॉलेट',
    liveTelemetry: 'लाइव स्थिति',
    coachPosition: 'कोच स्थिति',
    stationGuide: 'स्टेशन गाइड',
    nextDepartures: 'अगली प्रस्थान ट्रेनें',
    liveBoard: 'लाइव बोर्ड ➔',
    primaryCorridors: 'प्रमुख मुंबई कॉरिडोर',
    officialRoutes: 'आधिकारिक उपनगरीय मार्ग',
    railYatriTitle: 'रेल यात्री वॉइस और बुकिंग सहायक',
    railYatriSubtitle: 'एक कॉल में त्वरित टिकट बुकिंग, लाइव देरी और हिंदी/मराठी सहायता',
    oneCallBooking: 'एक कॉल में तुरंत टिकट बुक करें',
    oneCallBadge: 'वन-कॉल इंस्टेंट',
    bookFastLocalDadarThane: 'दादर से ठाणे फास्ट लोकल बुक करें',
    bookSecondThaneCsmt: 'ठाणे से सीएसएमटी सेकंड क्लास बुक करें',
    findAcLocalDadarThane: 'दादर से ठाणे एसी लोकल खोजें',
    checkDelay95112: 'ट्रेन 95112 की देरी जांचें',
    quoteFareChurchgateBorivali: 'चर्चगेट से बोरीवली का किराया बताएं',
    callScreen: 'वॉइस कॉल स्क्रीन',
    chatScreen: 'संवादात्मक चैट',
    askAssistantPlaceholder: 'रेल यात्री से पूछें (उदा. दादर से ठाणे फास्ट लोकल बुक करें)...',
    bookingConfirmed: 'बुकिंग कन्फर्म हो गई!',
    ticketIssued: 'स्पेसिमेन टिकट जारी हुआ',
    viewWallet: 'टिकट वॉलेट में देखें ➔',
    yesConfirmBooking: 'हाँ, टिकट बुक करें',
    cancel: 'रद्द करें',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    switchTheme: 'थीम बदलें',
    liveStatus: 'लाइव ट्रेन रनिंग स्थिति',
    trainTracker: 'ट्रेन या स्टेशन ट्रैक करें',
    delayPill: 'विलंबित',
    onTimePill: 'समय पर',
    fastLocal: 'फास्ट लोकल',
    slowLocal: 'स्लो लोकल',
    acLocal: 'एसी लोकल',
    moderateCrowd: 'मध्यम भीड़',
    lightCrowd: 'कम भीड़',
    heavyCrowd: 'भारी भीड़',
    stationNavTitle: 'स्टेशन नेविगेशन एवं गाइड',
    stationNavSubtitle: 'प्लेटफॉर्म दिशा-निर्देश, फुट ओवर ब्रिज, लिफ्ट और निकास द्वार',
    fobPathfinder: 'ब्रिज ट्रांसफर गाइड',
    stepFreeElevators: 'सुलभ व्हीलचेयर लिफ्ट मार्ग',
    platformsL0: 'प्लेटफॉर्म (स्तर 0)',
    bridgesL1: 'फुट ओवर ब्रिज (स्तर 1)',
    savedTicketsTitle: 'सहेजे गए टिकट और पास',
    noTicketsYet: 'वॉलेट में कोई सक्रिय टिकट नहीं है',
    emergencyHelpline: 'आपातकालीन हेल्पलाइन 139',
    grievanceDrafter: 'रेल मदद शिकायत प्रारूप',
    passengerRights: 'यात्री अधिकार एवं वैधानिक नियम',
    themePreferences: 'थीम रंग और प्राथमिकताएं',
    selectCity: 'ट्रांजिट शहर चुनें',
    readyToCall: 'कॉल के लिए तैयार · हिंदी / अंग्रेजी / मराठी',
    connected: 'कनेक्टेड',
    listening: 'यात्री की आवाज सुनी जा रही है...',
    speaking: 'रेल यात्री बोल रहा है...',
    thinking: 'रेलवे शेड्यूल सत्यापित किया जा रहा है...',
    endCall: 'कॉल समाप्त करें',
    startCall: 'वॉइस कॉल शुरू करें',
    departAfter: 'प्रस्थान समय',
    arriveBy: 'आगमन समय',
    allClasses: 'सभी श्रेणियां',
    secondClass: 'द्वितीय श्रेणी (II)',
    firstClass: 'प्रथम श्रेणी (I)',
    acMandatory: 'केवल एसी लोकल',
    fastest: '⚡ सबसे तेज़',
    leastCrowded: '👥 कम भीड़',
    lowestFare: '💰 न्यूनतम किराया',
    fewestTransfers: 'सीधी ट्रेन',
    verifiedTrunk: '[सत्यापित ट्रंक]',
    bookTicket: 'टिकट बुक करें',
    trackerSubtab: 'रनिंग ट्रैकर',
    boardSubtab: 'स्टेशन बोर्ड',
    mapSubtab: 'नेटवर्क मैप',
    coachSubtab: 'कोच स्थिति',
    allServices: 'सभी सेवाएं',
    activePassesSubtab: 'सक्रिय एवं अनारक्षित',
    seasonPassesSubtab: 'सीज़न पास',
    walletSubtab: 'आर-वॉलेट',
    tteSubtab: 'टीटीई सत्यापन'
  },
  mr: {
    appName: 'रेलोन नेक्स्ट',
    ministryName: 'रेल्वे मंत्रालय · भारतीय रेल्वे',
    statutoryActive: 'प्रमाणित सक्रिय',
    home: 'मुख्यपृष्ठ',
    journey: 'प्रवास',
    live: 'थेट स्थिती',
    railSathi: 'रेल यात्री',
    tickets: 'तिकीट',
    help: 'मदत',
    fromStation: 'सुरुवातीचे स्थानक',
    toStation: 'गंतव्य स्थानक',
    fromPlaceholder: 'उदा. दादर (DR)',
    toPlaceholder: 'उदा. ठाणे (TNA)',
    findItineraries: 'प्रमाणित गाड्या शोधा',
    quickActions: 'जलद सेवा',
    unreservedPass: 'यूटीएस लोकल',
    reservedTransit: 'एक्स्प्रेस रेल्वे',
    platformPermit: 'प्लॅटफॉर्म तिकीट',
    seasonPass: 'सीझन पास',
    transitWallet: 'तिकीट पाकीट',
    liveTelemetry: 'थेट धावसंख्या',
    coachPosition: 'डब्यांची स्थिती',
    stationGuide: 'स्थानक मार्गदर्शक',
    nextDepartures: 'पुढील सुटणाऱ्या गाड्या',
    liveBoard: 'थेट फलक ➔',
    primaryCorridors: 'प्रमुख मुंबई मार्ग',
    officialRoutes: 'अधिकृत उपनगरीय मार्ग',
    railYatriTitle: 'रेल यात्री व्हॉइस व बुकिंग मदतनीस',
    railYatriSubtitle: 'एका कॉलवर झटपट तिकीट बुकिंग, थेट उशीर व मराठी/हिंदी मदत',
    oneCallBooking: 'एका कॉलवर झटपट तिकीट बुकिंग',
    oneCallBadge: 'वन-कॉल इन्स्टंट',
    bookFastLocalDadarThane: 'दादर ते ठाणे जलद लोकल बुक करा',
    bookSecondThaneCsmt: 'ठाणे ते सीएसएमटी द्वितीय श्रेणी बुक करा',
    findAcLocalDadarThane: 'दादर ते ठाणे एसी लोकल शोधा',
    checkDelay95112: 'गाडी 95112 चा उशीर तपासा',
    quoteFareChurchgateBorivali: 'चर्चगेट ते बोरिवलीचे भाडे तपासा',
    callScreen: 'व्हॉइस कॉल स्क्रीन',
    chatScreen: 'संभाषण चॅट',
    askAssistantPlaceholder: 'रेल यात्रीला विचारा (उदा. दादर ते ठाणे जलद लोकल बुक करा)...',
    bookingConfirmed: 'बुकिंग निश्चित झाली!',
    ticketIssued: 'स्पेसिमेन तिकीट जारी झाले',
    viewWallet: 'तिकीट पाकिटात पहा ➔',
    yesConfirmBooking: 'होय, तिकीट बुक करा',
    cancel: 'रद्द करा',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    switchTheme: 'थीम बदला',
    liveStatus: 'थेट गाडी धावण्याची स्थिती',
    trainTracker: 'गाडी किंवा स्थानक शोधा',
    delayPill: 'उशिरा',
    onTimePill: 'वेळेवर',
    fastLocal: 'जलद लोकल',
    slowLocal: 'धीम्या लोकल',
    acLocal: 'एसी लोकल',
    moderateCrowd: 'मध्यम गर्दी',
    lightCrowd: 'कमी गर्दी',
    heavyCrowd: 'प्रचंड गर्दी',
    stationNavTitle: 'स्थानक मार्गदर्शन व नेव्हिगेशन',
    stationNavSubtitle: 'प्लॅटफॉर्म दिशा, पादचारी पूल, लिफ्ट व बाहेर पडण्याचे मार्ग',
    fobPathfinder: 'पूल बदल मार्गदर्शक',
    stepFreeElevators: 'सुलभ व्हीलचेअर लिफ्ट मार्ग',
    platformsL0: 'प्लॅटफॉर्म (पातळी 0)',
    bridgesL1: 'पादचारी पूल (पातळी 1)',
    savedTicketsTitle: 'जतन केलेली तिकिटे व पासेस',
    noTicketsYet: 'पाकिटात कोणतीही सक्रिय तिकिटे नाहीत',
    emergencyHelpline: 'आपत्कालीन हेल्पलाइन 139',
    grievanceDrafter: 'रेलमदत तक्रार मसुदा',
    passengerRights: 'प्रवासी हक्क व वैधानिक नियम',
    themePreferences: 'थीम रंग व पसंती',
    selectCity: 'शहर निवडा',
    readyToCall: 'कॉलसाठी सज्ज · मराठी / हिंदी / इंग्रजी',
    connected: 'जोडले गेले',
    listening: 'प्रवाशाचे बोलणे ऐकत आहे...',
    speaking: 'रेल यात्री बोलत आहे...',
    thinking: 'रेल्वे वेळापत्रक तपासत आहे...',
    endCall: 'कॉल संपवा',
    startCall: 'व्हॉइस कॉल सुरू करा',
    departAfter: 'सुटण्याची वेळ',
    arriveBy: 'पोहोचण्याची वेळ',
    allClasses: 'सर्व वर्ग',
    secondClass: 'द्वितीय श्रेणी (II)',
    firstClass: 'प्रथम श्रेणी (I)',
    acMandatory: 'फक्त एसी लोकल',
    fastest: '⚡ सर्वात वेगवान',
    leastCrowded: '👥 कमी गर्दी',
    lowestFare: '💰 सर्वात कमी भाडे',
    fewestTransfers: 'थेट गाडी',
    verifiedTrunk: '[प्रमाणित मार्ग]',
    bookTicket: 'तिकीट बुक करा',
    trackerSubtab: 'थेट ट्रॅकर',
    boardSubtab: 'स्थानक फलक',
    mapSubtab: 'नेटवर्क नकाशा',
    coachSubtab: 'डब्यांची स्थिती',
    allServices: 'सर्व गाड्या',
    activePassesSubtab: 'सक्रिय व अनारक्षित',
    seasonPassesSubtab: 'सीझन पास',
    walletSubtab: 'आर-पाकीट',
    tteSubtab: 'टीटीई तपासणी'
  }
};

export function getTranslation(lang: AppLanguage): AppTranslations {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
