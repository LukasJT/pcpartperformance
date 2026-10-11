'use strict';

// Source checking establishes identity and scope, not a human editorial decision.
// Keep click-to-load rendering in the caller. This module imports no benchmark data.
const sourceRecord = require('../docs/program-2026-10-11/review-video-sources.json');

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

const evidence = freeze(sourceRecord);
const prebuiltReviews = evidence.prebuiltReviews;
const phoneReviews = evidence.phoneReviews;
const defaultPhonePair = evidence.defaultPhonePair;

function reviewsForPrebuilt(prebuiltId) {
  return prebuiltReviews.filter(review => review.prebuiltIds.includes(prebuiltId));
}

// Order-independent, exact base-model matching; never fall back for another pair.
function phoneReviewForPair(firstId, secondId) {
  if (!firstId || !secondId || firstId === secondId) return null;
  return phoneReviews.find(review => review.phoneIds.length === 2
    && review.phoneIds.includes(firstId) && review.phoneIds.includes(secondId)) || null;
}

function isDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

function capacity(value) {
  const match = typeof value === 'string' && value.match(/^\s*(\d+(?:\.\d+)?)\s*GB\b/i);
  return match ? Number(match[1]) : null;
}

function validate({prebuilts = require('./prebuilt-data.cjs'), phones = require('./phone-data.cjs')} = {}) {
  const issues = [];
  const prebuiltById = new Map(prebuilts.map(item => [item.id, item]));
  const phoneIds = new Set(phones.map(item => item.id));
  const ids = new Set();
  const videoIds = new Set();
  if (prebuiltReviews.length < 2 || prebuiltReviews.length > 4) issues.push('Expected two to four component reviews.');
  if (phoneReviews.length !== 1) issues.push('Expected one bounded phone comparison.');
  if (!isDate(evidence.checkedAt)) issues.push('Invalid evidence check date.');

  for (const review of [...prebuiltReviews, ...phoneReviews]) {
    if (ids.has(review.id) || videoIds.has(review.videoId)) issues.push(`Duplicate review: ${review.id}`);
    ids.add(review.id); videoIds.add(review.videoId);
    if (!/^[A-Za-z0-9_-]{11}$/.test(review.videoId)) issues.push(`Invalid video ID: ${review.id}`);
    if (review.url !== `https://www.youtube.com/watch?v=${review.videoId}`) issues.push(`Watch URL mismatch: ${review.id}`);
    if (!isDate(review.publishedDate) || !isDate(review.checkedAt) || review.publishedDate > review.checkedAt || review.checkedAt !== evidence.checkedAt) issues.push(`Invalid dates: ${review.id}`);
    for (const field of ['title', 'channel', 'reviewedModel', 'relationship', 'label', 'scope', 'sourceURL', 'limitations']) {
      if (typeof review[field] !== 'string' || !review[field].trim()) issues.push(`Missing ${field}: ${review.id}`);
    }
    for (const disclosure of [review.sponsorship, review.affiliateDisclosure]) {
      if (!disclosure || !['disclosed', 'unknown'].includes(disclosure.status) || !disclosure.details || !disclosure.sourceURL) issues.push(`Missing or unsupported disclosure: ${review.id}`);
    }
    if (!review.verification || review.verification.playbackTested !== false) issues.push(`Playback verification overstated: ${review.id}`);
    const hostname = new URL(review.sourceURL).hostname;
    if (!['gamersnexus.net', 'www.youtube.com'].includes(hostname)) issues.push(`Unexpected source host: ${review.id}`);
  }

  for (const review of prebuiltReviews) {
    if (review.relationship !== 'component-only' || review.channel !== 'Gamers Nexus') issues.push(`Invalid component scope: ${review.id}`);
    if (!Array.isArray(review.prebuiltIds) || !review.prebuiltIds.length) issues.push(`No prebuilt mapping: ${review.id}`);
    const gpu = review.gpuFamily.replace(/^(GeForce|Radeon) /, '');
    const familyPattern = new RegExp(`(?:^|\\s)${gpu.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s)(?!Ti|SUPER)`, 'i');
    for (const prebuiltId of review.prebuiltIds) {
      const listing = prebuiltById.get(prebuiltId);
      if (!listing) issues.push(`Unknown prebuilt: ${prebuiltId}`);
      else if (!familyPattern.test(listing.gpu || '')) issues.push(`GPU-family mismatch: ${prebuiltId}`);
      else if (listing.vram && capacity(listing.vram) !== capacity(review.memoryVariant)) issues.push(`VRAM mismatch: ${prebuiltId}`);
      else if (gpu === 'RX 9060 XT' && capacity(listing.vram) !== 16) issues.push(`16 GB variant not established: ${prebuiltId}`);
    }
  }

  for (const review of phoneReviews) {
    if (review.relationship !== 'phone-comparison' || review.channel !== 'Android Authority') issues.push(`Invalid phone scope: ${review.id}`);
    if (!Array.isArray(review.phoneIds) || review.phoneIds.length !== 2 || new Set(review.phoneIds).size !== 2) issues.push(`Invalid phone mapping: ${review.id}`);
    else for (const phoneId of review.phoneIds) if (!phoneIds.has(phoneId)) issues.push(`Unknown phone: ${phoneId}`);
    if (JSON.stringify(review.defaultPair) !== JSON.stringify(defaultPhonePair)) issues.push(`Default pair mismatch: ${review.id}`);
  }
  return {ok: issues.length === 0, issues, prebuiltReviewCount: prebuiltReviews.length, phoneReviewCount: phoneReviews.length, mappedPrebuiltCount: new Set(prebuiltReviews.flatMap(review => review.prebuiltIds)).size, checkedAt: evidence.checkedAt};
}

module.exports = {prebuiltReviews, phoneReviews, defaultPhonePair, reviewsForPrebuilt, phoneReviewForPair, validate, evidence};

if (require.main === module) {
  const result = validate();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
