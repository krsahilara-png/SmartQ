/* ==========================================================================
   SmartQ Bhopal — Multi-Category Directory, Area Taxonomy & Counter Templates
   Strict Data Accuracy: Zero fabricated phones, hours, ratings, or live queues
   ========================================================================== */

export const BHOPAL_CATEGORIES = [
  {
    id: 'DIR_HOSPITALS',
    name: 'Hospitals & Clinics',
    nameHi: 'अस्पताल एवं क्लीनिक',
    shortName: 'Hospitals',
    icon: 'hospital',
    description: 'OPD registration, specialist consultations, and hospital billing desks.',
    suggestedCounters: [
      { name: 'OPD Registration', serviceId: 'SVC_OPD_REG', serviceName: 'OPD Registration', code: 'OR', defaultDurationMin: 6 },
      { name: 'General Medicine', serviceId: 'SVC_GEN_MED', serviceName: 'General Medicine', code: 'GM', defaultDurationMin: 12 },
      { name: 'Dental OPD', serviceId: 'SVC_DENTAL_OPD', serviceName: 'Dental OPD', code: 'DN', defaultDurationMin: 15 },
      { name: 'Billing', serviceId: 'SVC_HOSP_BILL', serviceName: 'Hospital Billing', code: 'HB', defaultDurationMin: 5 },
    ],
  },
  {
    id: 'DIR_DOCTORS',
    name: 'Doctors & Dental Clinics',
    nameHi: 'डॉक्टर एवं डेंटल क्लीनिक',
    shortName: 'Doctors & Dental',
    icon: 'stethoscope',
    description: 'Private physician consultations, dental appointments, and follow-up visits.',
    suggestedCounters: [
      { name: 'OPD Registration', serviceId: 'SVC_OPD_REG', serviceName: 'OPD Registration', code: 'OR', defaultDurationMin: 6 },
      { name: 'General Medicine', serviceId: 'SVC_GEN_MED', serviceName: 'General Medicine', code: 'GM', defaultDurationMin: 12 },
      { name: 'Dental OPD', serviceId: 'SVC_DENTAL_OPD', serviceName: 'Dental OPD', code: 'DN', defaultDurationMin: 15 },
      { name: 'Billing', serviceId: 'SVC_HOSP_BILL', serviceName: 'Clinic Billing', code: 'HB', defaultDurationMin: 5 },
    ],
  },
  {
    id: 'DIR_DIAGNOSTICS',
    name: 'Diagnostic & Pathology Labs',
    nameHi: 'डायग्नोस्टिक एवं पैथोलॉजी लैब',
    shortName: 'Diagnostics',
    icon: 'flask',
    description: 'Sample collection, diagnostic billing, and pathology report pickup.',
    suggestedCounters: [
      { name: 'Sample Collection', serviceId: 'SVC_LAB_SAMPLE', serviceName: 'Sample Collection', code: 'SC', defaultDurationMin: 8 },
      { name: 'Billing', serviceId: 'SVC_LAB_BILL', serviceName: 'Lab Billing', code: 'LB', defaultDurationMin: 5 },
      { name: 'Report Collection', serviceId: 'SVC_LAB_REPORT', serviceName: 'Report Collection', code: 'RC', defaultDurationMin: 4 },
    ],
  },
  {
    id: 'DIR_SHOPPING',
    name: 'Shopping & Retail Stores',
    nameHi: 'शॉपिंग एवं रिटेल स्टोर',
    shortName: 'Shopping & Retail',
    icon: 'bag',
    description: 'Checkout billing, exchange & returns, and retail customer service desks.',
    suggestedCounters: [
      { name: 'Billing', serviceId: 'SVC_RET_BILL', serviceName: 'Retail Billing', code: 'RB', defaultDurationMin: 5 },
      { name: 'Returns', serviceId: 'SVC_RET_RETURNS', serviceName: 'Returns & Exchange', code: 'RT', defaultDurationMin: 8 },
      { name: 'Customer Service', serviceId: 'SVC_RET_CS', serviceName: 'Customer Service', code: 'CS', defaultDurationMin: 7 },
    ],
  },
  {
    id: 'DIR_BANKS',
    name: 'Banks & Financial Services',
    nameHi: 'बैंक एवं वित्तीय सेवाएं',
    shortName: 'Banks & Finance',
    icon: 'bank',
    description: 'Cash transactions, deposits, withdrawals, KYC, and customer enquiry.',
    suggestedCounters: [
      { name: 'Cash Counter', serviceId: 'SVC_BNK_CASH', serviceName: 'Cash Counter', code: 'CC', defaultDurationMin: 6 },
      { name: 'Deposit', serviceId: 'SVC_BNK_DEP', serviceName: 'Deposit Desk', code: 'DP', defaultDurationMin: 6 },
      { name: 'Withdrawal', serviceId: 'SVC_BNK_WDR', serviceName: 'Withdrawal Desk', code: 'WD', defaultDurationMin: 6 },
      { name: 'Customer Enquiry', serviceId: 'SVC_BNK_ENQ', serviceName: 'Customer Enquiry', code: 'CE', defaultDurationMin: 9 },
    ],
  },
  {
    id: 'DIR_GOVT',
    name: 'Government & Citizen Services',
    nameHi: 'सरकारी एवं नागरिक सेवाएं',
    shortName: 'Citizen Services',
    icon: 'landmark',
    description: 'Citizen enquiry, certificate services, and document verification.',
    suggestedCounters: [
      { name: 'Citizen Enquiry', serviceId: 'SVC_GOV_ENQ', serviceName: 'Citizen Enquiry', code: 'GE', defaultDurationMin: 8 },
      { name: 'Certificate Services', serviceId: 'SVC_GOV_CERT', serviceName: 'Certificate Services', code: 'CT', defaultDurationMin: 10 },
      { name: 'Document Verification', serviceId: 'SVC_GOV_DOC', serviceName: 'Document Verification', code: 'DV', defaultDurationMin: 12 },
    ],
  },
  {
    id: 'DIR_SALONS',
    name: 'Salons & Beauty Services',
    nameHi: 'सैलून एवं ब्यूटी सेवाएं',
    shortName: 'Salons & Beauty',
    icon: 'scissors',
    description: 'Haircut, hair styling, facial treatments, and salon checkout.',
    suggestedCounters: [
      { name: 'Haircut', serviceId: 'SVC_SAL_CUT', serviceName: 'Haircut', code: 'HC', defaultDurationMin: 25 },
      { name: 'Hair Styling', serviceId: 'SVC_SAL_STYLE', serviceName: 'Hair Styling', code: 'HS', defaultDurationMin: 30 },
      { name: 'Facial', serviceId: 'SVC_SAL_FACIAL', serviceName: 'Facial & Skin Care', code: 'FC', defaultDurationMin: 40 },
      { name: 'Billing', serviceId: 'SVC_SAL_BILL', serviceName: 'Salon Billing', code: 'SB', defaultDurationMin: 4 },
    ],
  },
  {
    id: 'DIR_EDUCATION',
    name: 'Education & Coaching',
    nameHi: 'शिक्षा एवं कोचिंग',
    shortName: 'Education',
    icon: 'graduation',
    description: 'Admissions enquiry, fee counter, and student counselling desks.',
    suggestedCounters: [
      { name: 'Admissions Enquiry', serviceId: 'SVC_EDU_ADM', serviceName: 'Admissions Enquiry', code: 'AD', defaultDurationMin: 12 },
      { name: 'Fee Counter', serviceId: 'SVC_EDU_FEE', serviceName: 'Fee Counter', code: 'FE', defaultDurationMin: 6 },
      { name: 'Student Counselling', serviceId: 'SVC_EDU_COUNS', serviceName: 'Student Counselling', code: 'CN', defaultDurationMin: 15 },
    ],
  },
  {
    id: 'DIR_RESTAURANTS',
    name: 'Restaurants & Food Services',
    nameHi: 'रेस्टोरेंट एवं फूड सेवाएं',
    shortName: 'Restaurants',
    icon: 'utensils',
    description: 'Dining table waitlist, takeaway pickup, and order billing.',
    suggestedCounters: [
      { name: 'Table Waitlist', serviceId: 'SVC_RST_TBL', serviceName: 'Table Waitlist', code: 'TW', defaultDurationMin: 15 },
      { name: 'Takeaway Pickup', serviceId: 'SVC_RST_PKP', serviceName: 'Takeaway Pickup', code: 'PK', defaultDurationMin: 6 },
      { name: 'Billing', serviceId: 'SVC_RST_BILL', serviceName: 'Restaurant Billing', code: 'FB', defaultDurationMin: 4 },
    ],
  },
  {
    id: 'DIR_OTHER',
    name: 'Other Local Services',
    nameHi: 'अन्य स्थानीय सेवाएं',
    shortName: 'Other Services',
    icon: 'grid',
    description: 'Utility offices, repair centres, and local community service desks.',
    suggestedCounters: [
      { name: 'General Reception', serviceId: 'SVC_OTH_REC', serviceName: 'General Reception', code: 'GR', defaultDurationMin: 8 },
      { name: 'Service Desk', serviceId: 'SVC_OTH_SRV', serviceName: 'Service Desk', code: 'SD', defaultDurationMin: 10 },
      { name: 'Billing', serviceId: 'SVC_OTH_BILL', serviceName: 'Billing Counter', code: 'BL', defaultDurationMin: 5 },
    ],
  },
];

export const BHOPAL_AREAS = [
  'MP Nagar',
  'Arera Colony',
  'New Market',
  'TT Nagar',
  'Shahpura',
  'Saket Nagar',
  'Habibganj',
  'Hoshangabad Road',
  'Kolar Road',
  'Lalghati',
  'Karond',
  'Bhanpur',
  'Old Bhopal',
  'Ayodhya Bypass',
  'Awadhpuri',
];

/**
 * Real Bhopal Seed Directory Listings.
 * DATA ACCURACY GUARANTEE:
 * - No fabricated phone numbers, operating hours, ratings, or live queue counts.
 * - All entries start as unverified directory listings (isOnboarded: false, bookingEnabled: false)
 *   until an administrator explicitly configures counters, verifies details, and enables booking.
 */
export const BHOPAL_SEED_BUSINESSES = [
  // Healthcare
  {
    id: 'BPL_AIIMS',
    name: 'AIIMS Bhopal',
    nameHi: 'एम्स भोपाल',
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'Saket Nagar',
    locality: 'Saket Nagar',
    areaTags: ['Saket Nagar'],
    address: 'Saket Nagar, Bhopal, Madhya Pradesh 462020',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_BMHRC',
    name: 'Bhopal Memorial Hospital & Research Centre',
    nameHi: 'भोपाल मेमोरियल हॉस्पिटल एंड रिसर्च सेंटर',
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'Karond',
    locality: 'Karond',
    areaTags: ['Karond'],
    address: 'Raisen Bypass Road, Karond, Bhopal, Madhya Pradesh 462038',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_JP_HOSP',
    name: 'Government Jai Prakash District Hospital',
    nameHi: 'शासकीय जयप्रकाश जिला चिकित्सालय',
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'TT Nagar',
    locality: 'Tulsi Nagar',
    areaTags: ['TT Nagar', 'New Market'],
    address: 'Link Road No. 1, Tulsi Nagar, Bhopal, Madhya Pradesh 462003',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_HAMIDIA',
    name: 'Hamidia Hospital',
    nameHi: 'हमीदिया अस्पताल',
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'Old Bhopal',
    locality: 'Royal Market',
    areaTags: ['Old Bhopal'],
    address: 'Sultania Road, Royal Market, Old Bhopal, Madhya Pradesh 462001',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_KAMLA_NEHRU',
    name: 'Kamla Nehru Hospital',
    nameHi: 'कमला नेहरू अस्पताल',
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'Old Bhopal',
    locality: 'Hamidia Campus',
    areaTags: ['Old Bhopal'],
    address: 'Hamidia Hospital Campus, Sultania Road, Old Bhopal, Madhya Pradesh 462001',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_KASTURBA',
    name: 'Kasturba Hospital',
    nameHi: 'कस्तूरबा अस्पताल',
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'Habibganj',
    locality: 'Habibganj',
    areaTags: ['Habibganj'],
    address: 'BHEL Township, Habibganj, Bhopal, Madhya Pradesh 462024',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_SAGAR_MULTI',
    name: 'Sagar Multispeciality Hospital',
    nameHi: 'सागर मल्टीस्पेशलिटी हॉस्पिटल',
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'Hoshangabad Road',
    locality: 'Hoshangabad Road',
    areaTags: ['Hoshangabad Road'],
    address: 'Narmadapuram (Hoshangabad) Road, Bhopal, Madhya Pradesh 462026',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_PEOPLES',
    name: "People's Hospital",
    nameHi: 'पीपुल्स हॉस्पिटल',
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'Bhanpur',
    locality: 'Bhanpur',
    areaTags: ['Bhanpur', 'Ayodhya Bypass'],
    address: "People's Campus, Bhanpur, Bhopal, Madhya Pradesh 462037",
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_LAL_PATHLABS',
    name: 'Dr Lal PathLabs',
    nameHi: 'डॉ. लाल पैथलैब्स',
    directoryCategoryId: 'DIR_DIAGNOSTICS',
    area: 'MP Nagar',
    locality: 'MP Nagar',
    areaTags: ['MP Nagar'],
    address: 'MP Nagar, Bhopal, Madhya Pradesh 462011',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },

  // Shopping
  {
    id: 'BPL_DB_CITY',
    name: 'DB City Mall',
    nameHi: 'डीबी सिटी मॉल',
    directoryCategoryId: 'DIR_SHOPPING',
    area: 'MP Nagar',
    locality: 'MP Nagar',
    areaTags: ['MP Nagar'],
    address: 'Arera Hills, Zone-I, MP Nagar, Bhopal, Madhya Pradesh 462011',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_AASHIMA',
    name: 'Aashima Mall',
    nameHi: 'आशिमा मॉल',
    directoryCategoryId: 'DIR_SHOPPING',
    area: 'Hoshangabad Road',
    locality: 'Bawadiya Kalan',
    areaTags: ['Hoshangabad Road'],
    address: 'Hoshangabad Road, Bawadiya Kalan, Bhopal, Madhya Pradesh 462026',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_VISHAL_MEGA',
    name: 'Vishal Mega Mart',
    nameHi: 'विशाल मेगा मार्ट',
    directoryCategoryId: 'DIR_SHOPPING',
    area: 'MP Nagar',
    locality: 'MP Nagar',
    areaTags: ['MP Nagar'],
    address: 'MP Nagar, Bhopal, Madhya Pradesh 462011',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_CHOWK_BAZAAR',
    name: 'Chowk Bazaar',
    nameHi: 'चौक बाज़ार',
    directoryCategoryId: 'DIR_SHOPPING',
    area: 'Old Bhopal',
    locality: 'Old Bhopal',
    areaTags: ['Old Bhopal'],
    address: 'Chowk Bazaar, Old Bhopal, Madhya Pradesh 462001',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },

  // Beauty
  {
    id: 'BPL_NIKKY_BAWA',
    name: 'Nikky Bawa Family Salon',
    nameHi: 'निक्की बावा फैमिली सैलून',
    directoryCategoryId: 'DIR_SALONS',
    area: 'TT Nagar',
    locality: 'TT Nagar',
    areaTags: ['TT Nagar', 'New Market'],
    address: 'TT Nagar, Bhopal, Madhya Pradesh 462003',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_YASHI_SALON',
    name: "YASHI's Beauty Salon",
    nameHi: 'याशीज़ ब्यूटी सैलून',
    directoryCategoryId: 'DIR_SALONS',
    area: 'Lalghati',
    locality: 'Lalghati',
    areaTags: ['Lalghati'],
    address: 'Lalghati, Bhopal, Madhya Pradesh 462030',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_KARISHMA_LOUNGE',
    name: 'KARISHMA Beauty Lounge',
    nameHi: 'करिश्मा ब्यूटी लाउंज',
    directoryCategoryId: 'DIR_SALONS',
    area: 'New Market',
    locality: 'Malviya Nagar',
    areaTags: ['New Market', 'TT Nagar'],
    address: 'Malviya Nagar, Near New Market, Bhopal, Madhya Pradesh 462003',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
  {
    id: 'BPL_JCB_SALON',
    name: 'Jean-Claude Biguine',
    nameHi: 'ज्याँ-क्लॉद बिगुइन',
    directoryCategoryId: 'DIR_SALONS',
    area: 'Arera Colony',
    locality: 'Arera Colony',
    areaTags: ['Arera Colony'],
    address: 'Arera Colony, Bhopal, Madhya Pradesh 462016',
    city: 'Bhopal',
    phone: '',
    openTime: '',
    closeTime: '',
    dataScope: 'directory',
    isOnboarded: false,
    bookingEnabled: false,
    verified: false,
    verifiedAt: null,
    verifiedBy: '',
    isActive: true,
    announcements: [],
  },
];

/**
 * Metadata mapping for existing SmartQ demo sandbox centres so sample/demo data
 * remains clearly separated from real Bhopal directory / operational data.
 */
export const DEMO_CENTRE_META = {
  CTR_METRO: {
    directoryCategoryId: 'DIR_BANKS',
    area: 'Demo Sandbox',
    locality: 'Interactive Demo',
    areaTags: [],
    dataScope: 'demo',
    isOnboarded: true,
    bookingEnabled: true,
    verified: false,
  },
  CTR_HEALTH: {
    directoryCategoryId: 'DIR_HOSPITALS',
    area: 'Demo Sandbox',
    locality: 'Interactive Demo',
    areaTags: [],
    dataScope: 'demo',
    isOnboarded: true,
    bookingEnabled: true,
    verified: false,
  },
  CTR_PASSPORT: {
    directoryCategoryId: 'DIR_GOVT',
    area: 'Demo Sandbox',
    locality: 'Interactive Demo',
    areaTags: [],
    dataScope: 'demo',
    isOnboarded: true,
    bookingEnabled: true,
    verified: false,
  },
};

export function getDirectoryCategory(categoryId) {
  return BHOPAL_CATEGORIES.find((c) => c.id === categoryId) || BHOPAL_CATEGORIES[BHOPAL_CATEGORIES.length - 1];
}

export function getSuggestedCounterTemplates(categoryId) {
  const cat = getDirectoryCategory(categoryId);
  return cat && Array.isArray(cat.suggestedCounters) ? cat.suggestedCounters : [];
}

export function matchesBhopalArea(centre, selectedArea) {
  if (!selectedArea || selectedArea === 'all') return true;
  const target = selectedArea.toLowerCase();
  if (centre.area && centre.area.toLowerCase() === target) return true;
  if (centre.locality && centre.locality.toLowerCase() === target) return true;
  if (Array.isArray(centre.areaTags) && centre.areaTags.some((a) => a.toLowerCase() === target)) return true;
  if (centre.address && centre.address.toLowerCase().includes(target)) return true;
  return false;
}

export function buildTemplateServiceCategories() {
  const map = new Map();
  for (const cat of BHOPAL_CATEGORIES) {
    for (const tpl of cat.suggestedCounters) {
      if (!map.has(tpl.serviceId)) {
        map.set(tpl.serviceId, {
          id: tpl.serviceId,
          name: tpl.serviceName,
          nameHi: tpl.serviceName,
          code: tpl.code,
          defaultDurationMin: tpl.defaultDurationMin,
          description: `Configured counter service for ${cat.name}.`,
          directoryCategoryId: cat.id,
          active: true,
          isTemplateService: true,
        });
      }
    }
  }
  return Array.from(map.values());
}

/**
 * Computes strictly truthful operational status for any business/centre.
 * Never fabricates queue counts, ETAs, or partnership claims.
 */
export function getBusinessQueueMeta(db, centre, QueueEngine) {
  const isDemo = centre.dataScope === 'demo';
  const counters = (db.counters || []).filter((c) => c.centreId === centre.id);
  const openCounters = counters.filter((c) => c.status === 'open');
  const isOnboarded = Boolean(centre.isOnboarded);
  const bookingEnabled = centre.bookingEnabled !== false;

  if (!isOnboarded) {
    return {
      isDemo,
      isOnboarded: false,
      canBook: false,
      statusCode: 'directory',
      statusLabel: 'Directory Listing · Coming Soon',
      statusClass: 'status-directory',
      eligibilityLabel: 'Not eligible — Business not yet onboarded',
      waitingCount: null,
      estWaitMin: null,
      counters,
      openCounters: [],
      scopeLabel: 'Bhopal Directory Listing (Unverified)',
    };
  }

  if (!centre.isActive) {
    return {
      isDemo,
      isOnboarded: true,
      canBook: false,
      statusCode: 'inactive',
      statusLabel: 'Inactive',
      statusClass: 'status-closed',
      eligibilityLabel: 'Unavailable — Business inactive',
      waitingCount: null,
      estWaitMin: null,
      counters,
      openCounters: [],
      scopeLabel: isDemo ? 'Interactive Demo Sandbox' : centre.verified ? 'Verified Bhopal Partner' : 'Onboarded (Unverified)',
    };
  }

  if (!bookingEnabled) {
    return {
      isDemo,
      isOnboarded: true,
      canBook: false,
      statusCode: 'paused',
      statusLabel: 'Token Booking Paused',
      statusClass: 'status-paused',
      eligibilityLabel: 'Paused by administrator',
      waitingCount: counters.reduce((acc, c) => acc + QueueEngine.getCounterState(db, c.id).waiting.length, 0),
      estWaitMin: null,
      counters,
      openCounters,
      scopeLabel: isDemo ? 'Interactive Demo Sandbox' : centre.verified ? 'Verified Bhopal Partner' : 'Onboarded (Pending Verification)',
    };
  }

  if (counters.length === 0) {
    return {
      isDemo,
      isOnboarded: true,
      canBook: false,
      statusCode: 'unconfigured',
      statusLabel: 'Counters Not Configured',
      statusClass: 'status-paused',
      eligibilityLabel: 'Awaiting counter setup by administrator',
      waitingCount: null,
      estWaitMin: null,
      counters: [],
      openCounters: [],
      scopeLabel: isDemo ? 'Interactive Demo Sandbox' : centre.verified ? 'Verified Bhopal Partner' : 'Onboarded (Pending Verification)',
    };
  }

  let totalWaiting = 0;
  let lowestEta = null;
  for (const cnt of counters) {
    const st = QueueEngine.getCounterState(db, cnt.id);
    totalWaiting += st.waiting.length;
    if (cnt.status === 'open' && st.waiting.length < cnt.maxCapacity) {
      if (lowestEta === null || st.projectedWaitMin < lowestEta) {
        lowestEta = st.projectedWaitMin;
      }
    }
  }

  const hasOpenCounter = openCounters.length > 0;
  return {
    isDemo,
    isOnboarded: true,
    canBook: hasOpenCounter || counters.some((c) => c.status === 'paused'),
    statusCode: hasOpenCounter ? 'open' : 'paused',
    statusLabel: hasOpenCounter ? (isDemo ? 'Demo Queue Open' : 'Live Queue Open') : 'All Counters Paused / Closed',
    statusClass: hasOpenCounter ? 'status-open' : 'status-paused',
    eligibilityLabel: hasOpenCounter
      ? isDemo
        ? 'Eligible (Interactive Demo Booking)'
        : 'Eligible for Live QR Token Booking'
      : 'Counters currently paused or closed',
    waitingCount: totalWaiting,
    estWaitMin: lowestEta,
    counters,
    openCounters,
    scopeLabel: isDemo ? 'Interactive Demo Sandbox' : centre.verified ? 'Verified Bhopal Partner' : 'Onboarded (Pending Verification)',
  };
}
