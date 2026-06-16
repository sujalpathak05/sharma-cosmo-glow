# Sharma Cosmo Clinic - Project Report

## 1. Cover Page

**Project Title:** Sharma Cosmo Clinic Website and Clinic Management System  
**Project Type:** Web Application  
**Domain:** Healthcare, Skin Clinic, Hair Treatment, Aesthetic Medicine  
**Client/Organization:** Sharma Cosmo Clinic, Noida  
**Doctor:** Dr. Vishikant Sharma  
**Technology Stack:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Supabase  
**Prepared On:** April 2026

## 2. Abstract

Sharma Cosmo Clinic is a modern clinic website and admin management system created for a skin, hair, and aesthetic care clinic in Noida. The application helps patients learn about treatments, read clinic blogs, view testimonials, contact the clinic, and submit appointment requests online.

Along with the public-facing website, the project includes an admin dashboard for managing appointments, doctor workflow, patient records, WhatsApp confirmation/reminder workflows, OPD billing, pharmacy stock, sales invoices, purchase invoices, review moderation, and clinic schedule settings. Supabase is used as the backend for authentication, normalized database storage, real-time updates, role-based access, and row-level security.

The main goal of this project is to provide a professional digital presence for the clinic and also reduce manual work for clinic staff by bringing important operational tasks into one dashboard.

## 3. Introduction

Healthcare clinics need a reliable online platform where patients can understand services, book appointments, and communicate easily. Traditional manual appointment registers and billing records can be time-consuming and difficult to track. This project solves that problem by combining a responsive clinic website with an internal clinic operations dashboard.

The website highlights services such as acne treatment, PRP hair treatment, chemical peels, psoriasis treatment, alopecia treatment, vitiligo treatment, laser hair removal, Botox consultation, and anti-aging care. The admin panel helps the clinic team manage patient requests, confirm bookings, create bills, track pharmacy inventory, and monitor follow-ups.

## 4. Objectives

The main objectives of this project are:

1. To build a responsive and visually appealing clinic website.
2. To allow patients to submit appointment requests online.
3. To provide clinic information such as services, contact details, location, timings, and doctor details.
4. To publish SEO-friendly blog pages for skin and hair treatment awareness.
5. To collect patient testimonials and allow admin approval before display.
6. To provide an authenticated admin dashboard for clinic operations.
7. To manage appointment status such as pending, confirmed, completed, and cancelled.
8. To support OPD billing with invoice preview and print option.
9. To manage pharmacy stock, medicine master, sales invoices, and purchase invoices.
10. To provide schedule control using off-dates and disabled time slots.
11. To provide role-based access for admin, doctor, and staff users.
12. To support WhatsApp confirmation and reminder message workflows for appointments.

## 5. Scope of the Project

The scope of this project includes both patient-side and admin-side functionality.

### Patient-Side Scope

- Clinic landing page
- Service details
- Appointment booking form
- Consultation mode and fee display
- Date and time slot selection
- Testimonials display and review submission
- Blog listing and detailed blog pages
- Contact section with phone, email, address, WhatsApp link, and map
- SEO metadata for search engine visibility

### Admin-Side Scope

- Secure admin login
- Role-based dashboard access
- Dashboard overview
- Appointment queue management
- Patient profile grouping
- Doctor panel
- 28-day follow-up queue
- Patient messaging overview with WhatsApp confirmation and reminder queues
- OPD billing and invoice preview
- Pharmacy medicine master
- Pharmacy stock tracking
- Sales and purchase invoice handling
- Review approval, rejection, and deletion
- Slot and off-date management
- Analytics based on appointment data

## 6. Existing System

In a traditional clinic process, appointments, billing, and pharmacy records are often handled manually or with separate tools. This can create problems such as:

- Difficulty in tracking pending appointment requests
- Manual effort in confirming or cancelling bookings
- No central patient history
- Separate billing and stock records
- Lack of real-time data visibility
- No easy way to moderate patient reviews
- Limited online presence for new patients

## 7. Proposed System

The proposed system provides a single web application where patients and clinic staff can complete important tasks digitally. Patients can explore clinic services and book appointments from the website. Admin, doctor, and staff users can log in with role-based access and manage the sections relevant to their responsibilities.

The project uses Supabase as a backend platform, making it possible to store appointment data, review data, schedule settings, WhatsApp message logs, OPD bills, and pharmacy records in database tables. Real-time subscriptions are also used so the admin dashboard can reflect updates quickly.

## 8. Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui, Radix UI |
| Icons | lucide-react |
| Routing | React Router DOM |
| Data Fetching | TanStack React Query |
| SEO | react-helmet-async |
| Backend | Supabase |
| Database | PostgreSQL through Supabase |
| Authentication | Supabase Auth |
| Testing | Vitest, Testing Library, Playwright setup |
| Deployment Config | Netlify configuration |

## 9. Project Structure

Important folders and files:

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Main routing and providers |
| `src/pages/Index.tsx` | Public home page |
| `src/pages/Admin.tsx` | Admin dashboard page |
| `src/pages/AdminLogin.tsx` | Admin login page |
| `src/pages/BlogDetail.tsx` | Individual blog detail page |
| `src/components/` | Public website sections |
| `src/components/admin/` | Admin dashboard modules |
| `src/components/ui/` | Reusable UI components |
| `src/lib/` | Shared business logic and helpers |
| `src/lib/adminRoles.ts` | Role lookup and role normalization |
| `src/lib/whatsappAutomation.ts` | WhatsApp message templates, links, and logs |
| `src/data/` | SEO and blog content data |
| `src/integrations/supabase/` | Supabase client and generated types |
| `supabase/migrations/` | Database migration files |
| `public/` | Static public assets |
| `package.json` | Project scripts and dependencies |

## 10. Main Modules

### 10.1 Public Website Module

The public website provides clinic information to visitors. It includes:

- Hero section with clinic introduction
- About section
- Services section
- Appointment booking section
- Gallery section
- Testimonials section
- Blog section
- Contact section
- Footer and floating action buttons

The home page also includes SEO metadata, Open Graph metadata, Twitter metadata, and JSON-LD structured data for local business and medical clinic search visibility.

### 10.2 Appointment Booking Module

The appointment form allows patients to submit:

- Name
- Phone number
- Email
- Gender
- Service
- Consultation mode
- Location
- Preferred date
- Preferred time slot
- Optional message

The system checks off-dates and disabled slots before accepting a booking. Appointment data is saved locally first as a backup and then synced to Supabase. This improves reliability if cloud sync is temporarily unavailable.

### 10.3 Blog Module

The project includes SEO-focused treatment guides. Blog pages are generated from structured data and include:

- Title
- Meta description
- Keywords
- Category
- Reading time
- Intro content
- Detailed sections
- FAQs
- Related posts
- BlogPosting JSON-LD
- FAQPage JSON-LD

This module improves patient education and search engine visibility.

### 10.4 Testimonials and Review Module

Patients can submit reviews from the public website. Reviews are not shown immediately. They are stored in Supabase and require admin approval. Admin can:

- View all reviews
- Filter pending and approved reviews
- Approve reviews
- Hide/reject reviews
- Delete reviews

Only approved reviews are displayed publicly.

### 10.5 Admin Authentication Module

Admin access is protected using Supabase Auth. If a user is not logged in, the admin page redirects to `/admin/login`. Auth state is managed through a custom `useAuth` hook.

The authentication flow also fetches the logged-in user's clinic role from the `clinic_staff_roles` table. The supported roles are:

- Admin
- Doctor
- Staff

Each role receives a different dashboard view so users only see the modules that match their work.

### 10.6 Admin Dashboard Module

The admin dashboard works as the clinic command center. It includes:

- Dashboard overview
- Doctor panel
- Appointments
- Messages
- OPD billing
- Pharmacy
- Patients
- Follow-ups
- Schedule control
- Reviews
- Analytics

It shows important metrics such as total bookings, pending appointments, completed visits, unique patients, pipeline value, and repeat patients.

Role-based visibility is applied to dashboard navigation. Admin users can access all modules, doctor users can access clinical and OPD-related sections, and staff users can access front-desk, billing, pharmacy, patient, and follow-up modules.

### 10.7 Appointment Management Module

The admin can manage appointment status:

- Pending
- Confirmed
- Completed
- Cancelled

The dashboard also provides search and filter options. Appointment data is read from Supabase and merged with local backup appointments. Real-time updates are enabled through Supabase channels.

### 10.8 Doctor Panel Module

The doctor panel is used for clinical workflow. It allows the doctor/admin to view appointment queues, follow-up patients, and move selected appointments toward OPD billing.

### 10.9 OPD Billing Module

The OPD billing module supports:

- Appointment-linked billing
- Manual billing
- Patient details
- Gender and age entry
- Service/visit type
- Consultation mode
- Payment mode
- Paid, due, and refunded status
- Invoice preview
- Print-friendly invoice
- Billing history search

OPD bill data is stored in normalized Supabase tables: `opd_bills` and `opd_bill_items`. This makes billing data easier to query, report, and scale compared with storing all records in one JSON payload.

### 10.10 Pharmacy Module

The pharmacy module supports:

- Medicine master
- Add, edit, and delete medicine records
- Stock tracking
- Expiry date tracking
- Sales invoice creation
- Purchase invoice creation
- Discount percentage on sale bills
- OPD and OTC sale types
- Stock reduction after sales
- Stock increase after purchases
- Pharmacy invoice preview

This module helps the clinic manage medicines and billing from the same admin area.

Pharmacy data is stored in separate normalized tables for medicines, sales, sale items, purchases, and purchase items. This provides a cleaner database structure and makes stock, invoice, and reporting queries easier.

### 10.11 Schedule Management Module

Schedule management allows admin users to control:

- Clinic off-dates
- Disabled time slots for specific dates

The public appointment form reads these settings and prevents patients from selecting unavailable dates or slots.

### 10.12 Analytics Module

The analytics section calculates insights from appointment data:

- Service demand
- Location mix
- Booking count
- Pending and completed appointments
- Estimated revenue pipeline
- Cancelled lead risk

These values help the clinic understand patient demand and operations.

### 10.13 WhatsApp Automation Module

The WhatsApp module prepares appointment-based message workflows for clinic staff. It supports:

- Appointment confirmation messages
- Appointment reminder messages
- Follow-up message templates
- Review request templates
- WhatsApp click-to-send links
- Message logging in Supabase

When staff opens a WhatsApp message from the dashboard, the system creates a ready-to-send WhatsApp message using the patient's name, service, date, time, and clinic address. The action is logged in `whatsapp_message_logs`.

## 11. Database Design

The project uses Supabase PostgreSQL tables.

### 11.1 `appointments`

Stores patient appointment requests.

| Field | Description |
| --- | --- |
| `id` | Unique appointment ID |
| `name` | Patient name |
| `phone` | Patient phone |
| `email` | Optional email |
| `service` | Selected service |
| `location` | Clinic location |
| `preferred_date` | Preferred visit date |
| `preferred_time` | Preferred time |
| `message` | Patient message and stored metadata |
| `status` | Appointment status |
| `created_at` | Creation timestamp |

### 11.2 `reviews`

Stores patient testimonials.

| Field | Description |
| --- | --- |
| `id` | Unique review ID |
| `name` | Reviewer name |
| `treatment` | Treatment name |
| `rating` | Rating from 1 to 5 |
| `text` | Review message |
| `is_approved` | Public visibility status |
| `created_at` | Creation timestamp |

### 11.3 `off_dates`

Stores dates when the clinic is unavailable.

| Field | Description |
| --- | --- |
| `id` | Unique record ID |
| `date` | Off-date |
| `reason` | Optional reason |
| `created_at` | Creation timestamp |

### 11.4 `disabled_slots`

Stores unavailable slots for specific dates.

| Field | Description |
| --- | --- |
| `id` | Unique record ID |
| `date` | Date |
| `time_slot` | Disabled time slot |
| `created_at` | Creation timestamp |

### 11.5 `clinic_staff_roles`

Stores role information for authenticated clinic users.

| Field | Description |
| --- | --- |
| `user_id` | Supabase authenticated user ID |
| `role` | User role: admin, doctor, or staff |
| `display_name` | Optional display name |
| `is_active` | Whether the role is active |
| `created_at` | Creation timestamp |
| `updated_at` | Last update timestamp |

### 11.6 `whatsapp_message_logs`

Stores WhatsApp confirmation and reminder message activity.

| Field | Description |
| --- | --- |
| `id` | Unique log ID |
| `appointment_id` | Related appointment ID |
| `patient_name` | Patient name |
| `phone` | Patient phone number |
| `message_type` | Confirmation, reminder, follow-up, review request, or custom |
| `message_body` | Generated message text |
| `delivery_mode` | Delivery method such as WhatsApp link |
| `status` | Queued, opened, sent, or failed |
| `sent_by` | User who triggered the message |
| `sent_at` | Message action timestamp |
| `created_at` | Creation timestamp |

### 11.7 `opd_bills` and `opd_bill_items`

Stores OPD billing data in normalized format.

| Table | Purpose |
| --- | --- |
| `opd_bills` | Main bill details such as bill number, patient, date, status, amount, payment mode, and consultation mode |
| `opd_bill_items` | Line items linked to each OPD bill |

### 11.8 Pharmacy Tables

Stores pharmacy records in separate database tables.

| Table | Purpose |
| --- | --- |
| `pharmacy_medicines` | Medicine master and stock details |
| `pharmacy_sales` | Pharmacy sales invoice header |
| `pharmacy_sale_items` | Medicines linked to sales invoices |
| `pharmacy_purchases` | Purchase invoice header |
| `pharmacy_purchase_items` | Medicines linked to purchase invoices |

### 11.9 `clinic_admin_state`

Stores legacy shared admin data as JSON payload and acts as a fallback for older deployments that have not yet applied the normalized table migration.

| Field | Description |
| --- | --- |
| `id` | State key, mainly `primary` |
| `payload` | Legacy JSON data |
| `updated_at` | Last update timestamp |

## 12. Security

Security is handled mainly through Supabase Row Level Security policies.

- Public users can submit appointments.
- Only authenticated users can view appointments.
- Public users can submit reviews.
- Public users can view only approved reviews.
- Admin users can view, update, approve, and delete reviews.
- Public users can view off-dates and disabled slots.
- Only authenticated users can create or delete schedule settings.
- Admin, doctor, and staff roles are stored in `clinic_staff_roles`.
- OPD and pharmacy tables use row-level security for authenticated clinic roles.
- WhatsApp message logs are accessible only to authenticated clinic users.
- Legacy admin state is accessible only to authenticated users.
- Admin routes are protected by authentication checks.

## 13. User Roles

### Patient/Public User

- View clinic website
- Read services and blogs
- Submit appointment request
- Submit review
- Use phone, email, WhatsApp, and map links

### Admin User

- Login to dashboard
- Manage appointments
- Update appointment status
- View patient queue
- Generate OPD bills
- Manage pharmacy records
- Approve or delete reviews
- Manage schedule availability
- View operational metrics

### Doctor User

- View doctor panel
- View appointment queue
- Manage consultations and follow-ups
- Generate OPD bills when needed
- View patient and analytics sections

### Staff User

- Manage appointment desk
- Send WhatsApp confirmations and reminders
- Manage OPD billing
- Manage pharmacy records
- View patients and follow-ups

## 14. Functional Requirements

1. The system should display clinic services and contact details.
2. The system should allow appointment booking.
3. The system should validate required appointment fields.
4. The system should prevent booking on unavailable dates or slots.
5. The system should store appointment records in Supabase.
6. The system should keep local appointment backup if cloud sync fails.
7. The system should allow admin login.
8. The system should display appointments in the admin dashboard.
9. The system should allow appointment status changes.
10. The system should allow OPD bill generation.
11. The system should allow invoice preview and printing.
12. The system should allow pharmacy medicine management.
13. The system should update stock after sale and purchase invoices.
14. The system should allow review submission and moderation.
15. The system should support SEO-friendly blog pages.
16. The system should provide role-based dashboard access.
17. The system should generate WhatsApp confirmation and reminder messages.
18. The system should store OPD and pharmacy records in normalized database tables.

## 15. Non-Functional Requirements

1. The website should be responsive on desktop, tablet, and mobile.
2. The UI should be user-friendly and visually professional.
3. Admin data should update reliably.
4. The application should load quickly using Vite and lazy loading.
5. The system should use TypeScript for better code safety.
6. The application should support SEO through metadata and structured data.
7. Sensitive admin operations should require authentication.
8. The project should be maintainable through reusable components and shared helper functions.

## 16. Installation and Running Steps

### Prerequisites

- Node.js
- npm
- Supabase project credentials

### Setup

1. Open the project folder.
2. Install dependencies:

```bash
npm install
```

3. Add Supabase environment variables in `.env`:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open the local URL shown by Vite, for example:

```text
http://127.0.0.1:8080/
```

## 17. Testing

The project includes Vitest configuration and test files for important utility functions.

Available commands:

```bash
npm run test
npm run lint
npm run build
```

Existing test coverage includes:

- Appointment time conversion helpers
- Appointment local storage and normalization helpers

Manual testing can be done for:

- Appointment booking flow
- Admin login flow
- Appointment status update
- Review submission and approval
- OPD bill generation
- Pharmacy sale and purchase invoice creation
- WhatsApp confirmation and reminder message flow
- Role-based dashboard navigation
- Slot disabling and off-date selection
- Blog page routing
- Mobile responsive layout

## 18. Advantages

- Professional clinic website for online presence
- Easy appointment request system
- Admin dashboard for daily clinic workflow
- Real-time appointment updates
- Local backup for appointment requests
- Role-based dashboard access for admin, doctor, and staff
- WhatsApp confirmation and reminder workflow
- OPD billing and invoice printing
- Pharmacy inventory and invoice management
- Normalized OPD and pharmacy database tables
- Review moderation for trust building
- SEO-friendly blog architecture
- Responsive design for all major screen sizes

## 19. Limitations

- Advanced payment gateway integration is not included.
- Full electronic medical records are not included.
- True background WhatsApp sending through WhatsApp Business API requires external API credentials and production configuration.
- Advanced reporting exports such as Excel/PDF reports are not included.

## 20. Future Enhancements

Possible future improvements include:

1. Online payment gateway integration.
2. Direct WhatsApp Business API integration for unattended background sending.
3. SMS reminder integration.
4. Patient login portal.
5. Prescription management.
6. Lab report upload and history tracking.
7. PDF export for invoices and analytics reports.
8. Advanced revenue dashboard with date filters.
9. Backup and restore tools for admin data.

## 21. Conclusion

Sharma Cosmo Clinic is a complete clinic website and management system that supports both patient engagement and internal clinic operations. The public website helps the clinic attract and inform patients, while the role-based admin dashboard helps staff manage appointments, WhatsApp communication, billing, pharmacy, reviews, schedule, and follow-ups.

By using React, TypeScript, Tailwind CSS, and Supabase, the project delivers a modern, scalable, and maintainable web application. It reduces manual effort, improves patient communication, and gives the clinic a strong digital foundation for future growth.
