import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SystemCommand {
  command: string;
  description: string;
  requiresCreator: boolean;
}

export const SYSTEM_COMMANDS: SystemCommand[] = [
  { command: 'list files', description: 'List files in current directory', requiresCreator: false },
  { command: 'system status', description: 'Show system resource usage', requiresCreator: false },
  { command: 'open application', description: 'Open specified application', requiresCreator: true },
  { command: 'shutdown', description: 'Shutdown the system', requiresCreator: true },
  { command: 'restart', description: 'Restart the system', requiresCreator: true },
  { command: 'network info', description: 'Show network information', requiresCreator: false },
  { command: 'memory usage', description: 'Show memory usage statistics', requiresCreator: false },
  { command: 'cpu usage', description: 'Show CPU usage statistics', requiresCreator: false },
];

export async function executeSystemCommand(
  command: string,
  isCreator: boolean
): Promise<{ success: boolean; result: string; error?: string }> {
  try {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check if command requires creator privileges
    const systemCommand = SYSTEM_COMMANDS.find(cmd => 
      normalizedCommand.includes(cmd.command.toLowerCase())
    );
    
    if (systemCommand && systemCommand.requiresCreator && !isCreator) {
      return {
        success: false,
        result: '',
        error: 'This command requires Creator-level access'
      };
    }
    
    let shellCommand = '';
    
    // Map voice commands to shell commands
    if (normalizedCommand.includes('list files')) {
      shellCommand = 'ls -la';
    } else if (normalizedCommand.includes('system status')) {
      shellCommand = 'top -n 1 -b | head -20';
    } else if (normalizedCommand.includes('memory usage')) {
      shellCommand = 'free -h';
    } else if (normalizedCommand.includes('cpu usage')) {
      shellCommand = 'top -n 1 -b | grep "Cpu(s)"';
    } else if (normalizedCommand.includes('network info')) {
      shellCommand = 'ifconfig';
    } else if (normalizedCommand.includes('disk usage')) {
      shellCommand = 'df -h';
    } else if (normalizedCommand.includes('processes')) {
      shellCommand = 'ps aux | head -20';
    } else if (normalizedCommand.includes('uptime')) {
      shellCommand = 'uptime';
    } else if (normalizedCommand.includes('date')) {
      shellCommand = 'date';
    } else if (normalizedCommand.includes('whoami')) {
      shellCommand = 'whoami';
    } else {
      return {
        success: false,
        result: '',
        error: 'Command not recognized or not authorized'
      };
    }
    
    const { stdout, stderr } = await execAsync(shellCommand);
    
    if (stderr) {
      return {
        success: false,
        result: '',
        error: stderr
      };
    }
    
    return {
      success: true,
      result: stdout.trim()
    };
  } catch (error) {
    console.error('Command execution error:', error);
    return {
      success: false,
      result: '',
      error: 'Command execution failed'
    };
  }
}

export function parseVoiceCommand(text: string): {
  isSystemCommand: boolean;
  command?: string;
  isNexusActivation: boolean;
} {
  const normalizedText = text.toLowerCase().trim();
  
  const isNexusActivation = normalizedText.includes('hey nexus') || 
                           normalizedText.includes('hey n.e.x.u.s') ||
                           normalizedText.includes('nexus activate');
  
  const systemCommandKeywords = [
    'list files', 'system status', 'memory usage', 'cpu usage', 
    'network info', 'disk usage', 'processes', 'uptime', 'date',
    'open application', 'shutdown', 'restart'
  ];
  
  const isSystemCommand = systemCommandKeywords.some(keyword => 
    normalizedText.includes(keyword)
  );
  
  return {
    isSystemCommand,
    command: isSystemCommand ? text : undefined,
    isNexusActivation
  };
}
