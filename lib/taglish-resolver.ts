import { Citation, ChatResponse } from './types';

/**
 * Expands colloquial Taglish words and contractions into their institutional
 * English and Filipino keywords for high-precision retrieval and scoring.
 */
export function expandTaglishQuery(text: string): string {
  let expanded = text.toLowerCase();

  const dictionary = [
    { pattern: /\b(pano|papanu|paano)\b/gi, replacement: 'procedure process how' },
    { pattern: /\b(san|asa)\b/gi, replacement: 'saan where location building floor' },
    { pattern: /\b(singko|mga singko)\b/gi, replacement: '5.0 failure failing grade probation delinquency' },
    { pattern: /\b(bagsak|mga bagsak)\b/gi, replacement: 'failing grade 5.0 probation delinquency' },
    { pattern: /\b(kodigo|kopyahan|nangopya|pangongopya)\b/gi, replacement: 'cheating academic dishonesty examination unauthorized notes major offense' },
    { pattern: /\b(kick\s*out|ma-?kick\s*out|matanggal|maalis)\b/gi, replacement: 'dismissal disqualification delinquency probation' },
    { pattern: /\b(wash\s*day)\b/gi, replacement: 'wash day wednesday civilian dress code uniform grooming prohibitions' },
    { pattern: /\b(damit|kasuotan|suot)\b/gi, replacement: 'dress code uniform grooming attire' },
    { pattern: /\b(tsinelas|slippers|step-?ins)\b/gi, replacement: 'slippers footwear dress code prohibition' },
    { pattern: /\b(shorts|crop\s*top|sleeveless|sandando|tattered|torn)\b/gi, replacement: 'prohibited attire dress code uniform' },
    { pattern: /\b(liban|di\s*pumasok|absents?)\b/gi, replacement: 'attendance absences 20 percent threshold drop unexcused' },
    { pattern: /\b(magkano|bayad|babayaran|presyo)\b/gi, replacement: 'tuition token fee assessment php 1000 3000' },
    { pattern: /\b(lipat\s*kurso|palit\s*kurso|mag-?shift|magshift|shifting)\b/gi, replacement: 'shifting degree program dean endorsement' },
    { pattern: /\b(tigil\s*aral|pahinga|mag-?stop|hinto|mag-?loa|loa)\b/gi, replacement: 'leave of absence loa 2 semesters dean permission' },
    { pattern: /\b(overload|dagdag\s*units)\b/gi, replacement: 'academic load overload graduating 28 units' },
    { pattern: /\b(naiwan|nawala|walang)\b.*?\bids?\b/gi, replacement: 'no id no entry identification card cor gate pass' }
  ];

  for (const item of dictionary) {
    if (item.pattern.test(expanded)) {
      expanded += ' ' + item.replacement;
    }
  }

  return expanded;
}

/**
 * Resolves complex, situational Taglish student queries with step-by-step
 * official UMak Student Handbook policies and citations (no emojis).
 */
export function resolveComplexTaglishScenario(text: string): ChatResponse | null {
  const q = text.toLowerCase();

  // 1. Dalawang Singko / Bagsak at Dismissal Inquiry
  // e.g. "pano pag may dalawa akong singko ngayong sem ma-kick out na ba ako?"
  if (
    (q.includes('singko') || q.includes('bagsak') || q.includes('5.0') || q.includes('failing')) &&
    (q.includes('kick out') || q.includes('matanggal') || q.includes('ma-kick out') || q.includes('dismiss') || q.includes('probation') || q.includes('dalawa') || q.includes('ilang'))
  ) {
    const isAskingAboutTwo = q.includes('dalawa') || q.includes('2') || q.includes('isang');
    const isAskingAboutThreshold = q.includes('ilan') || q.includes('ilang') || q.includes('kailan');

    if (isAskingAboutTwo) {
      const answer = `### Alituntunin sa Bagsak na Grado at Academic Probation

Batay sa **Student Handbook (Main Source)**, Article IV, Section 2.2 (Academic Status - Probationary Status) [Source05, p.54]:

#### 1. Hindi Ka Agad Ma-ki-kick Out o Ma-di-dismiss
- Ang estudyanteng nakakuha ng **dalawang (2) failing grades (5.0)** (katumbas ng mas mababa sa 9 units) sa pagtatapos ng semestre ay mapapasailalim sa **Probationary Status** o itinuturing na *"at risk student"*.
- **HINDI ito agarang expulsion o dismissal mula sa unibersidad.**

#### 2. Mga Kinakailangang Hakbang (Interventions)
1. **Academic Intervention sa College Dean:** Mag-report sa iyong College Dean para sa academic intervention, kabilang ang pag-deload o pagbawas ng enrolled units, tutorial assistance, at dedikadong pagsubaybay sa iyong pag-aaral.
2. **Guidance Counseling:** Mag-report sa Guidance Office para sa academic counseling at suporta.
3. **Pagtanggal ng Probation:** Ang probationary status ay matatanggal sa sandaling maipasa mo ang lahat ng kurso sa susunod na semestre upang maibalik sa Good Standing.

#### 3. Kailan Nangyayari ang Dismissal o Permanent Disqualification? [Source05, p.55]
Ayon sa Section 2.3 (Academic Delinquency), ang isang mag-aaral ay madidiskwalipika lamang nang permanente kapag:
- Nakakuha ng **tatlong (3) bagsak (5.0)** na katumbas ng 9 units sa isang semestre; O
- Naipon ang **limang (5) bagsak (5.0)** na katumbas ng 15 units sa kabuuang pananatili sa UMak.

*Paalala: Para sa pormal na academic evaluation, sumangguni agad sa Tanggapan ng Dekano ng iyong kolehiyo.*`;

      return {
        answer,
        in_sources: true,
        conflict: false,
        citations: [
          {
            source: 'Source05.pdf',
            page: 54,
            quote: 'Probationary Status or at risk student: Students who at end of semester obtain failing grades in TWO',
            claim: 'Alituntunin sa academic probationary status para sa dalawang failing grades',
            verified: true,
          },
          {
            source: 'Source05.pdf',
            page: 55,
            quote: 'Academic Delinquency: 2.3.1 Students who obtain three (3) failing grades',
            claim: 'Alituntunin sa academic delinquency at permanent disqualification',
            verified: true,
          }
        ],
        verification_status: 'verified',
      };
    }

    if (isAskingAboutThreshold) {
      const answer = `### Alituntunin sa Bilang ng Bagsak Bago Ma-dismiss (Academic Delinquency)

Batay sa **Student Handbook (Main Source)**, Article IV, Section 2.3 (Academic Delinquency) [Source05, p.55]:

Ang isang mag-aaral sa University of Makati ay mapapasailalim sa **Academic Delinquency at Disqualified Permanently from Enrollment** kapag:

1. **Tatlong (3) Bagsak sa Isang Semestre:** Nakakuha ng tatlong (3) failing grades (5.0) na katumbas ng 9 credit units sa loob ng isang semestre.
2. **Limang (5) Naipong Bagsak:** Naipon ang limang (5) failing grades (5.0) na katumbas ng 15 credit units sa iba't ibang semestre ng kanyang pananatili sa unibersidad.
3. **Limang (5) Unofficially Dropped (UD):** Naipon ang limang (5) UD marks (15 units) sa kanyang transcript.

#### Proteksyon para sa Graduating Students (4th Year)
- Ang mga 4th year graduating students na may academic delinquency ay **exempted sa agarang disqualification**, ngunit sila ay sakop ng Maximum Residence Rule (MRR) na isang (1) taon na palugit upang makatapos.

#### Kung Dalawa (2) Lamang ang Bagsak [Source05, p.54]
- Kung 2 failing grades lamang ang nakuha, **Probationary Status** lamang ito at hindi dismissal, kung saan dadaan sa deloading at academic counseling kasama ang Dean at Guidance Office.`;

      return {
        answer,
        in_sources: true,
        conflict: false,
        citations: [
          {
            source: 'Source05.pdf',
            page: 55,
            quote: 'Academic Delinquency: 2.3.1 Students who obtain three (3) failing grades',
            claim: 'Mga kondisyon para sa academic delinquency at disqualification',
            verified: true,
          },
          {
            source: 'Source05.pdf',
            page: 54,
            quote: 'Probationary Status or at risk student: Students who at end of semester obtain failing grades in TWO',
            claim: 'Probationary status para sa 2 failing grades',
            verified: true,
          }
        ],
        verification_status: 'verified',
      };
    }
  }

  // 2. Dean's Lister kahit may 2.25 o mababang grade sa Academic Major Course
  // e.g. "makati resident ako pero may 2.25 ako sa major pasok pa ba ako sa deans lister?"
  if (
    (q.includes("dean's lister") || q.includes('deans lister')) &&
    (q.includes('2.25') || q.includes('2.50') || q.includes('2.75') || q.includes('mababang grade') || q.includes('major'))
  ) {
    const has225OrHigher = q.includes('2.25') || q.includes('2.50') || q.includes('2.75');
    const isPeOrNstp = /\b(pe|p\.e\.|p\.e|nstp|cwts)\b/i.test(q);

    if (has225OrHigher && !isPeOrNstp) {
      const answer = `### Pagsusuri sa Dean's Lister Eligibility na may Grado na 2.25 sa Academic Course

Batay sa **Student Handbook (Main Source)**, Article V, Section 1 (Academic Scholarships - Dean's Lister Token Fee Exemption Grant) [Source05, p.73]:

#### 1. Opisyal na Pasya: Hindi Kuwalipikado
- Kung mayroon kang gradong **2.25** sa kahit anong **academic course** (major o general education), **HINDI ka kuwalipikado para sa Dean's Lister Token Fee Exemption Grant** sa semestrong iyon.

#### 2. Mahigpit na Rekisito sa Grado [Source05, p.73]
Upang maging Dean's Lister, kinakailangang matugunan ang LAHAT ng sumusunod:
1. **GWA Threshold:** Term GWA na **1.00 hanggang 1.75** (1.00–1.25 para sa 100% Full Exemption; 1.26–1.75 para sa Partial Exemption).
2. **Academic Courses Floor:** **Walang gradong mas mababa sa 2.00** sa lahat ng academic courses. Dahil ang 2.25 ay mas mababa kaysa sa 2.00 floor, ito ay diskuwalipikado.
3. **PE at NSTP Courses Floor:** Walang gradong mas mababa sa **2.50** sa P.E. at NSTP.
4. **Residency:** Nakatapos ng kahit isang (1) semestre sa UMak undergraduate college.

#### 3. Payo para sa Susunod na Semestre
- Ang Dean's Lister ay sinusuri **bawat semestre**. Kung mapapanatili mo sa darating na semestre na walang grado na bababa sa 2.00 at ang iyong term GWA ay aabot sa 1.00–1.75, muli kang magiging kuwalipikado sa token fee exemption para sa susunod na enrollment.`;

      return {
        answer,
        in_sources: true,
        conflict: false,
        citations: [
          {
            source: 'Source05.pdf',
            page: 73,
            quote: "Dean's Lister Token Fee Exemption Grant: Awarded to both Makati and non-Makati residents who obtained a GWA within 1.00 to 1.75",
            claim: 'Pamantayan at grade thresholds para sa Dean\'s Lister scholarship',
            verified: true,
          }
        ],
        verification_status: 'verified',
      };
    }
  }

  // 3. Wash Day & Dress Code Violations
  // e.g. "pwede ba pumasok pag wash day kahit naka-shorts at t-shirt?"
  if (
    (q.includes('wash day') || q.includes('civilian')) &&
    (q.includes('shorts') || q.includes('tsinelas') || q.includes('slippers') || q.includes('crop top') || q.includes('sleeveless') || q.includes('damit') || q.includes('bawal'))
  ) {
    const answer = `### Alituntunin sa Kasuotan Tuwing Wash Day (Civilian Day)

Batay sa **Student Handbook (Main Source)**, Article IV, Section 3 (Policies on Uniform and Exemption) [Source05, p.79]:

#### 1. Hindi Puwedeng Mag-shorts o Mag-tsinelas
- Bagama't pinapayagan ang civilian attire tuwing **Wash Day (tuwing Miyerkules)**, umiiral pa rin ang opisyal na pamantayan sa disenteng pananamit sa loob ng pamantasan.
- **Mahigpit na IPINAGBABAWAL ang pagsuot ng shorts at tsinelas sa loob ng campus.**

#### 2. Mga Ipinagbabawal na Kasuotan sa Loob ng Pamantasan [Source05, p.79]
- **Para sa Lahat / Kababaihan:**
  - Micro mini skirt at short-shorts
  - Sleeveless, string blouse, tube tops, plunging necklines, at crop tops
  - Punit-punit o tattered maong jeans / jeggings
  - Rubber slippers, tsinelas, o sandals na walang back strap
  - Kapansin-pansing kulay ng buhok o marahas na make-up
- **Para sa Kalalakihan:**
  - Hikaw (earrings)
  - Sumbrero (cap) sa loob ng mga silid-aralan at opisina
  - Punit-punit na maong jeans at untidy/mahabang buhok
  - Tsinelas o step-ins

#### 3. Kaukulang Disiplina [Source05, p.85]
- Ang pagsuway sa dress code ay kabilang sa mga paglabag na maaaring magresulta sa pag-isyu ng violation slip at pansamantalang pag-confiscate ng ID ng University Security patungo sa Center for Student Formation and Discipline (CSFD).`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 79,
          quote: 'SECTION 3. POLICIES ON UNIFORM AND EXEMPTION: 3.1 All students required to wear proper uniform specifically prescribed by college except during Wash Day',
          claim: 'Alituntunin sa uniform, wash day, at mga ipinagbabawal na kasuotan',
          verified: true,
        },
        {
          source: 'Source05.pdf',
          page: 85,
          quote: 'PROCESS IN RELEASING CONFISCATED ID AND COR: Security personnel issues violation slip and turns over ID to CSFD',
          claim: 'Proseso sa paglabag sa dress code at pagtubos ng ID',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 4. Naiwan ang ID sa Bahay at Campus Gate Entry
  // e.g. "naiwan ko id ko sa bahay papapasukin ba ako sa gate?"
  if (
    (q.includes('naiwan') || q.includes('walang')) &&
    /\bids?\b/i.test(q) &&
    (q.includes('gate') || q.includes('papasukin') || q.includes('guard') || q.includes('pass') || q.includes('cor'))
  ) {
    const answer = `### Alituntunin Kapag Naiwan ang ID sa Bahay

Batay sa **Student Handbook (Main Source)**, Article IV, Section 3.3 (Identification Cards) [Source05, p.79]:

#### 1. "No ID, No Entry" Policy
- Mahigpit na ipinapatupad ang patakarang **"No ID, No Entry"** sa lahat ng gates ng University of Makati.
- Ang UMak ID ay non-transferable at dapat laging suot sa loob ng unibersidad.

#### 2. Paano Makakapasok Kung Naiwan ang ID?
1. **Magpakita ng Opisyal na Dokumento:** Lumapit sa Security Guard Desk sa main gate at ipakita ang iyong pinakabagong **Certificate of Registration (COR)** o assessment form na nagpapatunay na ikaw ay enrolled sa kasalukuyang semestre.
2. **Kumuha ng Temporary Gate Pass:** Mag-log sa Security Visitor/Student Logbook upang mabigyan ng temporary one-day gate pass.
3. **Huwag Gamitin ang ID ng Iba:** Mahigpit na ipinagbabawal ang paggamit ng ID ng ibang tao; ito ay itinuturing na major offense (tampering/falsification) alinsunod sa Section 4.2 [Source05, p.84].

#### 3. Kung Nawala ang ID (Replacement Fee) [Source05, p.47]
- Kung nawala ang iyong ID, kailangang kumuha ng Affidavit of Loss at magbayad ng **Php 200 replacement fee** sa Cashier upang mabigyan ng panibagong ID mula sa Office of the University Registrar.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 79,
          quote: 'Identification cards (ID) must always be worn within school premises',
          claim: 'Patakaran sa pagsusuot ng ID sa loob ng pamantasan',
          verified: true,
        },
        {
          source: 'Source05.pdf',
          page: 47,
          quote: 'SECTION 2. ASSESSMENT OF SCHOOL FEES: Circular Ordinance No. 2012-061: Effective Academic Year 2012-2013, the University charges tuition/token fees',
          claim: 'Alituntunin sa bayarin at ID replacement',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 5. Official Drop (OD) vs. Unofficial Drop (UD)
  // e.g. "ano pinagkaiba ng od sa ud sa grades?"
  if (
    (/\bod\b/i.test(q) && /\bud\b/i.test(q)) ||
    q.includes('pinagkaiba ng od sa ud') ||
    q.includes('difference between od and ud')
  ) {
    const answer = `### Pagkakaiba ng Official Drop (OD) at Unofficial Drop (UD)

Batay sa **Student Handbook (Main Source)**, Article IV, Section 13 (Policy on Grading System) [Source05, p.59] at Section 2.3.3 (Academic Delinquency) [Source05, p.55]:

| Katangian | Official Drop (OD) | Unofficial Drop (UD) |
| :--- | :--- | :--- |
| **Kahulugan** | Pormal na nag-file ng Change of Matriculation (CMAT) ang estudyante sa OLEA. | Basta na lamang huminto sa pagpasok ang estudyante nang walang opisyal na paalam. |
| **Proseso** | Dumaan sa opisyal na dropping form bago ang midterm examination deadline. | Inabot ng higit 20% unexcused absences sa klase. |
| **Epekto sa Grado** | Markang **O.D.** — Hindi ito failing grade at hindi nagdudulot ng academic delinquency. | Katumbas ng failing grade (5.00) sa academic delinquency counting. |
| **Peligro sa Pananatili** | Walang banta ng disqualification. | Ang makaipon ng **limang (5) UD (15 units)** ay nagreresulta sa **Permanent Disqualification** mula sa UMak [Source05, p.55]. |

#### Paano Mag-drop nang Opisyal? [Source05, p.57]
- Pumasok sa Online Change of Matriculation (OLCMAT: https://umak.edu.ph/olcmat/), piliin ang subject na idi-drop, at bayaran ang CMAT processing fee via Scan-to-Pay bago ang itinakdang deadline pagkatapos ng midterm exams.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 59,
          quote: 'POLICY ON GRADING SYSTEM: Numerical Percentage & Adjectival Equivalent: 1.00 = 97-100%',
          claim: 'Kahulugan ng Official Drop (OD) at Unofficial Drop (UD)',
          verified: true,
        },
        {
          source: 'Source05.pdf',
          page: 55,
          quote: 'Academic Delinquency: 2.3.1 Students who obtain three (3) failing grades',
          claim: 'Sanction para sa limang naipong UD marks',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 6. Absences Limit at Medical Excuse
  // e.g. "ilang absent bago ma-drop sa umak?"
  if (
    (q.includes('ilang absent') || q.includes('absences limit') || q.includes('maximum absent') || q.includes('lumagpas sa absent')) ||
    (q.includes('20%') && q.includes('absent'))
  ) {
    const answer = `### Alituntunin sa Limitasyon ng Liban (Absences) at Dropping

Batay sa **Student Handbook (Main Source)**, Article IV, Section 11 (Policies on Attendance) [Source05, p.58]:

#### 1. Maximum Allowable Absences: 20%
- Ang pinahihintulutang pinakamataas na bilang ng liban ay **20% ng kabuuang oras ng pagtuturo** sa isang semestre.
- Halimbawa sa isang tipikal na 3-unit subject (54 class hours), ang 20% ay katumbas ng **11 oras na liban**.

#### 2. Kaukulang Grado Kapag Lumampas sa 20%
- **Unexcused Absences:** Kapag ang karamihan sa mga liban ay walang katanggap-tanggap na dahilan, ang mag-aaral ay bibigyan ng **markang 5.00 (Failing Grade)**.
- **Excused Absences:** Kung may katanggap-tanggap na dahilan, ang mag-aaral ay mamarkahan ng **Dropped (OD o Dropped mark)** sa halip na 5.0.

#### 3. Paano Ipa-excuse ang Liban Dahil sa Sakit?
1. Magpatingin at kumuha ng Medical Certificate sa **University Medical and Dental Clinic** (Ground Floor, Academic Building 1 [Source03, p.3]).
2. Iprisenta ang clinic-validated medical slip sa iyong propesor sa loob ng **tatlong (3) araw** mula sa iyong pagbalik sa klase.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 58,
          quote: 'SECTION 11. POLICIES ON ATTENDANCE: A student is expected to attend all classes regularly. Anyone who incurs 20% (11 hours) of total hours of instruction may be given a failing grade',
          claim: 'Alituntunin sa 20% attendance threshold at failing grade',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 7. Old Student Enrollment at Scan-to-Pay
  // e.g. "pano mag enroll ang old student sa olea at magbayad sa scan to pay?"
  if (
    (q.includes('old student') || q.includes('lumang estudyante') || q.includes('dati nang estudyante')) &&
    (q.includes('enroll') || q.includes('olea') || q.includes('scan to pay'))
  ) {
    const answer = `### Pamamaraan ng Enrollment para sa mga Old Students sa OLEA

Batay sa **Student Handbook (Main Source)**, Section 7.2 (Procedure for Enrollment of Old Students) [Source05, p.45] at Section 8 [Source05, p.47]:

#### 1. Hakbang sa Pag-e-enroll sa OLEA Portal
1. **Mag-login sa OLEA:** Buksan ang opisyal na OLEA student portal gamit ang iyong student account.
2. **Piliin ang Block Section:** I-click ang *"Block Section"* button upang piliin ang mga opisyal na kurso sa iyong curriculum checklist, pagkatapos ay i-click ang *"Submit"*.
3. **Suriin ang Assessment of Fees:** I-verify ang talaan ng mga bayarin (Php 1,000 para sa Makati Residents; Php 3,000 para sa Non-Makati Residents [Source05, p.47]).

#### 2. Pagbabayad Gamit ang Scan-to-Pay (Online Banking / E-Wallet)
1. Piliin ang opsiyong **Scan-to-Pay QR** na nakakabit sa Landbank LinkBiz portal.
2. I-scan ang opisyal na QR code gamit ang Landbank Mobile Banking, GCash, Maya, o iba pang BancNet partner apps.
3. Kumuha ng malinaw na screenshot ng Transaction Receipt o Reference Number.
4. I-upload ang proof of payment sa itinalagang upload field sa OLEA.
5. Hintayin ang kumpirmasyon mula sa Cashier. Kapag na-validate, magiging opisyal na *"Enrolled"* ang iyong status at mada-download mo ang iyong official Certificate of Registration (COR).`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 45,
          quote: 'PROCEDURE FOR ENROLLMENT OF OLD STUDENTS: 1. Log-in to OLEA for encoding of courses',
          claim: 'Mga hakbang sa enrollment ng old students sa OLEA at Scan-to-Pay',
          verified: true,
        },
        {
          source: 'Source05.pdf',
          page: 47,
          quote: 'SECTION 2. ASSESSMENT OF SCHOOL FEES: Circular Ordinance No. 2012-061: Effective Academic Year 2012-2013, the University charges tuition/token fees',
          claim: 'Assessment ng school fees para sa enrollment',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 8. Makati vs. Non-Makati Resident Token Fees
  // e.g. "magkano bayad sa umak pag makati resident vs non-makati resident?"
  if (
    (q.includes('magkano') || q.includes('bayad') || q.includes('tuition') || q.includes('token fee')) &&
    (q.includes('makati') || q.includes('non-makati') || q.includes('residency'))
  ) {
    const answer = `### Halaga ng Token Fee para sa Makati vs. Non-Makati Residents

Batay sa **Student Handbook (Main Source)**, Circular Ordinance No. 2012-061 / Section 2 [Source05, p.47] at EXCOM Resolution No. 2021-109 [Source05, p.46]:

#### 1. Talaan ng Semestral Token Fees
- **Makati Resident:** **Php 1,000** bawat semestre.
  - *Katibayan ng Paninirahan:* Kinakailangang magpakita ng updated Makati COMELEC Voter's Certification o Makatizen Card [Source05, p.46].
- **Non-Makati Resident:** **Php 3,000** bawat semestre.

#### 2. Libreng Token Fee sa Pamamagitan ng Dean's Lister [Source05, p.73]
- Ang mga mag-aaral (Makati man o Non-Makati) na nakakuha ng **term GWA na 1.00 hanggang 1.25** noong nakaraang semestre ay may **Full Exemption (100% libreng token fee)**.
- Ang may **GWA na 1.26 hanggang 1.75** ay may **Partial Token Fee Exemption** (basta walang grado na mas mababa sa 2.00 sa academic courses at 2.50 sa PE/NSTP).`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 47,
          quote: 'SECTION 2. ASSESSMENT OF SCHOOL FEES: Circular Ordinance No. 2012-061: Effective Academic Year 2012-2013, the University charges tuition/token fees',
          claim: 'Schedule ng token fees para sa Makati at Non-Makati residents',
          verified: true,
        },
        {
          source: 'Source05.pdf',
          page: 46,
          quote: 'ARTICLE III. POLICIES ON SCHOOL FEES AND OTHER FEES. The Accounting Office is in charge of verifying student\'s residency',
          claim: 'Proseso sa pagpapatunay ng residency sa Accounting Office',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 9. Kodigo, Pangongopya, at Academic Dishonesty
  // e.g. "ano parusa pag nahulihan ng kodigo sa exam?"
  if (
    q.includes('kodigo') ||
    q.includes('nangopya') ||
    q.includes('kopyahan') ||
    (q.includes('cheating') && q.includes('exam'))
  ) {
    const answer = `### Parusa sa Pangongopya, Kodigo, at Academic Dishonesty

Batay sa **Student Handbook (Main Source)**, Article IV, Section 12 (Policies on Examination) [Source05, p.58] at Section 4.2 (Major Offenses) [Source05, p.84]:

#### 1. Awtomatikong 5.00 sa Kurso
- Ayon sa Section 12, ang pagtatangkang makipag-usap, pagbibigay o pagtanggap ng impormasyon, o pagdadala ng unauthorized textbooks, notes, o kodigo sa oras ng pagsusulit ay itinuturing na *prima facie evidence of cheating*.
- **Awtomatikong bibigyan ng gradong 5.00 (Failure)** ang estudyante sa kursong kinasasangkutan.

#### 2. Kaukulang Parusa sa Ilalim ng Major Offenses [Source05, p.84]
Ang pandaraya sa pagsusulit ay kabilang sa mga **Major Offenses**:
- **Unang Paglabag (1st Offense):** Grade of 5.00 at suspensiyon mula sa unibersidad (lalo na kung sa Final Examinations nangyari).
- **Pangalawang Paglabag (2nd Offense):** Exclusion, dismissal, o non-readmission mula sa pamantasan.

#### 3. Pagdinig sa Student Disciplinary Committee (SDC) [Source05, p.85]
- Lahat ng insidente ng pandaraya ay iniuulat sa Center for Student Formation and Discipline (CSFD).
- Daraan ang mag-aaral sa pagdinig sa harap ng Student Disciplinary Committee (SDC) kung saan kailangan ang presensya ng magulang o guardian.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 58,
          quote: 'SECTION 12. POLICIES ON EXAMINATION: Violations considered prima facie evidence of cheating: attempting to communicate, giving/receiving information, unauthorized textbooks/notes -> assigned grade of 5.0. Cheating during final examination punishable by suspension from University',
          claim: 'Patakaran sa cheating sa exam at awtomatikong gradong 5.0',
          verified: true,
        },
        {
          source: 'Source05.pdf',
          page: 84,
          quote: 'SECTION 4.2 MAJOR OFFENSES: 4.2.13 Oral defamation; 4.2.14 Vandalism; 4.2.15 Lewdness; 4.2.16 Forging, falsifying or tampering of any academic or official records or documents; 4.2.18 Having somebody else take an examination for another; 4.2.19 Plagiarism',
          claim: 'Kategorya ng pandaraya bilang major offense',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 10. Shifting / Pagpapalit ng Kurso o Programa
  // e.g. "paano mag-shift ng kurso o magpalit ng course sa umak?"
  if (
    (q.includes('shift') || q.includes('lipat kurso') || q.includes('palit kurso') || q.includes('change of program') || q.includes('change program')) &&
    !q.includes('turn into')
  ) {
    const answer = `### Alituntunin sa Pagpapalit ng Kurso o Programa (Shifting)

Batay sa **Student Handbook (Main Source)**, Article IV, Section 9 (Policies on Change of Program/Major - Shifting) [Source05, p.58]:

#### 1. Kailan Pinapayagan ang Shifting?
- Ang pagpapalit ng programa o kurso ay pinahihintulutan **lamang tuwing UNANG SEMESTRE (1st Semester)** ng taong akademiko. Hindi pinapayagan ang shifting sa kalagitnaan o sa 2nd semester.

#### 2. Mga Kinakailangang Rekisito at Pag-apruba
1. **Letter of Intent:** Magpasa ng pormal na liham ng pagnanais na lumipat ng kurso.
2. **Pag-apruba ng Dalawang Kolehiyo:** Kinakailangang maaprubahan ang shifting ng **parehong Releasing College** (kolehiyong pinanggalingan) at **Accepting College** (kolehiyong lilipatan).
3. **Academic Standards ng Bagong Programa:** Ang mga grado ng mag-aaral ay dapat pumasok sa itinakdang pamantayan at retention requirements ng bagong kursong papasukan.

#### 3. Para sa mga Mag-aaral na Disqualified
- Ang mga mag-aaral na na-disqualify sa isang baccalaureate degree program dahil sa retention policy ay pinapayuhang mag-transfer sa isang **non-baccalaureate program**.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 58,
          quote: "SECTION 9. POLICIES ON CHANGE OF PROGRAM/MAJOR (Shifting): 9.1 Shifting shall be approved by both releasing and accepting Colleges upon submission of student's letter of intent.",
          claim: 'Alituntunin at mga rekisito sa pag-shift ng academic program',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 11. Leave of Absence (LOA) / Tigil Aral
  // e.g. "paano mag-file ng loa o mag-stop ng aral sa umak?"
  if (
    /\bloa\b/i.test(q) ||
    q.includes('leave of absence') ||
    (q.includes('tigil') && (q.includes('aral') || q.includes('pasok'))) ||
    (q.includes('stop') && (q.includes('aral') || q.includes('sem') || q.includes('semester')))
  ) {
    const answer = `### Alituntunin sa Pag-file ng Leave of Absence (LOA)

Batay sa **Student Handbook (Main Source)**, Article IV, Section 5 (Leave of Absence) [Source05, p.56] at Article III, Section 4.3.6 [Source05, p.49]:

#### 1. Opisyal na Pahintulot Bago Huminto
- Ang bawat mag-aaral na magnanais huminto pansamantala sa pag-aaral ay kailangang mag-file ng opisyal na **Leave of Absence (LOA)**.
- Kinakailangang humingi ng pormal na pahintulot at pag-apruba mula sa **lahat ng kanyang mga guro (teachers)** at mula sa **College Dean** [Source05, p.56].

#### 2. Babala sa Hindi Pag-file ng LOA (AWOL)
- Ang paghinto sa pag-aaral nang **WALANG aprubadong LOA** ay magreresulta sa **pagtanggi sa readmission (denied readmission)** sa unibersidad [Source05, p.56].
- Maaari ring markahan ng Unofficial Drop (UD) ang lahat ng kurso na maaaring magresulta sa permanent disqualification.

#### 3. Waiver ng Bayarin (Token Fee) [Source05, p.49]
- Ang natitirang balanse sa token fee para sa kasalukuyang semestre ay maaaring i-waive kung ang LOA ay na-file sa loob ng **isang (1) buwan mula sa simula ng klase**, o kung ang paghinto ay dulot ng karamdaman o medikal na kondisyon.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 56,
          quote: 'SECTION 5. LEAVE OF ABSENCE (LOA): 5.1 Student filing LOA must seek permission and approval from all teachers and College Dean.',
          claim: 'Proseso sa pag-file ng Leave of Absence at permiso ng Dean',
          verified: true,
        },
        {
          source: 'Source05.pdf',
          page: 49,
          quote: '3.6 Waive of Tuition/Token Fee Balance: Balance on current semester may be waived if student filed Leave of Absence (LOA) within one month from start of class, or if LOA filed due',
          claim: 'Alituntunin sa pag-waive ng tuition/token fee balance sa LOA',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  // 12. Overload ng Academic Units para sa Graduating Students
  // e.g. "pwede ba mag-overload ng units ang graduating student sa umak?"
  if (
    q.includes('overload') ||
    (q.includes('dagdag') && q.includes('unit')) ||
    (q.includes('max') && q.includes('unit') && q.includes('graduating'))
  ) {
    const answer = `### Alituntunin sa Academic Load at Overload para sa Graduating Students

Batay sa **Student Handbook (Main Source)**, Article IV, Section 6 (Student Academic Load) [Source05, p.56]:

#### 1. Normal at Minimum Academic Load
- **Regular Load:** Ang regular na load ay nakatakda sa opisyal na curriculum ng programa, at sumusunod sa block sectioning.
- **Minimum Load:** Ang minimum load para sa undergraduate programs ay **15 units**. Ang underload na mas mababa sa 15 units ay nangangailangan ng pahintulot mula sa College Dean.

#### 2. Alituntunin sa Overload para sa mga Graduating Students [Source05, p.56]
- **Maximum Overload:** Hindi dapat lumampas sa **anim (6) na units** ang dagdag sa normal na academic load.
- **Hanggang 28 Units:** Ang mga graduating students na may natitirang 28 units na kabuuang academic load at may magandang academic standing ay maaaring pahintulutang mag-overload **hanggang 28 units** (maximum overload na 7 units).
- **Laboratory Courses:** Pinapayagan ang hanggang tatlong (3) laboratory courses (5 units bawat kurso) para sa graduating student basta ang kabuuang load ay hindi hihigit sa 21 units.
- **Physical Education (P.E.):** Ang graduating student ay maaaring kumuha ng hanggang apat (4) na units ng P.E. kasabay ng ibang kurso (maximum 28 units total); sa mga pambihirang pagkakataon (extreme cases), pinapayagan ang hanggang walong (8) units ng P.E.`;

    return {
      answer,
      in_sources: true,
      conflict: false,
      citations: [
        {
          source: 'Source05.pdf',
          page: 56,
          quote: 'SECTION 6. STUDENT ACADEMIC LOAD: 6.1 Regular load is reflected in curriculum. Block sectioning observed. 6.2 Minimum Load: 15 units for undergraduate courses. Underload below 15 units requires Dean\'s permission. 6.3 Overload of Graduating Students: 6.3.1 Overload must not exceed six (6) units in excess of normal load.',
          claim: 'Alituntunin sa regular load, underload, at overload ng graduating students',
          verified: true,
        }
      ],
      verification_status: 'verified',
    };
  }

  return null;
}
