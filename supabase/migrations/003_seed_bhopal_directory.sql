-- ============================================================================
-- SmartQ Bhopal — Idempotent Seed Data Migration (003)
-- Run AFTER 001_smartq_schema.sql and 002_rls_policies_and_rpcs.sql.
--
-- Seeds:
--   1. Default platform policy settings singleton (app_settings.id = 'default')
--   2. 30 Bhopal template service categories (matching bhopalData.js)
--   3. 17 real Bhopal directory establishments (matching BHOPAL_SEED_BUSINESSES)
--
-- STRICT DATA ACCURACY: Zero fabricated phone numbers, hours, or fake live queues.
-- Idempotent: uses ON CONFLICT (id) DO NOTHING so re-running never overwrites
-- live onboarded businesses, custom settings, or administrator edits.
-- ============================================================================

-- 1. Default App Settings Singleton
insert into public.app_settings (
  id,
  notify_at_five,
  notify_at_three,
  notify_at_one,
  notify_approaching,
  notify_eta_change,
  no_show_grace_sec,
  auto_no_show_enabled,
  auto_advance_on_no_show,
  priority_rules
)
values (
  'default',
  true,
  true,
  true,
  true,
  true,
  180,
  true,
  true,
  '{"senior":true,"medical":true,"accessibility":true,"vip":false,"requireReason":true}'::jsonb
)
on conflict (id) do nothing;

-- 2. Service Categories (30 Bhopal Counter Templates)
insert into public.service_categories (
  id, name, name_hi, code, default_duration_min, description, directory_category_id, active, is_template_service
) values
  ('SVC_OPD_REG', 'OPD Registration', 'ओपीडी पंजीकरण', 'OR', 6, 'Configured counter service for Hospitals & Clinics.', 'DIR_HOSPITALS', true, true),
  ('SVC_GEN_MED', 'General Medicine', 'सामान्य चिकित्सा', 'GM', 12, 'Configured counter service for Hospitals & Clinics.', 'DIR_HOSPITALS', true, true),
  ('SVC_DENTAL_OPD', 'Dental OPD', 'डेंटल ओपीडी', 'DN', 15, 'Configured counter service for Hospitals & Clinics.', 'DIR_HOSPITALS', true, true),
  ('SVC_HOSP_BILL', 'Hospital Billing', 'अस्पताल बिलिंग', 'HB', 5, 'Configured counter service for Hospitals & Clinics.', 'DIR_HOSPITALS', true, true),
  ('SVC_LAB_SAMPLE', 'Sample Collection', 'सैंपल कलेक्शन', 'SC', 8, 'Configured counter service for Diagnostic & Pathology Labs.', 'DIR_DIAGNOSTICS', true, true),
  ('SVC_LAB_BILL', 'Lab Billing', 'लैब बिलिंग', 'LB', 5, 'Configured counter service for Diagnostic & Pathology Labs.', 'DIR_DIAGNOSTICS', true, true),
  ('SVC_LAB_REPORT', 'Report Collection', 'रिपोर्ट कलेक्शन', 'RC', 4, 'Configured counter service for Diagnostic & Pathology Labs.', 'DIR_DIAGNOSTICS', true, true),
  ('SVC_RET_BILL', 'Retail Billing', 'रिटेल बिलिंग', 'RB', 5, 'Configured counter service for Shopping & Retail Stores.', 'DIR_SHOPPING', true, true),
  ('SVC_RET_RETURNS', 'Returns & Exchange', 'रिटर्न एवं एक्सचेंज', 'RT', 8, 'Configured counter service for Shopping & Retail Stores.', 'DIR_SHOPPING', true, true),
  ('SVC_RET_CS', 'Customer Service', 'ग्राहक सेवा', 'CS', 7, 'Configured counter service for Shopping & Retail Stores.', 'DIR_SHOPPING', true, true),
  ('SVC_BNK_CASH', 'Cash Counter', 'नकद काउंटर', 'CC', 6, 'Configured counter service for Banks & Financial Services.', 'DIR_BANKS', true, true),
  ('SVC_BNK_DEP', 'Deposit Desk', 'जमा डेस्क', 'DP', 6, 'Configured counter service for Banks & Financial Services.', 'DIR_BANKS', true, true),
  ('SVC_BNK_WDR', 'Withdrawal Desk', 'निकासी डेस्क', 'WD', 6, 'Configured counter service for Banks & Financial Services.', 'DIR_BANKS', true, true),
  ('SVC_BNK_ENQ', 'Customer Enquiry', 'ग्राहक पूछताछ', 'CE', 9, 'Configured counter service for Banks & Financial Services.', 'DIR_BANKS', true, true),
  ('SVC_GOV_ENQ', 'Citizen Enquiry', 'नागरिक पूछताछ', 'GE', 8, 'Configured counter service for Government & Citizen Services.', 'DIR_GOVT', true, true),
  ('SVC_GOV_CERT', 'Certificate Services', 'प्रमाणपत्र सेवाएं', 'CT', 10, 'Configured counter service for Government & Citizen Services.', 'DIR_GOVT', true, true),
  ('SVC_GOV_DOC', 'Document Verification', 'दस्तावेज़ सत्यापन', 'DV', 12, 'Configured counter service for Government & Citizen Services.', 'DIR_GOVT', true, true),
  ('SVC_SAL_CUT', 'Haircut', 'हेयरकट', 'HC', 25, 'Configured counter service for Salons & Beauty Services.', 'DIR_SALONS', true, true),
  ('SVC_SAL_STYLE', 'Hair Styling', 'हेयर स्टाइलिंग', 'HS', 30, 'Configured counter service for Salons & Beauty Services.', 'DIR_SALONS', true, true),
  ('SVC_SAL_FACIAL', 'Facial & Skin Care', 'फेशियल एवं स्किन केयर', 'FC', 40, 'Configured counter service for Salons & Beauty Services.', 'DIR_SALONS', true, true),
  ('SVC_SAL_BILL', 'Salon Billing', 'सैलून बिलिंग', 'SB', 4, 'Configured counter service for Salons & Beauty Services.', 'DIR_SALONS', true, true),
  ('SVC_EDU_ADM', 'Admissions Enquiry', 'प्रवेश पूछताछ', 'AD', 12, 'Configured counter service for Education & Coaching.', 'DIR_EDUCATION', true, true),
  ('SVC_EDU_FEE', 'Fee Counter', 'शुल्क काउंटर', 'FE', 6, 'Configured counter service for Education & Coaching.', 'DIR_EDUCATION', true, true),
  ('SVC_EDU_COUNS', 'Student Counselling', 'छात्र परामर्श', 'CN', 15, 'Configured counter service for Education & Coaching.', 'DIR_EDUCATION', true, true),
  ('SVC_RST_TBL', 'Table Waitlist', 'टेबल वेटलिस्ट', 'TW', 15, 'Configured counter service for Restaurants & Food Services.', 'DIR_RESTAURANTS', true, true),
  ('SVC_RST_PKP', 'Takeaway Pickup', 'टेकअवे पिकअप', 'PK', 6, 'Configured counter service for Restaurants & Food Services.', 'DIR_RESTAURANTS', true, true),
  ('SVC_RST_BILL', 'Restaurant Billing', 'रेस्टोरेंट बिलिंग', 'FB', 4, 'Configured counter service for Restaurants & Food Services.', 'DIR_RESTAURANTS', true, true),
  ('SVC_OTH_REC', 'General Reception', 'सामान्य स्वागत कक्ष', 'GR', 8, 'Configured counter service for Other Local Services.', 'DIR_OTHER', true, true),
  ('SVC_OTH_SRV', 'Service Desk', 'सेवा डेस्क', 'SD', 10, 'Configured counter service for Other Local Services.', 'DIR_OTHER', true, true),
  ('SVC_OTH_BILL', 'Billing Counter', 'बिलिंग काउंटर', 'BL', 5, 'Configured counter service for Other Local Services.', 'DIR_OTHER', true, true)
on conflict (id) do nothing;

-- 3. Real Bhopal Directory Establishments (17 listings; unverified directory scope by default)
insert into public.businesses (
  id, name, name_hi, directory_category_id, area, locality, area_tags, address, city,
  phone, open_time, close_time, data_scope, is_onboarded, booking_enabled, verified, is_active
) values
  ('BPL_AIIMS', 'AIIMS Bhopal', 'एम्स भोपाल', 'DIR_HOSPITALS', 'Saket Nagar', 'Saket Nagar', array['Saket Nagar'], 'Saket Nagar, Bhopal, Madhya Pradesh 462020', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_BMHRC', 'Bhopal Memorial Hospital & Research Centre', 'भोपाल मेमोरियल हॉस्पिटल एंड रिसर्च सेंटर', 'DIR_HOSPITALS', 'Karond', 'Karond', array['Karond'], 'Raisen Bypass Road, Karond, Bhopal, Madhya Pradesh 462038', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_JP_HOSP', 'Government Jai Prakash District Hospital', 'शासकीय जयप्रकाश जिला चिकित्सालय', 'DIR_HOSPITALS', 'TT Nagar', 'Tulsi Nagar', array['TT Nagar', 'New Market'], 'Link Road No. 1, Tulsi Nagar, Bhopal, Madhya Pradesh 462003', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_HAMIDIA', 'Hamidia Hospital', 'हमीदिया अस्पताल', 'DIR_HOSPITALS', 'Old Bhopal', 'Royal Market', array['Old Bhopal'], 'Sultania Road, Royal Market, Old Bhopal, Madhya Pradesh 462001', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_KAMLA_NEHRU', 'Kamla Nehru Hospital', 'कमला नेहरू अस्पताल', 'DIR_HOSPITALS', 'Old Bhopal', 'Hamidia Campus', array['Old Bhopal'], 'Hamidia Hospital Campus, Sultania Road, Old Bhopal, Madhya Pradesh 462001', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_KASTURBA', 'Kasturba Hospital', 'कस्तूरबा अस्पताल', 'DIR_HOSPITALS', 'Habibganj', 'Habibganj', array['Habibganj'], 'BHEL Township, Habibganj, Bhopal, Madhya Pradesh 462024', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_SAGAR_MULTI', 'Sagar Multispeciality Hospital', 'सागर मल्टीस्पेशलिटी हॉस्पिटल', 'DIR_HOSPITALS', 'Hoshangabad Road', 'Hoshangabad Road', array['Hoshangabad Road'], 'Narmadapuram (Hoshangabad) Road, Bhopal, Madhya Pradesh 462026', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_PEOPLES', 'People''s Hospital', 'पीपुल्स हॉस्पिटल', 'DIR_HOSPITALS', 'Bhanpur', 'Bhanpur', array['Bhanpur', 'Ayodhya Bypass'], 'People''s Campus, Bhanpur, Bhopal, Madhya Pradesh 462037', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_LAL_PATHLABS', 'Dr Lal PathLabs', 'डॉ. लाल पैथलैब्स', 'DIR_DIAGNOSTICS', 'MP Nagar', 'MP Nagar', array['MP Nagar'], 'MP Nagar, Bhopal, Madhya Pradesh 462011', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_DB_CITY', 'DB City Mall', 'डीबी सिटी मॉल', 'DIR_SHOPPING', 'MP Nagar', 'MP Nagar', array['MP Nagar'], 'Arera Hills, Zone-I, MP Nagar, Bhopal, Madhya Pradesh 462011', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_AASHIMA', 'Aashima Mall', 'आशिमा मॉल', 'DIR_SHOPPING', 'Hoshangabad Road', 'Bawadiya Kalan', array['Hoshangabad Road'], 'Hoshangabad Road, Bawadiya Kalan, Bhopal, Madhya Pradesh 462026', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_VISHAL_MEGA', 'Vishal Mega Mart', 'विशाल मेगा मार्ट', 'DIR_SHOPPING', 'MP Nagar', 'MP Nagar', array['MP Nagar'], 'MP Nagar, Bhopal, Madhya Pradesh 462011', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_CHOWK_BAZAAR', 'Chowk Bazaar', 'चौक बाज़ार', 'DIR_SHOPPING', 'Old Bhopal', 'Old Bhopal', array['Old Bhopal'], 'Chowk Bazaar, Old Bhopal, Madhya Pradesh 462001', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_NIKKY_BAWA', 'Nikky Bawa Family Salon', 'निक्की बावा फैमिली सैलून', 'DIR_SALONS', 'TT Nagar', 'TT Nagar', array['TT Nagar', 'New Market'], 'TT Nagar, Bhopal, Madhya Pradesh 462003', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_YASHI_SALON', 'YASHI''s Beauty Salon', 'याशीज़ ब्यूटी सैलून', 'DIR_SALONS', 'Lalghati', 'Lalghati', array['Lalghati'], 'Lalghati, Bhopal, Madhya Pradesh 462030', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_KARISHMA_LOUNGE', 'KARISHMA Beauty Lounge', 'करिश्मा ब्यूटी लाउंज', 'DIR_SALONS', 'New Market', 'Malviya Nagar', array['New Market', 'TT Nagar'], 'Malviya Nagar, Near New Market, Bhopal, Madhya Pradesh 462003', 'Bhopal', '', '', '', 'directory', false, false, false, true),
  ('BPL_JCB_SALON', 'Jean-Claude Biguine', 'ज्याँ-क्लॉद बिगुइन', 'DIR_SALONS', 'Arera Colony', 'Arera Colony', array['Arera Colony'], 'Arera Colony, Bhopal, Madhya Pradesh 462016', 'Bhopal', '', '', '', 'directory', false, false, false, true)
on conflict (id) do nothing;
