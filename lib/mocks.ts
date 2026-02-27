export const MOCK_STAMPS = [
  { id: 'stamp-forest', name: 'Ancient Oak', color: '#2e7d32', icon: 'Tree', price: 0, is_default: true },
  { id: 'stamp-sky', name: 'Cloud Peak', color: '#81d4fa', icon: 'Cloud', price: 0, is_default: true },
  { id: 'stamp-sun', name: 'Golden Sol', color: '#fbc02d', icon: 'Sun', price: 0, is_default: true },
  { id: 'stamp-moon', name: 'Silver Crescent', color: '#9e9e9e', icon: 'Moon', price: 50, is_default: false },
  { id: 'stamp-fire', name: 'Eternal Flame', color: '#f44336', icon: 'Flame', price: 75, is_default: false },
  { id: 'stamp-water', name: 'Deep Blue', color: '#2196f3', icon: 'Waves', price: 60, is_default: false },
];

export const MOCK_USER = {
  _id: 'mock-user-123',
  full_name: 'Elder Thorne',
  birth_date: '1985-05-12',
  addresses: [{ address: 'elder-thorne', label: 'Primary' }],
  bird: {
    name: 'Archimedes',
    type: 'owl',
  },
  gold: 250,
  stamps: [
    { stamp_id: 'stamp-forest', quantity: 5 },
    { stamp_id: 'stamp-sky', quantity: 3 },
    { stamp_id: 'stamp-sun', quantity: 10 },
  ],
  created_at: new Date().toISOString(),
};

export const MOCK_LETTERS = [
  {
    _id: 'letter-mock-1',
    sender_address: 'mystic-vale',
    receiver_address: 'elder-thorne',
    content: 'The stars align over the Great Oak. The ritual begins at midnight. Bring the silver chalice.',
    available_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    created_at: new Date(Date.now() - 172800000).toISOString(),
    stamp: MOCK_STAMPS[0],
  },
  {
    _id: 'letter-mock-2',
    sender_address: 'iron-forge',
    receiver_address: 'elder-thorne',
    content: 'The shipment of dragon-glass has arrived. Prepare the forges. We strike at dawn.',
    available_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    created_at: new Date(Date.now() - 7200000).toISOString(),
    stamp: MOCK_STAMPS[2],
  },
  {
    _id: 'letter-mock-3',
    sender_address: 'silver-stream',
    receiver_address: 'elder-thorne',
    content: 'The river whispers of a coming storm. Secure the scrolls in the high tower.',
    available_at: new Date(Date.now() - 10000).toISOString(), // 10 seconds ago
    created_at: new Date(Date.now() - 120000).toISOString(),
    stamp: null,
  }
];
