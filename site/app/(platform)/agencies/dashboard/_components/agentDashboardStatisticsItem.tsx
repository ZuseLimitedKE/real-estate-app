interface AgentDashboardStatisticsData {
  title: string;
  icon: React.ReactNode;
  value: string;
}

export default function AgentDashboardStatisticsItem(
  props: AgentDashboardStatisticsData,
) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {props.title}
        </h3>
        <div className="text-gray-400 opacity-60">{props.icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">
        {props.value}
      </p>
    </div>
  );
}
