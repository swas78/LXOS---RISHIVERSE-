# RishiVerse LX Module — Complete Seed Data & Showcase Reference

This document catalogs **every piece of seed data** loaded on localhost across the backend database (`rishiverse_db`) and frontend application. It serves as the production blueprint and dataset reference when productizing and seeding staging/production environments.

---

## Table of Contents

1. [Overview & Summary Statistics](#1-overview--summary-statistics)
2. [Actors & Role-Based Identities (`lxMember`)](#2-actors--role-based-identities-lxmember)
3. [Clubs (`lxClub`)](#3-clubs-lxclub)
4. [Clans & Point Ledgers (`lxClan` & `lxClanPointTxn`)](#4-clans--point-ledgers-lxclan--lxclanpointtxn)
5. [Campus Rooms & Facilities (`lxRoom`)](#5-campus-rooms--facilities-lxroom)
6. [Events (`lxEvent`)](#6-events-lxevent)
7. [Room Bookings (`lxRoomBooking`)](#7-room-bookings-lxroombooking)
8. [Achievements & Campus Updates (`lxAchievement`)](#8-achievements--campus-updates-lxachievement)
9. [Event Expenses (`lxExpense`)](#9-event-expenses-lxexpense)
10. [Reimbursements (`lxReimbursement`)](#10-reimbursements-lxreimbursement)
11. [Initiatives (`lxInitiative`)](#11-initiatives-lxinitiative)
12. [File Repository (`lxFile`)](#12-file-repository-lxfile)
13. [Learner Products Showcase (`lxProduct`)](#13-learner-products-showcase-lxproduct)
14. [Lost & Found Registry (`lxLostFoundItem`)](#14-lost--found-registry-lxlostfounditem)
15. [Library Study Cabins & Desk (`lxCabin`, `lxCabinBooking`, `lxCabinBlock`)](#15-library-study-cabins--desk-lxcabin-lxcabinbooking-lxcabinblock)
16. [Demo Scaffold Items (`demoItem`)](#16-demo-scaffold-items-demoitem)
17. [Frontend Dev Shim & Simulation Contracts](#17-frontend-dev-shim--simulation-contracts)

---

## 1. Overview & Summary Statistics

| Dataset Entity              | Prisma Model      | Row Count | Primary Key Type | Description                                                       |
| :-------------------------- | :---------------- | :-------- | :--------------- | :---------------------------------------------------------------- |
| **Members / Actors**        | `LxMember`        | **25**    | UUID / String    | Admins, LX team, Finance, Librarian, Club & Clan Heads, Students  |
| **Campus Rooms**            | `LxRoom`          | **26**    | UUID / String    | Auditoriums and classrooms across A & C Blocks                    |
| **Clubs**                   | `LxClub`          | **11**    | UUID / String    | Technical, Cultural, Academic, Social & Other campus clubs        |
| **Clans**                   | `LxClan`          | **4**     | UUID / String    | Inter-clan competition houses (Maratha, Vijaya, Chola, Rajputana) |
| **Clan Point Transactions** | `LxClanPointTxn`  | **2**     | UUID / String    | Ledger of clan point credits and justifications                   |
| **Events**                  | `LxEvent`         | **6**     | UUID / String    | Club, Clan, Campus Fest, and Orientation events                   |
| **Room Bookings**           | `LxRoomBooking`   | **9**     | UUID / String    | Reservation slots linked to events or ad-hoc student bookings     |
| **Achievements & Updates**  | `LxAchievement`   | **7**     | UUID / String    | Verified achievements and club/clan announcement feed items       |
| **Event Expenses**          | `LxExpense`       | **2**     | UUID / String    | Direct club event expenditures with receipts                      |
| **Reimbursements**          | `LxReimbursement` | **3**     | UUID / String    | Multi-stage reimbursement claims (Pending, Approved, Processed)   |
| **Initiatives**             | `LxInitiative`    | **2**     | UUID / String    | Clan community projects with progress tracking                    |
| **File Repository**         | `LxFile`          | **2**     | UUID / String    | Shared campus documents, constitutions, and reports               |
| **Learner Products**        | `LxProduct`       | **4**     | UUID / String    | Student startup/portfolio apps (Approved, Featured, Pending)      |
| **Lost & Found**            | `LxLostFoundItem` | **4**     | UUID / String    | Verified lost and found claims across categories                  |
| **Study Cabins**            | `LxCabin`         | **5**     | UUID / String    | Ashok Goel Library group study rooms (P1 to P5)                   |
| **Cabin Bookings**          | `LxCabinBooking`  | **5**     | UUID / String    | Live, booked, completed, no-show, and cancelled slots             |
| **Cabin Sanctions**         | `LxCabinBlock`    | **1**     | UUID / String    | Automatic restriction record for no-show breach                   |
| **Scaffold Demo Items**     | `DemoItem`        | **3**     | CUID / String    | Template validation items for CRUD verification                   |

---

## 2. Actors & Role-Based Identities (`lxMember`)

Identity mapping follows core Rishihood conventions: `referenceId` corresponds to `User.referenceId` (Employee ID or Student Enrollment Number).

### 2.1 Administrative & Functional Staff (8 members)

| `referenceId`  | Role        | Display Name      | Email                                 | Purpose / Permissions                               |
| :------------- | :---------- | :---------------- | :------------------------------------ | :-------------------------------------------------- |
| `EMP0417`      | `ADMIN`     | Yashika B         | `yashika.b@rishihood.edu.in`          | Full Admin: events, rooms, approvals, budgets       |
| `EMP0418`      | `ADMIN`     | Mehak M           | `mehak.m@rishihood.edu.in`            | Admin permissions                                   |
| `EMP0419`      | `ADMIN`     | Sandeep S         | `sandeep.s@rishihood.edu.in`          | Admin permissions                                   |
| `EMP0420`      | `ADMIN`     | Soumya A          | `soumya.a@rishihood.edu.in`           | Admin permissions                                   |
| `EMP0423`      | `ADMIN`     | Sarthak J         | `sarthak.j@rishihood.edu.in`          | Admin permissions                                   |
| `RU2024BTC001` | `ADMIN`     | Neelanshu         | `neelanshu.2024@nst.rishihood.edu.in` | Student Super-Admin in LXOS                         |
| `EMP0421`      | `LX_TEAM`   | LX Team           | `lx.team@rishihood.edu.in`            | Operational approvals, event reviews, rooms         |
| `EMP0422`      | `FINANCE`   | Finance           | `finance@rishihood.edu.in`            | Budget approvals, reimbursement disbursements       |
| `EMP0430`      | `LIBRARIAN` | Library Desk      | `libraryservices@rishihood.edu.in`    | Cabin desk oversight, check-ins, suspensions        |
| `RU2024BTC900` | `GUEST`     | Student (General) | `student@nst.rishihood.edu.in`        | General student access, cabin bookings, submissions |

### 2.2 Clan Heads (4 members)

| `referenceId`  | Role        | Display Name        | Clan Assigned | Email                             |
| :------------- | :---------- | :------------------ | :------------ | :-------------------------------- |
| `RU2024BTC200` | `CLAN_HEAD` | Maratha Clan Head   | Maratha       | `maratha.clan@rishihood.edu.in`   |
| `RU2024BTC201` | `CLAN_HEAD` | Vijaya Clan Head    | Vijaya        | `vijaya.clan@rishihood.edu.in`    |
| `RU2024BTC202` | `CLAN_HEAD` | Chola Clan Head     | Chola         | `chola.clan@rishihood.edu.in`     |
| `RU2024BTC203` | `CLAN_HEAD` | Rajputana Clan Head | Rajputana     | `rajputana.clan@rishihood.edu.in` |

### 2.3 Club Heads (11 members)

| `referenceId`  | Role        | Display Name        | Club Assigned  | Email                            |
| :------------- | :---------- | :------------------ | :------------- | :------------------------------- |
| `RU2024BTC100` | `CLUB_HEAD` | SAST Head           | SAST           | `sast@rishihood.edu.in`          |
| `RU2024BTC101` | `CLUB_HEAD` | Content Team Head   | Content Team   | `content@rishihood.edu.in`       |
| `RU2024BTC102` | `CLUB_HEAD` | Fine Arts Club Head | Fine Arts Club | `finearts.club@rishihood.edu.in` |
| `RU2024BTC103` | `CLUB_HEAD` | GDG Head            | GDG            | `gdg@rishihood.edu.in`           |
| `RU2024BTC104` | `CLUB_HEAD` | Robotics Club Head  | Robotics Club  | `robotics.club@rishihood.edu.in` |
| `RU2024BTC105` | `CLUB_HEAD` | Dance Club Head     | Dance Club     | `dance.club@rishihood.edu.in`    |
| `RU2024BTC106` | `CLUB_HEAD` | Theatre Club Head   | Theatre Club   | `theatre.club@rishihood.edu.in`  |
| `RU2024BTC107` | `CLUB_HEAD` | Finanza Head        | Finanza        | `finanza@rishihood.edu.in`       |
| `RU2024BTC108` | `CLUB_HEAD` | GD Club Head        | GD Club        | `gdclub@nst.rishihood.edu.in`    |
| `RU2024BTC109` | `CLUB_HEAD` | AI Club Head        | AI Club        | `aiclub@nst.rishihood.edu.in`    |
| `RU2024BTC110` | `CLUB_HEAD` | SAGE Head           | SAGE           | `sage.club@rishihood.edu.in`     |

---

## 3. Clubs (`lxClub`)

Default allocated budget per club is **₹10,000** for **Spring 2026**.

| Club Name          | Category    | Head Ref       | Head Email                       | Budget Allocated | Budget Spent | Description                                     |
| :----------------- | :---------- | :------------- | :------------------------------- | :--------------- | :----------- | :---------------------------------------------- |
| **SAST**           | `TECHNICAL` | `RU2024BTC100` | `sast@rishihood.edu.in`          | ₹10,000          | ₹4,200       | Official SAST of Rishihood University           |
| **Content Team**   | `OTHER`     | `RU2024BTC101` | `content@rishihood.edu.in`       | ₹10,000          | ₹800         | Official Content Team of Rishihood University   |
| **Fine Arts Club** | `CULTURAL`  | `RU2024BTC102` | `finearts.club@rishihood.edu.in` | ₹10,000          | ₹1,500       | Official Fine Arts Club of Rishihood University |
| **GDG**            | `TECHNICAL` | `RU2024BTC103` | `gdg@rishihood.edu.in`           | ₹10,000          | ₹3,600       | Official GDG of Rishihood University            |
| **Robotics Club**  | `TECHNICAL` | `RU2024BTC104` | `robotics.club@rishihood.edu.in` | ₹10,000          | ₹5,200       | Official Robotics Club of Rishihood University  |
| **Dance Club**     | `CULTURAL`  | `RU2024BTC105` | `dance.club@rishihood.edu.in`    | ₹10,000          | ₹1,900       | Official Dance Club of Rishihood University     |
| **Theatre Club**   | `CULTURAL`  | `RU2024BTC106` | `theatre.club@rishihood.edu.in`  | ₹10,000          | ₹2,300       | Official Theatre Club of Rishihood University   |
| **Finanza**        | `ACADEMIC`  | `RU2024BTC107` | `finanza@rishihood.edu.in`       | ₹10,000          | ₹1,200       | Official Finanza of Rishihood University        |
| **GD Club**        | `OTHER`     | `RU2024BTC108` | `gdclub@nst.rishihood.edu.in`    | ₹10,000          | ₹400         | Official GD Club of Rishihood University        |
| **AI Club**        | `TECHNICAL` | `RU2024BTC109` | `aiclub@nst.rishihood.edu.in`    | ₹10,000          | ₹2,100       | Official AI Club of Rishihood University        |
| **SAGE**           | `SOCIAL`    | `RU2024BTC110` | `sage.club@rishihood.edu.in`     | ₹10,000          | ₹900         | Official SAGE of Rishihood University           |

---

## 4. Clans & Point Ledgers (`lxClan` & `lxClanPointTxn`)

### 4.1 Clans

| Clan Name     | Hex Color | Current Points | Budget Allocated | Budget Spent | Semester    | Description                                           |
| :------------ | :-------- | :------------- | :--------------- | :----------- | :---------- | :---------------------------------------------------- |
| **Maratha**   | `#f97316` | **20**         | ₹10,000          | ₹4,200       | Spring 2026 | Maratha clan — inter-clan competition at Rishihood.   |
| **Vijaya**    | `#22c55e` | **10**         | ₹10,000          | ₹0           | Spring 2026 | Vijaya clan — inter-clan competition at Rishihood.    |
| **Chola**     | `#a855f7` | **0**          | ₹10,000          | ₹0           | Spring 2026 | Chola clan — inter-clan competition at Rishihood.     |
| **Rajputana** | `#ef4444` | **0**          | ₹10,000          | ₹0           | Spring 2026 | Rajputana clan — inter-clan competition at Rishihood. |

### 4.2 Point Ledger Transactions (`lxClanPointTxn`)

1. **Transaction 1 (Maratha):**
    - **Clan:** Maratha
    - **Delta:** `+20` (Previous: `0`, New Balance: `20`)
    - **Reason:** `"State Athletics Gold — achievement approved"`
    - **Created By:** `EMP0417` (Yashika B)
2. **Transaction 2 (Vijaya):**
    - **Clan:** Vijaya
    - **Delta:** `+10` (Previous: `0`, New Balance: `10`)
    - **Reason:** `"Cultural night participation"`
    - **Created By:** `EMP0417` (Yashika B)

---

## 5. Campus Rooms & Facilities (`lxRoom`)

26 rooms mapped across Central Block and Academic Blocks.

| Room Name                              | Building      | Floor  | Capacity | Type         | Amenities                                           |
| :------------------------------------- | :------------ | :----- | :------- | :----------- | :-------------------------------------------------- |
| **Main Audi**                          | Central Block | Ground | 350      | `AUDITORIUM` | Projector, Whiteboard, AC, Sound System, Mic, Stage |
| **Mini Audi**                          | Central Block | Ground | 150      | `AUDITORIUM` | Projector, Whiteboard, AC, Sound System, Stage      |
| **C-103**                              | C Block       | First  | 60       | `CLASSROOM`  | Projector, Whiteboard, AC                           |
| **C-104**                              | C Block       | First  | 60       | `CLASSROOM`  | Projector, Whiteboard, AC                           |
| **A-303**                              | A Block       | Third  | 60       | `CLASSROOM`  | Projector, Whiteboard, AC                           |
| **A-304**                              | A Block       | Third  | 60       | `CLASSROOM`  | Projector, Whiteboard, AC                           |
| **A-401** through **A-410** (10 rooms) | A Block       | Fourth | 60 each  | `CLASSROOM`  | Projector, Whiteboard, AC                           |
| **A-501** through **A-510** (10 rooms) | A Block       | Fifth  | 60 each  | `CLASSROOM`  | Projector, Whiteboard, AC                           |

---

## 6. Events (`lxEvent`)

| Event Title                | Type   | Host Unit     | Venue         | Schedule                 | Status     | Budget (Alloc / Spent) | Expected Attendees |
| :------------------------- | :----- | :------------ | :------------ | :----------------------- | :--------- | :--------------------- | :----------------- |
| **GDG DevFest 2026**       | `CLUB` | GDG           | Mini Audi     | +5 days (10:00 - 17:00)  | `APPROVED` | ₹20,000 / ₹9,000       | 180                |
| **Robotics Build Night**   | `CLUB` | Robotics Club | A-401, A-402  | +9 days (18:00 - 06:00)  | `PENDING`  | ₹15,000 / ₹0           | 60                 |
| **Theatre Annual Play**    | `CLUB` | Theatre Club  | Mini Audi     | +14 days (18:00 - 21:00) | `APPROVED` | ₹18,000 / ₹8,100       | 150                |
| **Inter-Clan Sports Meet** | `CLAN` | Maratha       | Sports Ground | +3 days (08:00 - 16:00)  | `APPROVED` | ₹10,000 / ₹4,200       | 300                |
| **Freshers Fest 2026**     | `FEST` | Campus-wide   | Mini Audi     | +20 days (16:00 - 22:00) | `APPROVED` | ₹40,000 / ₹12,000      | 600                |
| **LX Orientation**         | `LX`   | LX Team       | C-103         | +1 day (11:00 - 13:00)   | `APPROVED` | ₹3,000 / ₹900          | 45                 |

---

## 7. Room Bookings (`lxRoomBooking`)

| Room          | Purpose / Title                         | Requester                      | Approver          | Timing                      | Status                                                           |
| :------------ | :-------------------------------------- | :----------------------------- | :---------------- | :-------------------------- | :--------------------------------------------------------------- |
| **Mini Audi** | GDG DevFest 2026 Keynote & AI Workshops | `RU2024BTC103` (GDG Head)      | `EMP0417` (Admin) | +5d (10:00 - 17:00)         | `APPROVED`                                                       |
| **A-401**     | Robotics Build Night — Arena Setup      | `RU2024BTC104` (Robotics Head) | —                 | +9d (18:00) to +10d (06:00) | `PENDING`                                                        |
| **A-402**     | Robotics Build Night — Circuit Lab      | `RU2024BTC104` (Robotics Head) | —                 | +9d (18:00) to +10d (06:00) | `PENDING`                                                        |
| **Mini Audi** | Theatre Club Annual Play                | `RU2024BTC106` (Theatre Head)  | `EMP0417` (Admin) | +14d (18:00 - 21:00)        | `APPROVED`                                                       |
| **C-103**     | LX Orientation Session                  | `EMP0417` (Admin)              | `EMP0417` (Admin) | +1d (11:00 - 13:00)         | `APPROVED`                                                       |
| **C-104**     | SAST Core Team Sprint Planning          | `RU2024BTC100` (SAST Head)     | `EMP0417` (Admin) | +2d (16:00 - 18:00)         | `APPROVED`                                                       |
| **A-403**     | AI Club Paper Reading Group             | `RU2024BTC109` (AI Club Head)  | `EMP0417` (Admin) | +3d (15:00 - 17:00)         | `APPROVED`                                                       |
| **Main Audi** | Informal Gaming Meetup                  | `RU2024BTC900` (Student)       | `EMP0417` (Admin) | +4d (14:00 - 18:00)         | `REJECTED` _(Main Audi reserved for institutional convocations)_ |
| **C-103**     | Design Critique Circle                  | `RU2024BTC900` (Student)       | —                 | -2d (16:00 - 18:00)         | `CANCELLED`                                                      |

---

## 8. Achievements & Campus Updates (`lxAchievement`)

| Title                                  | Kind          | Category    | Submitted By             | Points Awarded | Status     | Details                               |
| :------------------------------------- | :------------ | :---------- | :----------------------- | :------------- | :--------- | :------------------------------------ |
| **Smart India Hackathon — Finalists**  | `ACHIEVEMENT` | `TECHNICAL` | SAST Head                | 50             | `APPROVED` | Team: Aarav, Ishita, Dev              |
| **Inter-College Robotics Gold**        | `ACHIEVEMENT` | `TECHNICAL` | Robotics Head            | 30             | `APPROVED` | Team: Kabir, Sana                     |
| **State Athletics Gold**               | `ACHIEVEMENT` | `SPORTS`    | Maratha Clan Head        | 20             | `APPROVED` | Participant: Meera                    |
| **My Design Certification**            | `ACHIEVEMENT` | `ACADEMIC`  | Student (`RU2024BTC900`) | 0              | `PENDING`  | Participant: Student                  |
| **GDG: Study Jams launching**          | `UPDATE`      | `SOCIAL`    | GDG Head                 | —              | `APPROVED` | Weekly Google Study Jams              |
| **Maratha: Weekly huddle recap**       | `UPDATE`      | `SOCIAL`    | Maratha Clan Head        | —              | `APPROVED` | Green-campus drive planning           |
| **SAST: New robotics workshop series** | `UPDATE`      | `SOCIAL`    | SAST Head                | —              | `PENDING`  | 4-week robotics workshop announcement |

---

## 9. Event Expenses (`lxExpense`)

| Expense Item             | Associated Event | Amount | Category | Submitted By              | Status     | Verified By       | Budget Deducted |
| :----------------------- | :--------------- | :----- | :------- | :------------------------ | :--------- | :---------------- | :-------------- |
| **Catering for DevFest** | GDG DevFest 2026 | ₹9,000 | `FOOD`   | `RU2024BTC103` (GDG Head) | `APPROVED` | `EMP0417` (Admin) | **Yes**         |
| **Speaker travel**       | GDG DevFest 2026 | ₹3,500 | `OTHER`  | `RU2024BTC103` (GDG Head) | `PENDING`  | —                 | **No**          |

---

## 10. Reimbursements (`lxReimbursement`)

All reimbursements adhere to core privacy standards: the module stores **no plaintext bank accounts**, using indirect payout pointer `payoutRef: "student-bank:<referenceId>"`.

| Reimbursement Title             | Amount | Category    | Event / Club        | Submitted By | Status      | Payout Ref / Txn ID                               |
| :------------------------------ | :----- | :---------- | :------------------ | :----------- | :---------- | :------------------------------------------------ |
| **Auto fare for vendor pickup** | ₹450   | `TRAVEL`    | GDG DevFest 2026    | GDG Head     | `PENDING`   | `student-bank:RU2024BTC103`                       |
| **Printing handouts**           | ₹800   | `PRINTING`  | SAST / Orientation  | SAST Head    | `APPROVED`  | `student-bank:RU2024BTC100` _(Reviewed by Admin)_ |
| **Props for play**              | ₹2,200 | `MATERIALS` | Theatre Club / Play | Theatre Head | `PROCESSED` | `student-bank:RU2024BTC106` _(NEFT/2026/0042)_    |

---

## 11. Initiatives (`lxInitiative`)

Community/clan driven long-term initiatives with progress metrics.

1. **Maratha Green Campus**
    - **Clan:** Maratha
    - **Status:** `ACTIVE` (Progress: **60%**, Priority: `HIGH`)
    - **Team:** Meera, Arjun
    - **Created By:** `RU2024BTC200` (Maratha Clan Head)
    - **Description:** Tree plantation drive across university grounds.
2. **Vijaya Blood Donation**
    - **Clan:** Vijaya
    - **Status:** `PLANNING` (Progress: **20%**, Priority: `MEDIUM`)
    - **Team:** Sana
    - **Description:** Campus blood donation camp.

---

## 12. File Repository (`lxFile`)

Demonstration artifacts stored in S3 dev bucket (`s3:lx-dev-bucket:...`).

| File Name                  | File Key                                                    | MIME / Size                | Type       | Associated Unit | Tags                   | Uploaded By                |
| :------------------------- | :---------------------------------------------------------- | :------------------------- | :--------- | :-------------- | :--------------------- | :------------------------- |
| **SAST Constitution.pdf**  | `s3:lx-dev-bucket:document/seed-0001-sast-constitution.pdf` | `application/pdf` (240 KB) | `DOCUMENT` | SAST Club       | `constitution`, `sast` | `RU2024BTC100` (SAST Head) |
| **GDG DevFest Report.pdf** | `s3:lx-dev-bucket:document/seed-0002-devfest-report.pdf`    | `application/pdf` (512 KB) | `REPORT`   | GDG / DevFest   | `report`, `devfest`    | `EMP0417` (Admin)          |

---

## 13. Learner Products Showcase (`lxProduct`)

Campus products built by learners and clubs.

| Product Name   | Tagline                            | Category   | Tech Stack             | Team         | Club    | Featured   | Status     | Links                                                                                  |
| :------------- | :--------------------------------- | :--------- | :--------------------- | :----------- | :------ | :--------- | :--------- | :------------------------------------------------------------------------------------- |
| **CampusEats** | Order from campus canteens in taps | `WEB_APP`  | Next.js, Node, MongoDB | Riya, Aditya | GDG     | **Yes** ⭐ | `APPROVED` | [Live](https://campuseats.example.com) • [Repo](https://github.com/example/campuseats) |
| **NoteNest**   | Shared notes for every course      | `WEBSITE`  | React, Firebase        | Kabir        | SAST    | No         | `APPROVED` | [Live](https://notenest.example.com)                                                   |
| **ClanClash**  | A game to boost clan spirit        | `GAME`     | Phaser, TypeScript     | Meera        | Maratha | No         | `PENDING`  | [Repo](https://github.com/example/clanclash)                                           |
| **GreenTrack** | Track campus sustainability        | `RESEARCH` | Python, Streamlit      | Sana, Riya   | SAGE    | No         | `PENDING`  | —                                                                                      |

---

## 14. Lost & Found Registry (`lxLostFoundItem`)

| Item Title                      | Kind    | Category      | Location Found / Lost       | Contact Phone | Reported By              | Status     | Details / Actions                                          |
| :------------------------------ | :------ | :------------ | :-------------------------- | :------------ | :----------------------- | :--------- | :--------------------------------------------------------- |
| **Black JBL earbuds case**      | `FOUND` | `ELECTRONICS` | Bench outside Mini Audi     | `9876500110`  | GDG Head                 | `APPROVED` | Image: `seed-earbuds.jpg`                                  |
| **Blue Rishihood water bottle** | `LOST`  | `ACCESSORY`   | A-Block, 3rd floor corridor | `987650111`   | Student (`RU2024BTC900`) | `APPROVED` | Image: `seed-bottle.jpg` (Navy blue steel with dented cap) |
| **Student ID card**             | `FOUND` | `ID_CARD`     | Ashok Goel Library entrance | —             | Robotics Head            | `PENDING`  | Image: `seed-idcard.jpg`                                   |
| **Set of keys**                 | `LOST`  | `KEYS`        | Somewhere on campus         | —             | Student (`RU2024BTC900`) | `REJECTED` | _Reason: Add a clearer photo & approx location._           |

---

## 15. Library Study Cabins & Desk (`lxCabin`, `lxCabinBooking`, `lxCabinBlock`)

The Ashok Goel Library contains group study cabins managed through a dedicated booking board and check-in desk operated by `EMP0430` (`LIBRARIAN`).

### 15.1 Cabin Inventory (`lxCabin`)

| Cabin Code | Cabin Name | Floor        | Capacity (Min - Max) | Amenities      | Active |
| :--------- | :--------- | :----------- | :------------------- | :------------- | :----- |
| **P1**     | Cabin P1   | Ground floor | 3 - 6 persons        | AC, Whiteboard | Active |
| **P2**     | Cabin P2   | Ground floor | 3 - 6 persons        | AC, Whiteboard | Active |
| **P3**     | Cabin P3   | Ground floor | 3 - 6 persons        | AC, Whiteboard | Active |
| **P4**     | Cabin P4   | First floor  | 2 - 4 persons        | AC, Whiteboard | Active |
| **P5**     | Cabin P5   | First floor  | 2 - 4 persons        | AC, Whiteboard | Active |

### 15.2 Cabin Bookings (`lxCabinBooking`)

| Cabin  | Date & Slot                | Booker                   | Booker Type | Status       | Group Members                     | Notes                    |
| :----- | :------------------------- | :----------------------- | :---------- | :----------- | :-------------------------------- | :----------------------- |
| **P1** | 2026-09-01 (10:00 - 11:00) | GDG Head                 | `STUDENT`   | `CHECKED_IN` | Student, SAST Head, Robotics Head | Active in-session        |
| **P2** | 2026-09-01 (14:00 - 15:00) | Admin (`EMP0417`)        | `FACULTY`   | `BOOKED`     | Theatre Head, Finanza Head        | Upcoming confirmed       |
| **P3** | 2026-08-31 (15:00 - 16:00) | SAST Head                | `STUDENT`   | `COMPLETED`  | Student, Robotics Head            | Checked in & completed   |
| **P4** | 2026-08-31 (11:00 - 12:00) | Student (`RU2024BTC900`) | `STUDENT`   | `NO_SHOW`    | AI Club Head                      | Desk marked no-show      |
| **P5** | 2026-09-02 (16:00 - 17:00) | GD Club Head             | `STUDENT`   | `CANCELLED`  | —                                 | Cancelled prior to start |

### 15.3 Cabin Disciplinary Suspension (`lxCabinBlock`)

- **Member Restricted:** `RU2024BTC900` (Student)
- **Reason:** `NO_SHOW` (Breach on Cabin P4 booking)
- **Duration:** 7 days restriction (`2026-08-31 11:00` to `2026-09-07 11:00`)
- **Note:** `"Automatic 7-day restriction: missed check-in window for Cabin P4 on 2026-08-31."`

---

## 16. Demo Scaffold Items (`demoItem`)

Scaffold baseline rows for checking module CRUD mechanics:

1. `Welcome to RishiVerse Modules` (Status: `ACTIVE`)
2. `Sample Draft Specification` (Status: `DRAFT`)
3. `Archived Milestone Report` (Status: `ARCHIVED`)

---

## 17. Frontend Dev Shim & Simulation Contracts

### 17.1 Actor Switcher & Query Param Simulation

The frontend scaffold reads the acting user using:

1. `x-user-ref` HTTP request header sent to the backend
2. URL search parameter: `?actor=<referenceId>`
3. Access Switcher UI at [`/lx/access`](http://localhost:3020/lx/access)

**Example URLs to test each role:**

- **Admin:** `http://localhost:3020/lx/dashboard?actor=EMP0417`
- **LX Team:** `http://localhost:3020/lx/dashboard?actor=EMP0421`
- **Finance Officer:** `http://localhost:3020/lx/dashboard?actor=EMP0422`
- **Librarian Desk:** `http://localhost:3020/lx/dashboard?actor=EMP0430`
- **Club Head (GDG):** `http://localhost:3020/lx/dashboard?actor=RU2024BTC103`
- **Clan Head (Maratha):** `http://localhost:3020/lx/dashboard?actor=RU2024BTC200`
- **General Student:** `http://localhost:3020/lx/dashboard?actor=RU2024BTC900`

### 17.2 Permission Matrix (`LX_PERMISSION_MATRIX`)

| Permission Key          | Permitted Roles                                                  |
| :---------------------- | :--------------------------------------------------------------- |
| `CREATE_EVENT`          | `ADMIN`, `LX_TEAM`, `CLUB_HEAD`, `CLAN_HEAD`                     |
| `APPROVE_EVENT`         | `ADMIN`, `LX_TEAM`                                               |
| `BOOK_ROOM`             | `ADMIN`, `LX_TEAM`, `CLUB_HEAD`, `CLAN_HEAD`                     |
| `MANAGE_ROOMS`          | `ADMIN`                                                          |
| `MANAGE_CLUBS`          | `ADMIN`, `LX_TEAM`                                               |
| `MANAGE_CLANS`          | `ADMIN`, `CLAN_HEAD`                                             |
| `ALLOCATE_POINTS`       | `ADMIN`                                                          |
| `SUBMIT_EXPENSE`        | `ADMIN`, `LX_TEAM`, `CLUB_HEAD`                                  |
| `APPROVE_EXPENSE`       | `ADMIN`, `FINANCE`                                               |
| `VIEW_BUDGET`           | `ADMIN`, `LX_TEAM`, `FINANCE`                                    |
| `SUBMIT_ACHIEVEMENT`    | `ADMIN`, `LX_TEAM`, `CLUB_HEAD`, `CLAN_HEAD`, `GUEST`            |
| `APPROVE_ACHIEVEMENT`   | `ADMIN`, `LX_TEAM`                                               |
| `APPROVE_REIMBURSEMENT` | `ADMIN`, `LX_TEAM`                                               |
| `PROCESS_REIMBURSEMENT` | `ADMIN`, `FINANCE`                                               |
| `VIEW_ANALYTICS`        | `ADMIN`, `LX_TEAM`, `FINANCE`                                    |
| `MANAGE_USERS`          | `ADMIN`                                                          |
| `FILE_REPOSITORY`       | `ADMIN`, `LX_TEAM`, `CLUB_HEAD`, `CLAN_HEAD`, `FINANCE`, `GUEST` |

### 17.3 S3 Mock Storage Paths

Uploaded attachments in local development use structured pointer strings:

- Documents: `s3:lx-dev-bucket:document/<filename>`
- Images: `s3:lxos-dev:img/<filename>`
- Receipts / Invoices: `s3:lxos-dev:receipts/<filename>`
