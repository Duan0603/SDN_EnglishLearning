// ============================================================
// CENTRALIZED ICON SYSTEM
// Source: @expo/vector-icons ONLY
// Fixes ALL broken icon rendering issues
// ============================================================

import React from 'react';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from '@expo/vector-icons';

// ─── Icon size presets ────────────────────────────────────────
export const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
};

// ─── Core AppIcon component ───────────────────────────────────
const AppIcon = ({ name, size = ICON_SIZE.md, color = '#6B7280', style }) => {
  const iconMap = {
    // ── Bottom Tabs ──────────────────────────────────────
    home:                   { lib: Ionicons,               n: 'home' },
    'home-outline':         { lib: Ionicons,               n: 'home-outline' },
    practice:               { lib: MaterialCommunityIcons, n: 'book-open-page-variant' },
    'practice-outline':     { lib: MaterialCommunityIcons, n: 'book-open-page-variant-outline' },
    roadmap:                { lib: MaterialCommunityIcons, n: 'map-marker-path' },
    progress:               { lib: MaterialCommunityIcons, n: 'chart-line' },
    profile:                { lib: Ionicons,               n: 'person-circle' },
    'profile-outline':      { lib: Ionicons,               n: 'person-circle-outline' },

    // ── Authentication ───────────────────────────────────
    email:                  { lib: Ionicons,               n: 'mail-outline' },
    password:               { lib: Ionicons,               n: 'lock-closed-outline' },
    'eye-on':               { lib: Ionicons,               n: 'eye-outline' },
    'eye-off':              { lib: Ionicons,               n: 'eye-off-outline' },
    user:                   { lib: Feather,                n: 'user' },
    phone:                  { lib: Feather,                n: 'phone' },
    google:                 { lib: MaterialCommunityIcons, n: 'google' },

    // ── Status / Feedback ────────────────────────────────
    success:                { lib: Ionicons,               n: 'checkmark-circle' },
    'success-outline':      { lib: Ionicons,               n: 'checkmark-circle-outline' },
    error:                  { lib: Ionicons,               n: 'close-circle' },
    'error-outline':        { lib: Ionicons,               n: 'close-circle-outline' },
    warning:                { lib: Ionicons,               n: 'warning-outline' },
    info:                   { lib: Ionicons,               n: 'information-circle-outline' },
    check:                  { lib: Ionicons,               n: 'checkmark' },
    close:                  { lib: Ionicons,               n: 'close' },
    'check-circle':         { lib: Feather,                n: 'check-circle' },
    'x-circle':             { lib: Feather,                n: 'x-circle' },
    circle:                 { lib: Feather,                n: 'circle' },

    // ── Skills ───────────────────────────────────────────
    reading:                { lib: Ionicons,               n: 'document-text-outline' },
    writing:                { lib: Ionicons,               n: 'create-outline' },
    listening:              { lib: Ionicons,               n: 'headset-outline' },
    speaking:               { lib: Ionicons,               n: 'mic-outline' },
    'mic-active':           { lib: Ionicons,               n: 'mic' },
    'mic-off':              { lib: Ionicons,               n: 'mic-off-outline' },

    // ── Navigation ──────────────────────────────────────
    back:                   { lib: Ionicons,               n: 'arrow-back' },
    forward:                { lib: Ionicons,               n: 'arrow-forward' },
    up:                     { lib: Ionicons,               n: 'arrow-up' },
    down:                   { lib: Ionicons,               n: 'arrow-down' },
    'chevron-right':        { lib: Ionicons,               n: 'chevron-forward' },
    'chevron-left':         { lib: Ionicons,               n: 'chevron-back' },
    'chevron-down':         { lib: Ionicons,               n: 'chevron-down' },
    menu:                   { lib: Ionicons,               n: 'menu' },
    'more-vertical':        { lib: Ionicons,               n: 'ellipsis-vertical' },
    'more-horizontal':      { lib: Ionicons,               n: 'ellipsis-horizontal' },

    // ── Actions ──────────────────────────────────────────
    settings:               { lib: Ionicons,               n: 'settings-outline' },
    notifications:          { lib: Ionicons,               n: 'notifications-outline' },
    'notifications-active': { lib: Ionicons,               n: 'notifications' },
    logout:                 { lib: Ionicons,               n: 'log-out-outline' },
    edit:                   { lib: Feather,                n: 'edit-2' },
    trash:                  { lib: Feather,                n: 'trash-2' },
    share:                  { lib: Ionicons,               n: 'share-outline' },
    download:               { lib: Feather,                n: 'download' },
    upload:                 { lib: Feather,                n: 'upload' },
    refresh:                { lib: Ionicons,               n: 'refresh-outline' },
    search:                 { lib: Ionicons,               n: 'search-outline' },
    filter:                 { lib: Ionicons,               n: 'filter-outline' },
    add:                    { lib: Ionicons,               n: 'add' },
    'add-circle':           { lib: Ionicons,               n: 'add-circle-outline' },
    play:                   { lib: Ionicons,               n: 'play' },
    pause:                  { lib: Ionicons,               n: 'pause' },
    stop:                   { lib: Ionicons,               n: 'stop' },
    'play-circle':          { lib: Ionicons,               n: 'play-circle-outline' },

    // ── Features ─────────────────────────────────────────
    ai:                     { lib: MaterialCommunityIcons, n: 'brain' },
    star:                   { lib: Ionicons,               n: 'star' },
    'star-outline':         { lib: Ionicons,               n: 'star-outline' },
    trophy:                 { lib: Ionicons,               n: 'trophy-outline' },
    flame:                  { lib: Ionicons,               n: 'flame-outline' },
    bookmark:               { lib: Ionicons,               n: 'bookmark-outline' },
    heart:                  { lib: Ionicons,               n: 'heart-outline' },
    calendar:               { lib: Ionicons,               n: 'calendar-outline' },
    time:                   { lib: Ionicons,               n: 'time-outline' },
    timer:                  { lib: MaterialCommunityIcons, n: 'timer-outline' },
    lock:                   { lib: Ionicons,               n: 'lock-closed-outline' },
    unlock:                 { lib: Ionicons,               n: 'lock-open-outline' },
    diamond:                { lib: Ionicons,               n: 'diamond-outline' },
    subscription:           { lib: Ionicons,               n: 'diamond-outline' },

    // ── Admin ────────────────────────────────────────────
    admin:                  { lib: Ionicons,               n: 'shield-checkmark-outline' },
    analytics:              { lib: Ionicons,               n: 'stats-chart-outline' },
    users:                  { lib: Ionicons,               n: 'people-outline' },
    dashboard:              { lib: MaterialCommunityIcons, n: 'view-dashboard-outline' },

    // ── Content ──────────────────────────────────────────
    book:                   { lib: Ionicons,               n: 'book-outline' },
    document:               { lib: Ionicons,               n: 'document-outline' },
    image:                  { lib: Ionicons,               n: 'image-outline' },
    video:                  { lib: Ionicons,               n: 'videocam-outline' },
    audio:                  { lib: Ionicons,               n: 'volume-medium-outline' },
    'audio-off':            { lib: Ionicons,               n: 'volume-mute-outline' },
    link:                   { lib: Feather,                n: 'link' },
    copy:                   { lib: Feather,                n: 'copy' },
    map:                    { lib: Ionicons,               n: 'map-outline' },
    location:               { lib: Ionicons,               n: 'location-outline' },
    chat:                   { lib: Ionicons,               n: 'chatbubble-outline' },
    help:                   { lib: Ionicons,               n: 'help-circle-outline' },
    
    // ── Missing Mappings ──────────────────────────────────
    award:                  { lib: Ionicons,               n: 'medal-outline' },
    medal:                  { lib: Ionicons,               n: 'medal' },
    headset:                { lib: Ionicons,               n: 'headset-outline' },
    mic:                    { lib: Ionicons,               n: 'mic-outline' },
    camera:                 { lib: Ionicons,               n: 'camera-outline' },
    chatbubbles:            { lib: Ionicons,               n: 'chatbubbles-outline' },
    'log-out':              { lib: Ionicons,               n: 'log-out-outline' },
    email:                  { lib: Ionicons,               n: 'mail-outline' },
    password:               { lib: Ionicons,               n: 'lock-closed-outline' },
  };

  const icon = iconMap[name];
  if (!icon) {
    // Fallback to Ionicons help icon so nothing breaks
    console.warn(`AppIcon: icon "${name}" not found, using fallback.`);
    return <Ionicons name="help-circle-outline" size={size} color={color} style={style} />;
  }

  const IconLib = icon.lib;
  return <IconLib name={icon.n} size={size} color={color} style={style} />;
};

export default AppIcon;
