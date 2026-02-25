export const MOCK_STAMPS = [
  { id: 'stamp-forest', name: 'Ancient Oak', color: '#2e7d32', icon: 'Tree' },
  { id: 'stamp-sky', name: 'Cloud Peak', color: '#81d4fa', icon: 'Cloud' },
  { id: 'stamp-sun', name: 'Golden Sol', color: '#fbc02d', icon: 'Sun' },
  { id: 'stamp-moon', name: 'Silver Crescent', color: '#9e9e9e', icon: 'Moon' },
];

export const MOCK_USER = {
  _id: 'mock-user-123',
  full_name: 'Elder Thorne',
  birth_date: '1985-05-12',
  addresses: [{ address: 'elder-thorne', label: 'Primary' }],
  bird: {
    name: 'Hugin',
    type: 'raven',
  },
  stamps: ['stamp-forest', 'stamp-sky'],
  created_at: new Date().toISOString(),
};

export const MOCK_LETTERS = [
  {
    _id: 'letter-mock-1',
    sender_address: 'mystic-vale',
    receiver_address: 'elder-thorne',
    content_raw: 'The stars align over the Great Oak. The ritual begins at midnight. Bring the silver chalice.',
    content_rendered: '<p>The stars align over the Great Oak. The ritual begins at midnight. Bring the silver chalice.</p>',
    available_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    created_at: new Date(Date.now() - 172800000).toISOString(),
    stamp: MOCK_STAMPS[0],
  },
  {
    _id: 'letter-mock-2',
    sender_address: 'iron-forge',
    receiver_address: 'elder-thorne',
    content_raw: 'The shipment of dragon-glass has arrived. Prepare the forges. We strike at dawn.',
    content_rendered: '<p>The shipment of dragon-glass has arrived. Prepare the forges. We strike at dawn.</p>',
    available_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    created_at: new Date(Date.now() - 7200000).toISOString(),
    stamp: MOCK_STAMPS[2],
  },
  {
    _id: 'letter-mock-3',
    sender_address: 'silver-stream',
    receiver_address: 'elder-thorne',
    content_raw: 'The river whispers of a coming storm. Secure the scrolls in the high tower.',
    content_rendered: '<p>The river whispers of a coming storm. Secure the scrolls in the high tower.</p>',
    available_at: new Date(Date.now() - 10000).toISOString(), // 10 seconds ago
    created_at: new Date(Date.now() - 120000).toISOString(),
    stamp: null,
  }
];
