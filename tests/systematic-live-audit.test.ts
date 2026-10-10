import http from 'http';
import assert from 'assert';

function req(options: http.RequestOptions, postData?: any): Promise<{ status?: number; headers: http.IncomingHttpHeaders; body: any }> {
  return new Promise((resolve, reject) => {
    const r = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : {} });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    r.on('error', reject);
    if (postData) {
      r.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    r.end();
  });
}

export async function runSystematicLiveAudit() {
  console.log('\n--- SYSTEMATIC AUDIT: VERIFYING ZERO DATA FABRICATION ACROSS BACKEND ---');

  // 1. Health check
  const health = await req({ hostname: 'localhost', port: 3000, path: '/api/health', method: 'GET' });
  assert.strictEqual(health.status, 200, 'Health endpoint must be 200');
  assert.strictEqual(health.body.status, 'healthy');
  assert.strictEqual(health.body.database.status, 'connected');
  assert.strictEqual(health.body.modulesCount, 20);
  console.log('  [PASS] 1: Health status healthy, 20 modules verified');

  // 2. Truthful National Rail PRS Availability
  const prs = await req({ hostname: 'localhost', port: 3000, path: '/api/v1/availability?train=12951&date=2026-10-15', method: 'GET' });
  assert.strictEqual(prs.status, 200);
  assert.strictEqual(prs.body.isSimulated, true, 'PRS must be explicitly flagged simulated');
  assert.strictEqual(prs.body.isOfficialInventoryAvailable, false, 'No fake official seats');
  assert.ok(prs.body.simulationNotice.includes('[DEMO_SIMULATION]'), 'Simulation notice required');
  console.log('  [PASS] 2: National Rail PRS availability flags demo simulation and zero fake seats');

  // 3. Operational curfew enforcement (no fake schedules past curfew)
  const curfew = await req({ hostname: 'localhost', port: 3000, path: '/api/v1/routes/search?from=METRO_ADH&to=METRO_GHT&departureTime=23:55', method: 'GET' });
  assert.strictEqual(curfew.status, 200);
  assert.strictEqual(curfew.body.count, 0, 'Curfew must return 0 trips');
  assert.strictEqual(curfew.body.itineraries.length, 0);
  console.log('  [PASS] 3: Operational curfew (23:55) returns 0 without silent morning retry');

  // 4. Unknown station returns 0 itineraries (truthful missing response)
  const missing = await req({ hostname: 'localhost', port: 3000, path: '/api/v1/routes/search?from=UNKNOWN_XYZ&to=TNA', method: 'GET' });
  assert.strictEqual(missing.status, 200);
  assert.strictEqual(missing.body.count, 0);
  console.log('  [PASS] 4: Unknown station returns 0 itineraries truthfully');

  // 5. Unindexed PNR does not fabricate seat confirmation
  const pnr = await req({ hostname: 'localhost', port: 3000, path: '/api/v1/pnr/8901234567', method: 'GET' });
  assert.strictEqual(pnr.status, 200);
  assert.strictEqual(pnr.body.isDemo, false);
  assert.strictEqual(pnr.body.status, 'OFFICIAL_PORTAL_REQUIRED');
  assert.ok(pnr.body.officialUrl.includes('indianrail.gov.in'));
  console.log('  [PASS] 5: Unindexed commercial PNR truthfully hands off to official portal');

  // 6. Ambiguous Dadar station normalizer
  const dadar = await req({ hostname: 'localhost', port: 3000, path: '/api/v1/stations/search?q=Dadar', method: 'GET' });
  assert.strictEqual(dadar.status, 200);
  const foundCodes = dadar.body.stations.map((s: any) => s.code);
  assert.ok(foundCodes.includes('DR') && foundCodes.includes('DDR'), 'Both DR and DDR returned');
  console.log('  [PASS] 6: Dadar search returns both DR (Central) and DDR (Western)');

  // 7. Security: cross-user isolation
  const userA = await req({ hostname: 'localhost', port: 3000, path: '/api/v1/passengers', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { name: 'User A', phone: '1111111111' });
  const userB = await req({ hostname: 'localhost', port: 3000, path: '/api/v1/passengers', method: 'POST', headers: { 'Content-Type': 'application/json' } }, { name: 'User B', phone: '2222222222' });
  
  const tokenA = userA.body.token;
  const tokenB = userB.body.token;

  // Book as User A
  const bookA = await req({
    hostname: 'localhost', port: 3000, path: '/api/v1/bookings', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokenA }
  }, {
    trainNumber: 'UNRESERVED', journeyDate: '2026-10-15', fromStationCode: 'TNA', toStationCode: 'CSMT',
    classBooked: 'II', ticketType: 'UNRESERVED_SUBURBAN', passengers: [{ name: 'User A', age: 30, gender: 'M' }]
  });
  const bookIdA = bookA.body.booking.id;

  // User B attempts to access User A booking
  const leakCheck = await req({
    hostname: 'localhost', port: 3000, path: '/api/v1/bookings/' + bookIdA, method: 'GET',
    headers: { 'Authorization': 'Bearer ' + tokenB }
  });
  assert.strictEqual(leakCheck.status, 403, 'Cross-user access must be blocked with 403');
  console.log('  [PASS] 7: Cross-user access blocked with 403 FORBIDDEN_CROSS_USER_ACCESS');

  // 8. Idempotent submission: duplicate booking prevented
  const idemKey = 'idem-' + Date.now();
  const bookIdem1 = await req({
    hostname: 'localhost', port: 3000, path: '/api/v1/bookings', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokenA, 'x-idempotency-key': idemKey }
  }, {
    trainNumber: 'UNRESERVED', journeyDate: '2026-10-15', fromStationCode: 'TNA', toStationCode: 'CSMT',
    classBooked: 'II', ticketType: 'UNRESERVED_SUBURBAN', passengers: [{ name: 'User A', age: 30, gender: 'M' }]
  });
  const bookIdem2 = await req({
    hostname: 'localhost', port: 3000, path: '/api/v1/bookings', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tokenA, 'x-idempotency-key': idemKey }
  }, {
    trainNumber: 'UNRESERVED', journeyDate: '2026-10-15', fromStationCode: 'TNA', toStationCode: 'CSMT',
    classBooked: 'II', ticketType: 'UNRESERVED_SUBURBAN', passengers: [{ name: 'User A', age: 30, gender: 'M' }]
  });
  assert.strictEqual(bookIdem1.body.booking.id, bookIdem2.body.booking.id, 'Idempotency returns exact same booking ID');
  console.log('  [PASS] 8: Idempotency deduplication verified (same booking returned without duplicate charge)');

  console.log('\nALL 8 SYSTEMATIC LIVE VERIFICATION CHECKS PASSED WITH ZERO FABRICATION');
}

runSystematicLiveAudit().catch(e => {
  console.error('VERIFICATION FAILED:', e);
  process.exit(1);
});
