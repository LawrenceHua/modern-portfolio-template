# Cron Jobs Documentation v2.0

**Last Updated:** February 16, 2026  
**Version:** 2.0.0  
**Status:** ✅ Active

---

## Overview

The OpenClaw system runs **3 consolidated cron jobs** that monitor all projects, run health checks, and generate daily summaries. All jobs post updates to **#ai-worker-chat** (C0AEWRXU9PY).

**Budget:** $500/month limit, $400 alert threshold

---

## Job 1: Master Progress Monitor

**Schedule:** Every 30 minutes (`*/30 * * * *`)  
**Priority:** Critical  
**Max Cost:** $0.50 per run (~$720/month if constant)  
**Status:** ✅ Enabled

### Purpose
Consolidated monitoring for all active projects. Replaces 3 previous jobs (ios_readiness, grubbrr_check, master_monitor).

### What It Checks
1. **ES API Health** - Hits `/health` endpoint on Azure backend
2. **iOS App Store Readiness** - Reviews IOS_APP_STORE_READY_REPORT.md
3. **GRUBBRR Sprint Progress** - Checks bug fix dashboard status
4. **n8n Workflow Status** - Verifies job search automation running
5. **Daily Summary Trigger** - If 9 AM, triggers summary generation

### Alerts
Posts to #ai-worker-chat immediately on:
- API downtime
- Critical bug count increase
- Workflow failures
- iOS blockers

---

## Job 2: Hourly Test Monitor

**Schedule:** Every hour (`0 * * * *`)  
**Priority:** High  
**Max Cost:** $0.25 per run (~$180/month)  
**Status:** ✅ Enabled

### Purpose
Automated health checks across all infrastructure. Replaces ios_testing and job_monitor.

### What It Tests
| Service | Endpoint | Expected |
|---------|----------|----------|
| ES API | https://expired-v2-dev-backend-app.azurewebsites.net/health | 200 OK |
| ES Docs | https://mellow-seahorse-1d903e.netlify.app | 200 OK |
| Portfolio | https://www.lawrencehua.com | 200 OK |
| ES Website | https://www.expiredsolutions.com | 200 OK |
| n8n | https://lawrencehua1.app.n8n.cloud | 200 OK |
| GRUBBRR Dashboard | https://grubbrr-live-20250216.netlify.app | 200 OK |

### Output
- Logs to `cron_logs/hourly_test_monitor_YYYYMMDD.log`
- Markdown report: `cron_logs/hourly_test_report_YYYYMMDD_HHMMSS.md`
- Alerts on failure to #ai-worker-chat

---

## Job 3: Daily Summary Generator

**Schedule:** Daily at 9:00 AM (`0 9 * * *`)  
**Priority:** Medium  
**Max Cost:** $1.00 per run (~$30/month)  
**Status:** ✅ Enabled

### Purpose
Comprehensive daily review and reporting. Replaces website_worker and docs_deploy.

### What It Does
1. **Review ES Status**
   - Check API health
   - Review iOS app readiness
   - Check Giant Eagle pilot prep

2. **Review GRUBBRR Progress**
   - Bug sprint dashboard status
   - Count fixed vs remaining bugs
   - Track 40-bug target

3. **Update Memory Files**
   - Create/update `memory/YYYY-MM-DD.md`
   - Add key achievements to `MEMORY.md`
   - Update project status

4. **Generate Reports**
   - API cost summary
   - System health report
   - Project progress snapshot

5. **Post to Slack**
   - Consolidated status to #ai-worker-chat
   - Cross-post to project channels as needed

### Output
- Daily log: `memory/2026-02-16.md` (example)
- Cost report: `cron_logs/daily_cost_report_YYYYMMDD.md`
- Slack update with summary

---

## Consolidation History

### Previous Jobs (v1.0 - Disabled)
| Job | Schedule | Reason for Consolidation |
|-----|----------|--------------------------|
| ios_readiness | 0 */3 * * * | Merged into master_monitor |
| ios_testing | 0 */6 * * * | Merged into hourly_test_monitor |
| website_worker | 0 2 * * * | Merged into daily_summary_generator |
| job_monitor | 0 */2 * * * | Merged into hourly_test_monitor |
| docs_deploy | 0 */6 * * * | Merged into daily_summary_generator |
| master_monitor | */30 * * * * | Merged into master_progress_monitor |
| grubbrr_check | 0 9 * * * | Merged into master_progress_monitor |

### New Jobs (v2.0 - Active)
| Job | Schedule | Coverage |
|-----|----------|----------|
| master_progress_monitor | */30 * * * * | All project progress + iOS + GRUBBRR |
| hourly_test_monitor | 0 * * * * | All health checks + iOS testing |
| daily_summary_generator | 0 9 * * * | Daily reports + docs + websites |

**Result:** 7 jobs → 3 jobs (57% reduction)  
**Benefit:** Simpler monitoring, no overlap, all enabled

---

## Cost Budgeting

### Monthly Projections
| Job | Per Run | Runs/Month | Monthly Cost |
|-----|---------|------------|--------------|
| master_progress_monitor | $0.50 | 1,440 | ~$30-50* |
| hourly_test_monitor | $0.25 | 720 | ~$15-30* |
| daily_summary_generator | $1.00 | 30 | ~$20-30 |
| **Total** | - | - | **~$65-110/month** |

*Actual costs lower due to quick health checks not using full budget

### Alert Thresholds
- **Warning:** $400/month (80% of budget)
- **Limit:** $500/month (hard stop)

---

## Troubleshooting

### Job Not Running
1. Check `cron_config.json` - `enabled` should be `true`
2. Check individual job `enabled` field
3. Verify `budget_limit` not exceeded
4. Check `cron_logs/` for error messages

### Too Many Alerts
- Adjust `max_cost_per_run` down
- Check if services actually down vs monitoring issue
- Review alert thresholds in individual jobs

### Need to Disable
```json
{
  "enabled": false  // Disables ALL jobs
}
```

Or disable individual job:
```json
{
  "jobs": {
    "hourly_test_monitor": {
      "enabled": false
    }
  }
}
```

---

## Related Files

- `cron_config.json` - Live configuration
- `cron_logs/` - Execution logs and reports
- `memory/YYYY-MM-DD.md` - Daily logs
- `MEMORY.md` - Long-term achievements
- `TOOLS.md` - Slack channel mappings

---

*Documentation maintained by OpenClaw system*
