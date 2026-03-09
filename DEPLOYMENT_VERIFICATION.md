# Deployment Verification Steps

After the deployment completes, follow these steps to verify the fix:

## 1. Check PM2 Processes

View the application logs:
```bash
curl -s "https://coolify.dotthedoor.com/api/v1/applications/n0gwgwookgg48cs8o880kss0/logs" \
  -H "Authorization: Bearer $(cat /root/.coolify_token)" | jq -r '.logs'
```

You should see output similar to:
```
[PM2] Spawning PM2 daemon with pm2_home=/home/nextjs/.pm2
[PM2] PM2 Successfully daemonized
[PM2][WARN] Applications nextjs, worker not running, starting...
[PM2] App [nextjs] launched (1 instances)
[PM2] App [worker] launched (1 instances)
╔════════╦════════╦═════════╦═══════╦═══════╗
║ id     │ name   │ status  │ ...   │ ...   ║
╠════════╬════════╬═════════╬═══════╬═══════╣
║ 0      │ nextjs │ online  │ ...   │ ...   ║
║ 1      │ worker │ online  │ ...   │ ...   ║
╚════════╩════════╩═════════╩═══════╩═══════╝

[Worker] ScoutWo scraper worker starting...
[Worker] ✓ Worker ready - waiting for jobs...
▲ Next.js 14.1.4
 ✓ Ready in XXms
```

## 2. Test Scraping Functionality

1. Visit: https://scoutwo.dotthedoor.com/searches/d8275875-e3eb-4a61-8905-56731e5ad28b
2. Click the "Ürünleri Listele" (List Products) button
3. Wait 10-30 seconds for scraping to complete
4. Refresh the page
5. Verify that:
   - Real products are displayed (with names, prices, images)
   - Product count > 0
   - Products look authentic (not placeholder/mock data)
   - "Son Güncelleme" (Last Update) timestamp is recent

## 3. Check Worker Logs

If scraping doesn't work, check worker logs for errors:
```bash
# Worker logs should show scraping activity
[Worker] Processing scrape job for search d8275875-e3eb-4a61-8905-56731e5ad28b
[Worker] Scraping zara for query: QUERY_TEXT
[Worker] Found X products from zara
[Worker] Completed scrape job for search d8275875-e3eb-4a61-8905-56731e5ad28b
```

## Troubleshooting

### Issue: PM2 processes not showing in logs
- Check if deployment completed successfully
- Verify Dockerfile changes were applied
- Check container is using the new image

### Issue: Worker logs show Playwright errors
- Playwright dependencies might be missing
- Check if chromium installed correctly
- Verify PLAYWRIGHT_BROWSERS_PATH is set

### Issue: No products found
- Check brand domain mappings in `src/scraper/scraper.ts`
- Test search URLs manually in browser
- Anti-bot measures might be blocking requests
- Check Redis connection for job queue

### Issue: Container crashes or restarts
- Memory limit might be too low (increase from 2G if needed)
- PM2 might be OOM-killed
- Check container logs for crash details

## Success Criteria

✅ Both PM2 processes (nextjs + worker) show status "online"
✅ Worker logs show "ready - waiting for jobs"
✅ Clicking "Ürünleri Listele" queues a job and processes it
✅ Real products appear on the page after scraping
✅ Products have proper names, prices, images, and URLs
