import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { generateRandomData } from "./generateRandomData";

const calculateZScore = (data: { name: string; value: number }[]) => {
  const values = data.map((d) => d.value);
  const mean = values.reduce((acc, cur) => acc + cur, 0) / values.length;
  const std = Math.sqrt(
    values.reduce((acc, cur) => acc + Math.pow(cur - mean, 2), 0) /
      (values.length - 1)
  );
  return { mean, std };
};

export const OutliersVizualization = () => {
  const [data, setData] = React.useState(() => generateRandomData());
  const [zScoreThreshold, setZScoreThreshold] = React.useState(1);
  const [selectedPoint, setSelectedPoint] = React.useState<null | {
    name: string;
    value: number;
    zscore: number;
  }>(null);
  const stats = calculateZScore(data);

  const processedData = data.map((d: { name: string; value: number }) => {
    const z = (d.value - stats.mean) / stats.std;
    return {
      ...d,
      zscore: z,
      red: Math.abs(z) > zScoreThreshold ? d.value : null,
      blue: Math.abs(z) <= zScoreThreshold ? d.value : null,
    };
  });

  const outliers = processedData.filter(
    (d) => Math.abs(d.zscore) > zScoreThreshold
  );
  const outlierStats = {
    count: outliers.length,
    percentage: ((outliers.length / processedData.length) * 100).toFixed(1),
    max: outliers.length ? Math.max(...outliers.map((d) => d.value)) : 0,
    min: outliers.length ? Math.min(...outliers.map((d) => d.value)) : 0,
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].payload.value;
      const zscore = payload[0].payload.zscore;
      const isOutlier = Math.abs(zscore) > zScoreThreshold;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border dark:border-gray-700 rounded shadow">
          <p className="font-bold dark:text-gray-100">{label}</p>
          <p className="dark:text-gray-200">Значение: {value}</p>
          <p className="dark:text-gray-200">Z-score: {zscore.toFixed(2)}</p>
          <p
            className={
              isOutlier
                ? "text-red-500 dark:text-red-400"
                : "text-blue-500 dark:text-blue-400"
            }
          >
            {isOutlier ? "Выброс" : "В пределах нормы"}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderDot =
    (color: string) =>
    (props: any): React.ReactElement<SVGElement> => {
      const { cx, cy, payload } = props;
      const isNull = payload[color === "#3B82F6" ? "blue" : "red"] === null;
      const isSelected = selectedPoint?.name === payload.name;

      if (isNull) return <circle cx={0} cy={0} r={0} fill="none" />;

      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 6 : 4}
            fill={color}
            stroke={color}
            strokeWidth={isSelected ? 2 : 1}
          />
          <circle
            cx={cx}
            cy={cy}
            r={15}
            fill={color}
            opacity={0}
            className="hover:opacity-10 transition-opacity cursor-pointer"
            onClick={() => setSelectedPoint(isSelected ? null : payload)}
          />
        </g>
      );
    };

  const handleMainClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      !target.closest("circle") &&
      !target.closest(".recharts-tooltip-wrapper") &&
      !target.closest("[data-selected-point-info]")
    ) {
      setSelectedPoint(null);
    }
  };

  return (
    <main
      className="min-h-screen p-4 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900 relative"
      onClick={handleMainClick}
    >
      <a
        href="https://github.com/kokunyan"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 text-xs text-gray-400/50 hover:text-gray-400/70 dark:text-gray-600/50 dark:hover:text-gray-600/70 transition-colors pointer-events-auto"
      >
        Created by @kokunyan
      </a>

      <div className="w-full max-w-4xl flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <label className="flex items-center font-medium">
          <span className="text-gray-700 dark:text-gray-200 whitespace-nowrap">
            Порог Z-score:
          </span>
          <input
            type="number"
            step="0.1"
            value={zScoreThreshold}
            onChange={(e) => setZScoreThreshold(Number(e.target.value))}
            className="ml-2 w-20 px-2 py-1 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:ring-primary/30"
          />
        </label>
        <button
          onClick={() => setData(generateRandomData())}
          className="w-full sm:w-auto px-4 py-2 bg-primary text-gray-900 dark:text-white rounded-md hover:bg-primary-hover active:bg-primary-hover/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg dark:shadow-primary/20 dark:hover:shadow-primary/30 border border-black/10 dark:border-primary-hover/30 hover:border-black/20 dark:hover:border-primary-hover/40 cursor-pointer"
        >
          Сгенерировать рандомные данные
        </button>
      </div>

      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg shadow-sm">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#666" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              payload={[
                { value: "В пределах нормы", type: "line", color: "#3B82F6" },
                { value: "Выбросы", type: "line", color: "red" },
              ]}
            />
            <Line
              type="monotone"
              dataKey="blue"
              stroke="#3B82F6"
              dot={renderDot("#3B82F6")}
              connectNulls
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="red"
              stroke="red"
              dot={renderDot("red")}
              connectNulls
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full max-w-4xl text-center space-y-4 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm">
        {selectedPoint && (
          <div
            data-selected-point-info
            className={`mt-4 p-4 rounded-lg border ${
              Math.abs(selectedPoint.zscore) > zScoreThreshold
                ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800"
            }`}
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-base sm:text-lg">
              Выбранная точка
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Точка
                </p>
                <p className="font-medium dark:text-gray-100">
                  {selectedPoint.name}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Значение
                </p>
                <p className="font-medium dark:text-gray-100">
                  {selectedPoint.value}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Z-score
                </p>
                <p
                  className={`font-medium ${
                    Math.abs(selectedPoint.zscore) > zScoreThreshold
                      ? "text-red-600 dark:text-red-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {selectedPoint.zscore.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-base sm:text-lg">
              Основная статистика
            </h3>
            <div className="space-y-1">
              <p className="text-sm flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Среднее значение:
                </span>
                <span className="font-medium dark:text-gray-100">
                  {stats.mean.toFixed(2)}
                </span>
              </p>
              <p className="text-sm flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Стандартное отклонение:
                </span>
                <span className="font-medium dark:text-gray-100">
                  {stats.std.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-base sm:text-lg">
              Статистика выбросов
            </h3>
            <div className="space-y-1">
              <p className="text-sm flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Количество:
                </span>
                <span className="font-medium dark:text-gray-100">
                  {outlierStats.count} ({outlierStats.percentage}%)
                </span>
              </p>
              {outlierStats.count > 0 && (
                <p className="text-sm flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Диапазон:
                  </span>
                  <span className="font-medium dark:text-gray-100">
                    {outlierStats.min} - {outlierStats.max}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
          Значения с |z-score| больше {zScoreThreshold} отмечены красным
        </p>
      </div>
    </main>
  );
};
