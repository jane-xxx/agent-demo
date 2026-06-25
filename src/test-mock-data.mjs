import { MOCK_MESSAGES, MOCK_LOGS } from './utils/mockData.js';

console.log('🧪 Testing Mock Data Expansion\n');

// Check each team
const teams = ['team-001', 'team-002', 'team-003', 'team-004', 'team-005'];
let totalMessages = 0;
let totalLogs = 0;

for (const teamId of teams) {
  const messages = MOCK_MESSAGES[teamId] || [];
  const logs = MOCK_LOGS[teamId] || [];
  totalMessages += messages.length;
  totalLogs += logs.length;
  
  const hasExpansion = messages.length >= 7;
  const status = hasExpansion ? '✅' : '❌';
  
  console.log(`${status} ${teamId}: ${messages.length} messages, ${logs.length} logs`);
  
  // Show last message preview
  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    console.log(`   Last: ${lastMsg.id} - "${lastMsg.content?.substring(0, 30) || lastMsg.data?.content?.substring(0, 30) || 'N/A'}..."`);
  }
  console.log();
}

console.log(`📊 Total: ${totalMessages} messages, ${totalLogs} logs`);
console.log(`🎯 Target: 7 messages per team (35 total)`);
