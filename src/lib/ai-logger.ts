import fs from 'fs';
import path from 'path';

const AI_LOG_PATH = path.join(process.cwd(), 'logs', 'ai.log');

export function logAI(type: 'REQUEST' | 'RESPONSE', data: any) {
  const timestamp = new Date().toISOString();
  const emoji = type === 'REQUEST' ? '📤' : '📥';
  const logEntry = `${timestamp} ${emoji} [AI ${type}] ${JSON.stringify(data, null, 2)}\n`;
  
  // Ensure logs directory exists
  const logsDir = path.dirname(AI_LOG_PATH);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  
  // Append to ai.log
  fs.appendFileSync(AI_LOG_PATH, logEntry);
}