# Configure Firebase Emulator for Local Development

**Created**: 2025-06-10
**Priority**: Medium
**Component**: Firebase/Development

## Description
Set up Firebase emulators for local development to avoid using production Firebase services during development and testing.

## Current State
- Firebase emulator configuration exists in .env.local but is set to false
- Firebase configuration files exist but emulators not configured
- Risk of affecting production data during development

## Tasks
- [ ] Configure Firebase emulators in firebase.json
- [ ] Set up Auth emulator on port 9099
- [ ] Set up Firestore emulator on port 8080
- [ ] Set up Storage emulator if needed
- [ ] Create scripts for starting emulators
- [ ] Update .env.local to use emulators by default
- [ ] Add emulator data export/import scripts
- [ ] Document emulator usage in README

## Configuration
```json
// firebase.json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## Scripts to Add
```json
"scripts": {
  "emulators:start": "firebase emulators:start",
  "emulators:export": "firebase emulators:export ./emulator-data",
  "emulators:import": "firebase emulators:start --import=./emulator-data"
}
```

## Acceptance Criteria
- [ ] Emulators start without errors
- [ ] App connects to emulators in dev mode
- [ ] Production credentials not used in development
- [ ] Data persists between emulator restarts