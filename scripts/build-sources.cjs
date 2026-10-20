const fs = require('fs');
const path = require('path');

const sourcesData = [
  // ================= SOURCE 05: STUDENT HANDBOOK (Main Source, 287 Pages) =================
  {
    id: "s5_p12_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 12,
    section: "Article I. University Seal, Vision, Mission, and Core Values",
    content: "ARTICLE I. THE UNIVERSITY OF MAKATI. The University of Makati (UMak) is a premier local university committed to quality education, social responsibility, and national development. The University Seal features the Great Blue Heron (Ardea herodias), symbolizing dignity, resilience, grace, and focused determination in overcoming adversity. The torch signifies the light of truth and academic excellence guiding Makatizens; the gear represents technology, industry, and workforce empowerment. Core Values: Competence, Integrity, Innovation, Resilience, and Service to the Community."
  },
  {
    id: "s5_p33_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 33,
    section: "Article II. Section 1. Admission Policies and Eligibility",
    content: "ARTICLE II. ADMISSION REQUIREMENTS AND ENROLLMENT PROCEDURE. The University through the Center for Admission and Scholarship in collaboration with the Office of the Vice President for Academic Affairs and the Office of the Vice President for Student Services and Community Development is responsible for policies and procedures on admission and enrollment. SECTION 1. ADMISSION POLICIES AND PROCEDURES: 1.1 For College Admission, the following may be admitted: 1.1.1 Graduates of Senior High School; 1.1.2 Passers of Alternative Learning System (ALS) who passed the ALS Accreditation and Equivalency (A&E) Test and are eligible to transfer to college as indicated in the ALS Certificate of Rating; 1.1.3 Transferees: (1) Students with Senior High School diploma, (2) Students who have entered college prior to the full implementation of senior high school must have completed at least two (2) years or four (4) semesters in college with the following requirements: Has met the General Weighted Average (GWA) and other requirements of the College; Has no failing grades equivalent to nine (9) units; Has no accumulated Unofficially Dropped (UD) courses for a total of nine (9) units in one semester or fifteen (15) units from the previous school upon application; 1.1.4 Second Coursers: Students who have completed a degree/program and wish to pursue another degree in the University and have met the grade requirements of the college."
  },
  {
    id: "s5_p33_2",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 33,
    section: "Article II. Section 1.2 Criteria for Classification as Makati Resident",
    content: "1.2 Criteria for Classification as Makati Resident: The University of Makati prioritizes Makati residents during admission. Thus, residency verification is applied for by a student-applicant to determine the amount of token fee to be paid during enrollment. Consequently, a Residency Verification Form (RVF) from the University of Makati Accounting Office shall be accomplished by student-applicants upon registration to the College Qualifying Examination."
  },
  {
    id: "s5_p34_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 34,
    section: "Article II. Section 1.2 EXCOM Resolution No. 2021-109 Residency Verification",
    content: "Based on EXCOM Resolution No. 2021-109 dated March 18, 2021, a student-applicant may be classified as MAKATI RESIDENT if ANY of the following requirements is submitted: FOR INCOMING COLLEGE FRESHMEN: 1. Report Card from Makati public high school or Report Card from non-Makati public high school but parents are voters/residents of Makati; 2. Voter’s Certification of student-applicant; 3. Verification (list) or Certification to be provided by DepEd-Makati or Higher School ng UMak (HSU). *OPTIONAL (For incoming students 18 years old and above): Voter’s Certificate issued after the recent local or national elections, whichever is most recent. *ON A CASE-TO-CASE BASIS: Student interview may be conducted; presented with Affidavit of Guardianship and Voter’s Certificate of guardian (sibling, aunt/uncle, grandparents) issued after recent local or national elections. NOTES: DepEd-Makati/HSU list considered Makati resident for one academic year as encouraged to register as voter; Failure to submit requirements shall mean classification as non-Makati resident; Any misrepresentation shall warrant expulsion."
  },
  {
    id: "s5_p35_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 35,
    section: "Article II. Section 1.3 Admission Procedures & Requirements",
    content: "1.3 Admission Procedures: 1.3.1 Online registration at umak.edu.ph; 1.3.2 Answer captcha and submit application; 1.3.3 Click verify button in verification email; 1.3.4 Open email containing pre-filled application form, requirements list, and Google upload link; 1.3.5 Submit complete and clear scanned requirements compiled in ONE PDF file: (1) Duly filled-out Application Form, (2) Two recent 2\" x 2\" ID pictures with name tag, white background, (3) Original PSA Birth Certificate, (4) Original Report Card/Rating Form/Transcript (Grade 11 card for graduating SHS, Grade 12 card for SHS graduates, ALS Certificate of Rating, or TOR for Transferees/Second Coursers), (5) For Makati residents not graduating from Makati public SHS: Latest Voter's Certification (18yo+) or Parent/sibling Voter's Certification and birth certificate (17yo and below). 1.3.6 Examination permit sent to email; 1.3.7 Pay College Qualifying Examination fee and secure receipt at Cash Office at G/F Administrative Building or UMak Cooperative at G/F Academic Building III; 1.3.8 Take College Qualifying Examination (CQE). Note: If no exam held, admission based on GWA; 1.3.9 2nd Phase College screening list posted on official UMak Facebook page; 1.3.10 College screening interview; 1.3.11 Notice of Admission (NOA) sent by Center for Admission and Scholarship (CAS); 1.3.12 Follow NOA instructions. Priority to Makati public school graduates/Makati residents. Limited slots for non-Makati with GWA 90% or higher."
  },
  {
    id: "s5_p36_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 36,
    section: "Article II. Section 2. Enrollment Procedure for Freshmen Students",
    content: "SECTION 2. ENROLLMENT PROCEDURE FOR FRESHMEN STUDENTS: 2.1 Download Disclosure of Medical Condition Form from https://umak.edu.ph/assets/pdf/DISCLOSURE-OF-MEDICAL-CONDITION.pdf, accomplish, and submit to medical.requirements@umak.edu.ph; 2.2 For non-Higher School ng UMak (non-HSU) graduates, download Residency Verification Form (RVF) from https://umak.edu.ph/assets/pdf/RVForm.pdf and submit with scanned documents to accounting_rvf@umak.edu.ph; 2.3 Submit enrollment requirements in a long plastic envelope to Office of the University Registrar (OUR): 2.3.1 Original Copy of Notice of Admission (NOA), 2.3.2 Original Copy of Form 137-A for University of Makati."
  },
  {
    id: "s5_p37_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 37,
    section: "Article II. Section 3. Enrollment Procedure for Old Students",
    content: "SECTION 3. ENROLLMENT PROCEDURE FOR OLD STUDENTS: 3.1 Encoding: Log in at umak.edu.ph/olea using credentials indicated in Online Report of Grades (OLROG). For returnees, secure password from OUR. 3.1.1 Read reminders, click 'I understand and agree with terms and conditions'; 3.1.2 Select NSTP section, click Block Section, review schedule, click Submit Block Section. (To remove subject, click 'X' button); 3.1.3 Review enrolled subjects, click 'Save Schedule'; 3.1.4 Wait for College approval. 3.2 Assessment: Check online assessment details. Click 'Apply for Scholarship/Promissory Note'. If eligible, click 'Apply for Online Token Fee Exemption'; if not, proceed to online payment through http://umak.edu.ph/scantopay. 3.3 Payment using UMak Scan-to-Pay: Pay tuition/token fee in full or partial - at least Php 500 for Makati residents and Php 1,500 for non-Makati residents, and pay miscellaneous fees in full using GCash-iBayad. Input details at http://umak.edu.ph/scantopay (Tutorial: https://youtu.be/n8MsfS7nDnw). 3.4 Print and download COR: Certificate of Registration (COR) emailed after 24 to 72 hours by Information and Technology Center (ITC). Present COR to professors on first day of classes. Only those with COR are officially enrolled."
  },
  {
    id: "s5_p38_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 38,
    section: "Article II. Section 4. Enrollment Procedure for Transferees",
    content: "SECTION 4. ENROLLMENT PROCEDURE FOR TRANSFEREES: 4.1 Accomplish Disclosure of Medical Condition Form; 4.2 Accomplish Residency Verification Form (RVF); 4.3 Submit enrollment requirements in long plastic envelope to OUR: (1) Notice of Admission, (2) Original Copy of Transcript of Records (TOR), (3) Original Copy of Honorable Dismissal/Transfer Credential, (4) Original Copy of Certificate of Good Moral Character, (5) Original Copy of NCAE Results (if available), (6) Photocopy of PSA Birth Certificate, (7) 1 long white folder, (8) 1 recent 2x2 ID picture with name tag, white background. Incomplete submission puts 2nd semester enrollment on hold. 4.4 OUR evaluates TOR; 4.5 Access umak.edu.ph/olea, click 'For Freshmen/Transferees click here', enter Registration Number, Last Name, and Date of Birth. Receive UMak email and temporary password, log in to gmail.com to get credentials, then return to OLEA; 4.6 Select NSTP and block section; 4.7 Assessment & Token Fee application; 4.8 Scan-to-Pay partial payment (min Php 500 Makati, Php 1,500 non-Makati); 4.9 COR emailed within 24-72 hours by ITC; 4.10 Print COR for class presentation."
  },
  {
    id: "s5_p39_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 39,
    section: "Article II. Section 5. Enrollment Procedure for Cross-Enrollees",
    content: "SECTION 5. ENROLLMENT PROCEDURE FOR CROSS-ENROLLEES: 5.1 Requirements: 5.1.1 Permit to cross-enroll duly signed by the Registrar with dry seal; 5.1.2 Photocopy of Student ID. 5.2 Present requirements for evaluation of the Registrar; 5.3 Accomplish advising slip; 5.4 Proceed to Dean's office for availability of course and section; 5.5 Submit requirements for encoding; 5.6 Proceed to Accounting Office for assessment."
  },
  {
    id: "s5_p41_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 41,
    section: "Article II. Section 7. Checklist of Requirements and Undertaking",
    content: "SECTION 7. CHECKLIST OF REQUIREMENTS AND UNDERTAKING: Accomplished by new student, transferee, or second courser. Required credentials: Notice of Admission, Form 138/Grade 12 Card, TOR, Honorable Dismissal, Good Moral, NCAE Results, PSA Birth Certificate, Long white folder, 2x2 ID picture. Mandatory Undertaking: 'I hereby certify that all submitted requirements are true and correct, and that submission of INCOMPLETE documents may put my enrollment/registration ON HOLD. Also, any sign of forging, falsifying or tampering of any academic or official records or documents will be a cause for the University of Makati to refuse my enrollment.'"
  },
  {
    id: "s5_p42_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 42,
    section: "Article II. Section 8. Withdrawal of Credentials and Enrollment",
    content: "SECTION 8. WITHDRAWAL OF CREDENTIALS AND ENROLLMENT: 8.1 Students who withdraw their enrollment within their first semester shall have their credentials returned. 8.2 Students who withdraw their enrollment after the first semester can withdraw their credentials provided there are no units earned. The students need to apply for clearance. 8.3 Procedure for withdrawal of credentials: 8.3.1 Prepare a Letter of Intent addressed to the Dean of the College citing reason/s for withdrawal of enrollment; 8.3.2 Send copy of approved letter to Admissions Office and Registrar; 8.3.3 Proceed to Accounting Office for cancellation of assessment; 8.3.4 Submit approved letter with clearance to Accounting Office and return to Office of the Registrar the issued Student ID to receive credentials."
  },
  {
    id: "s5_p48_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 48,
    section: "Article IV. Section 1. Attendance, Absences, and Tardiness Policy",
    content: "ARTICLE IV. ACADEMIC POLICIES. SECTION 1. ATTENDANCE AND PUNCTUALITY: Regular attendance in all classes is required. A student who incurs unexcused absences exceeding twenty percent (20%) of the total prescribed contact hours for a course shall be dropped automatically (Officially Dropped - OD or Unofficially Dropped - UD). Tardiness: A student arriving within the first 15 minutes of the scheduled class period is considered tardy. Three (3) instances of tardiness are equivalent to one (1) unexcused absence. Arriving after 15 minutes from the start of class is marked as absent."
  },
  {
    id: "s5_p52_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 52,
    section: "Article IV. Section 3. Grading System, Incompletes, and Retention",
    content: "SECTION 3. GRADING SYSTEM AND ACADEMIC STANDARDS: The academic performance of students is evaluated using a numerical scale: 1.00 (98-100% Excellent), 1.25 (95-97% Superior), 1.50 (92-94% Very Good), 1.75 (89-91% Good), 2.00 (86-88% Satisfactory), 2.25 (83-85% Fair), 2.50 (80-82%), 2.75 (77-79%), 3.00 (75-76% Passing Grade), 5.00 (Below 75% Failed), INC (Incomplete), OD (Officially Dropped), UD (Unofficially Dropped). Removal of Incomplete (INC): A grade of INC must be completed within one (1) academic year by taking the required examination or completing required coursework, otherwise it automatically converts to 5.00. Maximum Residence Rule (MRR): Undergraduate degree programs must be completed within 1.5 times the normal program duration."
  },
  {
    id: "s5_p54_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 54,
    section: "Article IV. Section 4. Academic Probation, Disqualification, and Dropping",
    content: "SECTION 4. ACADEMIC PROBATION AND RETENTION POLICIES: Academic Probation: A student who fails fifty percent (50%) to seventy-four percent (74%) of the total academic units enrolled in a semester is placed on Academic Probation for the succeeding semester and is allowed a reduced load of only 12 to 15 units. Disqualification / Dismissal: A student who fails seventy-five percent (75%) or more of the total enrolled academic units in any semester is disqualified from re-enrolling in the program or College. A student placed on probation who fails to improve academic performance in the following semester is subject to dismissal from the University. Dropping of Courses: Official dropping of courses must be filed before the midterm examination period using the prescribed OLEA dropping form."
  },
  {
    id: "s5_p58_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 58,
    section: "Article IV. Section 5. Leave of Absence (LOA) and Honorable Dismissal",
    content: "SECTION 5. LEAVE OF ABSENCE AND HONORABLE DISMISSAL: Leave of Absence (LOA): A student in good standing who intends to take a temporary leave from studies must apply for an official LOA addressed to the College Dean before the midterm examination period. An official LOA is valid for a maximum of one (1) academic year, renewable once upon written appeal. Returnees without approved LOA are considered non-regular returnees and must undergo re-admission screening by the College and University Registrar. Honorable Dismissal: A student requesting transfer to another institution must obtain university clearance from all administrative offices, library, and accounting before the Certificate of Honorable Dismissal and Official Transcript of Records (TOR) are issued."
  },
  {
    id: "s5_p68_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 68,
    section: "Article VII. Section 2. Dress Code, Grooming Standards, and Identification Policy",
    content: "ARTICLE VII. STUDENT NORMS AND CAMPUS DECORUM. SECTION 2. DRESS CODE AND IDENTIFICATION: 1. University ID: The official University of Makati Identification Card (ID) is non-transferable and must be visibly worn with the official UMak lanyard at all times upon entering and while inside the campus premises. No ID, No Entry policy is strictly implemented. Tampering with or lending an ID card constitutes a serious disciplinary violation. 2. Prescribed Uniform: Students must wear the prescribed college uniform on official uniform days (Monday, Tuesday, Thursday, Friday). Uniforms must be clean, neat, and worn with modesty. On designated wash days (Wednesday / Saturday), decent casual attire is permitted. Prohibited Attire: Sleeveless shirts, sando, crop tops, deep plunging necklines, see-through clothing, micro-mini skirts, excessively torn/ripped jeans, and rubber slippers or flip-flops (unless backed by a validated medical certificate). Grooming: Clean, well-kept hair and decent grooming must be maintained in accordance with college professional standards."
  },
  {
    id: "s5_p85_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 85,
    section: "Article VIII. Section 1. Classification of Offenses (Minor Offenses)",
    content: "ARTICLE VIII. STUDENT DISCIPLINE AND CODE OF CONDUCT. SECTION 1. MINOR OFFENSES: The following acts constitute minor disciplinary offenses: (1) Failure to wear the official UMak ID visibly while on campus; (2) Failure to wear the prescribed uniform without an approved exemption slip; (3) Unauthorized entry into prohibited areas or restricted campus facilities; (4) Littering and improper waste disposal inside classrooms, hallways, and campus grounds; (5) Engaging in boisterous behavior, shouting, or creating unnecessary classroom disturbance; (6) Unauthorized posting or distribution of flyers, posters, or announcements; (7) Smoking or using electronic cigarettes/vapes in non-designated campus areas. Penalties for Minor Offenses: First Offense: Formal written warning and reprimand; Second Offense: Parent/Guardian conference and written undertaking; Third Offense: 3 to 5 days campus community service or suspension upon recommendation of Student Discipline Tribunal."
  },
  {
    id: "s5_p88_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 88,
    section: "Article VIII. Section 2. Major Offenses and Disciplinary Sanctions",
    content: "SECTION 2. MAJOR OFFENSES: The following acts are classified as major offenses: (1) Cheating, plagiarism, unauthorized copying, and academic dishonesty during examinations, quizzes, or term requirements; (2) Forging, tampering, falsifying, or altering official university documents, grades, receipts, certificates, or school seals; (3) Hazing or inflicting physical/psychological injury on any person in connection with initiation into a student organization, fraternity, or sorority (R.A. 11053 Anti-Hazing Act); (4) Possession, use, distribution, or peddling of dangerous drugs or illegal controlled substances within campus premises or during university-sanctioned activities; (5) Carrying deadly weapons, firearms, explosives, or sharp blades inside campus; (6) Physical assault, fighting, brawling, intimidation, sexual harassment, or severe bullying; (7) Theft, extortion, or intentional destruction of university property. Penalties for Major Offenses: Suspension for one (1) semester up to one (1) full academic year, Non-readmission, Exclusion, or Expulsion with recommendation to the Board of Regents."
  },
  {
    id: "s5_p95_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 95,
    section: "Article VIII. Section 5. Grievance Machinery and Due Process",
    content: "SECTION 5. STUDENT GRIEVANCE MACHINERY AND DUE PROCESS: All students facing disciplinary charges are entitled to fundamental due process: (1) Right to be informed in writing of the specific charges and evidence against them; (2) Right to answer charges in writing with supporting affidavits within five (5) working days from receipt of notice; (3) Right to a formal, impartial hearing before the Student Disciplinary Committee; (4) Right to have parents, guardians, or counsel present during hearings; (5) Right to a written decision stating findings of fact and basis; (6) Right to appeal an adverse ruling to the Office of the University President within ten (10) calendar days from receipt of decision. Academic Grievances regarding grading or faculty conduct must first be submitted in writing to the Department Chairperson, then to the College Dean before elevation to the VPAA."
  },
  {
    id: "s5_p104_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 104,
    section: "Article IX. Student Council, Organizations, and Campus Activities",
    content: "ARTICLE IX. STUDENT ORGANIZATIONS AND LEADERSHIP. The University of Makati Supreme Student Council (UMak SSC) is the highest governing student representation body. All recognized student clubs, academic societies, and special interest organizations must be officially accredited annually through the Center for Student Organizations and Activities (CSOA). Requirements for organization recognition: Constitution and By-Laws, calendar of proposed activities, roster of officers and members (minimum 25 enrolled students in good standing), and endorsement by a full-time faculty adviser. Off-campus student activities, educational tours, and team buildings require written parental consent, university approval, and risk assessment compliance per CHED and UMak safety guidelines."
  },
  {
    id: "s5_p118_1",
    source: "Source05.pdf",
    documentTitle: "Student Handbook",
    page: 118,
    section: "Article XI. Graduation Requirements and Academic Honors",
    content: "ARTICLE XI. GRADUATION AND COMMENCEMENT: To qualify for graduation with a bachelor's degree, a candidate must: (1) Have satisfactorily completed all prescribed courses and credit units in the curriculum; (2) Have fulfilled the minimum residence requirement in the University (at least two consecutive years immediately prior to graduation for transferees); (3) Have cleared all financial, property, and library obligations with official University Clearance; (4) Be recommended for graduation by the College Council and confirmed by the University Council and Board of Regents. Latin Honors (Baccalaureate): Summa Cum Laude (GWA 1.00 to 1.20 with no grade lower than 1.50); Magna Cum Laude (GWA 1.21 to 1.45 with no grade lower than 1.75); Cum Laude (GWA 1.46 to 1.75 with no grade lower than 2.00). Candidates for honors must have no failing, uncompleted, or dropped grades throughout their college stay and must have carried the regular prescribed semester semestral load."
  },

  // ================= SOURCE 01: SCHOLARSHIPS (14 Pages) =================
  {
    id: "s1_p1_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 1,
    section: "Basic Requirements and Application Process",
    content: "SCHOLARSHIPS. Different types of tuition/token fee exemption, together with their descriptions and specific requirements (in addition to the basic requirements) are listed below. Basic Requirements: 1. Accomplished tuition / token fee exemption application form (this is send to your Umak email after applying through your OLEA account) 2. Recent 2x2 ID picture 3. No: Officially Dropped (OD), Unofficially Dropped (UD), or Incomplete (INC) remarks 4. Tuition / token fee for the semester being applied for is not paid yet."
  },
  {
    id: "s1_p1_2",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 1,
    section: "Application Process Steps and Processing Time",
    content: "Application Process: Step 1: Log into your OLEA account. Step 2: After saving your class schedule, click the “Apply for tuitio /token fee exemption” button. Step 2.1: Choose the type of tuition / token fee exemption you are qualified to apply for, take note of the requirements, then click the “submit” button. Step 3: Login to your UMak account then check your inbox/spam folder for the email that contains your pre-filled tuition/token fee exemption application form link and the link where to submit your requirements online. Step 4: Click the link for submission of your requirements sent to your UMak email and fill-out and submit the Google form (note: all application requirements must be submitted online through the link provided in your email. Step 5: Wait for the confirmation. The application process takes one (1) to two (2) working days for those who have met the requirements. Check your UMak email regularly as updates regarding the application are sent to your UMak email. If there is a need for a follow-up for your application, please exercise courteous communication. Step 6: Proceed with your enrollment. For Undergraduate Students: Once your application is approved or disapproved, login to your OLEA account and access the scan-to-pay (“click here” button) to proceed with your enrollment. For Graduate Students: Wait for your Certificate of Recognition (COR) to be sent to your UMak email. For concerns regarding your COR, coordinate with the Information Technology Center (ICT). To cancel application: Login to your OLEA account, click “click this link” under the tuition / token fee exemption application status message and follow the process of cancelling your application."
  },
  {
    id: "s1_p2_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 2,
    section: "Incoming Freshman Grants & Makati City Ordinances",
    content: "FOR INCOMING FRESHMAN. Full Entrance Token Exemption Grant: Awarded to both Makati and Non-Makati residents who have graduated with a Highest Honor Award (GWA within 98 to 100) in senior high school. (This is applicable only to incoming freshmen). Requirements in addition to basic requirements: 1. Incoming freshman 2. 1st and 2nd semester grade 12 senior high school card 3. Certificate of having a “highest honor” award in senior high school (GWA within 98-100). Partial Entrance Token Exemption Grant: Awarded to both Makati and Non-Makati residents who have graduated with a High Honor Award (GWA within 95 – 97) in senior high school. (This is applicable only to incoming freshmen). Requirements in addition to basic requirements: 1. Incoming freshman 2. 1st and 2nd semester grade 12 senior high school card 3. Certificate of having a “high honor” award in senior high school. Makati Barangay Chairman / Kagawad and Legitimate Dependents or Sangguniang Kabataan Chairman / Kagawad Scholarships: The granting of this tuition/token fee exemption is pursuant to Art. 203 (1) of the Implementing Rules and Regulations of the Local Government Code of 1991. Full tuition/token fee exemptions for graduate and undergraduate programs are granted. Requirements: 1. 1st and 2nd semester grade 12 card (for freshmen) or Report of Grades 2. Endorsement from the Department of Interior and Local Government Makati (DILG Makati); Continuing applicants need to submit this only once every academic year. Makati City Ordinance No. 2017-062 (for Makati Residents Ages 70 or above): This special study grant is pursuant to Makati City Ordinance No. 2017-063 and is open to the residents of Makati ages 70 or above, who are endorsed by the Senior Citizens’ Affair Office (OSCA) – City Government of Makati for the said grant. Full tuition/token fee exemptions for undergraduate and graduate programs are granted. Requirements: 1. At least seventy (70) years of age at the time of application 2. 1st and 2nd semester grade 12 senior high school card (for freshmen) or Report of Grades of the previous semester 3. Senior Citizen’s ID 4. Endorsement from the Office of the Senior Citizens’ Affair (OSCA) (for new applicants only)."
  },
  {
    id: "s1_p3_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 3,
    section: "PWD, Sister City, and UMak Employees Dependents",
    content: "Persons with Disability R.A. 9442: This special study grant is pursuant to Presidential Decree 577 and is open to students who are dependents of military personnel who died or who were incapacitated in the line of duty. Full token fee exemptions for undergraduate programs are granted. Requirements: 1. 1st and 2nd semester grade 12 senior high school card (for freshmen) or Report of Grades from the previous semester 2. ID or certificate from the AFP that the applicant is a beneficiary. Sister City Scholar: This is a special grant for non-residents of Makati who wish to study and take up any UMak college program/degree under the Sisterhood program of the City Government of Makati. Full token fee exemptions for undergraduate programs are granted. Requirements: 1. 1st and 2nd semester grade 12 senior high school card (for freshmen) or Report of Grades from the previous semester 2. GWA of at least 2.00, with no grades lower than 3.00 in all academic courses 3. No failed, officially or unofficially dropped, and incomplete ratings 4. Endorsement from the International Relations Department (IRD) – Office of the Mayor. UMak Faculty and Non-Teaching Employees and their Dependents: The University awards this tuition/token fee exemption to improve the quality of teaching and services in UMak. Regular employees and casual employees with at least one (1) year of service may apply. Students in the undergraduate programs who are dependents of regular employees with at least one (1) year of service may apply. Full tuition/token fee exemptions for undergraduate and graduate programs are granted. Requirements in addition to basic requirements (dependents): 1. 1st and 2nd semester grade 12 senior high school card (for freshmen) or Report of Grades from the previous semester 2. Endorsement from the HRMO."
  },
  {
    id: "s1_p4_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 4,
    section: "Undergraduate Cultural & Performing Grants",
    content: "FOR UNDERGRADUATES / COLLEGE STUDENTS. Band Members: Band Member Token Fee Exemption Grant is awarded to students who are members of the UMak Band as endorsed by the Center of Culture and the Arts (CCA). Full token fee exemption is granted. Requirements: 1. 1st and 2nd Semester Grade 12 Senior High School Card (for Freshmen) or Report of Grades of the previous semester 2. No Failed, Officially and Unofficially Dropped, and Incomplete ratings 3. Endorsement (list to be submitted by the Center for Culture & Arts (CCA)) 4. Has rendered significant contribution to the University/City of Makati. Chorale: Chorale Token Fee Exemption Grant is awarded to students who are members of the UMak Chorale as endorsed by the Center of Culture and the Arts (CCA). Full token fee exemption is granted. Requirements: 1. Report of Grades / Grade 12 card 2. No Failed, Dropped, Incomplete ratings 3. Endorsement by CCA 4. Has rendered significant contribution. Corps of Sponsor: Corps of Sponsors Token Fee Exemption Grant is awarded to students who are members of the UMak NROTC Corps of Sponsors as endorsed by the Center for NSTP. Full token fee exemption is granted. Dance Troupe: Dance Troupe Token Fee Exemption Grant is awarded to students who are members of the UMak Dance Troupe as endorsed by the Center of Culture and the Arts (CCA). Full token fee exemption is granted."
  },
  {
    id: "s1_p5_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 5,
    section: "Student Leadership Grants & Athletes",
    content: "Student Leaders: President, Vice-President, and other key executive officers of the Supreme Student Council (SSC) and major college student councils receive token fee exemptions as endorsed by the Center for Student Organizations and Activities (CSOA). Requirements: Regular academic load, no failing grades, good moral standing. Varsity Athletes: Students who represent UMak in local, regional, and national athletic competitions (e.g. ALCU Games, PRISAA) receive full token fee exemptions and athletic allowances upon the endorsement of the Center for Athletic Development (CAD)."
  },
  {
    id: "s1_p6_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 6,
    section: "Student Assistantship Program",
    content: "Student Assistants: Enrolled undergraduate students in good moral standing with at least one semester of residency may apply for the Student Assistantship Program at the Center for Student Services. Privileges include token fee exemptions and a monthly hourly stipend. Requirements: Certificate of Matriculation, Report of Grades with GWA of 2.25 or better, and duty commitment of up to 20 hours per week without conflicting with class schedules."
  },
  {
    id: "s1_p7_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 7,
    section: "Academic Scholars (Dean's Listers)",
    content: "Academic Scholars / Dean's Lister: Students who obtain high scholastic standing in the previous semester are granted token fee exemption. First Honors (President's Lister): GWA of 1.00 to 1.45 with no grade lower than 1.75 receives 100% full token fee exemption. Second Honors (Dean's Lister): GWA of 1.46 to 1.75 with no grade lower than 2.00 receives 50% partial token fee discount. Requirements: Regular semester load of at least 15 units, no dropped, failing, or incomplete grades, and no disciplinary record."
  },
  {
    id: "s1_p8_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 8,
    section: "Makati Residents Subsidies & Token Fee Structure",
    content: "Token Fee Subsidies for Makati Residents: Under City Ordinance No. 2004-A-025, bona fide Makati residents with valid voter certification pay a subsidized token fee of Php 1,000 to Php 1,500 per semester for undergraduate programs, compared to non-Makati residents who pay standard rates of Php 3,000 to Php 5,000 per semester plus miscellaneous fees."
  },
  {
    id: "s1_p9_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 9,
    section: "Athletes and Sports Scholarship Guidelines",
    content: "Athletic Scholarships: UMak Varsity athletes must maintain a minimum semester GWA of 2.50 to retain varsity scholarship benefits. Failing more than 3 units in any semester automatically puts the athlete on probation. Revocation occurs if the student stops training or fails 6 or more units."
  },
  {
    id: "s1_p10_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 10,
    section: "Employee Development Grants",
    content: "Employee Continuing Education: Permanent UMak faculty and administrative personnel pursuing graduate studies (Master's or Doctorate) at UMak receive full tuition waivers subject to approval of the University President and HRMO, with a return-service agreement."
  },
  {
    id: "s1_p11_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 11,
    section: "Special Local & National Study Grants",
    content: "Special Grants: Covers CHED Tulong Dunong Program (TDP), Tertiary Education Subsidy (TES) under RA 10931, and private donor sponsorships coordinated through the Center for Admission and Scholarship (CAS)."
  },
  {
    id: "s1_p12_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 12,
    section: "Application Deadlines and Verification",
    content: "Application Period: Online token fee exemption applications via OLEA open during the pre-enrollment period and strictly close two (2) weeks after the first official day of classes. Late applications will not be processed under any circumstances."
  },
  {
    id: "s1_p13_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 13,
    section: "Revocation and Forfeiture of Scholarships",
    content: "Grounds for Revocation / Forfeiture: (1) Incurring a failing grade, Incomplete (INC), or Dropped mark (OD/UD) during the semester; (2) Submission of fraudulent, falsified, or tampered documents; (3) Conviction in any major disciplinary offense; (4) Failure to submit official requirements within prescribed deadlines."
  },
  {
    id: "s1_p14_1",
    source: "Source01.pdf",
    documentTitle: "Scholarships",
    page: 14,
    section: "Appeals and Contact Office",
    content: "Scholarship Inquiries and Appeals: Center for Admission and Scholarship (CAS), Ground Floor, Administration Building. Official Email: scholarship@umak.edu.ph. Office hours: Monday to Friday, 8:00 AM to 5:00 PM."
  },

  // ================= SOURCE 02: CCIS & COLLEGES (2 Pages) =================
  {
    id: "s2_p1_1",
    source: "Source02.pdf",
    documentTitle: "College Requirements",
    page: 1,
    section: "College of Computing and Information Sciences (CCIS) Retention Rules",
    content: "COLLEGE OF COMPUTING AND INFORMATION SCIENCES (CCIS). Retention Policy: To be retained in the Bachelor of Science in Computer Science (BSCS) or Bachelor of Science in Information Technology (BSIT) programs, students must maintain a General Weighted Average (GWA) of at least 2.25 in all major computing and programming subjects. Math Requirement: A minimum grade of 2.25 is required in Calculus and Discrete Structures. Students who receive a grade of 2.50 to 3.00 in a prerequisite subject must enroll in remedial sessions before advancing."
  },
  {
    id: "s2_p2_1",
    source: "Source02.pdf",
    documentTitle: "College Requirements",
    page: 2,
    section: "CCIS Probation and Shifting Guidelines",
    content: "Probation and Shifting: A student who fails two (2) major computing subjects in a single academic year is placed on College Probation. Incurring three (3) failing grades in major CCIS courses disqualifies the student from the BSCS and BSIT programs, requiring shifting to another college. Shifting Requirements: Must have a cumulative GWA of 2.50 or better, endorsement from the CCIS Dean, and acceptance by the receiving college."
  },

  // ================= SOURCE 03: CAMPUS MAP & DIRECTORY (6 Pages) =================
  {
    id: "s3_p1_1",
    source: "Source03.pdf",
    documentTitle: "Campus Map",
    page: 1,
    section: "Campus Overview & Main Landmarks",
    content: "UMAK CAMPUS DIRECTORY: The University of Makati campus is located along J.P. Rizal Extension, West Rembo, Taguig / Makati. Key facilities include: Administration Building, Academic Building 1, Academic Building 2, Academic Building 3, Higher Polytechnic Studies Building (HPSB 12-Story Tower), University Stadium, UMak Oval, and the University Gymnasium."
  },
  {
    id: "s3_p2_1",
    source: "Source03.pdf",
    documentTitle: "Campus Map",
    page: 2,
    section: "Administration Building Directory",
    content: "ADMINISTRATION BUILDING DIRECTORY: Ground Floor (G/F): Office of the University Registrar (OUR), Center for Admission and Scholarship (CAS), Cashier / Cash Office, Accounting Office, Center for Student Services. 2nd Floor (2/F): Office of the University President, Board of Regents Boardroom, Office of the Vice President for Academic Affairs (OVPAA). 3rd Floor (3/F): Office of the Vice President for Administration and Finance, Human Resource Management Office (HRMO), Legal Office."
  },
  {
    id: "s3_p3_1",
    source: "Source03.pdf",
    documentTitle: "Campus Map",
    page: 3,
    section: "Academic Buildings 1 and 2 Directory",
    content: "ACADEMIC BUILDING 1 & 2 DIRECTORY: Academic Building 1: College of Business and Financial Science (CBFS), College of Technology Management (CTM), University Clinic / Medical and Dental Clinic on the Ground Floor. Academic Building 2: College of Arts and Letters (CAL), College of Education (COE), Multimedia Classrooms, Science Laboratories."
  },
  {
    id: "s3_p4_1",
    source: "Source03.pdf",
    documentTitle: "Campus Map",
    page: 4,
    section: "Academic Building 3 and CIT Location",
    content: "ACADEMIC BUILDING 3 DIRECTORY: Ground Floor (G/F): UMak Employees Multi-Purpose Cooperative, Audio-Visual Center. 2nd Floor (2/F): Center for Information Technology (CIT Office) located specifically at the South Wing, 2nd Floor. College of Computing and Information Sciences (CCIS) Dean's Office, Computer Laboratories 1 to 8. 3rd Floor (3/F): College of Engineering and Technology (CET) laboratories."
  },
  {
    id: "s3_p5_1",
    source: "Source03.pdf",
    documentTitle: "Campus Map",
    page: 5,
    section: "HPSB 12-Story Tower Directory",
    content: "HIGHER POLYTECHNIC STUDIES BUILDING (HPSB): Ground Floor to 3rd Floor: University Library (Main Learning Resource Center), Law Library. 4th to 6th Floors: School of Law (SOL), College of Governance and Public Policy (CGPP). 7th to 9th Floors: Center of Imaging Health Sciences (CIHS), College of Allied Health Studies (CAHS), Nursing Simulation Laboratories. 10th to 12th Floors: Executive Suites, Conference Halls, University Auditorium."
  },
  {
    id: "s3_p6_1",
    source: "Source03.pdf",
    documentTitle: "Campus Map",
    page: 6,
    section: "Sports Complex and Auxiliary Buildings",
    content: "SPORTS FACILITIES: UMak Stadium: Football pitch, running track, grandstand seating. University Gymnasium: Basketball court, badminton, martial arts training room, Center for Athletic Development (CAD) office."
  },

  // ================= SOURCE 04: OFFICES & DIRECTORY (14 Pages) =================
  {
    id: "s4_p1_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 1,
    section: "Office of the University President",
    content: "Office of the University President: University President: Prof. Charlemagne G. Laviña. Functions: Chief Executive Officer of the University. Administers university policies, represents the university in Board of Regents, exercises supervisory authority over all colleges, centers, and administrative units. Located at 2/F Administration Building."
  },
  {
    id: "s4_p2_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 2,
    section: "Office of the Vice President for Academic Affairs (OVPAA)",
    content: "Office of the Vice President for Academic Affairs (OVPAA): Vice President: Dr. Elyxzur C. Ramos. Functions: Academic planning, curriculum development, faculty development, research programs, accreditation compliance across all academic colleges. Located at 2/F Administration Building."
  },
  {
    id: "s4_p3_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 3,
    section: "Office of the Vice President for Administration and Finance (OVPAF)",
    content: "Office of the Vice President for Administration and Finance (OVPAF): Oversees fiscal management, budget planning, accounting, procurement, physical plant maintenance, and human resources. Located at 3/F Administration Building."
  },
  {
    id: "s4_p4_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 4,
    section: "Office of the University Registrar (OUR)",
    content: "Office of the University Registrar (OUR): University Registrar: Ms. Cynthia Margaretta Rabago José. Functions: Student admission records, registration, enrollment verification, issuance of Transcript of Records (TOR), Certificate of Registration (COR), Honorable Dismissal, and graduation evaluations. Located at Ground Floor, Administration Building."
  },
  {
    id: "s4_p5_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 5,
    section: "Center for Admission and Scholarship (CAS)",
    content: "Center for Admission and Scholarship (CAS): Director: Dr. Edita C. Delos Santos. Functions: Coordinates college admission examinations, evaluates token fee exemptions, manages city ordinances and donor scholarships, verifies student residency. Located at Ground Floor, Administration Building."
  },
  {
    id: "s4_p6_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 6,
    section: "Center for Information Technology (CIT)",
    content: "Center for Information Technology (CIT): Director: Engr. Ronald A. Polidario. Functions: Manages campus network infrastructure, student portal (OLEA), Online Report of Grades (OLROG), Scan-to-Pay integration, official student email provisioning (@umak.edu.ph), and campus cyber-security. Located at Academic Building 3, 2nd Floor, South Wing."
  },
  {
    id: "s4_p7_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 7,
    section: "Accounting Office",
    content: "Accounting Office: Functions: Assessment of student fees, token fee computation, processing of promissory notes, residency verification forms (RVF), and financial clearance for graduation. Located at Ground Floor, Administration Building."
  },
  {
    id: "s4_p8_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 8,
    section: "Cash Office / University Cashier",
    content: "Cash Office: Receives payment for qualifying examinations, graduation fees, official transcript requests, and coordinates Scan-to-Pay settlement with GCash-iBayad. Located at Ground Floor, Administration Building."
  },
  {
    id: "s4_p9_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 9,
    section: "Medical and Dental Clinic",
    content: "University Health Services / Clinic: Provides primary medical and emergency dental care, annual student physical exams, medical clearance for internships and sports, and submission of Disclosure of Medical Condition Forms. Located at Ground Floor, Academic Building 1."
  },
  {
    id: "s4_p10_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 10,
    section: "Center for Student Organizations and Activities (CSOA)",
    content: "Center for Student Organizations and Activities (CSOA): Director: Ms. KATRISHA FAYE G. PINGOL. Accreditations for student organizations, Supreme Student Council oversight, student leadership development, and approval of campus events. Located at Ground Floor, Administration Building."
  },
  {
    id: "s4_p11_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 11,
    section: "Center for Alumni Affairs",
    content: "Center for Alumni Affairs: Director: Mr. Kenneth V. Panes. Maintains alumni registry, coordinates with Grand Alumni Association of Makati City, Herons, Inc. (UMakGAA), and facilitates homecoming activities."
  },
  {
    id: "s4_p12_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 12,
    section: "Center for Archives and Information Governance",
    content: "Center for Archives and Information Governance: Director: Assistant Professor PIO S. JAGURIN, MBA, J.D. Functions: Document Digitization, Retrieval of Documents, Archiving of Documents, Provision of Data Privacy, Protection, and Records Management Services, Awareness and Compliance Monitoring, Provision of Policy Guidelines, Handling Inquiries."
  },
  {
    id: "s4_p13_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 13,
    section: "Center for Integrated Communications & Linkages",
    content: "Center for Integrated Communications: Director: Mr. Steve R. Villacorta. Center for Linkages and Placement: Director: Ms. Cynthia Margaretta Rabago José. Functions: Linkages and Partnerships, Student Internships/On-The-Job Training, Career Planning and Development."
  },
  {
    id: "s4_p14_1",
    source: "Source04.pdf",
    documentTitle: "Offices",
    page: 14,
    section: "Center for Linkages and Placement Assistance",
    content: "Placement and Employment Assistance: The center helps employment or internship seeking students by linking them with reputable employer or intern seeking industry partners. Manages Mega Job Fair, Government Internship Program, and Special Program for Employment of Students."
  }
];

fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'sources.json'),
  JSON.stringify(sourcesData, null, 2),
  'utf-8'
);
console.log(`Successfully generated data/sources.json with ${sourcesData.length} indexed chunks.`);
