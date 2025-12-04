/**
 * Slack Reporter for Playwright
 * Sends test results & failures to Slack
 */

import { Reporter, FullResult, Suite, TestCase, TestResult, FullConfig } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

// Use native fetch if available (Node 18+), otherwise fallback to node-fetch
const getFetch = async () => {
  if (typeof globalThis !== 'undefined' && typeof globalThis.fetch !== 'undefined') {
    return globalThis.fetch;
  }
  const nodeFetch = await import('node-fetch');
  return nodeFetch.default;
};

let fetchFn: any = null;

interface SlackMessage {
  channel?: string;
  username?: string;
  icon_emoji?: string;
  attachments?: Array<{
    fallback: string;
    color: string;
    title?: string;
    title_link?: string;
    fields?: Array<{
      title: string;
      value: string;
      short?: boolean;
    }>;
    image_url?: string;
    text?: string;
    ts?: number;
  }>;
}

interface TestStats {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  passRate: number;
}

class SlackReporter implements Reporter {
  private slackWebhookUrl: string;
  private channel: string;
  private testStats: TestStats = {
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    duration: 0,
    passRate: 0,
  };
  private failedTests: Array<{
    name: string;
  }> = [];

  private testStartTime: number = 0;
  private config: FullConfig | null = null;

  constructor() {
    this.slackWebhookUrl =
      process.env.SLACK_WEBHOOK_URL || '';
    this.channel = process.env.SLACK_CHANNEL || '#test-results';

    if (!this.slackWebhookUrl) {
      console.warn(
        '⚠️  SLACK_WEBHOOK_URL not set. Slack notifications will not be sent.'
      );
    } else {
      console.log('✅ Slack webhook configured:', this.slackWebhookUrl.substring(0, 50) + '...');
    }
  }

  /**
   * Called when test run starts
   */
  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;
    this.testStartTime = Date.now();

    if (this.slackWebhookUrl) {
      this.sendTestStartNotification(config);
    }
  }

  /**
   * Called when a test result is available
   */
  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'passed') {
      this.testStats.passed++;
    } else if (result.status === 'failed') {
      this.testStats.failed++;
      this.recordFailedTest(test, result);
    } else if (result.status === 'skipped') {
      this.testStats.skipped++;
    }
    this.testStats.total++;
  }

  /**
   * Called when all tests are done
   */
  async onEnd(result: FullResult): Promise<void> {
    this.testStats.duration = result.startTime ? Date.now() - (result.startTime as any) : 0;
    this.testStats.passRate =
      this.testStats.total > 0
        ? Math.round((this.testStats.passed / this.testStats.total) * 100)
        : 0;

    if (this.slackWebhookUrl) {
      await this.sendSlackNotification();
    }
  }

  /**
   * Send test start notification
   */
  private sendTestStartNotification(config: FullConfig): void {
    const message: SlackMessage = {
      channel: this.channel,
      username: 'Playwright Test Reporter',
      icon_emoji: ':rocket:',
      attachments: [
        {
          fallback: '🚀 The Cat API automation Test run started',
          color: '#0099ff',
          title: '🚀 The Cat API automation Test Run Started',
          fields: [
            {
              title: 'Worker Threads',
              value: `${config.workers || 1}`,
              short: true,
            },
            {
              title: 'Projects',
              value: `${config.projects?.map((p) => p.name).filter(Boolean).join(', ') || 'Default'}`,
              short: false,
            },
            {
              title: 'Timestamp',
              value: new Date().toLocaleString(),
              short: true,
            },
          ],
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    this.sendToSlack(message).catch((error) => {
      console.error('❌ Failed to send test start notification:', error);
    });
  }

  /**
   * Record a failed test with details
   */
  private recordFailedTest(test: TestCase, result: TestResult): void {
      const failedTest = {
    name: test.title
  };

  this.failedTests.push(failedTest);
}

// private extractReadableError(result: TestResult): string {
//   if (!result.error) {
//     return 'Test failed without error message';
//   }

//   const error = result.error;
  
//   // Extract the most relevant error message
//   let message = error.message || '';
  
//   // Remove stack traces - keep only the first line if it contains useful info
//   const lines = message.split('\n');
//   const firstMeaningfulLine = lines[0]?.trim() || '';
  
//   // If first line is generic, try to find a more specific error
//   if (firstMeaningfulLine && !this.isGenericError(firstMeaningfulLine)) {
//     message = firstMeaningfulLine;
//   } else if (lines.length > 1) {
//     // Look for assertion errors or specific failure messages
//     const assertionLine = lines.find(line => 
//       line.includes('Expected') || 
//       line.includes('Received') ||
//       line.includes('AssertionError')
//     );
//     message = assertionLine?.trim() || firstMeaningfulLine;
//   }
  
//   // Clean up common noise patterns
//   message = message
//     .replace(/^Error:\s*/i, '') // Remove "Error:" prefix
//     .replace(/\s+at\s+.*$/g, '') // Remove "at ..." stack trace indicators
//     .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
//     .trim();
  
//   return message || 'Unknown error';
// }

// private isGenericError(message: string): boolean {
//   const genericPatterns = [
//     /^error$/i,
//     /^test failed$/i,
//     /^failure$/i,
//     /^undefined$/i
//   ];
  
//   return genericPatterns.some(pattern => pattern.test(message));
// }

  /**
   * Truncate string to max length
   */
  private truncateString(str: string, maxLength: number): string {
    if (str.length > maxLength) {
      return str.substring(0, maxLength - 3) + '...';
    }
    return str;
  }

  /**
   * Convert duration to readable format
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Determine color based on pass rate
   */
  private getColorForPassRate(passRate: number): string {
    if (passRate === 100) return '#36a64f'; // Green
    if (passRate >= 80) return '#ffc107'; // Yellow
    if (passRate >= 50) return '#ff9800'; // Orange
    return '#f44336'; // Red
  }

  /**
   * Build test summary message
   */
  private buildTestSummaryMessage(): SlackMessage {
    const color = this.getColorForPassRate(this.testStats.passRate);

    const fields: Array<{
      title: string;
      value: string;
      short?: boolean;
    }> = [
      {
        title: 'Total Tests',
        value: `${this.testStats.total}`,
        short: true,
      },
      {
        title: '✅ Passed',
        value: `${this.testStats.passed} ✓`,
        short: true,
      },
      {
        title: '❌ Failed',
        value: `${this.testStats.failed} ✗`,
        short: true,
      },
      {
        title: 'Skipped',
        value: `${this.testStats.skipped}`,
        short: true,
      },
      {
        title: 'Pass Rate',
        value: `${this.testStats.passRate}%`,
        short: true,
      },
      {
        title: 'Duration',
        value: this.formatDuration(this.testStats.duration),
        short: true,
      },
    ];

    const statusEmoji =
      this.testStats.passRate === 100
        ? '✅'
        : this.testStats.passRate >= 80
        ? '⚠️'
        : '❌';

    return {
      channel: this.channel,
      username: 'Playwright Test Reporter',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          fallback: `Test Results: ${this.testStats.passed}/${this.testStats.total} passed`,
          color,
          title: `${statusEmoji} Test Results Summary`,
          fields,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };
  }

  /**
   * Build failed tests message
   */
  private buildFailedTestsMessage(): SlackMessage | null {
    if (this.failedTests.length === 0) {
      return null;
    }

    const failureText = this.failedTests
      .map((test, index) => {
        return `${index + 1}. *${test.name}*\n`;
      })
      .join('\n\n');

    return {
      channel: this.channel,
      username: 'Playwright Test Reporter',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          fallback: `${this.failedTests.length} test(s) failed`,
          color: '#f44336',
          title: `❌ Failed Tests (${this.failedTests.length})`,
          text: failureText,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };
  }

  /**
   * Send all messages to Slack
   */
  private async sendSlackNotification(): Promise<void> {
    try {
      // Send summary message
      await this.sendToSlack(this.buildTestSummaryMessage());

      // Send failed tests message if there are failures
      const failedMessage = this.buildFailedTestsMessage();
      if (failedMessage) {
        await this.sendToSlack(failedMessage);
      }
      console.log('✅ Test results sent to Slack');
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error);
    }
  }

  /**
   * Send message to Slack webhook
   */
  private async sendToSlack(message: SlackMessage): Promise<void> {
    if (!this.slackWebhookUrl) {
      return;
    }

    if (!fetchFn) {
      fetchFn = await getFetch();
    }

    console.log('📤 Sending to Slack:', this.slackWebhookUrl.substring(0, 50) + '...');
    console.log('📝 Full URL length:', this.slackWebhookUrl.length);
    const response = await fetchFn(this.slackWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`Response status: ${response.status}, ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
      throw new Error(`Slack API error: ${response.statusText}`);
    }
  }
}

export default SlackReporter;
