'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Activity, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface VitalSign {
  Hr: number;
  Spo2: number;
  timestamp_server: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const [latestVitals, setLatestVitals] = useState<VitalSign | null>(null);
  const [history, setHistory] = useState<VitalSign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    
    setError(null); // Clear previous errors before fetching

    try {
      console.log("Fetching data from:", API_BASE_URL);

      // Fetch latest vitals
      const latestRes = await fetch(`${API_BASE_URL}/api/vitals/latest`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!latestRes.ok) {
        if (latestRes.status === 404) {
          console.log("No latest vitals found");
          setLatestVitals(null); 
        } else {
          const errorText = await latestRes.text();
          throw new Error(`Error fetching latest vitals: ${latestRes.status} ${latestRes.statusText} - ${errorText}`);
        }
      } else {
        const latestData: VitalSign = await latestRes.json();
        console.log("Latest vitals:", latestData);
        setLatestVitals(latestData);
      }

      // Fetch history
      const historyRes = await fetch(`${API_BASE_URL}/api/vitals/history?limit=10`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!historyRes.ok) {
        const errorText = await historyRes.text();
        throw new Error(`Error fetching history: ${historyRes.status} ${historyRes.statusText} - ${errorText}`);
      }
      const historyData: VitalSign[] = await historyRes.json();
      console.log("History data:", historyData);

      const sortedHistory = historyData.sort(
        (a, b) => new Date(b.timestamp_server).getTime() - new Date(a.timestamp_server).getTime(),
      );
      setHistory(sortedHistory);
      setLastUpdate(new Date());
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.name === "AbortError") {
        setError("Request timed out. The API server might be slow or unreachable.");
      } else if (err.message && err.message.includes("Failed to fetch")) { 
        setError("Network error: Cannot connect to the API. The server might be down or there might be CORS issues.");
      } else {
        setError(err.message || "An unknown error occurred while fetching data.");
      }
      
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    setIsLoading(true); 
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId); 
  }, []);

  const getVitalStatus = (hr: number, spo2: number) => {
    const hrNormal = hr >= 60 && hr <= 100;
    const spo2Normal = spo2 >= 95;

    if (hrNormal && spo2Normal) return { status: "Normal", color: "bg-green-500" };
    if (!hrNormal || spo2 < 90) return { status: "Critical", color: "bg-red-500" }; 
    if (spo2 < 95 && spo2 >= 90) return { status: "Warning", color: "bg-yellow-500" }; 
    if (!hrNormal) return {status: "Warning", color: "bg-yellow-500"}; 
    return { status: "Unknown", color: "bg-gray-500" }; 
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    fetchData();
  };

  // Initial loading state
  if (isLoading && !latestVitals && history.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state when no data could be loaded at all
  if (error && !latestVitals && history.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-red-500 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={handleRetry} className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Retry Connection
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const vitalStatus = latestVitals ? getVitalStatus(latestVitals.Hr, latestVitals.Spo2) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-400">VitalOps Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Real-time patient monitoring system
              {error && !isLoading && <span className="ml-2 text-yellow-500">(Offline - showing last known data)</span>}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 md:mt-0">
            {error && !isLoading && ( 
              <button
                onClick={handleRetry}
                className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              >
                <AlertCircle className="h-4 w-4" /> Reconnect
              </button>
            )}
            {lastUpdate && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Status Badge */}
        {vitalStatus && (
          <div className="mb-6">
            <Badge className={`${vitalStatus.color} text-white px-4 py-2 text-lg shadow-md`}>
              Patient Status: {vitalStatus.status}
            </Badge>
          </div>
        )}

        {/* Current Vitals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Heart Rate</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">
                {latestVitals?.Hr ? latestVitals.Hr.toFixed(1) : "--"}
                <span className="text-lg text-gray-400 ml-2">BPM</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Normal: 60-100 BPM</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Blood Oxygen</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">
                {latestVitals?.Spo2 ? latestVitals.Spo2.toFixed(1) : "--"}
                <span className="text-lg text-gray-400 ml-2">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Normal: &gt; 95%</p>

            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Last Reading Time</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-green-400">
                {latestVitals?.timestamp_server ? new Date(latestVitals.timestamp_server).toLocaleTimeString() : "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {latestVitals?.timestamp_server
                  ? new Date(latestVitals.timestamp_server).toLocaleDateString()
                  : "No data"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent History Table */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-300">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-semibold">Timestamp</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-semibold">Heart Rate</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-semibold">SpO₂</th>
                    <th className="text-left py-3 px-4 text-sm text-gray-400 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length > 0 ? (
                    history.map((reading, index) => {
                      const statusInfo = getVitalStatus(reading.Hr, reading.Spo2);
                      return (
                        <tr key={reading.timestamp_server + index} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                          <td className="py-3 px-4 text-gray-300 text-sm">
                            {new Date(reading.timestamp_server).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-red-400 font-mono text-sm">{reading.Hr.toFixed(1)} BPM</td>
                          <td className="py-3 px-4 text-blue-400 font-mono text-sm">{reading.Spo2.toFixed(1)}%</td>
                          <td className="py-3 px-4">
                            <Badge className={`${statusInfo.color} text-white text-xs`}>{statusInfo.status}</Badge>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        No history data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}