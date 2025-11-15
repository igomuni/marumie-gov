#!/usr/bin/env node

/**
 * Extract public/data from public_data.tar.gz
 * This script is run before build to extract preprocessed data
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ARCHIVE_PATH = path.join(process.cwd(), 'public_data.tar.gz');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const DATA_DIR = path.join(PUBLIC_DIR, 'data');

console.log('Checking if public/data directory exists...');

// Check if data directory already exists
if (fs.existsSync(DATA_DIR) && fs.readdirSync(DATA_DIR).length > 0) {
  console.log('✓ public/data directory already exists, skipping extraction');
  process.exit(0);
}

console.log('Extracting public/data from archive...');
console.log(`Archive: ${ARCHIVE_PATH}`);

// Check if archive exists
if (!fs.existsSync(ARCHIVE_PATH)) {
  console.error('Error: public_data.tar.gz not found');
  console.error('Please ensure public_data.tar.gz is in the project root');
  process.exit(1);
}

// Ensure public directory exists
if (!fs.existsSync(PUBLIC_DIR)) {
  console.log('Creating public directory...');
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

try {
  // Extract tar.gz to public/
  execSync(`tar -xzf ${ARCHIVE_PATH} -C ${PUBLIC_DIR}`, { stdio: 'inherit' });

  console.log('✓ Data extraction completed');

  // Verify extraction
  if (fs.existsSync(DATA_DIR)) {
    const files = fs.readdirSync(DATA_DIR);
    console.log(`✓ Found ${files.length} items in public/data/`);
  } else {
    console.error('Error: public/data directory not found after extraction');
    process.exit(1);
  }
} catch (error) {
  console.error('Error extracting data:', error.message);
  process.exit(1);
}
