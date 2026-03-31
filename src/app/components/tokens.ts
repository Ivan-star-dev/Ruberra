/**
 * RUBERRA Design Tokens — Mineral Shell
 */

export const R = {
  shell:    '#F9F9F7',
  ground:   '#F3F2EE',
  surface:  '#FFFFFF',
  lifted:   '#FAFAF8',
  selected: '#EDEAE4',
  hover:    '#F0EDE7',
  pressed:  '#E8E4DD',
  hairline: '#ECEAE4',
  line:     '#E2DED8',
  strong:   '#CCCAC4',
  ink:      '#1A1A18',
  ink2:     '#383835',
  ink3:     '#656560',
  ink4:     '#9E9E99',
  ink5:     '#C0C0BB',
  lab:      '#52796A',
  labLight: '#EEF4F1',
  school:   '#4A6B84',
  schoolLight: '#EEF2F6',
  creation: '#8A6238',
  creationLight: '#F5EFE7',
  live:     '#6B9C7A',
  success:  '#5C8A6A',
  t: {
    label:   { fontSize: '10px', fontWeight: 500, letterSpacing: '0.09em',  lineHeight: 1 },
    micro:   { fontSize: '10px', fontWeight: 400, letterSpacing: '0.03em',  lineHeight: 1.4 },
    meta:    { fontSize: '11px', fontWeight: 400, letterSpacing: '0.015em', lineHeight: 1.45 },
    ui:      { fontSize: '12px', fontWeight: 400, letterSpacing: '0.01em',  lineHeight: 1.5 },
    uiMed:   { fontSize: '12px', fontWeight: 500, letterSpacing: '0.01em',  lineHeight: 1.5 },
    body:    { fontSize: '13.5px', fontWeight: 400, letterSpacing: '0',     lineHeight: 1.65 },
    reading: { fontSize: '14px', fontWeight: 400, letterSpacing: '0',       lineHeight: 1.84 },
    title:   { fontSize: '15px', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.4 },
    display: { fontSize: '17px', fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.3 },
  },
  sp: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', xxl: '32px', '3xl': '48px' },
  r:  { sm: '4px', md: '6px', lg: '8px', xl: '10px', pill: '100px' },
  shadow: {
    xs: '0 1px 2px rgba(0,0,0,0.04)',
    sm: '0 1px 4px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)',
    md: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
  },
} as const;

export const chamberAccent = {
  lab:      { primary: R.lab,      light: R.labLight      },
  school:   { primary: R.school,   light: R.schoolLight   },
  creation: { primary: R.creation, light: R.creationLight },
} as const;

export type Mode = 'lab' | 'school' | 'creation';
