/**
 * Fictiva testanvändare för testläge.
 * Lösenorden nedan är ENDAST för utveckling/testning – aldrig i produktion.
 * De matas snabbt in i UserStore som genererar korrekt salt+hash.
 */
export const testUsers: { name: string; email: string; password: string; phone?: string }[] = [
  { name: 'Anna Svensson',  email: 'anna@test.se',  password: 'TestLosen1',  phone: '0701234567' },
  { name: 'Björn Karlsson', email: 'bjorn@test.se', password: 'TestLosen2',  phone: '0707654321' },
  { name: 'Cecilia Nilsson',email: 'cecilia@test.se', password: 'TestLosen3' },
  { name: 'David Eriksson', email: 'david@test.se', password: 'TestLosen4' },
  // En "extra känslig" användare – tänk dig den som admin i framtiden.
  { name: 'Admin Test',     email: 'admin@test.se', password: 'SuperHemligt1' },
];
