# QA Test Report: BabyBloom Platform

## Test Environment
- Local Development Server (Vite)
- Browsers: Chromium (via subagent)

## Test Areas

### 1. Guest View & Navigation
**Status**: Tested
**Findings**:
- **Navigation/About Link**: The "About" link mentioned in design requirements is missing from the top navigation bar and footer.
- **Resource External Links**: In the "Resources" section on the homepage, "Learn More" links pointing to external sites (like WHO guidelines) open in the SAME tab instead of a NEW tab. This causes the user to leave the app unexpectedly.
- **Form Warnings**: Console logs show missing `autocomplete` attributes on email and password inputs in Login and Registration forms.

### 2. Authentication Flow
**Status**: Tested
**Findings**:
- **Login/Logout**: Login and logout functions work correctly and redirect users to their respective dashboards based on roles.
- **Date Input Validation**: During registration, HTML5 `type="date"` inputs consistently allow invalid values and are overly sensitive.

### 3. Admin Dashboard
**Status**: Tested
**Findings**:
- **Broken "Remove" Buttons**: The "Remove" button in both the **Pediatricians** and **Resources** tabs is non-functional. Clicking the button triggers no UI change, confirmation modal, or removal of the record.
- **"Add Resource" Failure**: The form to add a new resource in the Resources tab appears to submit (fields clear), but the new resource is not added to the list.
- **Navigation Dead-End**: Sidebar navigation becomes **unresponsive** when the user is on the **Resources** page.

### 4. Parent Dashboard
**Status**: Tested
**Findings**:
- **Appointment Booking Broken**: Every doctor/date combination tested returned "No available slots for this doctor on the selected date," preventing the creation of any appointments. This completely blocks the parent workflow.
- **Profile Data Sync Issue**: After successfully saving the Baby Profile, the 'Date of Birth' field in the summary card continues to display "Not added yet," despite the UI confirming the save.
- **UX Issue (Hidden Profile Form)**: The form to complete a baby's profile is unexpectedly located at the very bottom of the main dashboard rather than on the profile page itself or a dedicated route.
- **Navigation Unresponsiveness**: Sidebar links occasionally required multiple clicks to trigger a route change.

### 5. Doctor Dashboard
**Status**: Pending
**Findings**:
- Unable to test thoroughly due to blocked Appointment Booking flow on the parent side (no patients to view).
