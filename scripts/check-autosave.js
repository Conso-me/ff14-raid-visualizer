// Check auto-save in localStorage
const fs = require('fs');
const path = require('path');

// Read the localStorage file if it exists (for debugging)
const autosaveKey = 'ff14-raid-visualizer-autosave-slot';
console.log('Checking auto-save...');
console.log('Auto-save key:', autosaveKey);
console.log('To verify in browser:');
console.log('1. Open developer tools (F12)');
console.log('2. Go to Application/Storage tab');
console.log('3. Check Local Storage');
console.log('4. Look for key:', autosaveKey);
console.log('');
console.log('Or run in console:');
console.log('localStorage.getItem("ff14-raid-visualizer-autosave-slot")');
