import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useTranslation } from "../hooks/useTranslation";

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Types for our system logs and metrics
interface ServerLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskSpace: {
    total: number;
    used: number;
    free: number;
  };
  uptime: number;
}

interface DatabaseMetrics {
  connections: number;
  queryResponseTime: number;
  size: number;
  tables: number;
  lastBackup: string;
}

interface UserActivityMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  activeSessionsCount: number;
}

const SystemLogs = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("server_logs");
  const [logs, setLogs] = useState<ServerLog[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserActivityMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logLevel, setLogLevel] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("24h");

  // Mock data fetching - in a real app, these would be API calls
  useEffect(() => {
    // Simulate API loading delay
    setTimeout(() => {
      // Mock server logs
      setLogs([
        { 
          id: '1', 
          timestamp: '2023-07-12T14:32:15Z', 
          level: 'info', 
          source: 'auth-service',
          message: t("log_msg_auth_success", "User authenticated successfully")
        },
        { 
          id: '2', 
          timestamp: '2023-07-12T14:35:22Z', 
          level: 'warning', 
          source: 'file-service',
          message: t("log_msg_storage_low", "Storage space running low (15% remaining)")
        },
        { 
          id: '3', 
          timestamp: '2023-07-12T15:12:08Z', 
          level: 'error', 
          source: 'db-service',
          message: t("log_msg_db_timeout", "Database connection timeout after 30s")
        },
        { 
          id: '4', 
          timestamp: '2023-07-12T15:14:45Z', 
          level: 'critical', 
          source: 'api-gateway',
          message: t("log_msg_service_unavailable", "Service unavailable - unable to process requests")
        },
        { 
          id: '5', 
          timestamp: '2023-07-12T15:18:32Z', 
          level: 'info', 
          source: 'monitoring',
          message: t("log_msg_health_check_complete", "Daily system health check completed")
        },
      ]);

      // Mock system metrics
      setSystemMetrics({
        cpuUsage: 42,
        memoryUsage: 68,
        diskSpace: {
          total: 500,
          used: 320,
          free: 180
        },
        uptime: 1209600 // 14 days in seconds
      });

      // Mock database metrics
      setDbMetrics({
        connections: 24,
        queryResponseTime: 0.12,
        size: 4.2, // GB
        tables: 32,
        lastBackup: '2023-07-12T02:00:00Z'
      });

      // Mock user activity metrics
      setUserMetrics({
        totalUsers: 1250,
        activeUsers: 78,
        newUsersToday: 5,
        activeSessionsCount: 32
      });

      setIsLoading(false);
    }, 1000);
  }, [t]);

  // Format uptime from seconds to days, hours, minutes
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Format the timestamp to a more readable format
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get badge color based on log level
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return 'badge-info';
      case 'warning':
        return 'badge-warning';
      case 'error':
        return 'badge-error';
      case 'critical':
        return 'badge-error';
      default:
        return 'badge-neutral';
    }
  };

  // Filter logs based on selected level
  const filteredLogs = logs.filter(log => 
    logLevel === 'all' || log.level === logLevel
  );

  // Chart data for disk usage
  const diskUsageData = {
    labels: [t("used_space", "Used Space"), t("free_space", "Free Space")],
    datasets: [
      {
        data: systemMetrics ? [systemMetrics.diskSpace.used, systemMetrics.diskSpace.free] : [0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for user metrics
  const userMetricsData = {
    labels: [t("active", "Active"), t("inactive", "Inactive")],
    datasets: [
      {
        data: userMetrics ? [userMetrics.activeUsers, userMetrics.totalUsers - userMetrics.activeUsers] : [0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(201, 203, 207, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // System resource usage chart
  const systemResourceData = {
    labels: [t("cpu_usage", "CPU Usage"), t("memory_usage", "Memory Usage")],
    datasets: [
      {
        label: t("usage_percent", "Usage %"),
        data: systemMetrics ? [systemMetrics.cpuUsage, systemMetrics.memoryUsage] : [0, 0],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-1">{t("system_logs_monitoring_title", "System Logs & Monitoring")}</h1>
      <p className="text-gray-500 mb-6">
        {t("system_logs_monitoring_subtitle", "View system performance, logs, and metrics for troubleshooting and monitoring")}
      </p>

      {/* Tabs navigation */}
      <div className="tabs tabs-border">
        <input
          type="radio"
          name="system_logs_tab_group"
          className="tab"
          aria-label={t("server_logs", "Server Logs")}
          checked={activeTab === "server_logs"}
          onChange={() => setActiveTab("server_logs")}
        />
        {activeTab === "server_logs" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t("server_logs", "Server Logs")}</h2>
                <div className="flex gap-2">
                  <select 
                    className="select select-bordered select-sm"
                    value={logLevel}
                    onChange={(e) => setLogLevel(e.target.value)}
                  >
                    <option value="all">{t("all_levels", "All Levels")}</option>
                    <option value="info">{t("info", "Info")}</option>
                    <option value="warning">{t("warning", "Warning")}</option>
                    <option value="error">{t("error", "Error")}</option>
                    <option value="critical">{t("critical", "Critical")}</option>
                  </select>
                  <select 
                    className="select select-bordered select-sm"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="1h">{t("last_hour", "Last Hour")}</option>
                    <option value="24h">{t("last_24_hours", "Last 24 Hours")}</option>
                    <option value="7d">{t("last_7_days", "Last 7 Days")}</option>
                    <option value="30d">{t("last_30_days", "Last 30 Days")}</option>
                  </select>
                  <button className="btn btn-sm btn-outline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t("export", "Export")}
                  </button>
                  <button className="btn btn-sm btn-outline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t("refresh", "Refresh")}
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : filteredLogs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>{t("timestamp", "Timestamp")}</th>
                        <th>{t("log_level", "Level")}</th>
                        <th>{t("source", "Source")}</th>
                        <th>{t("message", "Message")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="whitespace-nowrap">{formatTimestamp(log.timestamp)}</td>
                          <td>
                            <span className={`badge ${getLogLevelBadge(log.level)} badge-sm`}>
                              {t(log.level, log.level).toUpperCase()}
                            </span>
                          </td>
                          <td>{log.source}</td>
                          <td className="break-all">{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {t("no_logs_found_matching", "No logs found matching your filter criteria.")}
                </div>
              )}

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  {t("showing_logs_count", "Showing {count} of {total} logs")
                    .replace("{count}", filteredLogs.length.toString())
                    .replace("{total}", logs.length.toString())}
                </div>
                <div className="join">
                  <button className="join-item btn btn-sm">«</button>
                  <button className="join-item btn btn-sm">1</button>
                  <button className="join-item btn btn-sm btn-active">2</button>
                  <button className="join-item btn btn-sm">3</button>
                  <button className="join-item btn btn-sm">»</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          type="radio"
          name="system_logs_tab_group"
          className="tab"
          aria-label={t("system_health", "System Health")}
          checked={activeTab === "system_health"}
          onChange={() => setActiveTab("system_health")}
        />
        {activeTab === "system_health" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">{t("system_health_performance", "System Health & Performance")}</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : systemMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Overview Stats */}
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-bold mb-3">{t("system_health", "System Health")}</h3>
                    <div className="stats stats-vertical shadow w-full">
                      <div className="stat">
                        <div className="stat-title">{t("cpu_usage", "CPU Usage")}</div>
                        <div className="stat-value">{systemMetrics.cpuUsage}%</div>
                        <div className="stat-desc">
                          <progress 
                            className={`progress w-full ${systemMetrics.cpuUsage > 80 ? 'progress-error' : 'progress-success'}`} 
                            value={systemMetrics.cpuUsage} 
                            max="100"
                          ></progress>
                        </div>
                      </div>
                      
                      <div className="stat">
                        <div className="stat-title">{t("memory_usage", "Memory Usage")}</div>
                        <div className="stat-value">{systemMetrics.memoryUsage}%</div>
                        <div className="stat-desc">
                          <progress 
                            className={`progress w-full ${systemMetrics.memoryUsage > 80 ? 'progress-error' : 'progress-success'}`} 
                            value={systemMetrics.memoryUsage} 
                            max="100"
                          ></progress>
                        </div>
                      </div>
                      
                      <div className="stat">
                        <div className="stat-title">{t("system_uptime", "System Uptime")}</div>
                        <div className="stat-value text-lg">{formatUptime(systemMetrics.uptime)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Disk Usage */}
                  <div className="bg-base-100 p-4 rounded-xl flex flex-col">
                    <h3 className="text-lg font-bold mb-3">{t("disk_usage", "Disk Usage")}</h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div style={{ width: '180px', height: '180px' }}>
                        <Pie data={diskUsageData} />
                      </div>
                      <div className="stats shadow mt-3 w-full">
                        <div className="stat">
                          <div className="stat-title">{t("total_space", "Total Space")}</div>
                          <div className="stat-value text-lg">{systemMetrics.diskSpace.total} GB</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title">{t("used_space_gb", "Used Space")}</div>
                          <div className="stat-value text-lg">{systemMetrics.diskSpace.used} GB</div>
                          <div className="stat-desc">
                            {t("percent_used", "{percent}% used").replace("{percent}", Math.round((systemMetrics.diskSpace.used / systemMetrics.diskSpace.total) * 100).toString())}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resource Usage Over Time */}
                  <div className="bg-base-100 p-4 rounded-xl md:col-span-2">
                    <h3 className="text-lg font-bold mb-3">{t("resource_usage", "Resource Usage")}</h3>
                    <Bar 
                      data={systemResourceData}
                      options={{
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            title: {
                              display: true,
                              text: t("usage_percent", "Usage %")
                            }
                          }
                        },
                        plugins: {
                          title: {
                            display: true,
                            text: t("current_resource_usage", "Current System Resource Usage")
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {t("no_system_metrics", "No system metrics available. Please check your monitoring service.")}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="system_logs_tab_group"
          className="tab"
          aria-label={t("database", "Database")}
          checked={activeTab === "database"}
          onChange={() => setActiveTab("database")}
        />
        {activeTab === "database" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">{t("database_metrics", "Database Metrics")}</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : dbMetrics ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">{t("active_connections", "Active Connections")}</div>
                      <div className="stat-value">{dbMetrics.connections}</div>
                    </div>
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">{t("avg_query_time", "Avg Query Time")}</div>
                      <div className="stat-value">{dbMetrics.queryResponseTime}s</div>
                    </div>
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">{t("database_size", "Database Size")}</div>
                      <div className="stat-value">{dbMetrics.size} GB</div>
                    </div>
                    <div className="stat bg-base-100 rounded-xl shadow">
                      <div className="stat-title">{t("total_tables", "Total Tables")}</div>
                      <div className="stat-value">{dbMetrics.tables}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-base-100 p-4 rounded-xl">
                      <h3 className="text-lg font-bold mb-3">{t("backup_status", "Backup Status")}</h3>
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <tbody>
                            <tr>
                              <td className="font-medium">{t("last_backup", "Last Backup")}</td>
                              <td>{new Date(dbMetrics.lastBackup).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <td className="font-medium">{t("backup_status", "Backup Status")}</td>
                              <td><span className="badge badge-success">{t("successful", "Successful")}</span></td>
                            </tr>
                            <tr>
                              <td className="font-medium">{t("backup_size", "Backup Size")}</td>
                              <td>3.8 GB</td>
                            </tr>
                            <tr>
                              <td className="font-medium">{t("backup_retention", "Backup Retention")}</td>
                              <td>30 days</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <button className="btn btn-sm btn-primary mt-4">{t("run_manual_backup", "Run Manual Backup")}</button>
                    </div>

                    <div className="bg-base-100 p-4 rounded-xl">
                      <h3 className="text-lg font-bold mb-3">{t("recent_db_operations", "Recent Database Operations")}</h3>
                      <div className="overflow-x-auto">
                        <table className="table w-full">
                          <thead>
                            <tr>
                              <th>{t("time", "Time")}</th>
                              <th>{t("operation", "Operation")}</th>
                              <th>{t("status", "Status")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>10:32 AM</td>
                              <td>{t("index_rebuild", "Index Rebuild")}</td>
                              <td><span className="badge badge-success">{t("completed", "Completed")}</span></td>
                            </tr>
                            <tr>
                              <td>09:15 AM</td>
                              <td>{t("schema_update", "Schema Update")}</td>
                              <td><span className="badge badge-success">{t("completed", "Completed")}</span></td>
                            </tr>
                            <tr>
                              <td>08:05 AM</td>
                              <td>{t("scheduled_backup", "Scheduled Backup")}</td>
                              <td><span className="badge badge-success">{t("completed", "Completed")}</span></td>
                            </tr>
                            <tr>
                              <td>Yesterday 11:42 PM</td>
                              <td>{t("vacuum_full", "Vacuum Full")}</td>
                              <td><span className="badge badge-success">{t("completed", "Completed")}</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {t("no_database_metrics", "No database metrics available. Please check your database connection.")}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="radio"
          name="system_logs_tab_group"
          className="tab"
          aria-label={t("user_activity", "User Activity")}
          checked={activeTab === "user_activity"}
          onChange={() => setActiveTab("user_activity")}
        />
        {activeTab === "user_activity" && (
          <div className="tab-content p-5">
            <div className="bg-base-200 border border-base-300 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-6">{t("user_activity_monitoring", "User Activity Monitoring")}</h2>
              
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : userMetrics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-base-100 p-4 rounded-xl">
                    <h3 className="text-lg font-bold mb-3">{t("user_statistics", "User Statistics")}</h3>
                    <div className="stats stats-vertical shadow w-full">
                      <div className="stat">
                        <div className="stat-title">{t("total_registered_users", "Total Registered Users")}</div>
                        <div className="stat-value">{userMetrics.totalUsers}</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">{t("currently_active_users", "Currently Active Users")}</div>
                        <div className="stat-value">{userMetrics.activeUsers}</div>
                        <div className="stat-desc">{t("percent_of_total_users", "{percent}% of total users").replace("{percent}", Math.round((userMetrics.activeUsers / userMetrics.totalUsers) * 100).toString())}</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">{t("new_users_today", "New Users Today")}</div>
                        <div className="stat-value">{userMetrics.newUsersToday}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-100 p-4 rounded-xl flex flex-col">
                    <h3 className="text-lg font-bold mb-3">{t("user_activity_distribution", "User Activity Distribution")}</h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <div style={{ width: '180px', height: '180px' }}>
                        <Pie data={userMetricsData} />
                      </div>
                      <div className="stats shadow mt-3 w-full">
                        <div className="stat">
                          <div className="stat-title">{t("active_sessions", "Active Sessions")}</div>
                          <div className="stat-value">{userMetrics.activeSessionsCount}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-base-100 p-4 rounded-xl md:col-span-2">
                    <h3 className="text-lg font-bold mb-3">{t("recent_login_activity", "Recent Login Activity")}</h3>
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>{t("time", "Time")}</th>
                            <th>{t("user", "User")}</th>
                            <th>{t("ip_address", "IP Address")}</th>
                            <th>{t("status", "Status")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>10:45 AM</td>
                            <td>john.doe@example.com</td>
                            <td>192.168.1.105</td>
                            <td><span className="badge badge-success">{t("success", "Success")}</span></td>
                          </tr>
                          <tr>
                            <td>10:32 AM</td>
                            <td>sarah.smith@example.com</td>
                            <td>192.168.1.127</td>
                            <td><span className="badge badge-success">{t("success", "Success")}</span></td>
                          </tr>
                          <tr>
                            <td>10:15 AM</td>
                            <td>unknown@example.com</td>
                            <td>45.238.12.72</td>
                            <td><span className="badge badge-error">{t("failed", "Failed")}</span></td>
                          </tr>
                          <tr>
                            <td>09:58 AM</td>
                            <td>michael.brown@example.com</td>
                            <td>192.168.1.114</td>
                            <td><span className="badge badge-success">{t("success", "Success")}</span></td>
                          </tr>
                          <tr>
                            <td>09:42 AM</td>
                            <td>emily.jones@example.com</td>
                            <td>192.168.1.132</td>
                            <td><span className="badge badge-success">{t("success", "Success")}</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  {t("no_user_activity_metrics", "No user activity metrics available.")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
