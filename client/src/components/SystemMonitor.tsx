import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Cpu, HardDrive, Wifi, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SystemStats {
  cpu: {
    usage: number;
    status: 'good' | 'medium' | 'high';
  };
  memory: {
    used: number;
    total: number;
    usage: number;
    status: 'good' | 'medium' | 'high';
  };
  network: {
    status: 'connected' | 'disconnected';
    quality: 'good' | 'medium' | 'poor';
  };
  uptime: string;
}

export default function SystemMonitor() {
  const { data: systemStats } = useQuery<SystemStats>({
    queryKey: ['/api/system/monitor'],
    refetchInterval: 5000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-success';
      case 'medium': return 'text-azure';
      case 'high': return 'text-alert';
      default: return 'text-gray-400';
    }
  };

  const getStatusBarColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-success';
      case 'medium': return 'bg-azure';
      case 'high': return 'bg-alert';
      default: return 'bg-gray-400';
    }
  };

  const WaveBar = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
      className="wave-bar bg-electric-blue w-1 h-3 rounded"
      style={{ animationDelay: `${delay}s` }}
      animate={{ scaleY: [1, 1.5, 1] }}
      transition={{ duration: 0.5, repeat: Infinity, delay }}
    />
  );

  return (
    <motion.div
      className="absolute top-20 left-6 glassmorphism rounded-lg p-4 w-64 pointer-events-auto"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.6 }}
    >
      <h3 className="text-sm font-bold text-electric-blue mb-3 text-glow flex items-center space-x-2">
        <Activity className="w-4 h-4" />
        <span>System Monitor</span>
      </h3>
      
      {systemStats ? (
        <>
          {/* CPU Usage */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300 flex items-center space-x-1">
                <Cpu className="w-3 h-3" />
                <span>CPU</span>
              </span>
              <span className={`text-xs font-semibold ${getStatusColor(systemStats.cpu.status)}`}>
                {systemStats.cpu.usage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-dark-blue rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${getStatusBarColor(systemStats.cpu.status)}`}
                initial={{ width: 0 }}
                animate={{ width: `${systemStats.cpu.usage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Memory Usage */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300 flex items-center space-x-1">
                <HardDrive className="w-3 h-3" />
                <span>Memory</span>
              </span>
              <span className={`text-xs font-semibold ${getStatusColor(systemStats.memory.status)}`}>
                {(systemStats.memory.used / 1024).toFixed(1)}GB
              </span>
            </div>
            <div className="w-full bg-dark-blue rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${getStatusBarColor(systemStats.memory.status)}`}
                initial={{ width: 0 }}
                animate={{ width: `${systemStats.memory.usage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Network Activity */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-300 flex items-center space-x-1">
                <Wifi className="w-3 h-3" />
                <span>Network</span>
              </span>
              <span className={`text-xs font-semibold ${
                systemStats.network.status === 'connected' ? 'text-success' : 'text-alert'
              }`}>
                {systemStats.network.status === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <WaveBar delay={0} />
              <WaveBar delay={0.1} />
              <WaveBar delay={0.2} />
              <WaveBar delay={0.3} />
              <WaveBar delay={0.4} />
            </div>
          </div>
          
          {/* Uptime */}
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              <span className="font-semibold">Uptime:</span> {systemStats.uptime}
            </div>
          </div>
        </>
      ) : (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
        </div>
      )}
    </motion.div>
  );
}
