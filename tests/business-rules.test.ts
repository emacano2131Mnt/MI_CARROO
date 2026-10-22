import test from 'node:test';
import assert from 'node:assert/strict';
import { activityStatus, isAllowedServiceDate, nextDue, serviceTotal, type ActivityForStatus } from '../src/utils/business-rules.ts';

const base: ActivityForStatus = { paused: 0, due_date: null, due_mileage: null, mileage: 1000, advance_days: 14, advance_km: 500 };

test('calcula los estados de actividad por fecha o kilometraje', () => {
  assert.equal(activityStatus(base, '2026-10-21'), 'Sin programación');
  assert.equal(activityStatus({ ...base, due_date: '2026-11-20' }, '2026-10-21'), 'Al día');
  assert.equal(activityStatus({ ...base, due_date: '2026-10-30' }, '2026-10-21'), 'Próxima');
  assert.equal(activityStatus({ ...base, due_date: '2026-10-20' }, '2026-10-21'), 'Vencida');
  assert.equal(activityStatus({ ...base, due_mileage: 1400 }, '2026-10-21'), 'Próxima');
  assert.equal(activityStatus({ ...base, due_mileage: 1000 }, '2026-10-21'), 'Vencida');
  assert.equal(activityStatus({ ...base, due_date: '2026-10-20', due_mileage: 9000 }, '2026-10-21'), 'Vencida');
  assert.equal(activityStatus({ ...base, paused: 1 }, '2026-10-21'), 'Pausada');
});

test('recalcula periodicidad desde la fecha y kilometraje reales del servicio', () => {
  assert.deepEqual(nextDue('2026-10-21', 12345, 90, 5000), { dueDate: '2027-01-19', dueMileage: 17345 });
  assert.deepEqual(nextDue('2026-10-21', 12345, null, 5000), { dueDate: null, dueMileage: 17345 });
});

test('suma costos y rechaza importes negativos', () => {
  assert.equal(serviceTotal(100000, 250000, 15000), 365000);
  assert.throws(() => serviceTotal(100, -1, 0), /no negativos/);
});

test('rechaza fechas inválidas y posteriores al día actual', () => {
  assert.equal(isAllowedServiceDate('2026-10-21', '2026-10-21'), true);
  assert.equal(isAllowedServiceDate('2026-10-22', '2026-10-21'), false);
  assert.equal(isAllowedServiceDate('2026-02-30', '2026-10-21'), false);
});
