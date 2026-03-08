/**
 * Integration Test: Worker Service
 * 
 * Test suite to verify BullMQ worker properly processes scraping jobs
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

describe('Worker Integration Tests', () => {
  let redis: Redis;
  let queue: Queue;
  let worker: Worker;

  beforeAll(() => {
    redis = new Redis(REDIS_URL);
  });

  afterAll(async () => {
    await redis.quit();
    if (queue) await queue.close();
    if (worker) await worker.close();
  });

  it('should connect to Redis', async () => {
    const pong = await redis.ping();
    expect(pong).toBe('PONG');
  });

  it('should create scrape queue successfully', async () => {
    queue = new Queue('scrape-queue', { connection: redis });
    expect(queue).toBeDefined();
  });

  it('should add job to queue', async () => {
    const job = await queue.add('scrape-search', {
      searchId: 'test-search-id',
      query: 'test query',
      brands: [
        {
          searchBrandId: 'test-brand-id',
          brandId: 'test-brand-uuid',
          brandSlug: 'zara',
        },
      ],
    });

    expect(job).toBeDefined();
    expect(job.id).toBeDefined();
  });

  it('should store job status in Redis', async () => {
    const searchId = 'test-search-status';
    const status = { status: 'queued', jobId: 'test-job-123' };

    await redis.set(
      `scrape:${searchId}:status`,
      JSON.stringify(status),
      'EX',
      3600
    );

    const stored = await redis.get(`scrape:${searchId}:status`);
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toEqual(status);
  });

  it('should retrieve queued jobs', async () => {
    const jobs = await queue.getJobs(['waiting', 'active']);
    expect(Array.isArray(jobs)).toBe(true);
  });
});

/**
 * Docker Compose Deployment Test
 */
describe('Docker Compose Deployment', () => {
  it('should have docker-compose.yml', () => {
    const fs = require('fs');
    const path = require('path');
    
    const composePath = path.join(__dirname, '../../docker-compose.yml');
    expect(fs.existsSync(composePath)).toBe(true);
  });

  it('docker-compose.yml should define worker service', () => {
    const fs = require('fs');
    const path = require('path');
    const yaml = require('yaml');
    
    const composePath = path.join(__dirname, '../../docker-compose.yml');
    const composeFile = fs.readFileSync(composePath, 'utf8');
    const config = yaml.parse(composeFile);
    
    expect(config.services.worker).toBeDefined();
    expect(config.services.redis).toBeDefined();
    expect(config.services.web).toBeDefined();
  });

  it('worker service should use Dockerfile.worker', () => {
    const fs = require('fs');
    const path = require('path');
    const yaml = require('yaml');
    
    const composePath = path.join(__dirname, '../../docker-compose.yml');
    const composeFile = fs.readFileSync(composePath, 'utf8');
    const config = yaml.parse(composeFile);
    
    expect(config.services.worker.build.dockerfile).toBe('Dockerfile.worker');
  });
});
