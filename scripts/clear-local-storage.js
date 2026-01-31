// Clear localStorage script for ff14-raid-visualizer
// Run this in browser console (F12 → Console) or create a bookmarklet

// Method 1: Clear specific key
localStorage.removeItem('ff14-raid-visualizer-autosave');
console.log('✅ Auto-save data cleared from localStorage');

// Method 2: Clear all localStorage (if you want to be thorough)
// localStorage.clear();
// console.log('✅ All localStorage cleared');
