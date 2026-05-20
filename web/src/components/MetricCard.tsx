interface MetricCardProps {
  label: string;
  value: string | number;
}

export const MetricCard = ({ label, value }: MetricCardProps) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 flex flex-col justify-center">
      <span className="text-xs text-gray-500 uppercase font-medium tracking-wider mb-1">
        {label}
      </span>
      <span className="text-3xl font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
};
