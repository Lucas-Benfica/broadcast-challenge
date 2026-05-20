import { Link } from "react-router-dom";

interface MetricCardProps {
  label: string;
  value: string | number;
  to?: string;
}

export const MetricCard = ({ label, value, to }: MetricCardProps) => {
  const content = (
    <div className={`bg-gray-100 rounded-lg p-4 flex flex-col justify-center h-full ${to ? 'hover:bg-gray-200 transition-colors' : ''}`}>
      <span className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">
        {label}
      </span>
      <span className="text-3xl font-medium text-gray-900">
        {value}
      </span>
    </div>
  );

  return to ? <Link to={to} className="block h-full cursor-pointer">{content}</Link> : content;
};
