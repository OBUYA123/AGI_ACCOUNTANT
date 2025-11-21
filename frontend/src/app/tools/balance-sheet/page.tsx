"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";

interface BalanceSheetData {
  assets: {
    currentAssets: number;
    fixedAssets: number;
    intangibleAssets: number;
  };
  liabilities: {
    currentLiabilities: number;
    longTermLiabilities: number;
  };
  equity: {
    shareholderEquity: number;
    retainedEarnings: number;
  };
}

export default function BalanceSheetCalculator() {
  const [formData, setFormData] = useState<BalanceSheetData>({
    assets: {
      currentAssets: 0,
      fixedAssets: 0,
      intangibleAssets: 0,
    },
    liabilities: {
      currentLiabilities: 0,
      longTermLiabilities: 0,
    },
    equity: {
      shareholderEquity: 0,
      retainedEarnings: 0,
    },
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/accounting/balance-sheet", formData);
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;

    try {
      const response = await api.get(
        `/accounting/results/${result._id}/export`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `balance-sheet-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Balance Sheet Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Input Data</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-lg mb-3">Assets</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Current Assets
                    </label>
                    <input
                      type="number"
                      value={formData.assets.currentAssets}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assets: {
                            ...formData.assets,
                            currentAssets: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Fixed Assets
                    </label>
                    <input
                      type="number"
                      value={formData.assets.fixedAssets}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assets: {
                            ...formData.assets,
                            fixedAssets: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Intangible Assets
                    </label>
                    <input
                      type="number"
                      value={formData.assets.intangibleAssets}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assets: {
                            ...formData.assets,
                            intangibleAssets: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-3">Liabilities</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Current Liabilities
                    </label>
                    <input
                      type="number"
                      value={formData.liabilities.currentLiabilities}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          liabilities: {
                            ...formData.liabilities,
                            currentLiabilities: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Long-term Liabilities
                    </label>
                    <input
                      type="number"
                      value={formData.liabilities.longTermLiabilities}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          liabilities: {
                            ...formData.liabilities,
                            longTermLiabilities: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-3">Equity</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Shareholder Equity
                    </label>
                    <input
                      type="number"
                      value={formData.equity.shareholderEquity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          equity: {
                            ...formData.equity,
                            shareholderEquity: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Retained Earnings
                    </label>
                    <input
                      type="number"
                      value={formData.equity.retainedEarnings}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          equity: {
                            ...formData.equity,
                            retainedEarnings: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCalculate}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Calculating..." : "Calculate"}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </Card>

          {result && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Results</h2>
                <Button onClick={handleExportPDF} size="sm" variant="outline">
                  Export PDF
                </Button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-primary-50 dark:bg-primary-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Assets
                  </p>
                  <p className="text-2xl font-bold text-primary-600">
                    ${result.calculations.totalAssets.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Liabilities
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    ${result.calculations.totalLiabilities.toLocaleString()}
                  </p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Equity
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.calculations.totalEquity.toLocaleString()}
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg ${
                    result.calculations.isBalanced
                      ? "bg-green-50 dark:bg-green-900"
                      : "bg-red-50 dark:bg-red-900"
                  }`}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status
                  </p>
                  <p
                    className={`text-lg font-bold ${
                      result.calculations.isBalanced
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {result.calculations.isBalanced
                      ? "✓ Balanced"
                      : "✗ Not Balanced"}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
